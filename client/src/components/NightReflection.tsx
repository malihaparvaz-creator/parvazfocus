/* Parvaz Focus - Night Reflection Component
   Purpose: End-of-day reflection for self-awareness
   Design: Calm, introspective, minimal
*/

import { useState } from 'react';
import { NightReflection as NightReflectionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Moon, Check, Lock } from 'lucide-react';
import { getReflectionStatus, isReflectionFromToday } from '@/lib/reflection-lock';

interface NightReflectionProps {
  onSave?: (reflection: NightReflectionType) => void;
  today?: { reflection?: NightReflectionType; reflectionLocked?: boolean };
}

export function NightReflectionDialog({ onSave, today }: NightReflectionProps) {
  const [step, setStep] = useState(0);
  const [whatMovedForward, setWhatMovedForward] = useState('');
  const [whatDistracted, setWhatDistracted] = useState('');
  const [shouldImprove, setShouldImprove] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  
  const reflectionStatus = getReflectionStatus(today || {});
  const hasReflectionToday = today?.reflection && isReflectionFromToday(today.reflection);

  const handleSave = () => {
    if (!reflectionStatus.canAdd) {
      return; // Cannot add reflection
    }

    const reflection: NightReflectionType = {
      id: `reflection_${Date.now()}`,
      date: new Date(),
      whatMovedMeForward: whatMovedForward,
      whatDistractedMe: whatDistracted,
      shouldImprove: shouldImprove,
      energyLevel: energyLevel,
      completedAt: new Date(),
    };

    onSave?.(reflection);
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setStep(0);
    setWhatMovedForward('');
    setWhatDistracted('');
    setShouldImprove('');
    setEnergyLevel(5);
  };

  const questions = [
    {
      title: 'What moved you forward today?',
      description: 'What accomplishment or moment are you proud of?',
      value: whatMovedForward,
      onChange: setWhatMovedForward,
    },
    {
      title: 'What distracted you?',
      description: 'Be honest. What pulled you away from priorities?',
      value: whatDistracted,
      onChange: setWhatDistracted,
    },
    {
      title: 'What should improve tomorrow?',
      description: 'One thing to focus on for better execution.',
      value: shouldImprove,
      onChange: setShouldImprove,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={!reflectionStatus.canAdd}
        >
          {reflectionStatus.isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              Reflection Locked
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              Night Reflection
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>End of Day Reflection</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step < questions.length ? (
            /* Question Step */
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{questions[step].title}</h3>
                <p className="text-sm text-muted-foreground">{questions[step].description}</p>
              </div>

              <Textarea
                placeholder="Your thoughts..."
                value={questions[step].value}
                onChange={(e) => questions[step].onChange(e.target.value)}
                className="min-h-24"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  variant="outline"
                  disabled={step === 0}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Next
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Step {step + 1} of {questions.length + 1}
              </div>
            </div>
          ) : (
            /* Energy Level Step */
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Energy Level Today</h3>
                <p className="text-sm text-muted-foreground">How would you rate your energy?</p>
              </div>

              <Card className="p-6 bg-secondary/30 border-border/50">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-accent">{energyLevel}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {energyLevel <= 3
                      ? 'Low - Rest is needed'
                      : energyLevel <= 6
                      ? 'Moderate - Sustainable'
                      : 'High - Great day!'}
                  </p>
                </div>

                <Slider
                  value={[energyLevel]}
                  onValueChange={(v) => setEnergyLevel(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Reflection
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Step {step + 1} of {questions.length + 1}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
