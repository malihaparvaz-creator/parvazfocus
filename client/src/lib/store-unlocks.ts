/* Parvaz Focus - XP Store unlock effects, registries, and activation */

import { AppState, StoreItemData, DAILY_QUOTES, XPStoreActive, StoreItem } from './types';
import type { MusicTrack } from '@/contexts/MusicContext';

export const DEFAULT_STORE_ACTIVE: XPStoreActive = {
  focusRoomId: null,
  quotePackId: null,
  soundtrackId: null,
  avatarStyleId: null,
  streakEffectId: null,
  profileTitleId: null,
  timerSkinId: null,
  bonusProjectMinutes: 0,
};

const LS_KEYS = {
  focusRoom: 'parvaz-active-focus-room',
  soundtrack: 'parvaz-active-soundtrack',
  quotePack: 'parvaz-active-quote-pack',
  avatar: 'parvaz-active-avatar',
  streak: 'parvaz-active-streak',
  title: 'parvaz-active-title',
  timerSkin: 'parvaz-active-timer-skin',
};

export const AVATAR_STYLES: Record<string, { name: string; emoji: string; frameClass: string }> = {
  avatar_shadow: { name: 'Shadow Frame', emoji: '🌑', frameClass: 'avatar-frame-shadow' },
  avatar_gold: { name: 'Gold Frame', emoji: '👑', frameClass: 'avatar-frame-gold' },
  avatar_crystal: { name: 'Crystal Frame', emoji: '💎', frameClass: 'avatar-frame-crystal' },
  avatar_flame: { name: 'Flame Frame', emoji: '🔥', frameClass: 'avatar-frame-flame' },
  avatar_neon: { name: 'Neon Frame', emoji: '⚡', frameClass: 'avatar-frame-neon' },
  avatar_royal: { name: 'Royal Frame', emoji: '🏆', frameClass: 'avatar-frame-royal' },
  avatar_aurora: { name: 'Aurora Frame', emoji: '🌌', frameClass: 'avatar-frame-aurora' },
};

export const STREAK_EFFECTS: Record<string, { name: string; cssClass: string }> = {
  streak_fire: { name: 'Fire Streak', cssClass: 'streak-effect-fire' },
  streak_electric: { name: 'Electric Streak', cssClass: 'streak-effect-electric' },
  streak_cosmic: { name: 'Cosmic Streak', cssClass: 'streak-effect-cosmic' },
  streak_ice: { name: 'Ice Streak', cssClass: 'streak-effect-ice' },
  streak_rainbow: { name: 'Rainbow Streak', cssClass: 'streak-effect-rainbow' },
};

export const PROFILE_TITLES: Record<string, string> = {
  title_rookie: 'Focus Rookie',
  title_grinder: 'Daily Grinder',
  title_scholar: 'Night Scholar',
  title_elite: 'Elite Discipline',
  title_legend: 'Parvaz Legend',
};

export const TIMER_SKINS: Record<string, { name: string; bodyClass: string }> = {
  timer_skin_minimal: { name: 'Minimal Timer', bodyClass: 'timer-skin-minimal' },
  timer_skin_neon: { name: 'Neon Timer', bodyClass: 'timer-skin-neon' },
  timer_skin_sunset: { name: 'Sunset Timer', bodyClass: 'timer-skin-sunset' },
  timer_skin_zen: { name: 'Zen Timer', bodyClass: 'timer-skin-zen' },
  timer_skin_retro: { name: 'Retro Timer', bodyClass: 'timer-skin-retro' },
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
  quotes_exam: [
    'Exams reward repetition, not panic.',
    'One mock paper today beats ten plans tomorrow.',
    'Revise weak topics first — confidence follows competence.',
    'Sleep is part of the syllabus.',
    'Show up calm; your preparation already did the work.',
  ],
  quotes_mindful: [
    'Breathe in focus. Breathe out noise.',
    'One mindful minute can reset an entire hour.',
    'You are here now — that is enough to begin.',
    'Gentle consistency beats harsh intensity.',
    'Notice the urge to scroll, then choose your task.',
  ],
};

