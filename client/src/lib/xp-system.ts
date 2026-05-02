/* Parvaz Focus - Advanced XP System
   XP as Discipline Currency: unlocks flexibility, freedom, and customization
*/

import { AppState, FocusRank, FOCUS_RANKS, XP_COSTS } from './types';

/**
 * Calculate Trust Score (0-100)
 * Based on: consistency, promises kept, distractions overcome
 */
export function calculateTrustScore(state: AppState): number {
  const stats = state.user.stats;
  
  // Consistency: streak / max possible streak
  const consistencyScore = Math.min((stats.streak / 30) * 40, 40);
  
  // Promises Kept: completed tasks / total tasks
  const promisesKeptScore = Math.min((stats.totalTasksCompleted / Math.max(stats.totalTasksCompleted + 10, 1)) * 30, 30);
  
  // Focus Quality: average focus rating
  const focusQualityScore = Math.min((stats.averageFocusRating / 3) * 30, 30);
  
  const total = Math.round(consistencyScore + promisesKeptScore + focusQualityScore);
  return Math.max(0, Math.min(100, total));
}

/**
 * Get current Focus Rank based on total XP
 */
export function getFocusRank(totalXP: number): FocusRank {
  let rank: FocusRank = 'DISTRACTED';
  
  for (const rankInfo of FOCUS_RANKS) {
    if (totalXP >= rankInfo.minXP) {
      rank = rankInfo.rank;
    } else {
      break;
    }
  }
  
  return rank;
}

/**
 * Get Focus Rank info with description and emoji
 */
export function getFocusRankInfo(rank: FocusRank) {
  return FOCUS_RANKS.find(r => r.rank === rank) || FOCUS_RANKS[0];
}

/**
 * Calculate XP needed to reach next rank
 */
export function getXPToNextRank(currentXP: number): { nextRank: FocusRank; xpNeeded: number } {
  const currentRank = getFocusRank(currentXP);
  const currentRankIndex = FOCUS_RANKS.findIndex(r => r.rank === currentRank);
  
  if (currentRankIndex === FOCUS_RANKS.length - 1) {
    return { nextRank: currentRank, xpNeeded: 0 };
  }
  
  const nextRankInfo = FOCUS_RANKS[currentRankIndex + 1];
  const xpNeeded = Math.max(0, nextRankInfo.minXP - currentXP);
  
  return { nextRank: nextRankInfo.rank, xpNeeded };
}

/**
 * Check if user qualifies for Creative Freedom Pass (30-day streak)
 */
export function checkCreativeFreedomPass(state: AppState): boolean {
  const stats = state.user.stats;
  return stats.streak >= 30;
}

/**
 * Award Creative Freedom Pass
 */
export function awardCreativeFreedomPass(state: AppState): AppState {
  const newState = { ...state };
  
  if (checkCreativeFreedomPass(newState)) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days
    
    newState.user.stats.creativeFreedomPasses.push({
      earnedAt: new Date(),
      expiresAt,
      used: false,
    });
  }
  
  return newState;
}

/**
 * Use Creative Freedom Pass to activate bonus day
 */
export function useCreativeFreedomPass(state: AppState): AppState {
  const newState = { ...state };
  
  const availablePass = newState.user.stats.creativeFreedomPasses.find(
    p => !p.used && new Date() < p.expiresAt
  );
  
  if (availablePass) {
    availablePass.used = true;
    availablePass.usedAt = new Date();
    newState.today.bonusDayActive = true;
    newState.projectsLocked = false; // Unlock projects for the day
  }
  
  return newState;
}

/**
 * Bank extra study effort for hard days
 */
export function bankDiscipline(state: AppState, amount: number): AppState {
  const newState = { ...state };
  
  newState.user.stats.bankedDiscipline.totalBanked += amount;
  newState.user.stats.bankedDiscipline.lastBankedAt = new Date();
  newState.user.stats.bankedDiscipline.history.push({
    date: new Date(),
    amount,
  });
  
  return newState;
}

/**
 * Use banked discipline to reduce study requirements
 */
export function useBankedDiscipline(state: AppState, amount: number): AppState {
  const newState = { ...state };
  
  if (newState.user.stats.bankedDiscipline.totalBanked >= amount) {
    newState.user.stats.bankedDiscipline.totalBanked -= amount;
    return newState;
  }
  
  return state;
}

