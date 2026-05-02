/* Parvaz Focus - Study Mode Page
   Purpose: Core study system with priorities, XP, timer, and focus rating
   Design: Disciplined, minimal, focused
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { FocusTimer } from '@/components/FocusTimer';
import { NightReflectionDialog } from '@/components/NightReflection';
import { EmergencyMode } from '@/components/EmergencyMode';
import { TrustScoreCard } from '@/components/TrustScoreCard';
import { XPStore } from '@/components/XPStore';
import { BankedDisciplineCard } from '@/components/BankedDiscipline';

import { DistractionTracker } from '@/components/DistractionTracker';
import { ExamCountdownDisplay } from '@/components/ExamCountdownDisplay';
import { EnhancedTaskCategories } from '@/components/EnhancedTaskCategories';
import { AdvancedPomodoroTimer } from '@/components/AdvancedPomodoroTimer';
import { SimpleTimer } from '@/components/SimpleTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, BarChart3, Calendar, Zap, AlertTriangle, Music } from 'lucide-react';
import { NeuroMusic } from '@/components/NeuroMusic';
import { getReflectionStatus, isReflectionFromToday } from '@/lib/reflection-lock';

export default function StudyMode() {
  const { state, completeTaskById, addXPToUser, toggleEmergencyMode, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState('tasks');

  const mustDoTasks = state.today.mission.tasks.filter(t => t.priority === 'MUST_DO');
  const shouldDoTasks = state.today.mission.tasks.filter(t => t.priority === 'SHOULD_DO');
  const bonusTasks = state.today.mission.tasks.filter(t => t.priority === 'BONUS');

  const totalTasksCompleted = state.today.mission.tasks.filter(t => t.completed).length;
  const totalTasks = state.today.mission.tasks.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Emergency Mode Overlay */}
      <EmergencyMode
        isActive={state.emergencyModeActive}
        onClose={toggleEmergencyMode}
        nextTask={state.today.mission.tasks[0]?.title}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Study Mode</h1>
            <Button
              onClick={toggleEmergencyMode}
              variant="outline"
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency Mode
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <p className="text-2xl font-bold">{state.user.stats.currentLevel.level}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total XP</p>
              <p className="text-2xl font-bold">{state.user.stats.totalXP}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Streak</p>
              <p className="text-2xl font-bold text-accent">{state.user.stats.streak}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Focus Hours</p>
              <p className="text-2xl font-bold">{state.user.stats.totalFocusHours}h</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Overall Scroller */}
      <ScrollArea className="h-[calc(100vh-200px)]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timer">Pomodoro</TabsTrigger>
            <TabsTrigger value="simple-timer">Timer</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="reflection">Reflection</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>

          {/* Exam Countdown Tab */}
          <TabsContent value="exams" className="space-y-6">
            <ExamCountdownDisplay />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <EnhancedTaskCategories />
          </TabsContent>

          {/* Pomodoro Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <AdvancedPomodoroTimer />
          </TabsContent>

          {/* Simple Timer Tab */}
          <TabsContent value="simple-timer" className="space-y-6">
            <SimpleTimer />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Trust Score and Focus Rank */}
            <TrustScoreCard />

            {/* Banked Discipline and Bonus Days */}
            <BankedDisciplineCard />

            {/* XP Store */}
            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Discipline Currency</h3>
                <XPStore />
              </div>
              <p className="text-sm text-muted-foreground">
                Spend XP on customizations, themes, soundtracks, and bonus project time. Every purchase reinforces your discipline.
              </p>
            </Card>

            <Card className="p-6 shadow-md border-accent/50 bg-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Session Stats</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Focus Hours</p>
                  <p className="text-2xl font-bold">{state.user.stats.totalFocusHours}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold">{state.user.stats.totalTasksCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Focus Rating</p>
                  <p className="text-2xl font-bold">{state.user.stats.averageFocusRating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total XP Spent</p>
                  <p className="text-2xl font-bold">{state.user.stats.totalXPSpent}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reflection Tab */}
          <TabsContent value="reflection" className="space-y-6">
            <Card className="p-8 shadow-md text-center">
              <h2 className="text-2xl font-bold mb-4">End of Day Reflection</h2>
              <p className="text-muted-foreground mb-6">
                Take 5 minutes to reflect on your day. This builds incredible self-awareness.
              </p>
              <NightReflectionDialog
                today={state.today}
                onSave={(reflection) => {
                  const newState = { ...state };
                  newState.today.reflection = reflection;
                  newState.today.reflectionLocked = true;
                  newState.user.reflectionHistory.reflections.push(reflection);
                  newState.user.reflectionHistory.totalReflections += 1;
                  newState.user.reflectionHistory.lastReflectionDate = new Date();
                  updateState(newState);
                }}
              />
            </Card>

            {state.today.reflection && (
              <Card className="p-6 shadow-md space-y-4">
                <h3 className="font-semibold">Today's Reflection</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">What moved you forward?</p>
                    <p>{state.today.reflection.whatMovedMeForward}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">What distracted you?</p>
                    <p>{state.today.reflection.whatDistractedMe}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">What should improve tomorrow?</p>
                    <p>{state.today.reflection.shouldImprove}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Energy Level</p>
                    <p className="font-semibold">{state.today.reflection.energyLevel}/10</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
          {/* Neuroscience Music Tab */}
          <TabsContent value="music" className="space-y-6">
            <NeuroMusic />
          </TabsContent>
        </Tabs>
      </main>
      </ScrollArea>
    </div>
  );
}

function TaskRow({ task, onComplete }: { task: any; onComplete: () => void }) {
  return (
    <div
      onClick={onComplete}
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
        task.completed
          ? 'bg-secondary/30 opacity-60'
          : 'bg-card border border-border/50 hover:border-accent/50'
      }`}
    >
      <div
        className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all ${
          task.completed
            ? 'bg-accent border-accent'
            : 'border-border hover:border-accent'
        }`}
      >
        {task.completed && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">{task.estimatedTime} min</p>
      </div>
    </div>
  );
}
