/* Parvaz Focus - Home Page
   Design: Soft pastel aesthetic, minimal, focused
*/

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { BookOpen, Zap, Clock, Target, Gift, X, RotateCcw } from 'lucide-react';
import { LiveTracker } from '@/components/LiveTracker';
import { useTracking } from '@/contexts/TrackingContext';
import { resetCoreStats } from '@/lib/time-aggregation';

export default function Home() {
  const { state, addXPToUser, updateState } = useAppContext();
  const [, navigate] = useLocation();
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakRewardClaimed, setStreakRewardClaimed] = useState(false);

  // Check for 30-day streak reward
  useEffect(() => {
    const streak = state.user.stats.streak;
    const hasShownReward = sessionStorage.getItem('streakRewardShown');
    if (streak === 30 && !hasShownReward && !streakRewardClaimed) {
      setShowStreakReward(true);
      sessionStorage.setItem('streakRewardShown', 'true');
    }
  }, [state.user.stats.streak, streakRewardClaimed]);

  // Format full date with month, day, and day of week
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = state.user.stats;
  const mission = state.today.mission;
  const timeTracking = state.user.timeTracking;
  const { categoryTotals, formatTime: formatTrackTime } = useTracking();

  // Calculate mission progress
  const completedTasks = mission.tasks.filter(t => t.completed).length;
  const totalTasks = mission.tasks.length;
  const missionProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Format time display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleResetCoreStats = () => {
    updateState(prev => resetCoreStats(prev));
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Date */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Parvaz Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">{dateString}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Level Card */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level</p>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-4xl font-bold text-accent">{stats.currentLevel.level}</p>
            <p className="text-xs text-muted-foreground mt-2">{stats.currentLevel.levelName}</p>
          </Card>

          {/* XP Card */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total XP</p>
              <Target className="w-4 h-4 text-accent" />
            </div>
            <p className="text-4xl font-bold text-accent">{stats.totalXP}</p>
            <p className="text-xs text-muted-foreground mt-2">Discipline Currency</p>
          </Card>

          {/* Streak Card */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Streak</p>
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <p className="text-4xl font-bold text-accent">{stats.streak}</p>
            <p className="text-xs text-muted-foreground mt-2">Days Consistent</p>
          </Card>

          {/* Focus Hours Card */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Focus Hours</p>
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <p className="text-4xl font-bold text-accent">{stats.totalFocusHours}h</p>
            <p className="text-xs text-muted-foreground mt-2">Total Invested</p>
          </Card>
        </div>

        {/* Today's Mission */}
        <Card className="p-8 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Today's Mission</h2>
            <span className="text-sm font-semibold text-accent">{missionProgress.toFixed(0)}% Complete</span>
          </div>
          <p className="text-muted-foreground mb-6">Complete your priorities to unlock projects</p>

          {/* Progress Bar */}
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Progress</span>
              <span className="font-semibold">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <Progress value={missionProgress} className="h-2" />
          </div>

          {/* Task Summary */}
          {totalTasks === 0 ? (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No tasks added yet. Start building your day!</p>
              <Button
                onClick={() => navigate('/study')}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Go to Study Mode
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Must Do */}
              <div className="p-4 bg-card border border-border/50 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-2">TOP PRIORITY</p>
                <p className="text-2xl font-bold text-accent">
                  {mission.tasks.filter(t => t.priority === 'MUST_DO' && t.completed).length}/
                  {mission.tasks.filter(t => t.priority === 'MUST_DO').length}
                </p>
              </div>

              {/* Should Do */}
              <div className="p-4 bg-card border border-border/50 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-2">PRIORITY</p>
                <p className="text-2xl font-bold text-accent">
                  {mission.tasks.filter(t => t.priority === 'SHOULD_DO' && t.completed).length}/
                  {mission.tasks.filter(t => t.priority === 'SHOULD_DO').length}
                </p>
              </div>

              {/* Bonus */}
              <div className="p-4 bg-card border border-border/50 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-2">BONUS</p>
                <p className="text-2xl font-bold text-accent">
                  {mission.tasks.filter(t => t.priority === 'BONUS' && t.completed).length}/
                  {mission.tasks.filter(t => t.priority === 'BONUS').length}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Live App Tracker */}
        <LiveTracker />

        {/* Time Tracking Summary */}
        <Card className="p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6">Today's Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Study Time */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Study Time</p>
              <p className="text-3xl font-bold text-accent">{formatTrackTime(categoryTotals.STUDY)}</p>
              <p className="text-xs text-muted-foreground mt-2">Focus invested today</p>
            </div>

            {/* Creative Time */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Creative Time</p>
              <p className="text-3xl font-bold text-accent">{formatTrackTime(categoryTotals.CREATIVE)}</p>
              <p className="text-xs text-muted-foreground mt-2">Projects & creation</p>
            </div>

            {/* Entertainment Time */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Entertainment</p>
              <p className="text-3xl font-bold text-accent">{formatTrackTime(categoryTotals.ENTERTAINMENT)}</p>
              <p className="text-xs text-muted-foreground mt-2">Apps & distractions</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/study')}
            className="h-16 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Study Mode
          </Button>
          <Button
            onClick={() => navigate('/projects')}
            className="h-16 bg-secondary hover:bg-secondary/80 text-foreground text-lg font-semibold"
          >
            <Zap className="w-5 h-5 mr-3" />
            Projects
          </Button>
        </div>
        {/* Home reset (quick core stats reset) */}
        <Card className="p-6 shadow-md border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Quick Reset: Streak + Focus Hours + XP</p>
              <p className="text-xs text-muted-foreground mt-1">
                Resets only streak, focus hours, XP, and level. Your tasks and logs stay intact.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleResetCoreStats}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Core Stats
            </Button>
          </div>
        </Card>
      </main>

      {/* 30-Day Streak Reward Popup */}
      <Dialog open={showStreakReward} onOpenChange={setShowStreakReward}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                30-Day Streak Reward!
              </DialogTitle>
              <button
                onClick={() => setShowStreakReward(false)}
                className="p-1 hover:bg-secondary rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-4xl mb-2">🔥</p>
              <p className="text-lg font-semibold mb-2">Amazing Consistency!</p>
              <p className="text-muted-foreground">You've maintained a 30-day streak. Here's your reward:</p>
            </div>
            <div className="bg-accent/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Bonus XP</p>
              <p className="text-3xl font-bold text-accent">+50 XP</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  addXPToUser(50);
                  setStreakRewardClaimed(true);
                  setShowStreakReward(false);
                }}
                className="flex-1 btn-parvaz-primary"
              >
                Claim Reward
              </Button>
              <Button
                onClick={() => setShowStreakReward(false)}
                variant="outline"
                className="flex-1"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