/**
 * Spend XP to unlock project access
 */
export function spendXPForProjectAccess(state: AppState, cost: number, duration: string): AppState {
  const newState = { ...state };
  
  if (newState.user.stats.totalXP >= cost) {
    newState.user.stats.totalXP -= cost;
    newState.user.stats.totalXPSpent += cost;
    newState.projectsLocked = false;
    
    // Duration logic would be handled by timer
    return newState;
  }
  
  return state;
}

/**
 * Award Skip Token for consistency
 */
export function awardSkipToken(state: AppState, type: 'SKIP_TASK' | 'MAINTAIN_STREAK'): AppState {
  const newState = { ...state };
  
  newState.user.stats.skipTokens.push({
    id: `token_${Date.now()}`,
    type,
    earnedAt: new Date(),
  });
  
  return newState;
}

/**
 * Use Skip Token
 */
export function useSkipToken(state: AppState, tokenId: string): AppState {
  const newState = { ...state };
  
  const token = newState.user.stats.skipTokens.find(t => t.id === tokenId && !t.usedAt);
  if (token) {
    token.usedAt = new Date();
    return newState;
  }
  
  return state;
}

/**
 * Purchase item from XP Store
 */
export function purchaseStoreItem(state: AppState, itemId: string): AppState {
  const newState = { ...state };
  
  const item = newState.user.stats.xpStore.items.find(i => i.id === itemId);
  if (item && newState.user.stats.totalXP >= item.cost) {
    newState.user.stats.totalXP -= item.cost;
    newState.user.stats.totalXPSpent += item.cost;
    newState.user.stats.xpStore.purchasedItems.push(itemId);
    return newState;
  }
  
  return state;
}

/**
 * Update Trust Score in app state
 */
export function updateTrustScore(state: AppState): AppState {
  const newState = { ...state };
  const trustPercentage = calculateTrustScore(newState);
  
  newState.user.stats.trustScore.percentage = trustPercentage;
  newState.user.stats.trustScore.consistency = newState.user.stats.streak;
  newState.user.stats.trustScore.promisesKept = newState.user.stats.totalTasksCompleted;
  newState.user.stats.trustScore.lastUpdated = new Date();
  
  return newState;
}

/**
 * Update Focus Rank based on XP
 */
export function updateFocusRank(state: AppState): AppState {
  const newState = { ...state };
  const newRank = getFocusRank(newState.user.stats.totalXP);
  newState.user.stats.focusRank = newRank;
  return newState;
}

/**
 * Get available XP unlock options
 */
export function getAvailableUnlocks(state: AppState) {
  const xp = state.user.stats.totalXP;
  
  return {
    canUnlock30Min: xp >= XP_COSTS.PROJECT_ACCESS_30MIN,
    canUnlock1Hour: xp >= XP_COSTS.PROJECT_ACCESS_1HOUR,
    canUnlockEvening: xp >= XP_COSTS.BONUS_PROJECT_EVENING,
    canBuySkipToken: xp >= XP_COSTS.SKIP_TOKEN,
  };
}

/**
 * Check if bonus day is still active
 */
export function isBonusDayActive(state: AppState): boolean {
  if (!state.today.bonusDayActive) return false;
  
  // Bonus day is only active for the day it was earned
  // Reset happens at midnight (handled by storage.ts)
  return true;
}

/**
 * Get XP progress to next rank
 */
export function getXPProgressToNextRank(totalXP: number): { current: number; needed: number; percentage: number } {
  const currentRank = getFocusRank(totalXP);
  const currentRankIndex = FOCUS_RANKS.findIndex(r => r.rank === currentRank);
  
  if (currentRankIndex === FOCUS_RANKS.length - 1) {
    return { current: 0, needed: 0, percentage: 100 };
  }
  
  const currentRankXP = FOCUS_RANKS[currentRankIndex].minXP;
  const nextRankXP = FOCUS_RANKS[currentRankIndex + 1].minXP;
  
  const xpInCurrentRank = totalXP - currentRankXP;
  const xpNeededForRank = nextRankXP - currentRankXP;
  const percentage = Math.round((xpInCurrentRank / xpNeededForRank) * 100);
  
  return {
    current: xpInCurrentRank,
    needed: xpNeededForRank,
    percentage: Math.min(100, percentage),
  };
}
