/* Parvaz Focus - Focus Timer Component
   Features: Deep Focus, Revision Sprint, Quick Session
   Design: Minimal, clean, focused atmosphere
*/

import { useState, useEffect, useRef } from 'react';
import { FocusMode, FocusRating } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Play, Pause, X, Check } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete?: (rating: FocusRating, duration: number) => void;
}

const TIMER_PRESETS = {
  DEEP_FOCUS: 45,
  REVISION_SPRINT: 25,
  QUICK_SESSION: 15,
};

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FocusMode>('DEEP_FOCUS');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.DEEP_FOCUS * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showRating, setShowRating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer countdown
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setShowRating(true);
          playTimerSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleModeChange = (newMode: FocusMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode] * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const handleRating = (rating: FocusRating) => {
    if (onSessionComplete && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
      onSessionComplete(rating, duration);
    }
    resetTimer();
    setShowRating(false);
    setIsOpen(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode] * 60);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeDescriptions = {
    DEEP_FOCUS: 'Deep Focus - 45 min uninterrupted work',
    REVISION_SPRINT: 'Revision Sprint - 25 min focused session',
    QUICK_SESSION: 'Quick Session - 15 min rapid work',
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="btn-parvaz-primary"
      >
        Start Focus Timer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Focus Timer</DialogTitle>
          </DialogHeader>

          {!showRating ? (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Mode</label>
                <Select value={mode} onValueChange={(v) => handleModeChange(v as FocusMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEEP_FOCUS">Deep Focus (45 min)</SelectItem>
                    <SelectItem value="REVISION_SPRINT">Revision Sprint (25 min)</SelectItem>
                    <SelectItem value="QUICK_SESSION">Quick Session (15 min)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">{modeDescriptions[mode]}</p>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className="text-6xl font-bold font-mono mb-4 text-accent">
                  {formatTime(timeLeft)}
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${((TIMER_PRESETS[mode] * 60 - timeLeft) / (TIMER_PRESETS[mode] * 60)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={toggleTimer}
                  className="btn-parvaz-primary flex-1"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Tips */}
              <Card className="p-4 bg-secondary/30 border-border/50">
                <p className="text-xs text-muted-foreground">
                  💡 {mode === 'DEEP_FOCUS'
                    ? 'Eliminate all distractions. This is your deepest work time.'
                    : mode === 'REVISION_SPRINT'
                    ? 'Perfect for quick reviews and practice problems.'
                    : 'Great for getting started or wrapping up.'}
                </p>
              </Card>
            </div>
          ) : (
            /* Focus Rating */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold mb-4">How focused were you?</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handleRating('LOCKED_IN')}
                  className="w-full btn-parvaz-primary"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Locked In
                </Button>
                <Button
                  onClick={() => handleRating('DISTRACTED')}
                  variant="outline"
                  className="w-full"
                >
                  Distracted
                </Button>
                <Button
                  onClick={() => handleRating('SURVIVED')}
                  variant="outline"
                  className="w-full"
                >
                  Survived Somehow
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function playTimerSound() {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio not available');
  }
}
