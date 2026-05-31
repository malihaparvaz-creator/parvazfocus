/* Parvaz Focus - XP Store Component */

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { purchaseStoreItem } from '@/lib/xp-system';
import { activateStoreItem, isItemActive, AVATAR_STYLES } from '@/lib/store-unlocks';
import { StoreItemData } from '@/lib/types';
import { toast } from 'sonner';
import { ShoppingBag, Zap, Palette, Music, Clock, Sparkles, User, Crown } from 'lucide-react';

const ACTIVATABLE_TYPES = new Set([
  'FOCUS_ROOM',
  'QUOTE_PACK',
  'SOUNDTRACK',
  'AVATAR_STYLE',
  'STREAK_EFFECT',
  'PROFILE_TITLE',
  'TIMER_SKIN',
  'THEME',
]);

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
      return item.id === 'boost_xp_small'
        ? '+50 XP added to your balance.'
        : 'Bonus project time added — Projects may unlock early.';
    case 'AVATAR_STYLE':
      return 'Avatar frame activated — check sidebar & Study header.';
    case 'STREAK_EFFECT':
      return 'Streak effect active on Home & Study streak cards.';
    case 'PROFILE_TITLE':
      return 'Title shown under your profile avatar.';
    case 'TIMER_SKIN':
      return 'Timer skin applied to Pomodoro & Simple Timer.';
    case 'MYSTERY_BOX':
      return 'Mystery box opened — check your new unlock!';
    default:
      return 'Purchase complete.';
  }
}

function itemPreview(item: StoreItemData): string | null {
  if (item.type === 'AVATAR_STYLE' && AVATAR_STYLES[item.id]) {
    return AVATAR_STYLES[item.id].emoji;
  }
  return null;
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

  const canAfford = (cost: number) => state.user.stats.totalXP >= cost;

  const items = state.user.stats.xpStore.items;
  const themes = items.filter(i => i.type === 'THEME');
  const soundtracks = items.filter(i => i.type === 'SOUNDTRACK');
  const rooms = items.filter(i => i.type === 'FOCUS_ROOM');
  const quotes = items.filter(i => i.type === 'QUOTE_PACK');
  const avatars = items.filter(i => i.type === 'AVATAR_STYLE');
  const streaks = items.filter(i => i.type === 'STREAK_EFFECT');
  const titles = items.filter(i => i.type === 'PROFILE_TITLE');
  const timerSkins = items.filter(i => i.type === 'TIMER_SKIN');
  const bonusTime = items.filter(i => i.type === 'BONUS_PROJECT_TIME');
  const mystery = items.filter(i => i.type === 'MYSTERY_BOX');

  const renderItems = (list: StoreItemData[]) =>
    list.map(item => (
      <StoreItemCard
        key={item.id}
        item={item}
        preview={itemPreview(item)}
        isPurchased={isPurchased(item.id)}
        isActive={isItemActive(state, item)}
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            XP Store — Spend Your Discipline Currency
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1">
            <TabsTrigger value="themes" className="gap-1 text-xs sm:text-sm">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-1 text-xs sm:text-sm">
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-1 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="cosmetics" className="gap-1 text-xs sm:text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Cosmetics
            </TabsTrigger>
            <TabsTrigger value="boosts" className="gap-1 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              Boosts
            </TabsTrigger>
            <TabsTrigger value="mystery" className="gap-1 text-xs sm:text-sm">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              Mystery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-3 mt-4">
            {themes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No themes yet</p>
            ) : (
              renderItems(themes)
            )}
          </TabsContent>

          <TabsContent value="audio" className="space-y-3 mt-4">
            {soundtracks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No soundtracks yet</p>
            ) : (
              renderItems(soundtracks)
            )}
          </TabsContent>

          <TabsContent value="rooms" className="space-y-3 mt-4">
            {rooms.length === 0 && quotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No rooms or quotes yet</p>
            ) : (
              <>
                {quotes.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quote packs</p>
                    {renderItems(quotes)}
                  </>
                )}
                {rooms.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">Focus rooms</p>
                    {renderItems(rooms)}
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="cosmetics" className="space-y-4 mt-4">
            {avatars.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Avatar frames</p>
                <div className="space-y-3">{renderItems(avatars)}</div>
              </section>
            )}
            {streaks.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Streak effects</p>
                <div className="space-y-3">{renderItems(streaks)}</div>
              </section>
            )}
            {titles.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Profile titles</p>
                <div className="space-y-3">{renderItems(titles)}</div>
              </section>
            )}
            {timerSkins.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Timer skins</p>
                <div className="space-y-3">{renderItems(timerSkins)}</div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="boosts" className="space-y-3 mt-4">
            {bonusTime.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No boosts yet</p>
            ) : (
              renderItems(bonusTime)
            )}
          </TabsContent>

          <TabsContent value="mystery" className="space-y-3 mt-4">
            {mystery.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No mystery boxes yet</p>
            ) : (
              renderItems(mystery)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StoreItemCard({
  item,
  preview,
  isPurchased,
  isActive,
  canActivate,
  canAfford,
  onPurchase,
  onActivate,
}: {
  item: StoreItemData;
  preview: string | null;
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
        <div className="flex gap-3 flex-1 min-w-0">
          {preview && (
            <div className="w-12 h-12 shrink-0 rounded-full bg-muted flex items-center justify-center text-2xl">
              {preview}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-semibold mb-1">{item.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                {item.cost} XP
              </Badge>
              {isPurchased && !showBuyAgain && <Badge className="bg-accent">Owned</Badge>}
              {isActive && <Badge variant="secondary">Active</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {(!isPurchased || showBuyAgain) && (
            <Button
              onClick={onPurchase}
              disabled={!canAfford}
              className={canAfford ? 'btn-parvaz-primary' : ''}
              variant="default"
              size="sm"
            >
              {canAfford ? (showBuyAgain ? 'Buy Again' : 'Buy') : 'Need XP'}
            </Button>
          )}
          {isPurchased && canActivate && !consumable && (
            <Button onClick={onActivate} variant={isActive ? 'outline' : 'default'} disabled={isActive} size="sm">
              {isActive ? 'Active' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
