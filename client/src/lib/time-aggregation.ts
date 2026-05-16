import type { AppState, TimeTracking, WeeklySummary, LEVEL_NAMES } from './types';
import { resetTodayTracking } from './realtime-tracker';

export type TimeCategory = 'STUDY' | 'CREATIVE' | 'ENTERTAINMENT';

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function startOfWeek(day: Date): Date {
  const weekStart = new Date(day);
  weekStart.setDate(day.getDate() - day.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function endOfWeek(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

function createEmptyTimeTracking(): TimeTracking {
  const today = startOfToday();
  return {
    studyTime: 0,
    entertainmentTime: {},
    creativeTime: 0,
    lastUpdated: today,
    dailyStudyLog: [],
    weeklyStudyLog: [],
  };
}

function createWeeklySummaryEntry(weekStartDate: Date): WeeklySummary {
  const weekStart = new Date(weekStartDate);
  const weekEnd = endOfWeek(weekStart);
  return {
    weekStart,
    weekEnd,
    totalStudyTime: 0,
    totalCreativeTime: 0,
    totalEntertainmentTime: 0,
    subjectFocus: {},
    topSubject: '',
    leastSubject: '',
    averageDailyStudy: 0,
    taskCompletion: 0,
  };
}

function upsertDailyLog(tracking: TimeTracking, minutes: number) {
  const today = startOfToday();
  const dayIndex = tracking.dailyStudyLog.findIndex(
    (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
  );

  if (dayIndex >= 0) {
    tracking.dailyStudyLog[dayIndex].totalMinutes =
      (tracking.dailyStudyLog[dayIndex].totalMinutes || 0) + minutes;
    return;
  }

  tracking.dailyStudyLog.push({
    date: today,
    totalMinutes: minutes,
    bySubject: {},
    tasksCompleted: 0,
  });
}

function upsertWeeklyLog(tracking: TimeTracking, minutes: number, category: TimeCategory) {
  const today = startOfToday();
  const weekStart = startOfWeek(today);
  const weekIndex = tracking.weeklyStudyLog.findIndex(
    (entry) => new Date(entry.weekStart).setHours(0, 0, 0, 0) === weekStart.getTime()
  );

  const weeklyEntry =
    weekIndex >= 0
      ? tracking.weeklyStudyLog[weekIndex]
      : createWeeklySummaryEntry(weekStart);

  if (category === 'STUDY') {
    weeklyEntry.totalStudyTime += minutes;
  } else if (category === 'CREATIVE') {
    weeklyEntry.totalCreativeTime += minutes;
  } else {
    weeklyEntry.totalEntertainmentTime += minutes;
  }

  const weekTotal =
    weeklyEntry.totalStudyTime +
    weeklyEntry.totalCreativeTime +
    weeklyEntry.totalEntertainmentTime;
  weeklyEntry.averageDailyStudy = Math.round((weeklyEntry.totalStudyTime / 7) * 10) / 10;
  weeklyEntry.taskCompletion = weekTotal > 0 ? Math.round((weeklyEntry.totalStudyTime / weekTotal) * 100) : 0;

  if (weekIndex >= 0) {
    tracking.weeklyStudyLog[weekIndex] = weeklyEntry;
  } else {
    tracking.weeklyStudyLog.push(weeklyEntry);
  }
}

export function addTrackedDuration(
  state: AppState,
  durationSeconds: number,
  category: TimeCategory,
  entertainmentSource = 'timer'
): AppState {
  if (durationSeconds <= 0) return state;

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = durationSeconds / 3600;
  let nextState = { ...state };
  const tracking = nextState.user.timeTracking
    ? { ...nextState.user.timeTracking }
    : createEmptyTimeTracking();

  if (category === 'STUDY') {
    nextState.user.stats.totalFocusHours = (nextState.user.stats.totalFocusHours || 0) + hours;
    tracking.studyTime = (tracking.studyTime || 0) + minutes;
  } else if (category === 'CREATIVE') {
    tracking.creativeTime = (tracking.creativeTime || 0) + minutes;
  } else {
    tracking.entertainmentTime = { ...(tracking.entertainmentTime || {}) };
    tracking.entertainmentTime[entertainmentSource] =
      (tracking.entertainmentTime[entertainmentSource] || 0) + minutes;
  }

  if (!tracking.dailyStudyLog) tracking.dailyStudyLog = [];
  if (!tracking.weeklyStudyLog) tracking.weeklyStudyLog = [];

  upsertDailyLog(tracking, minutes);
  upsertWeeklyLog(tracking, minutes, category);
  tracking.lastUpdated = new Date();
  nextState.user.timeTracking = tracking;
  
  // Update streak when study time is logged
  nextState = updateStreak(nextState);

  return nextState;
}

/**
 * Update streak based on lastActivityDate
 * Increments streak if activity happened today (after yesterday)
 * Resets to 1 if first activity today after a gap
 */
export function updateStreak(state: AppState): AppState {
  const nextState = { ...state };
  const today = startOfToday();
  const lastActivityDate = state.user.stats.lastActivityDate
    ? new Date(state.user.stats.lastActivityDate)
    : null;

  if (!lastActivityDate) {
    // First time activity logged
    nextState.user.stats.streak = 1;
    nextState.user.stats.lastActivityDate = today;
    return nextState;
  }

  lastActivityDate.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActivityDate.getTime() === yesterday.getTime()) {
    // Activity happened yesterday, increment streak
    nextState.user.stats.streak = (nextState.user.stats.streak || 0) + 1;
  } else if (lastActivityDate.getTime() !== today.getTime()) {
    // Gap detected - reset streak to 1 (since they're active today)
    nextState.user.stats.streak = 1;
  }
  // If activity was already logged today, don't change streak

  nextState.user.stats.lastActivityDate = today;
  return nextState;
}

/**
 * Update level based on currentXP
 * Level up when currentXP >= nextLevelXP
 * Each level requires 50% more XP than previous (100, 150, 225, 337, 506, 759)
 */
export function updateLevel(state: AppState): AppState {
  const nextState = { ...state };
  const LEVEL_NAMES = ['Focused', 'Consistent', 'Disciplined', 'Relentless', 'Unstoppable', 'Legendary'];
  const MAX_LEVEL = LEVEL_NAMES.length;
  
  let level = nextState.user.stats.currentLevel.level;
  let currentXP = nextState.user.stats.currentLevel.currentXP;
  let nextLevelXP = nextState.user.stats.currentLevel.nextLevelXP;

  // Keep leveling up while currentXP >= nextLevelXP and not at max level
  while (currentXP >= nextLevelXP && level < MAX_LEVEL) {
    currentXP -= nextLevelXP;
    level += 1;
    // Calculate next level XP: 100 * 1.5^(level-1)
    nextLevelXP = Math.round(100 * Math.pow(1.5, level - 1));
  }

  nextState.user.stats.currentLevel = {
    level: Math.min(level, MAX_LEVEL),
    currentXP,
    totalXP: nextState.user.stats.totalXP,
    nextLevelXP: level >= MAX_LEVEL ? 0 : nextLevelXP,
    levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
  };

  return nextState;
}

export function resetCoreStats(state: AppState): AppState {
  const nextState = { ...state };
  nextState.user.stats = {
    ...nextState.user.stats,
    totalXP: 0,
    currentLevel: {
      level: 1,
      currentXP: 0,
      totalXP: 0,
      nextLevelXP: 100,
      levelName: 'Focused',
    },
    streak: 0,
    totalFocusHours: 0,
    totalXPSpent: 0,
  };
  return nextState;
}

export function resetWeeklyTracking(state: AppState): AppState {
  const nextState = { ...state };
  const tracking = nextState.user.timeTracking
    ? { ...nextState.user.timeTracking }
    : createEmptyTimeTracking();
  tracking.dailyStudyLog = [];
  tracking.weeklyStudyLog = [];
  tracking.lastUpdated = new Date();
  nextState.user.timeTracking = tracking;
  return nextState;
}

/**
 * Reset ONLY today's real-time activity tracking
 * Preserves: stats, XP, streak, weekly logs, all other data
 * Resets: live tracker session data for today
 */
export function resetTodaysActivity(state: AppState): AppState {
  // Reset the real-time tracking (today's sessions)
  resetTodayTracking();
  
  // Also reset today's daily log entry to start fresh
  // but keep weekly logs intact
  const nextState = { ...state };
  const tracking = nextState.user.timeTracking
    ? { ...nextState.user.timeTracking }
    : createEmptyTimeTracking();
  
  const today = startOfToday();
  // Remove today's entry from daily log (so fresh tracking starts with 0)
  tracking.dailyStudyLog = tracking.dailyStudyLog.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() !== today.getTime();
  });
  
  // Reset study and creative time for today (but keep entertainment breakdown)
  tracking.studyTime = 0;
  tracking.creativeTime = 0;
  tracking.entertainmentTime = {};
  tracking.lastUpdated = new Date();
  
  nextState.user.timeTracking = tracking;
  return nextState;
}
