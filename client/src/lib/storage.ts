import { AppState, LEVEL_NAMES, STORE_ITEMS } from './types';

const STORAGE_KEY = 'parvaz-focus-state';

export function initializeAppState(): AppState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    user: {
      stats: {
        totalXP: 0,
        currentLevel: {
          level: 1,
          currentXP: 0,
          totalXP: 0,
          nextLevelXP: 100,
          levelName: LEVEL_NAMES[0],
        },
        streak: 0,
        totalFocusHours: 0,
        totalTasksCompleted: 0,
        averageFocusRating: 0,
        focusRank: 'DISTRACTED',
        trustScore: {
          percentage: 50,
          consistency: 0,
          promisesKept: 0,
          distractionsFaced: 0,
          lastUpdated: new Date(),
        },
        bankedDiscipline: {
          totalBanked: 0,
          history: [],
        },
        skipTokens: [],
        creativeFreedomPasses: [],
        xpStore: {
          items: STORE_ITEMS,
          purchasedItems: [],
        },
        totalXPSpent: 0,
        subjectTracker: {
          subjects: [],
          lastUpdated: today,
          allTimeStats: {
            totalSubjectsStudied: 0,
            averagePerformance: 0,
          },
        },
        distractionTracker: {
          events: [],
          dailyCount: 0,
          weeklyCount: 0,
          totalCount: 0,
          focusStreak: 0,
          lastReset: today,
        },
      },
      projects: [],
      parvazProjects: [
        { id: 'pf1', name: 'PARVAZ_FLOW', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'hd1', name: 'HIDAYA', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'lm1', name: 'LUMA', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'lg1', name: 'LEGACY', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'in1', name: 'INSTINCT', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'tl1', name: 'TALES', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
        { id: 'ds1', name: 'DESIGNS', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: today, updatedAt: today },
      ],
      creativeDump: [],
      visionBoard: {
        id: 'vb1',
        goals: [],
        futurePlans: [],
        whyYouWork: '',
        updatedAt: today,
      },
      subjectSettings: {
        subjects: [],
        lastUpdated: today,
      },
      reflectionHistory: {
        reflections: [],
        totalReflections: 0,
      },
      timeTracking: {
        studyTime: 0,
        entertainmentTime: {},
        creativeTime: 0,
        lastUpdated: today,
        dailyStudyLog: [],
        weeklyStudyLog: [],
      },
    },
    today: {
      mission: {
        id: `mission_${today.toISOString()}`,
        date: today,
        tasks: [],
        progressPercentage: 0,
        completed: false,
      },
      brief: generateDailyBrief(today),
      bonusDayActive: false,
      reflectionLocked: false,
    },
    sessions: [],
    projectsLocked: true,
    projectsUnlockedOnce: false,
    emergencyModeActive: false,
    creativeAppsSetup: [],
    studyAppsSetup: [],
    studyAppsSetupOnce: false,
    examCountdown: {
      exams: [],
      daysUntilNextExam: 0,
      focusMode: false,
      weakSubjectsFocus: [],
    },
  };
}

function generateDailyBrief(date: Date) {
  const motivationalLines = [
    'Today is not for intensity. It\'s for consistency.',
    'Small progress is still progress.',
    'Your future self will thank you.',
    'Discipline is freedom.',
    'Focus beats talent when talent is not focused.',
  ];

  const quotes = [
    '"The only way to do great work is to love what you do." - Steve Jobs',
    '"Success is not final, failure is not fatal." - Winston Churchill',
    '"You miss 100% of the shots you don\'t take." - Wayne Gretzky',
    '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
  ];

  const focusTips = [
    'Start with your most important task first.',
    'Take breaks every 25 minutes to stay fresh.',
    'Eliminate distractions before you begin.',
    'Track your time to stay accountable.',
  ];

  return {
    id: `brief_${date.toISOString()}`,
    date,
    mission: 'Complete your priorities to unlock projects',
    quote: quotes[Math.floor(Math.random() * quotes.length)],
    reminder: 'You have the power to shape your day.',
    warning: 'Distractions are waiting. Stay focused.',
    focusTip: focusTips[Math.floor(Math.random() * focusTips.length)],
    motivationalLine: motivationalLines[Math.floor(Math.random() * motivationalLines.length)],
  };
}

