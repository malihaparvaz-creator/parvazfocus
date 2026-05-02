/*
   Shows combined study + project time tracking
   Displays entertainment app usage
*/

import { AppState } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Zap, AlertCircle, BookOpen } from 'lucide-react';
import { calculateSubjectBreakdown, formatSubjectTime } from '@/lib/subject-breakdown';

interface WeeklySummaryProps {
  state: AppState;
}

export function WeeklySummary({ state }: WeeklySummaryProps) {
  const timeTracking = state.user.timeTracking;
  const creativeApps = state.creativeAppsSetup || [];
  const studyApps = state.studyAppsSetup || [];

  // Format time display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate totals from TODAY's tracking (real-time data from Pomodoro sessions)
  const totalStudyTime = timeTracking.studyTime || 0;
  const totalCreativeTime = timeTracking.creativeTime || 0;
  const totalEntertainmentTime = Object.values(timeTracking.entertainmentTime || {}).reduce((a, b) => a + b, 0);
  const totalTime = totalStudyTime + totalCreativeTime + totalEntertainmentTime;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const currentWeek = (timeTracking.weeklyStudyLog || []).find(
    week => new Date(week.weekStart).setHours(0, 0, 0, 0) === weekStart.getTime()
  );

  // Prepare pie chart data
  const timeAllocationData = [
    { name: 'Study', value: totalStudyTime, color: '#d8b4fe' },
    { name: 'Creative', value: totalCreativeTime, color: '#a78bfa' },
    { name: 'Entertainment', value: totalEntertainmentTime, color: '#fca5a5' },
  ].filter(item => item.value > 0);

  // Prepare entertainment apps data
  const entertainmentData = Object.entries(timeTracking.entertainmentTime || {})
    .map(([app, time]) => ({
      name: app,
      time,
      displayTime: formatTime(time),
    }))
    .sort((a, b) => b.time - a.time);

  // Calculate percentages
  const studyPercent = totalTime > 0 ? ((totalStudyTime / totalTime) * 100).toFixed(1) : 0;
  const creativePercent = totalTime > 0 ? ((totalCreativeTime / totalTime) * 100).toFixed(1) : 0;
  const entertainmentPercent = totalTime > 0 ? ((totalEntertainmentTime / totalTime) * 100).toFixed(1) : 0;

  // Generate dynamic insights message based on TODAY's tracking
  const getInsightMessage = () => {
    if (totalTime === 0) {
      return { title: 'Get Started', message: 'Start a Pomodoro session to begin tracking your time today!', emoji: '🚀' };
    }
    
    const highest = Math.max(totalStudyTime, totalCreativeTime, totalEntertainmentTime);
    
    if (highest === totalStudyTime && Number(studyPercent) > 50) {
      return { title: 'Study Master', message: 'Your dedication to learning is impressive! Keep building those study habits.', emoji: '📚' };
    } else if (highest === totalCreativeTime && Number(creativePercent) > 50) {
      return { title: 'Creative Powerhouse', message: 'Your creative energy is flowing! Remember, consistency in study will amplify your creative output even more.', emoji: '✨' };
    } else if (highest === totalEntertainmentTime && Number(entertainmentPercent) > 50) {
      return { title: 'Time to Refocus', message: 'Entertainment is taking most of your time. Channel this energy into study or creative work for better results!', emoji: '⚡' };
    } else {
      return { title: 'Balanced Approach', message: 'Great balance between study, creative work, and rest. Keep maintaining this rhythm!', emoji: '⚖️' };
    }
  };
  
  const insight = getInsightMessage();

  return (
    <div className="space-y-6">
      {/* Today's Tracking Insights */}
      <Card className="p-6 shadow-md bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{insight.emoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{insight.title}</h3>
            <p className="text-foreground/80">{insight.message}</p>
            <p className="text-xs text-muted-foreground mt-2">Real-time tracking from today's Pomodoro sessions</p>
          </div>
        </div>
      </Card>

      {/* Weekly Totals */}
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-bold mb-2">This Week's Totals</h3>
        <p className="text-sm text-muted-foreground mb-6">From daily and weekly logs</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Study</p>
            <p className="text-2xl font-bold text-accent">{formatTime(currentWeek?.totalStudyTime || 0)}</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Creative</p>
            <p className="text-2xl font-bold text-accent">{formatTime(currentWeek?.totalCreativeTime || 0)}</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Entertainment</p>
            <p className="text-2xl font-bold text-destructive">{formatTime(currentWeek?.totalEntertainmentTime || 0)}</p>
          </div>
        </div>
      </Card>
      {/* Time Allocation Overview */}
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-bold mb-2">Today's Time Allocation</h3>
        <p className="text-sm text-muted-foreground mb-6">Tracked from active Pomodoro sessions</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Study Time */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Study Time</p>
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatTime(totalStudyTime)}</p>
            <p className="text-xs text-muted-foreground mt-1">{studyPercent}% of total time</p>
          </div>

          {/* Creative Time */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Creative Time</p>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatTime(totalCreativeTime)}</p>
            <p className="text-xs text-muted-foreground mt-1">{creativePercent}% of total time</p>
          </div>

          {/* Entertainment Time */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Entertainment</p>
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">{formatTime(totalEntertainmentTime)}</p>
            <p className="text-xs text-muted-foreground mt-1">{entertainmentPercent}% of total time</p>
          </div>
        </div>

        {/* Pie Chart */}
        {timeAllocationData.length > 0 && (
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatTime(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatTime(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Entertainment Apps Breakdown */}
      {entertainmentData.length > 0 && (
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-bold mb-6">Entertainment App Usage</h3>

          <div className="space-y-3">
            {entertainmentData.map((app, idx) => {
              const appPercent = totalEntertainmentTime > 0 ? ((app.time / totalEntertainmentTime) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{appPercent}% of entertainment time</p>
                  </div>
                  <p className="font-bold text-accent">{app.displayTime}</p>
                </div>
              );
            })}
          </div>

          {/* Bar Chart */}
          <div className="h-64 mt-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entertainmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  formatter={(value) => formatTime(value as number)}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="time" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Study Apps Tracked */}
      {studyApps.length > 0 && (
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4">Study Apps Being Tracked</h3>
          <ScrollArea className="h-auto max-h-32">
            <div className="flex flex-wrap gap-2 pr-4">
              {studyApps.map((app, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium whitespace-nowrap"
                >
                  {app}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Creative Apps Tracked */}
      {creativeApps.length > 0 && (
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4">Creative Apps Being Tracked</h3>
          <ScrollArea className="h-auto max-h-32">
            <div className="flex flex-wrap gap-2 pr-4">
              {creativeApps.map((app, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium whitespace-nowrap"
                >
                  {app}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Subject Time Breakdown */}
      {(() => {
        const subjectBreakdown = calculateSubjectBreakdown(state);
        if (subjectBreakdown.length === 0) return null;

        const subjectChartData = subjectBreakdown.map(item => ({
          name: item.subject,
          value: item.timeSpent,
          color: item.color,
        }));

        return (
          <Card className="p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="text-xl font-bold">Subject Time Breakdown</h3>
            </div>

            {/* Pie Chart */}
            <div className="h-64 flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatSubjectTime(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatSubjectTime(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Details */}
            <div className="space-y-3">
              {subjectBreakdown.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <p className="font-semibold text-sm">{subject.subject}</p>
                      <p className="text-xs text-muted-foreground">{subject.tasksCompleted} task{subject.tasksCompleted !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{formatSubjectTime(subject.timeSpent)}</p>
                    <p className="text-xs text-muted-foreground">{subject.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}
    </div>
  );
}
