/* Parvaz Focus - Distraction Tracker Utilities
   Track app switches and display gentle roasting messages
*/

import { AppState, DistractionEvent, DistractionTracker } from './types';
import { nanoid } from 'nanoid';

// Gentle roasting messages based on app and context
const ROASTING_MESSAGES = {
  YouTube: [
    "YouTube? Really? Your future self is disappointed. 🎬",
    "One more video... said no successful person ever. 📺",
    "YouTube is a time machine that only goes backward. ⏰",
    "Your brain called. It wants to study, not binge. 🧠",
    "Recommendation algorithm: You're procrastinating. 🤖",
  ],
  Twitter: [
    "Twitter? Your grades are trending downward. 📉",
    "Doomscrolling won't doom-solve your problems. 🌪️",
    "The tweet you're reading will be forgotten. Your exam won't. 📝",
    "Your TL will be there after you study. Probably. 🐦",
    "Hot take: Studying is hotter than hot takes. 🔥",
  ],
  Instagram: [
    "Instagram: Where productivity goes to die. 💀",
    "That story will still be there in 2 hours. Your focus won't. 📸",
    "Comparison is the thief of joy. Distraction is the thief of grades. 👀",
    "Double tap your textbook instead. 📚",
    "Your feed is infinite. Your study time isn't. ⏳",
  ],
  Discord: [
    "Discord servers will survive without you for 30 minutes. 🎮",
    "Your friends are probably studying too. Or they should be. 👥",
    "The group chat isn't going anywhere. Your deadline is. ⏰",
    "Notifications are just distractions wearing a costume. 👻",
    "Study now, Discord later. Future you will thank present you. 🙏",
  ],
  Reddit: [
    "Reddit: The front page of procrastination. 📰",
    "That thread will still be there. Your focus won't. 🧵",
    "Upvotes don't count toward your GPA. 👎",
    "You came for one post. You'll stay for three hours. Don't. ⚠️",
    "Reddit is a rabbit hole. Your studies are a ladder. 🐰",
  ],
  TikTok: [
    "TikTok: 15 seconds of entertainment, 2 hours of regret. 📱",
    "The algorithm is designed to keep you here. Don't let it. 🔄",
    "That sound will trend without you. Your grades won't. 🎵",
    "FYP = For You to Procrastinate. Don't fall for it. 😈",
    "Doom-scrolling TikTok is just YouTube's evil twin. 👯",
  ],
  Netflix: [
    "One episode turns into a season. One study session turns into mastery. 🎬",
    "Netflix is waiting. So is your exam. Guess which one matters? 📺",
    "The show will still be there. Your motivation might not. 🎭",
    "Binge-watching: The art of losing 8 hours. 😴",
    "Your future self is yelling at you right now. 📢",
  ],
  Gaming: [
    "That game will still be there after you ace this. 🎮",
    "Respawning works in games. Not on exams. 💀",
    "Your rank will go up slower than your grades are going down. 📊",
    "Gaming is a reward. Study is the quest. Complete the quest first. ⚔️",
    "You're speedrunning to failure. Wrong game. 🏃",
  ],
  default: [
    "Focus is a muscle. You're not exercising it right now. 💪",
    "Your future self is watching. And judging. 👀",
    "Distraction is just procrastination's cooler cousin. 😎",
    "Every minute counts. This one doesn't. ⏱️",
    "You know what you should be doing. Do it. 🎯",
    "The only thing between you and success is... that tab. 🚫",
    "Your brain is 99% focused. The other 1% is on Reddit. 🧠",
    "Discipline is doing what needs to be done, even when you don't want to. 💪",
    "You're not tired. You're just avoiding. Big difference. 😴",
    "The grind doesn't stop. Neither should you. 🔄",
  ],
};

/**
 * Get a random roasting message for an app
 */
