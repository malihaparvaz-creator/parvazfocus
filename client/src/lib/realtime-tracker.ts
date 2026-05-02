/*
  Parvaz Focus - Real-Time App & Website Tracking Engine
  Tracks time spent on user-configured apps across Study, Creative, Entertainment categories
  If an app is in both Study AND Creative, it counts for BOTH simultaneously.
*/

export type TrackingCategory = 'STUDY' | 'CREATIVE' | 'ENTERTAINMENT';

export interface TrackingSession {
  id: string;
  app: string;
  categories: TrackingCategory[]; // can have multiple if overlap
  startTime: number; // timestamp ms
  endTime?: number;
  durationSeconds: number;
  date: string; // YYYY-MM-DD
}

export interface AppTimeData {
  app: string;
  categories: TrackingCategory[];
  todaySeconds: number;
  totalSeconds: number;
  sessions: TrackingSession[];
}

export interface CategoryTotals {
  STUDY: number;    // seconds today
  CREATIVE: number; // seconds today
  ENTERTAINMENT: number; // seconds today
}

export interface RealTimeTrackingState {
  activeApp: string | null;
  activeCategories: TrackingCategory[];
  activeSessionStart: number | null;
  appData: Record<string, AppTimeData>;
  todayDate: string;
  lastUpdated: number;
}

const TRACKING_KEY = 'parvaz-realtime-tracking';
const TICK_INTERVAL = 1000; // 1 second

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Load tracking state from localStorage
 */
export function loadTrackingState(): RealTimeTrackingState {
  try {
    const raw = localStorage.getItem(TRACKING_KEY);
    if (!raw) return createFreshState();
    const parsed = JSON.parse(raw) as RealTimeTrackingState;
    // Reset if it's a new day
    if (parsed.todayDate !== getTodayStr()) {
      return resetDayInState(parsed);
    }
    return parsed;
  } catch {
    return createFreshState();
  }
}

/**
 * Save tracking state to localStorage
 */
export function saveTrackingState(state: RealTimeTrackingState): void {
  try {
    localStorage.setItem(TRACKING_KEY, JSON.stringify({
      ...state,
      lastUpdated: Date.now(),
    }));
  } catch {
    // Storage full or unavailable - ignore
  }
}

function createFreshState(): RealTimeTrackingState {
  return {
    activeApp: null,
    activeCategories: [],
    activeSessionStart: null,
    appData: {},
    todayDate: getTodayStr(),
    lastUpdated: Date.now(),
  };
}

function resetDayInState(prev: RealTimeTrackingState): RealTimeTrackingState {
  // Keep total history but reset today's counts
  const newAppData: Record<string, AppTimeData> = {};
  for (const [app, data] of Object.entries(prev.appData)) {
    newAppData[app] = {
      ...data,
      todaySeconds: 0,
      sessions: data.sessions.filter(s => s.date !== prev.todayDate), // keep old sessions
    };
  }
  return {
    activeApp: null,
    activeCategories: [],
    activeSessionStart: null,
    appData: newAppData,
    todayDate: getTodayStr(),
    lastUpdated: Date.now(),
  };
}

/**
 * Determine which categories an app belongs to, supporting multi-category overlap
 */
export function getAppCategories(
  appName: string,
  studyApps: string[],
  creativeApps: string[],
  entertainmentApps: string[]
): TrackingCategory[] {
  // Sentinel names for direct category tracking (no apps configured)
  if (appName === '__STUDY__') return ['STUDY'];
  if (appName === '__CREATIVE__') return ['CREATIVE'];
  if (appName === '__ENTERTAINMENT__') return ['ENTERTAINMENT'];

  const norm = appName.toLowerCase().trim();
  const categories: TrackingCategory[] = [];

  if (studyApps.some(a => a.toLowerCase().trim() === norm)) {
    categories.push('STUDY');
  }
  if (creativeApps.some(a => a.toLowerCase().trim() === norm)) {
    categories.push('CREATIVE');
  }
  // Entertainment: only if not already study/creative (or if explicitly listed)
  if (entertainmentApps.some(a => a.toLowerCase().trim() === norm)) {
    if (!categories.includes('ENTERTAINMENT')) {
      categories.push('ENTERTAINMENT');
    }
  }

  // Default to entertainment if nothing matched
  if (categories.length === 0) {
    categories.push('ENTERTAINMENT');
  }

  return categories;
}

/**
 * Start tracking an app
 */
