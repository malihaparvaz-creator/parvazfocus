/*
  App Categorizer Utility
  Categorizes apps into Study, Creative, or Entertainment for time tracking
*/

export type AppCategory = 'STUDY' | 'CREATIVE' | 'ENTERTAINMENT';

export interface AppCategoryInfo {
  category: AppCategory;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

// Default entertainment apps (rest/break time)
export const DEFAULT_ENTERTAINMENT_APPS = [
  'YouTube',
  'Netflix',
  'Hulu',
  'Disney+',
  'Prime Video',
  'Twitch',
  'Spotify',
  'Apple Music',
  'Soundcloud',
  'Pandora',
  'Gaming',
  'Steam',
  'Epic Games',
  'PlayStation',
  'Xbox',
  'Facebook',
  'Instagram',
  'Twitter',
  'TikTok',
  'Snapchat',
  'Reddit',
  'LinkedIn',
  'Pinterest',
  'Tumblr',
  'WhatsApp',
  'Telegram',
  'Signal',
  'Discord',
  'Slack',
  'WeChat',
];

/**
 * Categorize an app based on user's configured apps
 */
export function categorizeApp(
  appName: string,
  studyApps: string[] = [],
  creativeApps: string[] = [],
  entertainmentApps: string[] = DEFAULT_ENTERTAINMENT_APPS
): AppCategoryInfo {
  const normalizedApp = appName.toLowerCase().trim();

  // Check study apps
  if (studyApps.some(app => app.toLowerCase().trim() === normalizedApp)) {
    return {
      category: 'STUDY',
      reason: 'App is configured as a study app',
      confidence: 'high',
    };
  }

  // Check creative apps
  if (creativeApps.some(app => app.toLowerCase().trim() === normalizedApp)) {
    return {
      category: 'CREATIVE',
      reason: 'App is configured as a creative app',
      confidence: 'high',
    };
  }

  // Check entertainment apps
  if (entertainmentApps.some(app => app.toLowerCase().trim() === normalizedApp)) {
    return {
      category: 'ENTERTAINMENT',
      reason: 'App is known entertainment/social media app',
      confidence: 'high',
    };
  }

  // Default to entertainment if unknown (conservative approach)
  return {
    category: 'ENTERTAINMENT',
    reason: 'App category not configured, defaulting to entertainment',
    confidence: 'low',
  };
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: AppCategory): string {
  switch (category) {
    case 'STUDY':
      return '#d8b4fe'; // Purple
    case 'CREATIVE':
      return '#a78bfa'; // Indigo
    case 'ENTERTAINMENT':
      return '#fca5a5'; // Red
    default:
      return '#9ca3af'; // Gray
  }
}

/**
 * Get category emoji for UI display
 */
export function getCategoryEmoji(category: AppCategory): string {
  switch (category) {
    case 'STUDY':
      return '📚';
    case 'CREATIVE':
      return '🎨';
    case 'ENTERTAINMENT':
      return '🎬';
    default:
      return '❓';
  }
}

/**
 * Get category label for UI display
 */
export function getCategoryLabel(category: AppCategory): string {
  switch (category) {
    case 'STUDY':
      return 'Study';
    case 'CREATIVE':
      return 'Creative';
    case 'ENTERTAINMENT':
      return 'Entertainment';
    default:
      return 'Unknown';
  }
}

/**
 * Batch categorize multiple apps
 */
export function categorizeApps(
  apps: string[],
  studyApps: string[] = [],
  creativeApps: string[] = [],
  entertainmentApps: string[] = DEFAULT_ENTERTAINMENT_APPS
): Record<string, AppCategoryInfo> {
  return apps.reduce((acc, app) => {
    acc[app] = categorizeApp(app, studyApps, creativeApps, entertainmentApps);
    return acc;
  }, {} as Record<string, AppCategoryInfo>);
}

/**
 * Get apps by category
 */
export function getAppsByCategory(
  apps: string[],
  category: AppCategory,
  studyApps: string[] = [],
  creativeApps: string[] = [],
  entertainmentApps: string[] = DEFAULT_ENTERTAINMENT_APPS
): string[] {
  return apps.filter(app => {
    const info = categorizeApp(app, studyApps, creativeApps, entertainmentApps);
    return info.category === category;
  });
}
