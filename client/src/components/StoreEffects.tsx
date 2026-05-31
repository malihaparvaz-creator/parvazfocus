/* Applies all XP store cosmetics globally */

import { useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { FOCUS_ROOM_LABELS, getFocusRoomClass, syncAllStoreCosmetics } from '@/lib/store-unlocks';

export function StoreEffects() {
  const { state } = useAppContext();
  const active = state.user.stats.xpStore.active;
  const roomClass = useMemo(() => getFocusRoomClass(state), [active?.focusRoomId]);

  useEffect(() => {
    syncAllStoreCosmetics(state);
  }, [
    active?.focusRoomId,
    active?.avatarStyleId,
    active?.streakEffectId,
    active?.quotePackId,
    active?.soundtrackId,
    active?.profileTitleId,
    active?.timerSkinId,
    state,
  ]);

  useEffect(() => {
    const refresh = () => syncAllStoreCosmetics(state);
    window.addEventListener('storeCosmeticsChange', refresh);
    window.addEventListener('focusRoomChange', refresh);
    window.addEventListener('themeChange', refresh);
    return () => {
      window.removeEventListener('storeCosmeticsChange', refresh);
      window.removeEventListener('focusRoomChange', refresh);
      window.removeEventListener('themeChange', refresh);
    };
  }, [state]);

  const roomLabel = active?.focusRoomId ? FOCUS_ROOM_LABELS[active.focusRoomId] : null;

  return (
    <>
      {roomClass && <div className={`focus-room-ambience ${roomClass}`} aria-hidden />}
      {roomLabel && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 z-[35] px-3 py-1.5 rounded-full text-xs font-semibold bg-card/95 border border-border shadow-lg pointer-events-none">
          Room: {roomLabel}
        </div>
      )}
    </>
  );
}