export const STORE_SOUNDTRACKS: Record<string, MusicTrack> = {
  soundtrack_focus: {
    id: 'store_deep_focus',
    name: 'Deep Focus Soundtrack',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Deep work',
    youtubeId: 'lTRiuFIWV54',
    tag: 'Store',
  },
  soundtrack_rain: {
    id: 'store_rain',
    name: 'Rain & Thunder',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Calm focus',
    youtubeId: 'mPZkdNFkNps',
    tag: 'Store',
  },
  soundtrack_lofi: {
    id: 'store_lofi',
    name: 'Lofi Study Beats',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Steady rhythm',
    youtubeId: 'jfKfPfyJRdk',
    tag: 'Store',
  },
  soundtrack_cinematic: {
    id: 'store_cinematic',
    name: 'Cinematic Drive',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Intense sprints',
    youtubeId: '4Tr0otuiQuU',
    tag: 'Classical',
  },
  soundtrack_piano: {
    id: 'store_piano',
    name: 'Piano Focus Suite',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Reading',
    youtubeId: '4Tr0otuiQuU',
    tag: 'Classical',
  },
  soundtrack_space: {
    id: 'store_space',
    name: 'Space Ambient',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Deep concentration',
    youtubeId: 'lTRiuFIWV54',
    tag: 'Focus',
  },
  soundtrack_ocean: {
    id: 'store_ocean',
    name: 'Ocean Waves',
    description: 'Store unlock — play in Music tab.',
    bestFor: 'Calm deep work',
    youtubeId: 'mPZkdNFkNps',
    tag: 'Store',
  },
};

const FOCUS_ROOM_CLASS_PREFIX = 'focus-room-';

export const FOCUS_ROOM_IDS = [
  'room_library',
  'room_cafe',
  'room_garden',
  'room_mountain',
  'room_night_city',
  'room_space_station',
  'room_monk',
] as const;

export const FOCUS_ROOM_LABELS: Record<string, string> = {
  room_library: 'Library',
  room_cafe: 'Cafe',
  room_garden: 'Garden',
  room_mountain: 'Mountain',
  room_night_city: 'Night City',
  room_space_station: 'Space Station',
  room_monk: 'Monk Cell',
};

const BONUS_MINUTES: Record<string, number> = {
  bonus_30min: 30,
  bonus_60min: 60,
  bonus_90min: 90,
  bonus_120min: 120,
};

const XP_INSTANT_BOOST: Record<string, number> = {
  boost_xp_small: 50,
};

function ensureStoreActive(state: AppState): XPStoreActive {
  if (!state.user.stats.xpStore.active) {
    state.user.stats.xpStore.active = { ...DEFAULT_STORE_ACTIVE };
  }
  return state.user.stats.xpStore.active;
}

function persistActiveKey(key: keyof typeof LS_KEYS, value: string | null) {
  try {
    if (value) localStorage.setItem(LS_KEYS[key], value);
    else localStorage.removeItem(LS_KEYS[key]);
  } catch {}
}

function restoreIfOwned(active: XPStoreActive, purchased: string[], key: keyof typeof LS_KEYS, field: keyof XPStoreActive) {
  try {
    const stored = localStorage.getItem(LS_KEYS[key]);
    if (stored && purchased.includes(stored)) {
      (active as Record<string, unknown>)[field] = stored;
    }
  } catch {}
}

export function migrateStoreActive(state: AppState): void {
  const active = ensureStoreActive(state);
  const purchased = state.user.stats.xpStore.purchasedItems || [];

  restoreIfOwned(active, purchased, 'focusRoom', 'focusRoomId');
  restoreIfOwned(active, purchased, 'soundtrack', 'soundtrackId');
  restoreIfOwned(active, purchased, 'quotePack', 'quotePackId');
  restoreIfOwned(active, purchased, 'avatar', 'avatarStyleId');
  restoreIfOwned(active, purchased, 'streak', 'streakEffectId');
  restoreIfOwned(active, purchased, 'title', 'profileTitleId');
  restoreIfOwned(active, purchased, 'timerSkin', 'timerSkinId');

  // Clear invalid active ids
  const fields: (keyof XPStoreActive)[] = [
    'focusRoomId', 'soundtrackId', 'quotePackId', 'avatarStyleId',
    'streakEffectId', 'profileTitleId', 'timerSkinId',
  ];
  fields.forEach(field => {
    const val = active[field];
    if (typeof val === 'string' && val && !purchased.includes(val)) {
      (active as Record<string, unknown>)[field] = null;
    }
  });
}

export function syncFocusRoomDom(roomClass: string | null) {
  const root = document.documentElement;
  const body = document.body;
  FOCUS_ROOM_IDS.forEach(id => {
    const cls = `${FOCUS_ROOM_CLASS_PREFIX}${id.replace('room_', '')}`;
    root.classList.remove(cls);
    body.classList.remove(cls);
  });
  // Focus rooms are disabled to prevent theme conflicts
  delete root.dataset.focusRoom;
}

