/* Parvaz Focus - Banked Discipline Component
   Store extra study effort for hard days
   Earn Creative Freedom Passes for 30-day streaks
*/

import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { bankDiscipline, checkCreativeFreedomPass, useCreativeFreedomPass } from '@/lib/xp-system';
import { Zap, Gift, TrendingUp } from 'lucide-react';

export function BankedDisciplineCard() {
  const { state, updateState } = useAppContext();
  const stats = state.user.stats;
  const qualifiesForPass = checkCreativeFreedomPass(state);
  const hasAvailablePass = stats.creativeFreedomPasses.some(
    p => !p.used && new Date() < p.expiresAt
  );

  const handleActivateBonusDay = () => {
    if (hasAvailablePass) {
      const newState = useCreativeFreedomPass(state);
      updateState(newState);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Banked Discipline Card */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Banked Discipline</h3>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-accent">{stats.bankedDiscipline.totalBanked}</p>
            <p className="text-xs text-muted-foreground mt-1">Extra effort stored</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">How it works:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Study extra = bank discipline points</li>
              <li>• Use on hard days to reduce requirements</li>
              <li>• Mirrors real energy management</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Creative Freedom Pass Card */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Creative Freedom Pass</h3>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{stats.streak} day streak</p>
            {qualifiesForPass ? (
              <Badge className="bg-accent">🎉 Earned!</Badge>
            ) : (
              <p className="text-xs text-muted-foreground">
                {30 - stats.streak} days until Creative Freedom Pass
              </p>
            )}
          </div>

          {hasAvailablePass && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full btn-parvaz-primary">Activate Bonus Day</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Activate Creative Freedom Pass</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                    <p className="font-semibold mb-2">Today is your day of freedom!</p>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>✓ Projects unlocked freely</li>
                      <li>✓ No mandatory study requirements</li>
                      <li>✓ Relaxed schedule</li>
                      <li>✓ Focus on what matters to you</li>
                    </ul>
                  </div>
                  <Button onClick={handleActivateBonusDay} className="w-full btn-parvaz-primary">
                    Yes, Activate Bonus Day
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {state.today.bonusDayActive && (
            <div className="bg-accent/20 rounded-lg p-3 border border-accent/50">
              <p className="text-sm font-semibold text-accent">🎉 Bonus Day Active!</p>
              <p className="text-xs text-muted-foreground mt-1">Projects are unlocked. Enjoy your creative freedom.</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p className="mb-2">Available Passes: {stats.creativeFreedomPasses.filter(p => !p.used && new Date() < p.expiresAt).length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