export function getRoastingMessage(app: string): string {
  const messages = ROASTING_MESSAGES[app as keyof typeof ROASTING_MESSAGES] || ROASTING_MESSAGES.default;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Log a distraction event
 */
export function logDistraction(
  state: AppState,
  app: string,
  duration: number = 0,
  context?: string
): AppState {
  const newState = { ...state };
  const tracker = newState.user.stats.distractionTracker;

  const event: DistractionEvent = {
    id: nanoid(),
    timestamp: new Date(),
    app,
    duration,
    context,
    acknowledged: false,
  };

  tracker.events.push(event);
  tracker.lastDistraction = event;
  tracker.totalCount += 1;
  tracker.dailyCount += 1;
  tracker.weeklyCount += 1;
  tracker.focusStreak = 0; // Reset focus streak

  // Update most common app
  const appCounts = tracker.events.reduce(
    (acc, e) => {
      acc[e.app] = (acc[e.app] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  tracker.mostCommonApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return newState;
}

/**
 * Acknowledge a distraction (user saw the roast)
 */
export function acknowledgeDistraction(state: AppState, eventId: string): AppState {
  const newState = { ...state };
  const event = newState.user.stats.distractionTracker.events.find(e => e.id === eventId);
  if (event) {
    event.acknowledged = true;
  }
  return newState;
}

/**
 * Get today's distraction events
 */
export function getTodayDistractions(state: AppState): DistractionEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return state.user.stats.distractionTracker.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  });
}

/**
 * Get this week's distraction events
 */
export function getWeekDistractions(state: AppState): DistractionEvent[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return state.user.stats.distractionTracker.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= weekAgo && eventDate <= now;
  });
}

/**
 * Get distraction statistics
 */
export function getDistractionStats(state: AppState) {
  const tracker = state.user.stats.distractionTracker;
  const todayDistractions = getTodayDistractions(state);
  const weekDistractions = getWeekDistractions(state);

  // Most distracting apps
  const appStats = tracker.events.reduce(
    (acc, e) => {
      acc[e.app] = (acc[e.app] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topApps = Object.entries(appStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([app, count]) => ({ app, count }));

  // Total distraction time
  const totalDurationToday = todayDistractions.reduce((sum, e) => sum + e.duration, 0);
  const totalDurationWeek = weekDistractions.reduce((sum, e) => sum + e.duration, 0);

  return {
    totalDistractions: tracker.totalCount,
    todayDistractions: todayDistractions.length,
    weekDistractions: weekDistractions.length,
    mostCommonApp: tracker.mostCommonApp,
    topApps,
    totalDurationToday,
    totalDurationWeek,
    averageDurationPerDistraction: tracker.totalCount > 0 
      ? tracker.events.reduce((sum, e) => sum + e.duration, 0) / tracker.totalCount 
      : 0,
  };
}

/**
 * Reset daily distraction count
 */
export function resetDailyCount(state: AppState): AppState {
  const newState = { ...state };
  newState.user.stats.distractionTracker.dailyCount = 0;
  return newState;
}

/**
 * Reset weekly distraction count
 */
export function resetWeeklyCount(state: AppState): AppState {
  const newState = { ...state };
  newState.user.stats.distractionTracker.weeklyCount = 0;
  return newState;
}

/**
 * Get distraction severity level
 */
export function getDistractionSeverity(count: number): 'excellent' | 'good' | 'fair' | 'concerning' {
  if (count === 0) return 'excellent';
  if (count <= 2) return 'good';
  if (count <= 5) return 'fair';
  return 'concerning';
}

/**
 * Get severity message
 */
export function getSeverityMessage(severity: string): string {
  switch (severity) {
    case 'excellent':
      return 'Laser focused! No distractions today. 🔥';
    case 'good':
      return 'Great focus. Just a couple of blips. 👍';
    case 'fair':
      return 'Decent focus, but watch those distractions. ⚠️';
    case 'concerning':
      return 'Too many distractions. Time to lock in. 🔒';
    default:
      return 'Keep focused. You got this. 💪';
  }
}

/**
 * Get focus streak in minutes (simulated - based on time since last distraction)
 */
export function getFocusStreak(state: AppState): number {
  const tracker = state.user.stats.distractionTracker;
  if (!tracker.lastDistraction) {
    // No distractions today, calculate from start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minutesSinceStart = Math.floor((new Date().getTime() - today.getTime()) / (1000 * 60));
    return minutesSinceStart;
  }

  const lastDistractionTime = new Date(tracker.lastDistraction.timestamp).getTime();
  const now = new Date().getTime();
  const minutesSinceLast = Math.floor((now - lastDistractionTime) / (1000 * 60));
  return minutesSinceLast;
}

/**
 * Get recommendation based on distraction patterns
 */
export function getDistractionRecommendation(state: AppState): string {
  const stats = getDistractionStats(state);
  const severity = getDistractionSeverity(stats.todayDistractions);

  if (severity === 'excellent') {
    return "Keep this momentum! You're in the zone. 🚀";
  }

  if (severity === 'concerning') {
    return `${stats.mostCommonApp} is your biggest distraction. Consider blocking it during study time. 🚫`;
  }

  if (stats.topApps.length > 0) {
    return `Your top distraction is ${stats.topApps[0].app}. Be mindful of it. 👀`;
  }

  return "Stay focused. You're doing great! 💪";
}
