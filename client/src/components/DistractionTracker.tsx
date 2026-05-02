/* Parvaz Focus - Distraction Tracker Component
   Log app switches and display gentle roasting messages
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  logDistraction,
  acknowledgeDistraction,
  getRoastingMessage,
  getTodayDistractions,
  getDistractionStats,
  getDistractionSeverity,
  getSeverityMessage,
  getDistractionRecommendation,
  getFocusStreak,
} from '@/lib/distraction-tracker';
import { AlertCircle, Zap, TrendingDown, BarChart3, X } from 'lucide-react';

const COMMON_APPS = ['YouTube', 'Twitter', 'Instagram', 'Discord', 'Reddit', 'TikTok', 'Netflix', 'Gaming'];

export function DistractionTracker() {
  const { state, updateState } = useAppContext();
  const [selectedApp, setSelectedApp] = useState('');
  const [showRoast, setShowRoast] = useState(false);
  const [roastMessage, setRoastMessage] = useState('');

  const tracker = state.user.stats.distractionTracker;
  const todayDistractions = getTodayDistractions(state);
  const stats = getDistractionStats(state);
  const severity = getDistractionSeverity(stats.todayDistractions);
  const focusStreak = getFocusStreak(state);

  const handleLogDistraction = (app: string) => {
    const newState = logDistraction(state, app, 5, 'During study session');
    updateState(newState);

    // Show roasting message
    const roast = getRoastingMessage(app);
    setRoastMessage(roast);
    setShowRoast(true);
    setSelectedApp('');

    // Auto-hide after 5 seconds
    setTimeout(() => setShowRoast(false), 5000);
  };

  const handleAcknowledge = () => {
    if (tracker.lastDistraction) {
      const newState = acknowledgeDistraction(state, tracker.lastDistraction.id);
      updateState(newState);
      setShowRoast(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roasting Message Toast */}
      {showRoast && tracker.lastDistraction && (
        <Card className="p-4 bg-red-50/50 border-red-200/50 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-2">
                {tracker.lastDistraction.app} Detected! 🚨
              </p>
              <p className="text-sm text-red-800 mb-4">{roastMessage}</p>
              <Button
                onClick={handleAcknowledge}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                I Hear You. Back to Work.
              </Button>
            </div>
            <button
              onClick={() => setShowRoast(false)}
              className="text-red-600 hover:text-red-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-1">
            <AlertCircle className="w-4 h-4" />
            Log
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <TrendingDown className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Today</p>
              <p className="text-3xl font-bold">{stats.todayDistractions}</p>
              <p className="text-xs text-muted-foreground mt-1">distractions</p>
            </Card>
            <Card className="p-4 shadow-md">
              <p className="text-xs text-muted-foreground mb-1">This Week</p>
              <p className="text-3xl font-bold">{stats.weekDistractions}</p>
              <p className="text-xs text-muted-foreground mt-1">distractions</p>
            </Card>
            <Card className="p-4 shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Focus Streak</p>
              <p className="text-3xl font-bold">{focusStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">minutes</p>
            </Card>
            <Card className="p-4 shadow-md">
              <p className="text-xs text-muted-foreground mb-1">All-Time</p>
              <p className="text-3xl font-bold">{tracker.totalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">total</p>
            </Card>
          </div>

          {/* Severity Indicator */}
          <Card className="p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Today's Focus Level</h3>
              <Badge
                className={`${
                  severity === 'excellent'
                    ? 'bg-green-100 text-green-800'
                    : severity === 'good'
                    ? 'bg-blue-100 text-blue-800'
                    : severity === 'fair'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Badge>
            </div>
            <Progress
              value={
                severity === 'excellent'
                  ? 100
                  : severity === 'good'
                  ? 75
                  : severity === 'fair'
                  ? 50
                  : 25
              }
              className="h-3 mb-3"
            />
            <p className="text-sm text-muted-foreground">{getSeverityMessage(severity)}</p>
          </Card>

          {/* Top Distractions */}
          {stats.topApps.length > 0 && (
            <Card className="p-6 shadow-md">
              <h3 className="font-semibold mb-4">Your Top Distractions</h3>
              <div className="space-y-3">
                {stats.topApps.map((app, index) => (
                  <div key={app.app} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {index === 0 ? '🔴' : index === 1 ? '🟠' : '🟡'}
                        </span>
                        <p className="font-semibold">{app.app}</p>
                      </div>
                      <Badge variant="outline">{app.count} times</Badge>
                    </div>
                    <Progress value={(app.count / stats.topApps[0].count) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendation */}
          <Card className="p-4 bg-blue-50/50 border-blue-200/50 shadow-md">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> {getDistractionRecommendation(state)}
            </p>
          </Card>
        </TabsContent>

        {/* Log Tab */}
        <TabsContent value="log" className="space-y-4">
          <Card className="p-6 shadow-md">
            <h3 className="font-semibold mb-4">Log a Distraction</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Caught yourself distracted? Log it here. The roast will remind you to get back on track.
            </p>

            {/* Quick App Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {COMMON_APPS.map(app => (
                <Button
                  key={app}
                  onClick={() => handleLogDistraction(app)}
                  variant="outline"
                  className="gap-2"
                >
                  {app}
                </Button>
              ))}
            </div>

            {/* Custom App Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Or enter custom app name..."
                value={selectedApp}
                onChange={e => setSelectedApp(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && selectedApp) {
                    handleLogDistraction(selectedApp);
                  }
                }}
              />
              <Button
                onClick={() => selectedApp && handleLogDistraction(selectedApp)}
                disabled={!selectedApp}
              >
                Log
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {todayDistractions.length === 0 ? (
            <Card className="p-8 text-center bg-green-50/50 border-green-200/50 shadow-md">
              <Zap className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-semibold text-green-900">Perfect Focus Day!</p>
              <p className="text-sm text-green-800">No distractions logged. Keep it up! 🔥</p>
            </Card>
          ) : (
            <Card className="p-6 shadow-md">
              <h3 className="font-semibold mb-4">Today's Distractions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayDistractions.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{event.app}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                      {event.context && (
                        <p className="text-xs text-muted-foreground mt-1">{event.context}</p>
                      )}
                    </div>
                    <Badge
                      variant={event.acknowledged ? 'default' : 'outline'}
                      className="ml-2"
                    >
                      {event.acknowledged ? 'Acknowledged' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
