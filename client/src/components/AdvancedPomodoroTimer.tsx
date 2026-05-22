/* Parvaz Focus - Advanced Pomodoro Timer Component
   25min study + 5min break cycles with XP-based break extensions
*/

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import {
  createTimerSession,
  takeExtraBreak,
  completeStudyCycle,
  pauseTimer,
  resumeTimer,
  endTimerSession,
  getTimerProgress,
  getCurrentCycleInfo,
  getTimerMotivation,
  formatTime,
  getBreakCostInXP,
  validateTimerDuration,
} from '@/lib/advanced-timer';
import { logTimerSessionToApps } from '@/lib/timer-logging';
import { schedulePomodoroNotifications, cancelPomodoroNotifications, requestNotificationPermission } from '@/lib/notifications';
import { getRemainingSeconds } from '@/lib/advanced-timer';
import { addTrackedDuration } from '@/lib/time-aggregation';

export function AdvancedPomodoroTimer() {
  const { state, updateState } = useAppContext();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [durationInput, setDurationInput] = useState('120');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [breakDuration, setBreakDuration] = useState('10');
  // app blocker removed for Pomodoro flow

  // app blocker removed for Pomodoro flow

  const session = state.currentTimerSession;

  useEffect(() => {
    if (!session || !session.isActive) return;

    const interval = setInterval(() => {
      const remaining = getRemainingSeconds(session);
      setTimeLeft(Math.ceil(remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleStartTimer = () => {
    const validation = validateTimerDuration(parseInt(durationInput));
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const timerState = createTimerSession(state, parseInt(durationInput), selectedApps);
    updateState(timerState);
    setShowStartDialog(false);
    // Schedule background notifications for the full session
    requestNotificationPermission().then(() => {
      const cycleId = `pomo_${Date.now()}`;
      const studyMinutes = timerState.currentTimerSession?.studyDuration ?? 25;
      const breakMinutes = timerState.currentTimerSession?.breakDuration ?? 5;
      const totalCycles = timerState.currentTimerSession?.totalCycles ?? 1;
      schedulePomodoroNotifications(cycleId, studyMinutes * 60 * 1000, breakMinutes * 60 * 1000, totalCycles);
      sessionStorage.setItem('parvaz_pomo_cycle', cycleId);
    });
  };

  const handleTakeBreak = () => {
    const duration = parseInt(breakDuration);
    const result = takeExtraBreak(state, duration);

    if (result.success && result.newState) {
      updateState(result.newState);
      // Auto-pause timer when taking break
      const pausedState = pauseTimer(result.newState);
      updateState(pausedState);
      setShowBreakDialog(false);
    }
  };

  const handlePause = () => {
    if (session) {
      const newState = pauseTimer(state);
      updateState(newState);
    }
  };

  const handleResume = () => {
    if (session) {
      const newState = resumeTimer(state);
      updateState(newState);
    }
  };

  const handleEnd = () => {
    if (session) {
      let newState = endTimerSession(state);
      // Log time to tracked apps if any are selected
      if (selectedApps.length > 0) {
        const sessionType = state.studyAppsSetup && state.studyAppsSetup.length > 0 ? 'study' : 'creative';
        newState = logTimerSessionToApps(newState, sessionType, session.duration, selectedApps);
      }

      // Pomodoro sessions are study-only for focus-hours and study totals.
      newState = addTrackedDuration(newState, session.duration * 60, 'STUDY', 'pomodoro');
      updateState(newState);
      const cycleId = sessionStorage.getItem('parvaz_pomo_cycle');
      if (cycleId) { cancelPomodoroNotifications(cycleId); sessionStorage.removeItem('parvaz_pomo_cycle'); }
    }
  };

  if (!session || !session.isActive) {
    return (
      <Card className="p-8 shadow-md">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Advanced Pomodoro Timer</h3>
          <p className="text-muted-foreground mb-6">
            25min study + 5min break cycles with XP-based break extensions
          </p>

          <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Start Study Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start Pomodoro Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Study Duration (minutes)</label>
                  <Input
                    type="number"
                    min="120"
                    max="480"
                    value={durationInput}
                    onChange={e => setDurationInput(e.target.value)}
                    placeholder="Minimum 120 (2 hours)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: 120 min (2 hours) | Maximum: 480 min (8 hours)
                  </p>
                </div>

                {/* Smart App Blocker removed from Pomodoro UI */}

                <div>
                  <label className="text-sm font-semibold mb-3 block">Track App Usage</label>
                  <p className="text-xs text-muted-foreground mb-2">Select apps to track during this session</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2 bg-secondary/30">
                    {(state.studyAppsSetup || []).map(app => (
                      <div key={app} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApps([...selectedApps, app]);
                            } else {
                              setSelectedApps(selectedApps.filter(a => a !== app));
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                          id={`app-${app}`}
                        />
                        <label htmlFor={`app-${app}`} className="text-sm cursor-pointer">
                          {app}
                        </label>
                      </div>
                    ))}
                    {(!state.studyAppsSetup || state.studyAppsSetup.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">Add study apps in Settings to track them</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleStartTimer} className="w-full" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  const progress = getTimerProgress(session);
  const cycleInfo = getCurrentCycleInfo(session);
  const motivation = getTimerMotivation(session);

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <Card className="p-8 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200/50">
        <div className="text-center">
          <div className="mb-4">
            <Badge
              className={`${
                cycleInfo.isStudyPhase ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {cycleInfo.phase} Phase - Cycle {cycleInfo.currentCycle}/{session.totalCycles}
            </Badge>
          </div>

          <div className="text-6xl font-bold font-mono mb-4 text-indigo-900">
            {formatTime(timeLeft)}
          </div>

          <p className="text-lg text-indigo-800 mb-6">{motivation}</p>

          <Progress value={progress} className="h-3 mb-6" />

          <p className="text-sm text-indigo-700 mb-6">
            {progress.toFixed(0)}% Complete • {session.completedCycles} cycles done
          </p>

          {/* Controls */}
          <div className="flex gap-3 justify-center mb-6 flex-wrap">
            {session.isPaused ? (
              <Button onClick={handleResume} className="gap-2">
                <Play className="w-4 h-4" />
                Resume
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}

            <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Coffee className="w-4 h-4" />
                  Extra Break
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Take Extra Break (Costs XP)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Break Duration (minutes)</label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={breakDuration}
                      onChange={e => setBreakDuration(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      <Zap className="w-3 h-3 inline mr-1" />
                      Cost: {getBreakCostInXP(parseInt(breakDuration))} XP
                      {state.user.stats.totalXP < getBreakCostInXP(parseInt(breakDuration)) && (
                        <span className="text-red-600 ml-2">
                          (You have {state.user.stats.totalXP} XP)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={handleTakeBreak}
                    disabled={state.user.stats.totalXP < getBreakCostInXP(parseInt(breakDuration))}
                    className="w-full"
                  >
                    Take Break
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleEnd} variant="destructive" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              End Session
            </Button>
          </div>

          {/* Smart app blocker removed from Pomodoro UI */}
        </div>
      </Card>

      {/* Session Stats */}
      <Card className="p-6 shadow-md">
        <h4 className="font-semibold mb-4">Session Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Duration</p>
            <p className="text-2xl font-bold">{session.duration}min</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cycles</p>
            <p className="text-2xl font-bold">
              {session.completedCycles}/{session.totalCycles}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Extra Breaks</p>
            <p className="text-2xl font-bold">{session.extraBreaksTaken}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">XP Used</p>
            <p className="text-2xl font-bold text-accent">{session.xpUsedForBreaks}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
