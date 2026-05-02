/* Parvaz Focus - Emergency Mode Component
   Purpose: Simplify UI during overwhelmed/burnout moments with 5-min timer
   Design: Minimal, calming, focused on next action
   Timer: Counts down 5 minutes, adds to focus hours on completion
*/

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Droplet, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface EmergencyModeProps {
  isActive: boolean;
  onClose: () => void;
  nextTask?: string;
}

export function EmergencyMode({ isActive, onClose, nextTask }: EmergencyModeProps) {
  const { state, updateState } = useAppContext();
  const [waterReminders, setWaterReminders] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Water reminder every 15 minutes
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setWaterReminders(prev => prev + 1);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer completed
          setTimerActive(false);
          completeTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isPaused, timeRemaining]);

  const startTimer = () => {
    setTimerActive(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setIsPaused(false);
    setTimeRemaining(5 * 60);
    setSessionStartTime(null);
  };

  const completeTimer = () => {
    // Add 5 minutes to focus hours
    const newState = { ...state };
    newState.user.stats.totalFocusHours += 5 / 60; // Convert minutes to hours
    updateState(newState);

    // Show completion message
    alert('Great job! 5 minutes of focus added to your stats.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 shadow-lg border-accent/50">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-accent opacity-70" />
            <h2 className="text-2xl font-bold mb-2">Emergency Mode</h2>
            <p className="text-muted-foreground">Let's simplify. Just focus on the next thing.</p>
          </div>

          {/* Next Task */}
          {nextTask && (
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Next Task</p>
              <p className="font-semibold text-lg">{nextTask}</p>
            </div>
          )}

          {/* Timer Section */}
          <div className="bg-accent/10 rounded-lg p-6 border border-accent/30">
            {!timerActive ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">Start with just 5 minutes</p>
                <Button 
                  onClick={startTimer}
                  className="w-full btn-parvaz-primary"
                >
                  Start 5-Min Timer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                {/* Timer Display */}
                <div className="mb-6">
                  <div className="text-5xl font-bold text-accent font-mono tracking-wider">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                    {isPaused ? 'Paused' : 'Focus Time'}
                  </p>
                </div>

                {/* Timer Controls */}
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className="flex-1"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${((5 * 60 - timeRemaining) / (5 * 60)) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Water Reminder */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Droplet className="w-4 h-4" />
            <span>Have you had water today?</span>
          </div>

          {/* Exit Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Exit Emergency Mode
          </Button>

          {/* Motivational Line */}
          <p className="text-xs text-muted-foreground italic">
            "Just continue. You've got this."
          </p>
        </div>
      </Card>
    </div>
  );
}
