/* Parvaz Focus - XP Store Component */

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { purchaseStoreItem } from '@/lib/xp-system';
import { activateStoreItem } from '@/lib/store-unlocks';
import { StoreItemData } from '@/lib/types';
import { toast } from 'sonner';
import { ShoppingBag, Zap, Palette, Music, Clock, Sparkles } from 'lucide-react';

const ACTIVATABLE_TYPES = new Set(['FOCUS_ROOM', 'QUOTE_PACK', 'SOUNDTRACK', 'AVATAR_STYLE', 'STREAK_EFFECT', 'THEME']);

function purchaseMessage(item: StoreItemData): string {
  switch (item.type) {
    case 'THEME':
      return 'Theme applied across the app.';
    case 'SOUNDTRACK':
      return 'Soundtrack unlocked — open Music tab to play it.';
    case 'QUOTE_PACK':
      return 'Quote pack active — see your daily line in Study Mode.';
    case 'FOCUS_ROOM':
      return 'Focus room ambience applied to the app background.';
    case 'BONUS_PROJECT_TIME':
      return 'Bonus project time added — Projects may unlock early.';
    case 'AVATAR_STYLE':
      return 'Avatar frame style activated.';
    case 'STREAK_EFFECT':
      return 'Streak effect activated on your streak display.';
    case 'MYSTERY_BOX':
      return 'Mystery box opened — check your new unlock!';
    default:
      return 'Purchase complete.';
  }
}

export function XPStore() {
  const { state, updateState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const handlePurchase = (itemId: string) => {
    const item = state.user.stats.xpStore.items.find(i => i.id === itemId);
    if (!item) return;
    const isConsumable = item.type === 'BONUS_PROJECT_TIME' || item.type === 'MYSTERY_BOX';
    if (!isConsumable && state.user.stats.xpStore.purchasedItems.includes(itemId)) {
      toast.info('You already own this item.');
      return;
    }
    if (state.user.stats.totalXP < item.cost) {
      toast.error('Not enough XP for this item.');
      return;
    }

    const newState = purchaseStoreItem(state, itemId);
    if (newState === state) return;

    updateState(newState);
    toast.success(`${item.name} purchased`, { description: purchaseMessage(item) });
  };

  const handleActivate = (itemId: string) => {
    const item = state.user.stats.xpStore.items.find(i => i.id === itemId);
    if (!item) return;
    if (!state.user.stats.xpStore.purchasedItems.includes(itemId)) {
      toast.error('Buy this item first.');
      return;
    }

    updateState(prev => activateStoreItem(prev, itemId));
    toast.success(`${item.name} activated`, { description: purchaseMessage(item) });
  };

  const isPurchased = (itemId: string) => state.user.stats.xpStore.purchasedItems.includes(itemId);

  const isActive = (item: StoreItemData) => {
    const active = state.user.stats.xpStore.active;
    if (!active) return false;
    switch (item.type) {
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
      default:
        return false;
    }
  };

  const canAfford = (cost: number) => state.user.stats.totalXP >= cost;

  const themes = state.user.stats.xpStore.items.filter(i => i.type === 'THEME');
  const soundtracks = state.user.stats.xpStore.items.filter(i => i.type === 'SOUNDTRACK');
  const bonusTime = state.user.stats.xpStore.items.filter(i => i.type === 'BONUS_PROJECT_TIME');
  const extras = state.user.stats.xpStore.items.filter(i => i.type === 'FOCUS_ROOM' || i.type === 'QUOTE_PACK');
  const fun = state.user.stats.xpStore.items.filter(
    i => i.type === 'AVATAR_STYLE' || i.type === 'STREAK_EFFECT' || i.type === 'MYSTERY_BOX'
  );

  const renderItems = (items: StoreItemData[]) =>
    items.map(item => (
      <StoreItemCard
        key={item.id}
        item={item}
        isPurchased={isPurchased(item.id)}
        isActive={isActive(item)}
        canActivate={ACTIVATABLE_TYPES.has(item.type)}
        canAfford={canAfford(item.cost)}
        onPurchase={() => handlePurchase(item.id)}
        onActivate={() => handleActivate(item.id)}
      />
    ));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-parvaz-primary gap-2">
          <ShoppingBag className="w-4 h-4" />
          XP Store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            XP Store - Spend Your Discipline Currency
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available XP</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-2xl font-bold text-accent">{state.user.stats.totalXP}</span>
            </div>
          </div>
          {(state.user.stats.xpStore.active?.bonusProjectMinutes ?? 0) > 0 && (
            <p className="text-xs text-accent mt-2">
              Banked bonus project time: {state.user.stats.xpStore.active?.bonusProjectMinutes} min
            </p>
          )}
        </div>

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="w-4 h-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="soundtracks" className="gap-2">
              <Music className="w-4 h-4" />
              Soundtracks
            </TabsTrigger>
            <TabsTrigger value="bonus" className="gap-2">
              <Clock className="w-4 h-4" />
              Bonus Time
            </TabsTrigger>
            <TabsTrigger value="extras" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Extras
            </TabsTrigger>
            <TabsTrigger value="fun" className="gap-2">
              <Zap className="w-4 h-4" />
              Fun
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-3">
            {themes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No themes available yet</p>
            ) : (
              renderItems(themes)
            )}
          </TabsContent>

          <TabsContent value="soundtracks" className="space-y-3">
            {soundtracks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No soundtracks available yet</p>
            ) : (
              renderItems(soundtracks)
            )}
          </TabsContent>

          <TabsContent value="bonus" className="space-y-3">
            {bonusTime.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bonus time available yet</p>
            ) : (
              renderItems(bonusTime)
            )}
          </TabsContent>

          <TabsContent value="extras" className="space-y-3">
            {extras.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No extras available yet</p>
            ) : (
              renderItems(extras)
            )}
          </TabsContent>

          <TabsContent value="fun" className="space-y-3">
            {fun.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No fun items available yet</p>
            ) : (
              renderItems(fun)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StoreItemCard({
  item,
  isPurchased,
  isActive,
  canActivate,
  canAfford,
  onPurchase,
  onActivate,
}: {
  item: StoreItemData;
  isPurchased: boolean;
  isActive: boolean;
  canActivate: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  onActivate: () => void;
}) {
  const consumable = item.type === 'BONUS_PROJECT_TIME' || item.type === 'MYSTERY_BOX';
  const showBuyAgain = consumable && isPurchased;

  return (
    <Card className="p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{item.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              {item.cost} XP
            </Badge>
            {isPurchased && <Badge className="bg-accent">Owned</Badge>}
            {isActive && <Badge variant="secondary">Active</Badge>}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {(!isPurchased || showBuyAgain) && (
            <Button
              onClick={onPurchase}
              disabled={!canAfford}
              className={canAfford ? 'btn-parvaz-primary' : ''}
              variant="default"
            >
              {canAfford ? (showBuyAgain ? 'Buy Again' : 'Buy') : 'Need XP'}
            </Button>
          )}
          {isPurchased && canActivate && !consumable && (
            <Button onClick={onActivate} variant={isActive ? 'outline' : 'default'} disabled={isActive}>
              {isActive ? 'Active' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