export function syncAllStoreCosmetics(state: AppState) {
  const active = state.user.stats.xpStore.active;
  syncFocusRoomDom(getFocusRoomClass(state));

  const body = document.body;
  Object.values(AVATAR_STYLES).forEach(a => body.classList.remove(a.frameClass));
  Object.values(STREAK_EFFECTS).forEach(s => body.classList.remove(s.cssClass));
  Object.values(TIMER_SKINS).forEach(t => body.classList.remove(t.bodyClass));

  const avatar = active?.avatarStyleId ? AVATAR_STYLES[active.avatarStyleId] : null;
  if (avatar) body.classList.add(avatar.frameClass);

  const streak = active?.streakEffectId ? STREAK_EFFECTS[active.streakEffectId] : null;
  if (streak) body.classList.add(streak.cssClass);

  const timer = active?.timerSkinId ? TIMER_SKINS[active.timerSkinId] : null;
  if (timer) body.classList.add(timer.bodyClass);

  body.dataset.avatarStyle = active?.avatarStyleId || '';
  body.dataset.profileTitle = active?.profileTitleId || '';
  body.dataset.timerSkin = active?.timerSkinId || '';
}

export function getQuoteForState(state: AppState): string {
  const packId = state.user.stats.xpStore.active?.quotePackId;
  if (packId && QUOTE_PACKS[packId]) {
    const quotes = QUOTE_PACKS[packId];
    return quotes[new Date().getDate() % quotes.length];
  }
  return DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];
}

export function getFocusRoomClass(state: AppState): string | null {
  const roomId = state.user.stats.xpStore.active?.focusRoomId;
  if (!roomId) return null;
  return `${FOCUS_ROOM_CLASS_PREFIX}${roomId.replace('room_', '')}`;
}

export function getStreakEffectClass(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.streakEffectId;
  if (!id || !STREAK_EFFECTS[id]) return null;
  return STREAK_EFFECTS[id].cssClass;
}

export function getAvatarFrameClass(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.avatarStyleId;
  if (!id || !AVATAR_STYLES[id]) return null;
  return AVATAR_STYLES[id].frameClass;
}

export function getAvatarDisplay(state: AppState) {
  const id = state.user.stats.xpStore.active?.avatarStyleId;
  if (id && AVATAR_STYLES[id]) return AVATAR_STYLES[id];
  return { name: 'Default', emoji: '🎯', frameClass: 'avatar-frame-default' };
}

export function getProfileTitleLabel(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.profileTitleId;
  if (!id || !PROFILE_TITLES[id]) return null;
  return PROFILE_TITLES[id];
}

export function getTimerSkinClass(state: AppState): string | null {
  const id = state.user.stats.xpStore.active?.timerSkinId;
  if (!id || !TIMER_SKINS[id]) return null;
  return TIMER_SKINS[id].bodyClass;
}

export function getActiveUnlockLabels(state: AppState): string[] {
  const active = state.user.stats.xpStore.active;
  if (!active) return [];
  const labels: string[] = [];
  if (active.focusRoomId && FOCUS_ROOM_LABELS[active.focusRoomId]) {
    labels.push(`Room: ${FOCUS_ROOM_LABELS[active.focusRoomId]}`);
  }
  if (active.quotePackId) labels.push('Custom quotes');
  if (active.soundtrackId && STORE_SOUNDTRACKS[active.soundtrackId]) {
    labels.push(`Music: ${STORE_SOUNDTRACKS[active.soundtrackId].name}`);
  }
  if (active.avatarStyleId && AVATAR_STYLES[active.avatarStyleId]) {
    labels.push(`Avatar: ${AVATAR_STYLES[active.avatarStyleId].name}`);
  }
  if (active.streakEffectId && STREAK_EFFECTS[active.streakEffectId]) {
    labels.push(`Streak: ${STREAK_EFFECTS[active.streakEffectId].name}`);
  }
  if (active.profileTitleId && PROFILE_TITLES[active.profileTitleId]) {
    labels.push(`Title: ${PROFILE_TITLES[active.profileTitleId]}`);
  }
  if (active.timerSkinId && TIMER_SKINS[active.timerSkinId]) {
    labels.push(`Timer: ${TIMER_SKINS[active.timerSkinId].name}`);
  }
  if (active.bonusProjectMinutes > 0) {
    labels.push(`Bonus: ${active.bonusProjectMinutes}m projects`);
  }
  return labels;
}

