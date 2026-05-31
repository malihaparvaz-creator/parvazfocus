/* Applies purchased XP store unlocks globally (focus room ambience, etc.) */

import { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { getFocusRoomClass } from '@/lib/store-unlocks';

const FOCUS_ROOM_CLASSES = [
  'focus-room-library',
  'focus-room-cafe',
  'focus-room-garden',
  'focus-room-mountain',
  'focus-room-night_city',
  'focus-room-space_station',
  'focus-room-monk',
];

export function StoreEffects() {
  const { state } = useAppContext();

  useEffect(() => {
    const root = document.documentElement;
    FOCUS_ROOM_CLASSES.forEach(c => root.classList.remove(c));
    const roomClass = getFocusRoomClass(state);
    if (roomClass) root.classList.add(roomClass);
  }, [state.user.stats.xpStore.active?.focusRoomId, state]);

  return null;
}
