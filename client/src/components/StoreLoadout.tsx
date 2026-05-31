/* Activate owned XP store cosmetics from Settings */

import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { activateStoreItem } from '@/lib/store-unlocks';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ActiveUnlocksBar } from '@/components/ActiveUnlocksBar';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

export function StoreLoadout() {
  const { state, updateState } = useAppContext();
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

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Your Loadout
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Activate owned cosmetics — changes apply instantly.</p>
        </div>
        <ProfileAvatar size="lg" />
      </div>
      <ActiveUnlocksBar />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {activatable.map(item => (
          <Button
            key={item.id}
            variant="outline"
            size="sm"
            className="justify-start h-auto py-2 text-left"
            onClick={() => {
              updateState(prev => activateStoreItem(prev, item.id));
              toast.success(`Activated ${item.name}`);
            }}
          >
            <span className="font-medium">{item.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
