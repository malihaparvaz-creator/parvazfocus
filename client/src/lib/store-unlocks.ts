/* Parvaz Focus - XP Store unlock effects and activation */

import { AppState, StoreItemData, DAILY_QUOTES, XPStoreActive } from './types';
import type { MusicTrack } from '@/contexts/MusicContext';

export const DEFAULT_STORE_ACTIVE: XPStoreActive = {
  focusRoomId: null,
  quotePackId: null,
  soundtrackId: null,
  avatarStyleId: null,
  streakEffectId: null,
  bonusProjectMinutes: 0,
};

const QUOTE_PACKS: Record<string, string[]> = {
  quotes_stoic: [
    'The obstacle is the way.',
    'Discipline is choosing between what you want now and what you want most.',
    'You have power over your mind — not outside events.',
    'Waste no more time arguing what a good person should be. Be one.',
    'He who fears death will never do anything worthy of a living man.',
  ],
  quotes_warrior: [
    'Attack the day before it attacks you.',
    'Comfort is the enemy of progress.',
    'Win the morning, win the battle.',
    'Train when you do not feel like it — that is the whole game.',
    'Pressure is privilege if you are built for it.',
  ],
  quotes_founder: [
    'Ship one thing today. Momentum beats perfection.',
    'Your calendar is your strategy.',
    'Build in public, iterate in private.',
    'Focus is saying no to a hundred good ideas.',
    'Execution is the only moat that compounds.',
  ],
};

export const STORE_SOUNDTRACKS: Record<string, MusicTrack> = {
  soundtrack_focus: {
    id: 'store_deep_focus',
    name: 'Deep Focus Soundtrack',
    description: 'Store unlock: ambient instrumental for sustained concentration.',
    bestFor: 'Deep work, problem-solving',
    youtubeId: 'lTRiuFIWV54',
    tag: 'Focus',
  },
  soundtrack_rain: {
    id: 'store_rain',
    name: 'Rain & Thunder',
    description: 'Store unlock: calming rain for relaxed focus.',
    bestFor: 'Stress reduction, long sessions',
    youtubeId: 'mPZkdNFkNps',
    tag: 'Nature',
  },
  soundtrack_lofi: {
    id: 'store_lofi',
    name: 'Lofi Study Beats',
    description: 'Store unlock: steady lo-fi rhythm for flow.',
    bestFor: 'Light study, creative warm-up',
    youtubeId: 'jfKfPfyJRdk',
    tag: 'Lo-Fi',
  },
  soundtrack_cinematic: {
    id: 'store_cinematic',
    name: 'Cinematic Drive',
    description: 'Store unlock: epic instrumentals for intense blocks.',
    bestFor: 'High-intensity study sprints',
    youtubeId: '4Tr0otuiQuU',
    tag: 'Classical',
  },
  soundtrack_piano: {
    id: 'store_piano',
    name: 'Piano Focus Suite',
    description: 'Store unlock: soft piano to center attention.',
    bestFor: 'Reading and revision',
    youtubeId: '4Tr0otuiQuU',
    tag: 'Classical',
  },
  soundtrack_space: {
    id: 'store_space',
    name: 'Space Ambient',
    description: 'Store unlock: expansive ambient textures.',
    bestFor: 'Deep concentration',
    youtubeId: 'lTRiuFIWV54',
    tag: 'Focus',
  },
};

const FOCUS_ROOM_CLASS_PREFIX = 'focus-room-';

const BONUS_MINUTES: Record<string, number> = {
  bonus_30min: 30,
  bonus_60min: 60,
  bonus_90min: 90,
  bonus_120min: 120,
};

function ensureStoreActive(state: AppState): XPStoreActive {
  if (!state.user.stats.xpStore.active) {
    state.user.stats.xpStore.active = { ...DEFAULT_STORE_ACTIVE };
  }
  return state.user.stats.xpStore.active;
}

export function migrateStoreActive(state: AppState): void {
  ensureStoreActive(state);
}

export function getQuoteForState(state: AppState): string {
  const active = state.user.stats.xpStore.active;
  const packId = active?.quotePackId;
  if (packId && QUOTE_PACKS[packId]) {
    const quotes = QUOTE_PACKS[packId];
    const dayIndex = new Date().getDate() % quotes.length;
    return quotes[dayIndex];
  }
  const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
  return DAILY_QUOTES[dayIndex];
}