function migrateAppState(state: AppState): AppState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!state.user.stats) {
    state.user.stats = {} as any;
  }
  
  if (!state.user.stats.focusRank) {
    state.user.stats.focusRank = 'DISTRACTED';
  }
  
  if (!state.user.stats.trustScore) {
    state.user.stats.trustScore = {
      percentage: 50,
      consistency: 0,
      promisesKept: 0,
      distractionsFaced: 0,
      lastUpdated: new Date(),
    };
  }
  
  if (!state.user.stats.bankedDiscipline) {
    state.user.stats.bankedDiscipline = {
      totalBanked: 0,
      history: [],
    };
  }
  
  if (!state.user.stats.skipTokens) {
    state.user.stats.skipTokens = [];
  }
  
  if (!state.user.stats.creativeFreedomPasses) {
    state.user.stats.creativeFreedomPasses = [];
  }
  
  if (!state.user.stats.xpStore) {
    state.user.stats.xpStore = {
      items: STORE_ITEMS,
      purchasedItems: [],
    };
  }
  
  if (!state.user.stats.totalXPSpent) {
    state.user.stats.totalXPSpent = 0;
  }
  
  if (!state.user.stats.subjectTracker) {
    state.user.stats.subjectTracker = {
      subjects: [],
      lastUpdated: today,
      allTimeStats: {
        totalSubjectsStudied: 0,
        averagePerformance: 0,
      },
    };
  }
  
  if (!state.user.stats.distractionTracker) {
    state.user.stats.distractionTracker = {
      events: [],
      dailyCount: 0,
      weeklyCount: 0,
      totalCount: 0,
      focusStreak: 0,
      lastReset: today,
    };
  }
  
  if (!state.examCountdown) {
    state.examCountdown = {
      exams: [],
      daysUntilNextExam: 0,
      focusMode: false,
      weakSubjectsFocus: [],
    };
  }
  
  if (!state.user.subjectSettings) {
    state.user.subjectSettings = {
      subjects: [],
      lastUpdated: today,
    };
  }
  
  if (!state.user.reflectionHistory) {
    state.user.reflectionHistory = {
      reflections: [],
      totalReflections: 0,
    };
  }

  if (!state.user.timeTracking) {
    state.user.timeTracking = {
      studyTime: 0,
      entertainmentTime: {},
      creativeTime: 0,
      lastUpdated: today,
      dailyStudyLog: [],
      weeklyStudyLog: [],
    };
  } else {
    const lastUpdate = new Date(state.user.timeTracking.lastUpdated);
    lastUpdate.setHours(0, 0, 0, 0);
    if (lastUpdate.getTime() !== today.getTime()) {
      const dailyEntry = { date: lastUpdate, totalMinutes: state.user.timeTracking.studyTime, bySubject: {}, tasksCompleted: 0 };
      if (!state.user.timeTracking.dailyStudyLog) state.user.timeTracking.dailyStudyLog = [];
      state.user.timeTracking.dailyStudyLog.push(dailyEntry);
      state.user.timeTracking.studyTime = 0;
      state.user.timeTracking.creativeTime = 0;
      state.user.timeTracking.entertainmentTime = {};
      state.user.timeTracking.lastUpdated = today;
      state.today.reflectionLocked = false;
    }
  }

  if (!state.today.reflectionLocked) {
    state.today.reflectionLocked = false;
  }

  // Reset daily tasks if it's a new day
  const missionDate = state.today.mission.date ? new Date(state.today.mission.date) : null;
  if (missionDate) missionDate.setHours(0, 0, 0, 0);
  if (!missionDate || missionDate.getTime() !== today.getTime()) {
    // Reset daily mission with new date
    state.today.mission = {
      id: `mission-${today.getTime()}`,
      date: today,
      tasks: [],
      progressPercentage: 0,
      completed: false,
    };
    state.today.reflectionLocked = false;
  }

  if (state.projectsUnlockedOnce === undefined) {
    state.projectsUnlockedOnce = false;
  }

  if (!state.creativeAppsSetup) {
    state.creativeAppsSetup = [];
  }

  if (!state.studyAppsSetup) {
    state.studyAppsSetup = [];
  }

  if (state.studyAppsSetupOnce === undefined) {
    state.studyAppsSetupOnce = false;
  }

  // Migrate parvazProjects to include new fields
  if (state.user.parvazProjects) {
    const now = new Date();
    state.user.parvazProjects = state.user.parvazProjects.map(project => ({
      ...project,
      platforms: project.platforms || [],
      creativeApps: project.creativeApps || [],
      totalCreativeTimeSpent: project.totalCreativeTimeSpent || 0,
      locked: project.locked || false,
      status: (project as any).status || 'ACTIVE',
      createdAt: (project as any).createdAt || now,
      updatedAt: (project as any).updatedAt || now,
    }));
    
    // Add missing projects (TALES, DESIGNS)
    if (!state.user.parvazProjects.find(p => p.name === 'TALES')) {
      state.user.parvazProjects.push({
        id: 'tl1',
        name: 'TALES',
        ideas: [],
        pendingTasks: [],
        contentPipeline: [],
        experiments: [],
        platforms: [],
        creativeApps: [],
        totalCreativeTimeSpent: 0,
        locked: false,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });
    }
    
    if (!state.user.parvazProjects.find(p => p.name === 'DESIGNS')) {
      state.user.parvazProjects.push({
        id: 'ds1',
        name: 'DESIGNS',
        ideas: [],
        pendingTasks: [],
        contentPipeline: [],
        experiments: [],
        platforms: [],
        creativeApps: [],
        totalCreativeTimeSpent: 0,
        locked: false,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  
  return state;
}

export function loadAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initializeAppState();
    }

    let state = JSON.parse(stored) as AppState;
    state = migrateAppState(state);
    return state;
  } catch (error) {
    console.error('Failed to load app state:', error);
    return initializeAppState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
}

export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear app state:', error);
  }
}

// ── Firebase sync helper (called from AppContext) ─────────────────────────────
import { saveToFirestore } from './firebase';
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
export function saveAppStateWithSync(state: AppState): void {
  saveAppState(state); // local first, always instant
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => saveToFirestore(state), 2000); // cloud after 2s debounce
}
