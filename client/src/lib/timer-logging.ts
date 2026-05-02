/*
  Timer Logging Utility
  Automatically logs study and creative time for selected apps during Pomodoro sessions
*/

import { AppState, TimeTracking, AppCategory } from './types';
import { categorizeApp } from './app-categorizer';

export interface TimerSession {
  sessionId: string;
  type: 'study' | 'creative';
  durationMinutes: number;
  startTime: Date;
  endTime?: Date;
  appsUsed: string[];
  isActive: boolean;
}

/**
 * Log time spent on apps during a timer session
 * Updates the time tracking in AppState with categorization
 */
export function logTimerSessionToApps(
  state: AppState,
  sessionType: 'study' | 'creative',
  durationMinutes: number,
  trackedApps: string[]
): AppState {
  if (trackedApps.length === 0 || durationMinutes === 0) {
    return state;
  }

  const newState = { ...state };
  const currentTracking = { ...newState.user.timeTracking };
  const studyApps = state.studyAppsSetup || [];
  const creativeApps = state.creativeAppsSetup || [];

  // Totals are tracked by the central time aggregation utility.
  // This function only distributes entertainment attribution by app.

  // Track entertainment time for apps not in study or creative lists
  const timePerApp = durationMinutes / trackedApps.length;
  trackedApps.forEach(app => {
    const category = categorizeApp(app, studyApps, creativeApps);
    if (category.category === 'ENTERTAINMENT') {
      if (!currentTracking.entertainmentTime) {
        currentTracking.entertainmentTime = {};
      }
      currentTracking.entertainmentTime[app] = (currentTracking.entertainmentTime[app] || 0) + timePerApp;
    }
  });

  // Update lastUpdated timestamp
  currentTracking.lastUpdated = new Date();

  newState.user.timeTracking = currentTracking;
  return newState;
}

/**
 * Get summary of time logged for apps in current session
 */
export function getSessionTimeSummary(
  sessionType: 'study' | 'creative',
  durationMinutes: number,
  trackedApps: string[]
): { app: string; timeSpent: number }[] {
  if (trackedApps.length === 0) {
    return [];
  }

  const timePerApp = durationMinutes / trackedApps.length;
  return trackedApps.map(app => ({
    app,
    timeSpent: timePerApp,
  }));
}

/**
 * Format time for display (e.g., "25 mins", "1h 30m")
 */
export function formatSessionTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get app usage breakdown for a session with categorization
 */
export function getAppUsageBreakdown(
  trackedApps: string[],
  durationMinutes: number,
  studyApps: string[] = [],
  creativeApps: string[] = []
): { app: string; percentage: number; minutes: number; category: AppCategory }[] {
  if (trackedApps.length === 0) {
    return [];
  }

  const timePerApp = durationMinutes / trackedApps.length;
  const percentage = 100 / trackedApps.length;

  return trackedApps.map(app => {
    const category = categorizeApp(app, studyApps, creativeApps).category;
    return {
      app,
      percentage,
      minutes: timePerApp,
      category,
    };
  });
}

/**
 * Create a daily study log entry
 */
export function createDailyStudyLog(
  date: Date,
  totalMinutes: number,
  bySubject: { [subject: string]: number },
  tasksCompleted: number
) {
  return {
    date,
    totalMinutes,
    bySubject,
    tasksCompleted,
  };
}
