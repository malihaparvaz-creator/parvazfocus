/* Parvaz Focus - Settings Page
   Manage subjects, view reflections, and reset app
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, RotateCcw, Calendar, MessageSquare, BookOpen, Palette, X } from 'lucide-react';
import { WeeklySummary } from '@/components/WeeklySummary';
import { SubjectTaskTracker } from '@/components/SubjectTaskTracker';
import { resetCoreStats, resetWeeklyTracking } from '@/lib/time-aggregation';

export default function Settings() {
  const { state, updateState } = useAppContext();
  const [newSubject, setNewSubject] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');
  const [newStudyApp, setNewStudyApp] = useState('');
  const [newCreativeApp, setNewCreativeApp] = useState('');
  const [newEntertainmentApp, setNewEntertainmentApp] = useState('');

  const COMMON_STUDY_APPS = ['Notion', 'Google Drive', 'Microsoft Word', 'Obsidian', 'OneNote', 'Evernote', 'Anki', 'Quizlet', 'Khan Academy', 'Coursera', 'Udemy', 'YouTube', 'Wikipedia', 'ChatGPT', 'Grammarly', 'Duolingo', 'Wolfram Alpha', 'Stack Overflow', 'GitHub', 'VS Code', 'Sublime Text', 'PyCharm', 'Google Docs', 'Sheets', 'Slides'];
  const COMMON_CREATIVE_APPS = ['Photoshop', 'Premiere', 'Figma', 'Blender', 'VS Code', 'Notion', 'Canva', 'DaVinci Resolve', 'Final Cut Pro', 'Logic Pro', 'Ableton Live', 'OBS Studio', 'Audacity', 'Procreate', 'Adobe XD', 'Sketch'];
  const COMMON_ENTERTAINMENT_APPS = ['YouTube', 'Netflix', 'Instagram', 'TikTok', 'Twitter', 'Reddit', 'Discord', 'Twitch', 'Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Spotify', 'Snapchat', 'WhatsApp', 'Telegram', 'Pinterest', 'Tumblr', 'Quora', 'Medium'];

  const handleAddStudyApp = () => {
    if (newStudyApp.trim()) {
      const newState = { ...state };
      if (!newState.studyAppsSetup) newState.studyAppsSetup = [];
      if (!newState.studyAppsSetup.includes(newStudyApp.trim())) {
        newState.studyAppsSetup.push(newStudyApp.trim());
        updateState(newState);
        setNewStudyApp('');
      }
    }
  };

  const handleRemoveStudyApp = (app: string) => {
    const newState = { ...state };
    if (newState.studyAppsSetup) {
      newState.studyAppsSetup = newState.studyAppsSetup.filter(a => a !== app);
      updateState(newState);
    }
  };

  const handleAddCreativeApp = () => {
    if (newCreativeApp.trim()) {
      const newState = { ...state };
      if (!newState.creativeAppsSetup) newState.creativeAppsSetup = [];
      if (!newState.creativeAppsSetup.includes(newCreativeApp.trim())) {
        newState.creativeAppsSetup.push(newCreativeApp.trim());
        updateState(newState);
        setNewCreativeApp('');
      }
    }
  };

  const handleRemoveCreativeApp = (app: string) => {
    const newState = { ...state };
    if (newState.creativeAppsSetup) {
      newState.creativeAppsSetup = newState.creativeAppsSetup.filter(a => a !== app);
      updateState(newState);
    }
  };

  const handleAddEntertainmentApp = () => {
    if (newEntertainmentApp.trim()) {
      const newState = { ...state };
      if (!newState.entertainmentAppsSetup) newState.entertainmentAppsSetup = [];
      if (!newState.entertainmentAppsSetup.includes(newEntertainmentApp.trim())) {
        newState.entertainmentAppsSetup.push(newEntertainmentApp.trim());
        updateState(newState);
        setNewEntertainmentApp('');
      }
    }
  };

  const handleRemoveEntertainmentApp = (app: string) => {
    const newState = { ...state };
    if (newState.entertainmentAppsSetup) {
      newState.entertainmentAppsSetup = newState.entertainmentAppsSetup.filter(a => a !== app);
      updateState(newState);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      const newState = { ...state };
      if (!newState.user.subjectSettings.subjects.includes(newSubject.trim())) {
        newState.user.subjectSettings.subjects.push(newSubject.trim());
        newState.user.subjectSettings.lastUpdated = new Date();
        updateState(newState);
        setNewSubject('');
      }
    }
  };

  const handleRemoveSubject = (subject: string) => {
    const newState = { ...state };
    newState.user.subjectSettings.subjects = newState.user.subjectSettings.subjects.filter(s => s !== subject);
    newState.user.subjectSettings.lastUpdated = new Date();
    updateState(newState);
  };

  const handleResetApp = () => {
    const newState = { ...state };
    
    // Reset user stats
    newState.user.stats = {
      ...newState.user.stats,
      totalXP: 0,
      currentLevel: {
        level: 1,
        currentXP: 0,
        totalXP: 0,
        nextLevelXP: 100,
        levelName: 'Focused',
      },
      streak: 0,
      totalFocusHours: 0,
      totalTasksCompleted: 0,
      averageFocusRating: 0,
      focusRank: 'DISTRACTED',
      trustScore: {
        percentage: 50,
        consistency: 0,
        promisesKept: 0,
        distractionsFaced: 0,
        lastUpdated: new Date(),
      },
      totalXPSpent: 0,
      bankedDiscipline: {
        totalBanked: 0,
        history: [],
      },
      skipTokens: [],
      creativeFreedomPasses: [],
      subjectTracker: {
        subjects: [],
        lastUpdated: new Date(),
        allTimeStats: {
          totalSubjectsStudied: 0,
          averagePerformance: 0,
        },
      },
      distractionTracker: {
        events: [],
        dailyCount: 0,
        weeklyCount: 0,
        totalCount: 0,
        focusStreak: 0,
        lastReset: new Date(),
      },
    };

    // Reset daily mission
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    newState.today.mission = {
      id: `mission_${today.toISOString()}`,
      date: today,
      tasks: [],
      progressPercentage: 0,
      completed: false,
    };
    newState.today.reflection = undefined;
    newState.today.bonusDayActive = false;

    // Reset other data
    newState.sessions = [];
    newState.projectsLocked = true;
    newState.emergencyModeActive = false;
    newState.user.projects = [];
    newState.user.timeTracking = {
      studyTime: 0,
      entertainmentTime: {},
      creativeTime: 0,
      lastUpdated: today,
      dailyStudyLog: [],
      weeklyStudyLog: [],
    };
    newState.user.creativeDump = [];
    const now = new Date();
    newState.user.parvazProjects = [
      { id: 'pf1', name: 'PARVAZ_FLOW', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'hd1', name: 'HIDAYA', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'lm1', name: 'LUMA', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'lg1', name: 'LEGACY', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'in1', name: 'INSTINCT', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'tl1', name: 'TALES', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: 'ds1', name: 'DESIGNS', ideas: [], pendingTasks: [], contentPipeline: [], experiments: [], platforms: [], creativeApps: [], totalCreativeTimeSpent: 0, locked: false, status: 'ACTIVE', createdAt: now, updatedAt: now },
    ];

    updateState(newState);
    setShowResetDialog(false);
  };

  // Targeted reset handlers
  const handleResetFocusHours = () => {
    const ns = { ...state };
    ns.user.stats.totalFocusHours = 0;
    ns.user.timeTracking = {
      ...ns.user.timeTracking,
      studyTime: 0,
      creativeTime: 0,
      entertainmentTime: {},
      lastUpdated: new Date(),
    };
    updateState(ns);
  };

  const handleResetWeekly = () => {
    updateState(prev => resetWeeklyTracking(prev));
  };

  const handleResetXP = () => {
    const ns = { ...state };
    ns.user.stats.totalXP = 0;
    ns.user.stats.totalXPSpent = 0;
    ns.user.stats.currentLevel = {
      level: 1,
      currentXP: 0,
      totalXP: 0,
      nextLevelXP: 100,
      levelName: 'Focused',
    };
    updateState(ns);
  };

  const handleResetStatsOnly = () => {
    updateState(prev => {
      const reset = resetCoreStats(prev);
      return {
        ...reset,
        user: {
          ...reset.user,
          stats: {
            ...reset.user.stats,
            totalTasksCompleted: 0,
            averageFocusRating: 0,
          },
        },
      };
    });
  };

  const handleResetReflections = () => {
    updateState(prev => ({
      ...prev,
      today: { ...prev.today, reflection: undefined, reflectionLocked: false },
      user: {
        ...prev.user,
        reflectionHistory: {
          reflections: [],
          totalReflections: 0,
        },
      },
    }));
  };

  const handleResetCreativeDump = () => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        creativeDump: [],
      },
    }));
  };

  const handleResetStreak = () => {
    const ns = { ...state };
    ns.user.stats.streak = 0;
    updateState(ns);
  };
  const subjects = state.user.subjectSettings.subjects;
  const reflections = state.user.reflectionHistory.reflections;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your subjects, view reflections, and reset your progress</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="insights">Reflections & Dump</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>

          {/* Subject Task Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <SubjectTaskTracker />
            <Card className="p-4 border-orange-200 bg-orange-50/40">
              <p className="text-sm font-semibold mb-2">Reset Progress Stats</p>
              <p className="text-xs text-muted-foreground mb-3">
                Resets streak, focus hours, XP and base progress stats only.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={handleResetStatsOnly}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Progress
              </Button>
            </Card>
          </TabsContent>

          {/* Weekly Summary Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <Card className="p-4 border-orange-200 bg-orange-50/40">
              <p className="text-sm font-semibold mb-2">Reset Weekly Data Only</p>
              <p className="text-xs text-muted-foreground mb-3">
                Clears daily and weekly logs only. Today's totals remain.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={handleResetWeekly}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Weekly Data
              </Button>
            </Card>
            <WeeklySummary state={state} />
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <Card className="p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Manage Your Subjects</h2>
              </div>

              {/* Add Subject */}
              <div className="space-y-4 mb-8">
                <p className="text-sm text-muted-foreground">Add subjects you're studying to track performance and focus areas.</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Mathematics, Biology, History..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddSubject}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Subjects ({subjects.length})
                </p>
                {subjects.length === 0 ? (
                  <div className="text-center py-8 bg-secondary/30 rounded-lg">
                    <p className="text-muted-foreground">No subjects added yet. Add one to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject}
                        className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-lg hover:border-accent/50 transition-all"
                      >
                        <span className="font-medium">{subject}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubject(subject)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Reflections & Creative Dump Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Creative Dump Section */}
            <Card className="p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Creative Dump</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">All your quick ideas and fleeting thoughts captured during creative sessions.</p>

              {state.user.creativeDump.length === 0 ? (
                <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground">No ideas captured yet. Start dumping your thoughts!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {state.user.creativeDump.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-card border border-border/50 rounded-lg space-y-2 hover:border-accent/50 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{item.content}</p>
                          <button
                            onClick={() => {
                              const newState = { ...state };
                              newState.user.creativeDump = newState.user.creativeDump.filter(i => i.id !== item.id);
                              updateState(newState);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                <p>Total ideas captured: <span className="font-semibold text-foreground">{state.user.creativeDump.length}</span></p>
              </div>
            </Card>

            {/* Reflections Section */}
            <Card className="p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Daily Reflections</h2>
              </div>

              {reflections.length === 0 ? (
                <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground">No reflections yet. Complete your first day and add a reflection!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {reflections.map((reflection, index) => (
                      <div
                        key={reflection.id}
                        className="p-4 bg-card border border-border/50 rounded-lg space-y-3 hover:border-accent/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">
                            {new Date(reflection.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <Badge className="bg-accent/20 text-accent">
                            Energy: {reflection.energyLevel}/10
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground font-medium mb-1">What moved you forward?</p>
                            <p className="text-foreground">{reflection.whatMovedMeForward}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-1">What distracted you?</p>
                            <p className="text-foreground">{reflection.whatDistractedMe}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-1">What should improve tomorrow?</p>
                            <p className="text-foreground">{reflection.shouldImprove}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                <p>Total reflections: <span className="font-semibold text-foreground">{reflections.length}</span></p>
              </div>
            </Card>
          </TabsContent>

          {/* Reset Tab */}
          <TabsContent value="reset" className="space-y-6">

            {/* Targeted resets */}
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-bold mb-1">Reset Specific Data</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Reset only what you need — everything else stays untouched.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">Focus Hours & Time Tracking</p>
                  <p className="text-xs text-muted-foreground">Resets totalFocusHours, study time, creative time, entertainment time.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetFocusHours}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Focus Hours
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">Weekly & Daily Logs</p>
                  <p className="text-xs text-muted-foreground">Clears all daily and weekly study log history.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetWeekly}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Weekly Log
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">XP & Level</p>
                  <p className="text-xs text-muted-foreground">Resets XP to 0 and level back to 1.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetXP}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset XP & Level
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">Streak</p>
                  <p className="text-xs text-muted-foreground">Resets your daily streak back to 0.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetStreak}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Streak
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">Reflections</p>
                  <p className="text-xs text-muted-foreground">Clears all reflection history and unlocks reflection for today.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetReflections}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Reflections
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 space-y-2">
                  <p className="font-semibold text-sm">Creative Dump</p>
                  <p className="text-xs text-muted-foreground">Clears all creative dump entries only.</p>
                  <Button size="sm" variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full mt-1"
                    onClick={handleResetCreativeDump}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Dump
                  </Button>
                </div>
              </div>
            </Card>

            {/* Full reset */}
            <Card className="p-6 shadow-md border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-3 mb-4">
                <RotateCcw className="w-5 h-5 text-destructive" />
                <h2 className="text-xl font-bold text-destructive">Reset Everything</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Wipes all XP, levels, streak, focus hours, tasks, projects, and time tracking. Subjects and reflections are preserved.
              </p>
              <Button
                onClick={() => setShowResetDialog(true)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Everything
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your progress, XP, levels, and statistics will be permanently deleted. Your subjects and reflections will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetApp}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Reset Everything
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