export function getUnlockedStoreTracks(state: AppState): MusicTrack[] {
  return state.user.stats.xpStore.purchasedItems
    .map(id => STORE_SOUNDTRACKS[id])
    .filter(Boolean) as MusicTrack[];
}

export function isItemActive(state: AppState, item: StoreItemData): boolean {
  const active = state.user.stats.xpStore.active;
  if (!active) return false;
  switch (item.type as StoreItem) {
    case 'THEME':
      try {
        return localStorage.getItem('theme') === item.id.replace('theme_', '');
      } catch {
        return false;
      }
    case 'FOCUS_ROOM':
      return active.focusRoomId === item.id;
    case 'QUOTE_PACK':
      return active.quotePackId === item.id;
    case 'SOUNDTRACK':
      return active.soundtrackId === item.id;
    case 'AVATAR_STYLE':
      return active.avatarStyleId === item.id;
    case 'STREAK_EFFECT':
      return active.streakEffectId === item.id;
    case 'PROFILE_TITLE':
      return active.profileTitleId === item.id;
    case 'TIMER_SKIN':
      return active.timerSkinId === item.id;
    default:
      return false;
  }
}

function applyBonusProjectPurchase(state: AppState, itemId: string): void {
  const active = ensureStoreActive(state);
  if (XP_INSTANT_BOOST[itemId]) {
    state.user.stats.totalXP += XP_INSTANT_BOOST[itemId];
    return;
  }
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
  const purchased = state.user.stats.xpStore.purchasedItems;
  const pool = state.user.stats.xpStore.items.filter(
    i => !purchased.includes(i.id) && i.type !== 'MYSTERY_BOX'
  );
  if (pool.length === 0) {
    state.user.stats.totalXP += itemId === 'mystery_box_elite' ? 120 : 60;
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (!purchased.includes(pick.id)) {
    purchased.push(pick.id);
    applyStorePurchase(state, pick);
  }
}

/** Apply purchase / activation side-effects */
export function applyStorePurchase(state: AppState, item: StoreItemData): AppState {
  const active = ensureStoreActive(state);

  switch (item.type) {
    case 'THEME': {
      const key = item.id.replace('theme_', '');
      try {
        localStorage.setItem('theme', key);
        // Force immediate theme application
        const root = document.documentElement;
        Array.from(root.classList)
          .filter(c => c.startsWith('theme-') || c === 'dark')
          .forEach(c => root.classList.remove(c));
        Array.from(root.classList)
          .filter(c => c.startsWith('focus-room-'))
          .forEach(c => root.classList.remove(c));
        const themeClass = `theme-${key}`;
        root.classList.add(themeClass);
        if (key === 'dark') root.classList.add('dark');
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: key } }));
      } catch {}
      break;
    }
    case 'SOUNDTRACK':
      active.soundtrackId = item.id;
      persistActiveKey('soundtrack', item.id);
      break;
    case 'QUOTE_PACK':
      active.quotePackId = item.id;
      persistActiveKey('quotePack', item.id);
      state.today.brief = { ...state.today.brief, quote: getQuoteForState(state) };
      break;
    case 'FOCUS_ROOM':
      active.focusRoomId = item.id;
      persistActiveKey('focusRoom', item.id);
      break;
    case 'AVATAR_STYLE':
      active.avatarStyleId = item.id;
      persistActiveKey('avatar', item.id);
      break;
    case 'STREAK_EFFECT':
      active.streakEffectId = item.id;
      persistActiveKey('streak', item.id);
      break;
    case 'PROFILE_TITLE':
      active.profileTitleId = item.id;
      persistActiveKey('title', item.id);
      break;
    case 'TIMER_SKIN':
      active.timerSkinId = item.id;
      persistActiveKey('timerSkin', item.id);
      break;
    case 'BONUS_PROJECT_TIME':
      applyBonusProjectPurchase(state, item.id);
      break;
    case 'MYSTERY_BOX':
      applyMysteryBox(state, item.id);
      break;
  }

  syncAllStoreCosmetics(state);
  window.dispatchEvent(new CustomEvent('storeCosmeticsChange'));
  return state;
}

export function activateStoreItem(state: AppState, itemId: string): AppState {
  const item = state.user.stats.xpStore.items.find(i => i.id === itemId);
  if (!item || !state.user.stats.xpStore.purchasedItems.includes(itemId)) {
    return state;
  }

  const newState: AppState = {
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
    },
    today: { ...state.today, brief: { ...state.today.brief } },
  };

  return applyStorePurchase(newState, item);
}

export function parseLocalDateInput(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
