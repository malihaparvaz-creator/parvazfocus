import type { AppState, TimeTracking, WeeklySummary } from './types';

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
  const nextState = { ...state };
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
