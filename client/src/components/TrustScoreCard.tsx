/* Parvaz Focus - Trust Score & Focus Rank Card
   Displays self-trust percentage and current focus rank
*/

import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getFocusRankInfo, getXPProgressToNextRank } from '@/lib/xp-system';
import { Heart, Zap } from 'lucide-react';

export function TrustScoreCard() {
  const { state } = useAppContext();
  const stats = state.user.stats;
  const rankInfo = getFocusRankInfo(stats.focusRank);
  const xpProgress = getXPProgressToNextRank(stats.totalXP);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Trust Score Card */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Self-Trust Score</h3>
        </div>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-4xl font-bold text-accent">{stats.trustScore.percentage}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.trustScore.percentage >= 80
                ? 'You trust yourself completely'
                : stats.trustScore.percentage >= 60
                ? 'Building strong self-trust'
                : stats.trustScore.percentage >= 40
                ? 'Trust is growing'
                : 'Keep building consistency'}
            </p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consistency</span>
              <span className="font-medium">{stats.trustScore.consistency} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Promises Kept</span>
              <span className="font-medium">{stats.trustScore.promisesKept} tasks</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Focus Rank Card */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Focus Rank</h3>
        </div>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-5xl mb-2">{rankInfo.emoji}</p>
            <p className="text-2xl font-bold">{rankInfo.rank.replace(/_/g, ' ')}</p>
            <p className="text-xs text-muted-foreground mt-1">{rankInfo.description}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress to Next Rank</span>
              <span className="font-medium">{xpProgress.percentage}%</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {xpProgress.current} / {xpProgress.needed} XP
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
