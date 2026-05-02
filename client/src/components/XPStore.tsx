/* Parvaz Focus - XP Store Component
   Spend XP on customizations, themes, soundtracks, and bonus project time
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { purchaseStoreItem } from '@/lib/xp-system';
import { ShoppingBag, Zap, Palette, Music, Clock, Sparkles } from 'lucide-react';

export function XPStore() {
  const { state, updateState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const handlePurchase = (itemId: string) => {
    const item = state.user.stats.xpStore.items.find(i => i.id === itemId);
    if (item && state.user.stats.totalXP >= item.cost) {
      const newState = purchaseStoreItem(state, itemId);
      updateState(newState);
    }
  };

  const isPurchased = (itemId: string) => {
    return state.user.stats.xpStore.purchasedItems.includes(itemId);
  };

  const canAfford = (cost: number) => {
    return state.user.stats.totalXP >= cost;
  };

  const themes = state.user.stats.xpStore.items.filter(i => i.type === 'THEME');
  const soundtracks = state.user.stats.xpStore.items.filter(i => i.type === 'SOUNDTRACK');
  const bonusTime = state.user.stats.xpStore.items.filter(i => i.type === 'BONUS_PROJECT_TIME');

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
        </div>

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-3">
            {themes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No themes available yet</p>
            ) : (
              themes.map(item => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  isPurchased={isPurchased(item.id)}
                  canAfford={canAfford(item.cost)}
                  onPurchase={() => handlePurchase(item.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Soundtracks Tab */}
          <TabsContent value="soundtracks" className="space-y-3">
            {soundtracks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No soundtracks available yet</p>
            ) : (
              soundtracks.map(item => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  isPurchased={isPurchased(item.id)}
                  canAfford={canAfford(item.cost)}
                  onPurchase={() => handlePurchase(item.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Bonus Time Tab */}
          <TabsContent value="bonus" className="space-y-3">
            {bonusTime.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bonus time available yet</p>
            ) : (
              bonusTime.map(item => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  isPurchased={isPurchased(item.id)}
                  canAfford={canAfford(item.cost)}
                  onPurchase={() => handlePurchase(item.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Earn more XP by completing tasks, maintaining streaks, and avoiding distractions. Every purchase reinforces your discipline.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StoreItemCard({
  item,
  isPurchased,
  canAfford,
  onPurchase,
}: {
  item: any;
  isPurchased: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}) {
  return (
    <Card className="p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{item.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              {item.cost} XP
            </Badge>
            {isPurchased && <Badge className="bg-accent">Owned</Badge>}
          </div>
        </div>
        <Button
          onClick={onPurchase}
          disabled={isPurchased || !canAfford}
          className={isPurchased ? 'opacity-50' : canAfford ? 'btn-parvaz-primary' : ''}
          variant={isPurchased ? 'outline' : 'default'}
        >
          {isPurchased ? 'Owned' : canAfford ? 'Buy' : 'Need XP'}
        </Button>
      </div>
    </Card>
  );
}
