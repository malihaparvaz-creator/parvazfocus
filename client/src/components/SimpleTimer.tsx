/* Simple Timer — 3 categories (Study / Creative / Entertainment)
   Completed time adds to: totalFocusHours, studyTime/creativeTime,
   dailyStudyLog, weeklyStudyLog — all properly wired
*/

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, RotateCcw, Trash2, Plus, Clock, BookOpen, Palette, Tv } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { scheduleTimerNotification, cancelTimerNotification, requestNotificationPermission } from '@/lib/notifications';
import { addTrackedDuration } from '@/lib/time-aggregation';

type TimerCategory = 'STUDY' | 'CREATIVE' | 'ENTERTAINMENT';

interface SimpleTimerSession {
  id: string;
  label: string;
  category: TimerCategory;
  duration: number;       // seconds
  timeRemaining: number;  // seconds
  isActive: boolean;
  isPaused: boolean;
  startedAt: Date;
}

const CATEGORY_CONFIG: Record<TimerCategory, { label: string; color: string; icon: typeof BookOpen }> = {
  STUDY:         { label: 'Study',         color: '#d8b4fe', icon: BookOpen },
  CREATIVE:      { label: 'Creative',      color: '#a78bfa', icon: Palette  },
  ENTERTAINMENT: { label: 'Entertainment', color: '#fca5a5', icon: Tv       },
};

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function SimpleTimer() {
  const { state, updateState } = useAppContext();
  const [sessions, setSessions] = useState<SimpleTimerSession[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState('25');
  const [timerLabel, setTimerLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TimerCategory>('STUDY');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Countdown tick
  useEffect(() => {
    if (!activeSessionId) return;
    const active = sessions.find(s => s.id === activeSessionId);
    if (!active || !active.isActive || active.isPaused) return;

    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const newTime = s.timeRemaining - 1;
        if (newTime <= 0) {
          // Timer done — wire into focus hours + logs
          const finished = { ...s, timeRemaining: 0, isActive: false };
          const newAppState = addTrackedDuration(
            stateRef.current,
            finished.duration,
            finished.category,
            'simple-timer'
          );
          updateState(newAppState);
          cancelTimerNotification(s.id);

          // Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification('Parvaz Focus — Timer Done! ⏱️', {
                body: `${finished.label || Math.floor(finished.duration/60)+' min timer'} complete! Great work.`,
                icon: '/icon192x192.png',
                tag: 'timer-complete',
              });
            }).catch(() => {
              new Notification('Timer Done!', { body: 'Your timer is complete.' });
            });
          }
          return finished;
        }
        return { ...s, timeRemaining: newTime };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessionId, sessions]);

  const handleAddTimer = () => {
    const mins = parseInt(timerMinutes);
    if (!mins || mins <= 0) return;
    const durationSeconds = mins * 60;
    const newSession: SimpleTimerSession = {
      id: `timer_${Date.now()}`,
      label: timerLabel.trim() || `${mins} min ${CATEGORY_CONFIG[selectedCategory].label}`,
      category: selectedCategory,
      duration: durationSeconds,
      timeRemaining: durationSeconds,
      isActive: true,
      isPaused: false,
      startedAt: new Date(),
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setTimerMinutes('25'); setTimerLabel('');
    setShowAddDialog(false);
    requestNotificationPermission().then(() => {
      scheduleTimerNotification(newSession.id, durationSeconds * 1000, newSession.label);
    });
  };

  const handlePauseResume = (id: string) => {
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, isPaused: !s.isPaused } : s
    ));
  };

  const handleStop = (id: string) => {
    const s = sessions.find(x => x.id === id);
    if (s && s.isActive) {
      // Partial credit: add elapsed time
      const elapsed = s.duration - s.timeRemaining;
      if (elapsed > 30) {
        const newAppState = addTrackedDuration(
          stateRef.current,
          elapsed,
          s.category,
          'simple-timer'
        );
        updateState(newAppState);
      }
      cancelTimerNotification(id);
    }
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: false, isPaused: false } : s
    ));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const handleRemove = (id: string) => {
    handleStop(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add Timer */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-accent text-white hover:bg-accent/90">
            <Plus className="w-4 h-4" /> New Timer
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Timer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Category selector */}
            <div>
              <p className="text-sm font-medium mb-2">Category</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as TimerCategory[]).map(cat => {
                  const { label, color, icon: Icon } = CATEGORY_CONFIG[cat];
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: active ? `${color}20` : 'transparent',
                        borderColor: active ? color : 'var(--border)',
                        color: active ? color : 'var(--muted-foreground)',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Duration (minutes)</p>
              <Input
                type="number" min="1" max="300"
                value={timerMinutes}
                onChange={e => setTimerMinutes(e.target.value)}
                placeholder="25"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Label (optional)</p>
              <Input
                value={timerLabel}
                onChange={e => setTimerLabel(e.target.value)}
                placeholder="e.g. Math revision"
              />
            </div>
            <Button onClick={handleAddTimer} className="w-full bg-accent text-white hover:bg-accent/90">
              Start Timer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer cards */}
      {sessions.length === 0 && (
        <Card className="p-8 text-center shadow-md">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No timers running. Add one above!</p>
        </Card>
      )}

      {sessions.map(session => {
        const cfg = CATEGORY_CONFIG[session.category];
        const Icon = cfg.icon;
        const pct = ((session.duration - session.timeRemaining) / session.duration) * 100;
        const done = session.timeRemaining === 0;

        return (
          <Card key={session.id} className="p-5 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}25` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{session.label}</p>
                  <p className="text-xs" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
              </div>
              <button onClick={() => handleRemove(session.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Time display */}
            <div className="text-center my-3">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {formatTime(session.timeRemaining)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-secondary mb-4">
              <div className="h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
            </div>

            {/* Controls */}
            {!done ? (
              <div className="flex gap-2">
                <Button onClick={() => handlePauseResume(session.id)}
                  size="sm" variant="outline" className="flex-1 gap-1.5">
                  {session.isPaused
                    ? <><Play className="w-3.5 h-3.5" /> Resume</>
                    : <><Pause className="w-3.5 h-3.5" /> Pause</>
                  }
                </Button>
                <Button onClick={() => handleStop(session.id)}
                  size="sm" variant="outline"
                  className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
                  <RotateCcw className="w-3.5 h-3.5" /> Stop
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm font-semibold" style={{ color: cfg.color }}>
                ✓ Complete! Time logged.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
