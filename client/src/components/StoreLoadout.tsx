/* Activate owned XP store cosmetics from Settings */

import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { activateStoreItem, isItemActive, DEFAULT_STORE_ACTIVE } from '@/lib/store-unlocks';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { toast } from 'sonner';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function StoreLoadout() {
  const { state, updateState } = useAppContext();
  const { applyTheme } = useTheme();
  const purchased = state.user.stats.xpStore.purchasedItems;
  const activatable = state.user.stats.xpStore.items.filter(
    i =>
      purchased.includes(i.id) &&
      ['AVATAR_STYLE', 'STREAK_EFFECT', 'PROFILE_TITLE', 'TIMER_SKIN', 'FOCUS_ROOM', 'QUOTE_PACK', 'SOUNDTRACK', 'THEME'].includes(
        i.type
      )
  );

  if (activatable.length === 0) {
    return (
      <Card className="p-4 shadow-md">
        <p className="text-sm text-muted-foreground">Buy items in the XP Store (Study tab) to customize your profile and app.</p>
      </Card>
    );
  }

  const handleDeactivate = (item: any) => {
    updateState(prev => {
      const newState = { ...prev };
      const active = newState.user.stats.xpStore.active || { ...DEFAULT_STORE_ACTIVE };

      switch (item.type) {
        case 'AVATAR_STYLE':
          active.avatarStyleId = null;
          try { localStorage.removeItem('parvaz_avatar'); } catch {}
          break;
        case 'STREAK_EFFECT':
          active.streakEffectId = null;
          try { localStorage.removeItem('parvaz_streak'); } catch {}
          break;
        case 'PROFILE_TITLE':
          active.profileTitleId = null;
          try { localStorage.removeItem('parvaz_title'); } catch {}
          break;
        case 'TIMER_SKIN':
          active.timerSkinId = null;
          try { localStorage.removeItem('parvaz_timerSkin'); } catch {}
          break;
        case 'FOCUS_ROOM':
          active.focusRoomId = null;
          try { localStorage.removeItem('parvaz_focusRoom'); } catch {}
          break;
        case 'QUOTE_PACK':
          active.quotePackId = null;
          try { localStorage.removeItem('parvaz_quotePack'); } catch {}
          break;
        case 'SOUNDTRACK':
          active.soundtrackId = null;
          try { localStorage.removeItem('parvaz_soundtrack'); } catch {}
          break;
        case 'THEME':
          if (applyTheme) {
            applyTheme('light');
          }
          break;
      }

      newState.user.stats.xpStore.active = active;
      return newState;
    });

    toast.success(`Deactivated ${item.name}`);
  };

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Your Loadout
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Activate or deactivate owned cosmetics.</p>
        </div>
        <ProfileAvatar size="lg" />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {activatable.map(item => {
          const isActive = isItemActive(state, item);
          return (
            <div key={item.id} className="flex gap-1">
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="flex-1 justify-start h-auto py-2 text-left"
                onClick={() => {
                  if (!isActive) {
                    updateState(prev => activateStoreItem(prev, item.id));
                    toast.success(`Activated ${item.name}`);
                  }
                }}
              >
                <span className="font-medium">{item.name}</span>
              </Button>
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => handleDeactivate(item)}
                  title="Deactivate"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
