/* Parvaz Focus - Core Data Models */

export type TaskPriority = 'MUST_DO' | 'SHOULD_DO' | 'BONUS';
export type TaskCategory = 'TOP_PRIORITY' | 'PRIORITY' | 'BONUS';
export type FocusMode = 'DEEP_FOCUS' | 'REVISION_SPRINT' | 'QUICK_SESSION';
export type FocusRating = 'LOCKED_IN' | 'DISTRACTED' | 'SURVIVED';
export type FocusRank = 'DISTRACTED' | 'STABLE' | 'FOCUSED' | 'CONSISTENT' | 'RELENTLESS' | 'LOCKED_IN' | 'ELITE_DISCIPLINE';
export type StoreItem = 'THEME' | 'SOUNDTRACK' | 'QUOTE_PACK' | 'FOCUS_ROOM' | 'BONUS_PROJECT_TIME';
export type ProjectPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'DIGITAL_PRODUCT' | 'WEBSITE' | 'MERCH' | 'BUSINESS' | 'OTHER';
export type EntertainmentApp = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'REDDIT' | 'DISCORD' | 'GAMING' | 'OTHER';
export type AppCategory = 'STUDY' | 'CREATIVE' | 'ENTERTAINMENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  createdAt: Date;
  completedAt?: Date;
  subject?: string; // e.g., "Biology", "Math", "History"
  studyTimeSpent?: number; // in minutes - actual time spent studying
}

export interface DailyMission {
  id: string;
  date: Date;
  tasks: Task[];
  progressPercentage: number;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  taskId: string;
  mode: FocusMode;
  duration: number; // in minutes
  actualDuration: number; // in minutes
  startedAt: Date;
  endedAt?: Date;
  rating?: FocusRating;
  notes?: string;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  levelName: string;
}

export interface UserStats {
  totalXP: number;
  currentLevel: UserLevel;
  streak: number;
  lastActivityDate?: Date;
  totalFocusHours: number;
  totalTasksCompleted: number;
  averageFocusRating: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  unlocked: boolean;
  unlockedAt?: Date;
  ideas: IdeaVaultItem[];
  tasks: Task[];
  createdAt: Date;
}

export interface IdeaVaultItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: 'BUSINESS' | 'HOOK' | 'VIDEO' | 'QUOTE' | 'SYSTEM' | 'EXPERIMENT';
  createdAt: Date;
}