export function startTracking(
  state: RealTimeTrackingState,
  appName: string,
  studyApps: string[],
  creativeApps: string[],
  entertainmentApps: string[]
): RealTimeTrackingState {
  // Stop current session first
  let newState = stopTracking(state);

  const categories = getAppCategories(appName, studyApps, creativeApps, entertainmentApps);
  const now = Date.now();

  // Ensure app entry exists
  if (!newState.appData[appName]) {
    newState.appData[appName] = {
      app: appName,
      categories,
      todaySeconds: 0,
      totalSeconds: 0,
      sessions: [],
    };
  }

  // Update categories in case user changed settings
  newState.appData[appName].categories = categories;

  return {
    ...newState,
    activeApp: appName,
    activeCategories: categories,
    activeSessionStart: now,
  };
}

/**
 * Stop the current tracking session
 */
export function stopTracking(state: RealTimeTrackingState): RealTimeTrackingState {
  if (!state.activeApp || !state.activeSessionStart) {
    return state;
  }

  const now = Date.now();
  const durationSeconds = Math.floor((now - state.activeSessionStart) / 1000);

  if (durationSeconds < 1) {
    return {
      ...state,
      activeApp: null,
      activeCategories: [],
      activeSessionStart: null,
    };
  }

  const app = state.activeApp;
  const session: TrackingSession = {
    id: generateId(),
    app,
    categories: state.activeCategories,
    startTime: state.activeSessionStart,
    endTime: now,
    durationSeconds,
    date: getTodayStr(),
  };

  const appData = { ...(state.appData[app] || {
    app,
    categories: state.activeCategories,
    todaySeconds: 0,
    totalSeconds: 0,
    sessions: [],
  }) };

  appData.todaySeconds += durationSeconds;
  appData.totalSeconds += durationSeconds;
  appData.sessions = [...appData.sessions, session];
  appData.categories = state.activeCategories;

  return {
    ...state,
    activeApp: null,
    activeCategories: [],
    activeSessionStart: null,
    appData: {
      ...state.appData,
      [app]: appData,
    },
  };
}

/**
 * Add elapsed seconds to current active session (for live ticking)
 * This mutates the state's todaySeconds for the active app in real-time
 */
export function tickActiveSession(state: RealTimeTrackingState): RealTimeTrackingState {
  if (!state.activeApp || !state.activeSessionStart) return state;

  const now = Date.now();
  const elapsed = Math.floor((now - state.activeSessionStart) / 1000);

  // Update the app's today seconds (live, without finalizing session)
  const existing = state.appData[state.activeApp];
  if (!existing) return state;

  // We compute today seconds as: saved + current elapsed
  return state; // actual display is computed from activeSessionStart in UI
}

/**
 * Get category totals for today (in seconds), including live elapsed from active session
 */
export function getCategoryTotals(state: RealTimeTrackingState): CategoryTotals {
  const totals: CategoryTotals = { STUDY: 0, CREATIVE: 0, ENTERTAINMENT: 0 };

  for (const data of Object.values(state.appData)) {
    for (const cat of data.categories) {
      totals[cat] += data.todaySeconds;
    }
  }

  // Add live elapsed from active session
  if (state.activeApp && state.activeSessionStart) {
    const elapsed = Math.floor((Date.now() - state.activeSessionStart) / 1000);
    for (const cat of state.activeCategories) {
      totals[cat] += elapsed;
    }
  }

  return totals;
}

/**
 * Get today's seconds for a specific app (including live elapsed)
 */
export function getAppTodaySeconds(state: RealTimeTrackingState, appName: string): number {
  const saved = state.appData[appName]?.todaySeconds ?? 0;
  if (state.activeApp === appName && state.activeSessionStart) {
    const elapsed = Math.floor((Date.now() - state.activeSessionStart) / 1000);
    return saved + elapsed;
  }
  return saved;
}

/**
 * Format seconds into human-readable time
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

/**
 * Get all apps that were active today (with data)
 */
export function getTodayActiveApps(state: RealTimeTrackingState): AppTimeData[] {
  return Object.values(state.appData)
    .filter(d => d.todaySeconds > 0 || state.activeApp === d.app)
    .sort((a, b) => b.todaySeconds - a.todaySeconds);
}

/**
 * Get category color
 */
export function getCategoryColor(category: TrackingCategory): string {
  switch (category) {
    case 'STUDY': return '#d8b4fe';
    case 'CREATIVE': return '#a78bfa';
    case 'ENTERTAINMENT': return '#fca5a5';
    default: return '#9ca3af';
  }
}

export function getCategoryEmoji(category: TrackingCategory): string {
  switch (category) {
    case 'STUDY': return '📚';
    case 'CREATIVE': return '🎨';
    case 'ENTERTAINMENT': return '🎬';
    default: return '❓';
  }
}

export const TICK_MS = TICK_INTERVAL;