export function getFocusRoomClass(state: AppState): string | null {
  const roomId = state.user.stats.xpStore.active?.focusRoomId;
  if (!roomId) return null;
  return `${FOCUS_ROOM_CLASS_PREFIX}${roomId.replace('room_', '')}`;
}

export function getStreakEffectClass(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.streakEffectId;
  if (!id) return null;
  if (id === 'streak_fire') return 'streak-effect-fire';
  if (id === 'streak_electric') return 'streak-effect-electric';
  return null;
}

export function getAvatarFrameClass(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.avatarStyleId;
  if (!id) return null;
  if (id === 'avatar_shadow') return 'avatar-frame-shadow';
  if (id === 'avatar_gold') return 'avatar-frame-gold';
  return null;
}

export function isStoreTrackUnlocked(state: AppState, trackStoreId: string): boolean {
  return state.user.stats.xpStore.purchasedItems.includes(trackStoreId);
}

export function getUnlockedStoreTracks(state: AppState): MusicTrack[] {
  return state.user.stats.xpStore.purchasedItems
    .map(id => STORE_SOUNDTRACKS[id])
    .filter(Boolean) as MusicTrack[];
}

function applyBonusProjectPurchase(state: AppState, itemId: string): void {
  const active = ensureStoreActive(state);
  const minutes = BONUS_MINUTES[itemId] ?? 0;
  if (minutes > 0) {
    active.bonusProjectMinutes += minutes;
    state.projectsLocked = false;
  }
  if (itemId === 'bonus_evening' || itemId === 'bonus_weekend' || itemId === 'bonus_focus_boost') {
    state.today.bonusDayActive = true;
    state.projectsLocked = false;
  }
}

function applyMysteryBox(state: AppState, itemId: string): void {
  const owned = new Set(state.user.stats.xpStore.purchasedItems);
  const pool = state.user.stats.xpStore.items.filter(
    i => !owned.has(i.id) && i.type !== 'MYSTERY_BOX' && i.type !== 'THEME'
  );
  if (pool.length === 0) {
    const bonus = itemId === 'mystery_box_elite' ? 120 : 60;
    state.user.stats.totalXP += bonus;
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (!owned.has(pick.id)) {
    state.user.stats.xpStore.purchasedItems.push(pick.id);
    activateStoreItem(state, pick.id);
  }
}

/** Apply purchase side-effects (call after adding to purchasedItems) */
export function applyStorePurchase(state: AppState, item: StoreItemData): AppState {
  const active = ensureStoreActive(state);

  switch (item.type) {
    case 'THEME': {
      const key = item.id.replace('theme_', '');
      try {
        localStorage.setItem('theme', key);
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: key } }));
      } catch {}
      break;
    }
    case 'SOUNDTRACK':
      active.soundtrackId = item.id;
      try {
        localStorage.setItem('parvaz-active-soundtrack', item.id);
      } catch {}
      break;
    case 'QUOTE_PACK':
      active.quotePackId = item.id;
      state.today.brief = {
        ...state.today.brief,
        quote: getQuoteForState(state),
      };
      break;
    case 'FOCUS_ROOM':
      active.focusRoomId = item.id;
      try {
        localStorage.setItem('parvaz-active-focus-room', item.id);
      } catch {}
      break;
    case 'AVATAR_STYLE':
      active.avatarStyleId = item.id;
      break;
    case 'STREAK_EFFECT':
      active.streakEffectId = item.id;
      break;
    case 'BONUS_PROJECT_TIME':
      applyBonusProjectPurchase(state, item.id);
      break;
    case 'MYSTERY_BOX':
      applyMysteryBox(state, item.id);
      break;
  }

  return state;
}

/** Activate an already-owned item */
export function activateStoreItem(state: AppState, itemId: string): AppState {
  const item = state.user.stats.xpStore.items.find(i => i.id === itemId);
  if (!item || !state.user.stats.xpStore.purchasedItems.includes(itemId)) {
    return state;
  }

  const newState = {
    ...state,
    user: {
      ...state.user,
      stats: {
        ...state.user.stats,
        xpStore: {
          ...state.user.stats.xpStore,
          active: { ...(state.user.stats.xpStore.active ?? DEFAULT_STORE_ACTIVE) },
          purchasedItems: [...state.user.stats.xpStore.purchasedItems],
        },
      },
      today: { ...state.today, brief: { ...state.today.brief } },
    },
  };

  return applyStorePurchase(newState, item);
}

export function parseLocalDateInput(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