export interface ParvazProject {
  id: string;
  name: 'PARVAZ_FLOW' | 'HIDAYA' | 'LUMA' | 'LEGACY' | 'INSTINCT' | 'TALES' | 'DESIGNS';
  ideas: IdeaVaultItem[];
  pendingTasks: Task[];
  contentPipeline: string[];
  experiments: string[];
  platforms: ProjectPlatform[];
  creativeApps: string[];
  totalCreativeTimeSpent: number;
  locked: boolean;
  lockedAt?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  description?: string;
  startDate?: Date;
  operatesWhere?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreativeDumpItem {
  id: string;
  content: string;
  createdAt: Date;
  capturedAt: Date; // When idea appeared
}

export interface VisionBoard {
  id: string;
  goals: string[];
  futurePlans: string[];
  whyYouWork: string;
  updatedAt: Date;
}

export interface DailyBrief {
  id: string;
  date: Date;
  mission: string;
  quote: string;
  reminder: string;
  warning: string;
  focusTip: string;
  motivationalLine: string;
}

export interface NightReflection {
  id: string;
  date: Date;
  whatMovedMeForward: string;
  whatDistractedMe: string;
  shouldImprove: string;
  energyLevel: number; // 1-10
  completedAt: Date;
}

// Advanced XP System Types

export interface FocusRankInfo {
  rank: FocusRank;
  minXP: number;
  description: string;
  emoji: string;
}

export interface SkipToken {
  id: string;
  type: 'SKIP_TASK' | 'MAINTAIN_STREAK';
  earnedAt: Date;
  usedAt?: Date;
}

export interface BankedDiscipline {
  totalBanked: number;
  lastBankedAt?: Date;
  history: { date: Date; amount: number }[];
}

export interface CreativeFreedomPass {
  earnedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

export interface TrustScore {
  percentage: number; // 0-100
  consistency: number; // tasks completed on time
  promisesKept: number; // streaks maintained
  distractionsFaced: number; // distractions overcome
  lastUpdated: Date;
}

export interface StoreItemData {
  id: string;
  name: string;
  type: StoreItem;
  cost: number;
  description: string;
}

export interface XPStore {
  items: StoreItemData[];
  purchasedItems: string[];
}

export interface SubjectPerformance {
  subject: string;
  tasksCompleted: number;
  totalTasks: number;
  averageScore: number; // 0-100
  totalXPEarned: number;
  focusHours: number;
  lastStudiedAt?: Date;
  trend: 'improving' | 'stable' | 'declining'; // Based on last 7 days
}

export interface SubjectTracker {
  subjects: SubjectPerformance[];
  lastUpdated: Date;
  allTimeStats: {
    totalSubjectsStudied: number;
    averagePerformance: number;
    strongestSubject?: string;
    weakestSubject?: string;
  };
}

export interface DistractionEvent {
  id: string;
  timestamp: Date;
  app: string;
  duration: number;
  context?: string;
  acknowledged: boolean;
}

export interface DistractionTracker {
  events: DistractionEvent[];
  dailyCount: number;
  weeklyCount: number;
  totalCount: number;
  lastDistraction?: DistractionEvent;
  focusStreak: number;
  mostCommonApp?: string;
  lastReset: Date;
}

export interface Exam {
  id: string;
  subject: string;
  date: Date;
  daysUntil: number;
  priority: 'critical' | 'high' | 'medium';
  weakAreas: string[];
  focusSubjects: string[];
  createdAt: Date;
}

export interface AdvancedTimerSession {
  id: string;
  duration: number;
  studyDuration: number;
  breakDuration: number;
  totalCycles: number;
  completedCycles: number;
  extraBreaksTaken: number;
  xpUsedForBreaks: number;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  isPaused: boolean;
  // Pause tracking
  pausedAt?: Date;
  pausedDurationMs?: number; // accumulated paused milliseconds
  appBlockerActive: boolean;
  blockedApps: string[];
}

export interface ExamCountdown {
  exams: Exam[];
  upcomingExam?: Exam;
  daysUntilNextExam: number;
  focusMode: boolean;
  weakSubjectsFocus: string[];
}

export interface EnhancedUserStats extends UserStats {
  focusRank: FocusRank;
  trustScore: TrustScore;
  bankedDiscipline: BankedDiscipline;
  skipTokens: SkipToken[];
  creativeFreedomPasses: CreativeFreedomPass[];
  xpStore: XPStore;
  totalXPSpent: number;
  subjectTracker: SubjectTracker;
  distractionTracker: DistractionTracker;
}

export interface ReflectionHistory {
  reflections: NightReflection[];
  totalReflections: number;
  lastReflectionDate?: Date;
}

export interface SubjectSettings {
  subjects: string[];
  lastUpdated: Date;
}

export interface DailyStudyLog {
  date: Date;
  totalMinutes: number;
  bySubject: { [subject: string]: number };
  tasksCompleted: number;
}

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  totalStudyTime: number;
  totalCreativeTime: number;
  totalEntertainmentTime: number;
  subjectFocus: { [subject: string]: number };
  topSubject: string;
  leastSubject: string;
  averageDailyStudy: number;
  taskCompletion: number;
}

export interface TimeTracking {
  studyTime: number; // total minutes
  entertainmentTime: { [app: string]: number }; // minutes per app
  creativeTime: number; // total minutes
  lastUpdated: Date;
  dailyStudyLog: DailyStudyLog[];
  weeklyStudyLog: WeeklySummary[];
}

export interface CreativeProject {
  id: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreativeTodo {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  user: {
    stats: EnhancedUserStats;
    projects: Project[];
    parvazProjects: ParvazProject[];
    creativeDump: CreativeDumpItem[];
    visionBoard: VisionBoard;
    subjectSettings: SubjectSettings;
    reflectionHistory: ReflectionHistory;
    timeTracking: TimeTracking;
  };
  today: {
    mission: DailyMission;
    brief: DailyBrief;
    reflection?: NightReflection;
    bonusDayActive?: boolean;
    reflectionLocked?: boolean;
  };
  sessions: FocusSession[];
  projectsLocked: boolean;
  projectsUnlockedOnce: boolean; // Track if projects were unlocked for first time
  emergencyModeActive: boolean;
  examCountdown: ExamCountdown;
  currentTimerSession?: AdvancedTimerSession;
  creativeAppsSetup?: string[]; // Apps/websites used for creative projects
  studyAppsSetup?: string[]; // Apps/websites used for studying
  entertainmentAppsSetup?: string[]; // Apps/websites used for entertainment
  studyAppsSetupOnce: boolean; // Track if study apps were set up on first task
  creativeProjects?: CreativeProject[]; // Creative zone projects/todo list
  creativeTodos?: CreativeTodo[]; // Creative zone independent todo list
}

export const LEVEL_NAMES = [
  'Focused',
  'Consistent',
  'Disciplined',
  'Relentless',
  'Unstoppable',
  'Legendary',
];

export const FOCUS_RANKS: FocusRankInfo[] = [
  { rank: 'DISTRACTED', minXP: 0, description: 'Just starting', emoji: '😴' },
  { rank: 'STABLE', minXP: 100, description: 'Building consistency', emoji: '🧘' },
  { rank: 'FOCUSED', minXP: 300, description: 'Finding your rhythm', emoji: '🎯' },
  { rank: 'CONSISTENT', minXP: 700, description: 'Discipline becoming habit', emoji: '💪' },
  { rank: 'RELENTLESS', minXP: 1500, description: 'Unstoppable momentum', emoji: '⚡' },
  { rank: 'LOCKED_IN', minXP: 3000, description: 'Elite focus state', emoji: '🔥' },
  { rank: 'ELITE_DISCIPLINE', minXP: 6000, description: 'Master of discipline', emoji: '👑' },
];

export const XP_REWARDS = {
  READING: 10,
  PRACTICE_QUESTIONS: 30,
  MOCK_TEST: 100,
  TASK_COMPLETION: 50,
  FOCUS_SESSION: 25,
  EXTRA_STUDY: 40,
  AVOIDED_DISTRACTION: 15,
};

export const XP_COSTS = {
  PROJECT_ACCESS_30MIN: 100,
  PROJECT_ACCESS_1HOUR: 300,
  BONUS_PROJECT_EVENING: 1000,
  SKIP_TOKEN: 200,
  THEME_UNLOCK: 150,
  SOUNDTRACK_PACK: 250,
};

export const STORE_ITEMS: StoreItemData[] = [
  {
    id: 'theme_dark',
    name: 'Dark Theme',
    type: 'THEME',
    cost: 150,
    description: 'Elegant dark mode for late-night studying',
  },
  {
    id: 'theme_forest',
    name: 'Forest Theme',
    type: 'THEME',
    cost: 150,
    description: 'Calming green palette inspired by nature',
  },
  {
    id: 'theme_ocean',
    name: 'Ocean Theme',
    type: 'THEME',
    cost: 200,
    description: 'Cool blue tones to keep you calm and focused',
  },
  {
    id: 'theme_solar',
    name: 'Solar Theme',
    type: 'THEME',
    cost: 200,
    description: 'Warm, high-contrast palette for daytime productivity',
  },
  {
    id: 'theme_mint',
    name: 'Mint Theme',
    type: 'THEME',
    cost: 180,
    description: 'Fresh mint accents for a clean, energized interface',
  },
  {
    id: 'theme_twilight',
    name: 'Twilight Theme',
    type: 'THEME',
    cost: 220,
    description: 'Subtle dark blue tones for a calm evening workspace',
  },
  {
    id: 'theme_aurora',
    name: 'Aurora Theme',
    type: 'THEME',
    cost: 800,
    description: 'Premium northern-lights inspired gradient with vibrant accents',
  },
  {
    id: 'theme_midnight',
    name: 'Midnight Theme',
    type: 'THEME',
    cost: 900,
    description: 'Deep high-contrast midnight palette for focused late-night work',
  },
  {
    id: 'theme_crystal',
    name: 'Crystal Theme',
    type: 'THEME',
    cost: 1000,
    description: 'Luminous glass-like UI with soft glows and elegant highlights',
  },
  {
    id: 'soundtrack_focus',
    name: 'Deep Focus Soundtrack',
    type: 'SOUNDTRACK',
    cost: 250,
    description: 'Ambient music for maximum concentration',
  },
  {
    id: 'soundtrack_rain',
    name: 'Rain & Thunder',
    type: 'SOUNDTRACK',
    cost: 250,
    description: 'Calming rain sounds for relaxed focus',
  },
  {
    id: 'soundtrack_lofi',
    name: 'Lofi Study Beats',
    type: 'SOUNDTRACK',
    cost: 180,
    description: 'Chill lo-fi beats to maintain steady rhythm',
  },
  {
    id: 'soundtrack_cinematic',
    name: 'Cinematic Drive',
    type: 'SOUNDTRACK',
    cost: 300,
    description: 'Epic instrumental tracks to power intense sessions',
  },
  {
    id: 'soundtrack_piano',
    name: 'Piano Focus Suite',
    type: 'SOUNDTRACK',
    cost: 200,
    description: 'Soft piano melodies to keep your mind centered',
  },
  {
    id: 'soundtrack_space',
    name: 'Space Ambient',
    type: 'SOUNDTRACK',
    cost: 270,
    description: 'Expansive ambient textures for deep concentration',
  },
  {
    id: 'quotes_stoic',
    name: 'Stoic Quotes Pack',
    type: 'QUOTE_PACK',
    cost: 100,
    description: 'Ancient wisdom for modern discipline',
  },
  {
    id: 'room_library',
    name: 'Library Focus Room',
    type: 'FOCUS_ROOM',
    cost: 300,
    description: 'Study in a virtual library setting',
  },
  {
    id: 'room_cafe',
    name: 'Cafe Focus Room',
    type: 'FOCUS_ROOM',
    cost: 320,
    description: 'Warm cafe environment to keep energy high',
  },
  {
    id: 'room_garden',
    name: 'Garden Focus Room',
    type: 'FOCUS_ROOM',
    cost: 340,
    description: 'Relaxing garden ambience for steady focus',
  },
  // Bonus project time / unlocks
  {
    id: 'bonus_30min',
    name: '30m Bonus Project Time',
    type: 'BONUS_PROJECT_TIME',
    cost: 100,
    description: 'Add 30 minutes of project time unlock',
  },
  {
    id: 'bonus_60min',
    name: '60m Bonus Project Time',
    type: 'BONUS_PROJECT_TIME',
    cost: 180,
    description: 'Add 60 minutes of project time unlock',
  },
  {
    id: 'bonus_90min',
    name: '90m Bonus Project Time',
    type: 'BONUS_PROJECT_TIME',
    cost: 260,
    description: 'Extend your project time by 90 focused minutes',
  },
  {
    id: 'bonus_evening',
    name: 'Evening Bonus Unlock',
    type: 'BONUS_PROJECT_TIME',
    cost: 400,
    description: 'Unlock evening project window for relaxed work',
  },
  {
    id: 'bonus_focus_boost',
    name: 'Focus Boost Unlock',
    type: 'BONUS_PROJECT_TIME',
    cost: 350,
    description: 'Unlock an extra focused session for high-priority work',
  },
];

export const DAILY_QUOTES = [
  'Win today before dreaming about tomorrow.',
  'Your future is built in boring moments.',
  'Discipline beats motivation.',
  'Board exams do not care about perfectionism.',
  'Done > planning.',
  'Consistency is the compound interest of discipline.',
  'The best time to start was yesterday. The second best is now.',
  'Small daily improvements are the key to staggering long-term results.',
  'Your self-trust is your superpower.',
  'Discipline is freedom.',
  'Earn your freedom through consistency.',
  'The only way out is through.',
  'Progress over perfection.',
];
