/*
  Smart App Blocker Utility
  Blocks distraction and entertainment apps during Pomodoro sessions
  Automatically whitelists user's selected study apps
*/

export interface BlockerConfig {
  blockedApps: string[];
  whitelistedApps: string[];
  isActive: boolean;
}

export interface BlockerStatus {
  isBlocked: boolean;
  reason: string;
  isWhitelisted: boolean;
}

// Default distraction apps to block
export const DEFAULT_BLOCKED_APPS = [
  'YouTube',
  'Twitter',
  'Instagram',
  'Discord',
  'Reddit',
  'TikTok',
  'Netflix',
  'Gaming',
  'Facebook',
  'Snapchat',
  'WhatsApp',
  'Telegram',
  'Twitch',
  'Pinterest',
  'Tumblr',
];

// Entertainment apps that should be blocked
export const ENTERTAINMENT_APPS = [
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
];

// Social media apps that should be blocked
export const SOCIAL_MEDIA_APPS = [
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
 * Create a blocker configuration with automatic whitelist
 */
export function createBlockerConfig(
  whitelistedApps: string[] = [],
  customBlockedApps: string[] = DEFAULT_BLOCKED_APPS
): BlockerConfig {
  return {
    blockedApps: customBlockedApps,
    whitelistedApps: whitelistedApps,
    isActive: false,
  };
}

/**
 * Check if an app should be blocked
 */
export function isAppBlocked(
  appName: string,
  config: BlockerConfig
): BlockerStatus {
  const normalizedApp = appName.toLowerCase().trim();

  // Check if app is whitelisted (study apps)
  const isWhitelisted = config.whitelistedApps.some(
    app => app.toLowerCase().trim() === normalizedApp
  );

  if (isWhitelisted) {
    return {
      isBlocked: false,
      reason: 'App is whitelisted for studying',
      isWhitelisted: true,
    };
  }

  // Check if app is in blocked list
  const blocked = config.blockedApps.some(
    app => app.toLowerCase().trim() === normalizedApp
  );

  if (blocked) {
    return {
      isBlocked: true,
      reason: 'App is blocked during focus sessions',
      isWhitelisted: false,
    };
  }

  return {
    isBlocked: false,
    reason: 'App is not in blocked list',
    isWhitelisted: false,
  };
}

/**
 * Get list of apps that will be blocked (excluding whitelisted)
 */
export function getEffectiveBlockedApps(config: BlockerConfig): string[] {
  const whitelistedLower = config.whitelistedApps.map(a => a.toLowerCase().trim());
  return config.blockedApps.filter(
    app => !whitelistedLower.includes(app.toLowerCase().trim())
  );
}

/**
 * Get summary of blocker status
 */
export function getBlockerSummary(config: BlockerConfig): {
  totalBlocked: number;
  whitelisted: number;
  effectivelyBlocked: number;
  message: string;
} {
  const effectivelyBlocked = getEffectiveBlockedApps(config).length;

  return {
    totalBlocked: config.blockedApps.length,
    whitelisted: config.whitelistedApps.length,
    effectivelyBlocked,
    message:
      effectivelyBlocked === 0
        ? 'All distraction apps are whitelisted. Focus carefully!'
        : `${effectivelyBlocked} app(s) will be blocked. ${config.whitelistedApps.length} study app(s) are whitelisted.`,
  };
}

/**
 * Format app list for display
 */
export function formatAppList(apps: string[]): string {
  if (apps.length === 0) return 'None';
  if (apps.length <= 3) return apps.join(', ');
  return `${apps.slice(0, 3).join(', ')} +${apps.length - 3} more`;
}

/**
 * Simulate blocking an app (for browser/system integration)
 * In a real implementation, this would use a browser extension or system API
 */
export function blockApp(appName: string, config: BlockerConfig): boolean {
  const status = isAppBlocked(appName, config);
  
  if (status.isBlocked && config.isActive) {
    console.warn(`🚫 Access blocked: ${appName} - ${status.reason}`);
    return true;
  }

  return false;
}

/**
 * Activate blocker for a session
 */
export function activateBlocker(config: BlockerConfig): BlockerConfig {
  return {
    ...config,
    isActive: true,
  };
}

/**
 * Deactivate blocker
 */
export function deactivateBlocker(config: BlockerConfig): BlockerConfig {
  return {
    ...config,
    isActive: false,
  };
}
