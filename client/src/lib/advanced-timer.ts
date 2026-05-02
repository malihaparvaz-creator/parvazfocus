/* Parvaz Focus - Advanced Pomodoro Timer Utilities
   25min study + 5min break cycles with XP-based break extensions
*/

import { AppState, AdvancedTimerSession } from './types';
import { nanoid } from 'nanoid';

const STUDY_DURATION = 25; // minutes
const BREAK_DURATION = 5; // minutes
const XP_PER_10MIN_BREAK = 20;
const MIN_TIMER_DURATION = 120; // 2 hours minimum

/**
 * Create a new timer session
 */
export function createTimerSession(
  state: AppState,
  durationMinutes: number,
  blockedApps: string[] = []
): AppState {
  if (durationMinutes < MIN_TIMER_DURATION) {
    throw new Error(`Minimum timer duration is ${MIN_TIMER_DURATION} minutes`);
  }

  const newState = { ...state };
  
  // Calculate number of cycles
  const cycleTime = STUDY_DURATION + BREAK_DURATION; // 30 minutes per cycle
  const totalCycles = Math.floor(durationMinutes / cycleTime);

  const session: AdvancedTimerSession = {
    id: nanoid(),
    duration: durationMinutes,
    studyDuration: STUDY_DURATION,
    breakDuration: BREAK_DURATION,
    totalCycles,
    completedCycles: 0,
    extraBreaksTaken: 0,
    xpUsedForBreaks: 0,
    startedAt: new Date(),
    isActive: true,
    isPaused: false,
    appBlockerActive: true,
    blockedApps,
  };

  newState.currentTimerSession = session;
  return newState;
}

/**
 * Take an extra break using XP
 */
export function takeExtraBreak(
  state: AppState,
  breakDurationMinutes: number
): { success: boolean; message: string; newState?: AppState } {
  if (!state.currentTimerSession) {
    return { success: false, message: 'No active timer session' };
  }

  const xpRequired = Math.ceil((breakDurationMinutes / 10) * XP_PER_10MIN_BREAK);

  if (state.user.stats.totalXP < xpRequired) {
    return {
      success: false,
      message: `You need ${xpRequired} XP for a ${breakDurationMinutes}min break. You have ${state.user.stats.totalXP} XP.`,
    };
  }

  const newState = { ...state };
  const session = newState.currentTimerSession;

  if (session) {
    session.extraBreaksTaken += 1;
    session.xpUsedForBreaks += xpRequired;

    // Deduct XP
    newState.user.stats.totalXP -= xpRequired;
  }

  return {
    success: true,
    message: `Extra ${breakDurationMinutes}min break taken! Used ${xpRequired} XP.`,
    newState,
  };
}

/**
 * Complete a study cycle
 */
export function completeStudyCycle(state: AppState): AppState {
  const newState = { ...state };
  if (newState.currentTimerSession) {
    newState.currentTimerSession.completedCycles += 1;
  }
  return newState;
}

/**
 * Pause timer
 */
export function pauseTimer(state: AppState): AppState {
  const newState = { ...state };
  if (newState.currentTimerSession) {
    newState.currentTimerSession.isPaused = true;
  }
  return newState;
}

/**
 * Resume timer
 */
export function resumeTimer(state: AppState): AppState {
  const newState = { ...state };
  if (newState.currentTimerSession) {
    newState.currentTimerSession.isPaused = false;
  }
  return newState;
}

/**
 * End timer session
 */
export function endTimerSession(state: AppState): AppState {
  const newState = { ...state };
  if (newState.currentTimerSession) {
    newState.currentTimerSession.isActive = false;
    newState.currentTimerSession.endedAt = new Date();
  }
  return newState;
}

/**
 * Get timer progress percentage
 */
export function getTimerProgress(session: AdvancedTimerSession): number {
  const elapsedTime = new Date().getTime() - new Date(session.startedAt).getTime();
  const totalTime = session.duration * 60 * 1000; // Convert to milliseconds
  return Math.min(100, (elapsedTime / totalTime) * 100);
}

/**
 * Get remaining time in minutes
 */
export function getRemainingTime(session: AdvancedTimerSession): number {
  const elapsedTime = new Date().getTime() - new Date(session.startedAt).getTime();
  const remainingMs = session.duration * 60 * 1000 - elapsedTime;
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
}

/**
 * Get current cycle info
 */
export function getCurrentCycleInfo(session: AdvancedTimerSession) {
  const cycleTime = STUDY_DURATION + BREAK_DURATION;
  const elapsedTime = new Date().getTime() - new Date(session.startedAt).getTime();
  const elapsedMinutes = elapsedTime / (1000 * 60);

  const currentCycle = Math.floor(elapsedMinutes / cycleTime) + 1;
  const timeInCurrentCycle = elapsedMinutes % cycleTime;

  const isStudyPhase = timeInCurrentCycle < STUDY_DURATION;
  const timeRemaining = isStudyPhase
    ? STUDY_DURATION - timeInCurrentCycle
    : BREAK_DURATION - (timeInCurrentCycle - STUDY_DURATION);

  return {
    currentCycle,
    isStudyPhase,
    timeRemaining: Math.ceil(timeRemaining),
    phase: isStudyPhase ? 'Study' : 'Break',
  };
}

/**
 * Get break cost in XP
 */
export function getBreakCostInXP(breakDurationMinutes: number): number {
  return Math.ceil((breakDurationMinutes / 10) * XP_PER_10MIN_BREAK);
}

/**
 * Get timer statistics
 */
export function getTimerStats(session: AdvancedTimerSession) {
  const elapsedTime = new Date().getTime() - new Date(session.startedAt).getTime();
  const elapsedMinutes = elapsedTime / (1000 * 60);

  return {
    totalDuration: session.duration,
    elapsedMinutes: Math.floor(elapsedMinutes),
    remainingMinutes: session.duration - Math.floor(elapsedMinutes),
    completedCycles: session.completedCycles,
    totalCycles: session.totalCycles,
    extraBreaksTaken: session.extraBreaksTaken,
    xpUsedForBreaks: session.xpUsedForBreaks,
    progress: getTimerProgress(session),
  };
}

/**
 * Validate timer duration
 */
export function validateTimerDuration(minutes: number): { valid: boolean; message?: string } {
  if (minutes < MIN_TIMER_DURATION) {
    return {
      valid: false,
      message: `Minimum timer duration is ${MIN_TIMER_DURATION} minutes (2 hours)`,
    };
  }

  if (minutes > 480) {
    return {
      valid: false,
      message: 'Maximum timer duration is 480 minutes (8 hours)',
    };
  }

  return { valid: true };
}

/**
 * Get timer motivation message
 */
export function getTimerMotivation(session: AdvancedTimerSession): string {
  const progress = getTimerProgress(session);
  const cycleInfo = getCurrentCycleInfo(session);

  if (progress < 25) {
    return 'You got this! Warm up your focus. 🔥';
  }

  if (progress < 50) {
    return 'Halfway there! Keep the momentum. 💪';
  }

  if (progress < 75) {
    return 'Final stretch! You are unstoppable. ⚡';
  }

  return 'Almost done! Finish strong! 🏁';
}

/**
 * Format time for display (HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
