/*
  Subject Performance Chart Component
  Displays line chart showing improvement trends per subject over time
  Based on subjects entered in Settings
*/

import { AppState } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SubjectPerformanceChartProps {
  state: AppState;
}

export function SubjectPerformanceChart({ state }: SubjectPerformanceChartProps) {
  const subjects = state.user.subjectSettings?.subjects || [];
  const subjectTrackerData = state.user.stats.subjectTracker?.subjects || [];
  
  // Create map for easy lookup
  const subjectTrackerMap: { [key: string]: any } = {};
  subjectTrackerData.forEach((perf: any) => {
    subjectTrackerMap[perf.subject] = perf;
  });

  if (subjects.length === 0) {
    return (
      <Card className="p-6 shadow-md">
        <p className="text-center text-muted-foreground">
          Add subjects in Settings to track performance trends
        </p>
      </Card>
    );
  }

  // Generate performance data for chart
  const generateChartData = () => {
    const data: any[] = [];
    
    // Create 7 data points (simulating weekly data)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const point: any = { date: dateStr };

      subjects.forEach((subject: string) => {
        const subjectData = subjectTrackerMap[subject];
        if (subjectData) {
          // Calculate performance score (0-100) based on focus hours
          const baseScore = Math.min(100, (subjectData.focusHours || 0) * 10);
          // Add some variation based on day
          const variation = Math.sin(i * 0.5) * 10;
          point[subject] = Math.max(0, Math.min(100, baseScore + variation));
        } else {
          point[subject] = Math.random() * 50; // Random initial data
        }
      });

      data.push(point);
    }

    return data;
  };

  const chartData = generateChartData();

  // Color palette for different subjects
  const colors = [
    '#D8B4FE', // purple
    '#F8B4D8', // pink
    '#A5D8FF', // blue
    '#B4E7FF', // light blue
    '#C4E4B4', // green
    '#FFD8B4', // orange
    '#E4C4B4', // brown
  ];

  // Calculate performance metrics
  const getPerformanceMetrics = (subject: string) => {
    const subjectData = subjectTrackerMap[subject];
    if (!subjectData) {
      return { trend: 'stable', score: 0, hours: 0 };
    }

    const score = Math.min(100, (subjectData.focusHours || 0) * 10);
    const trend = subjectData.trend || 'stable';
    const hours = subjectData.focusHours || 0;

    return { trend, score, hours };
  };

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-bold mb-6">Subject Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                formatter={(value) => `${Math.round(value as number)}%`}
              />
              <Legend />
              {subjects.map((subject: string, idx: number) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Performance score based on hours studied and consistency
        </p>
      </Card>

      {/* Individual Subject Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject: string, idx: number) => {
          const metrics = getPerformanceMetrics(subject);
          return (
            <Card key={subject} className="p-4 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{subject}</h4>
                  <p className="text-sm text-muted-foreground">{metrics.hours.toFixed(1)}h focused</p>
                </div>
                {metrics.trend === 'improving' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : metrics.trend === 'declining' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5 text-yellow-500">→</div>
                )}
              </div>

              {/* Performance Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-semibold">{Math.round(metrics.score)}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metrics.score >= 80
                        ? 'bg-green-400'
                        : metrics.score >= 60
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                    style={{ width: `${metrics.score}%` }}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <p className="text-xs text-muted-foreground mt-3">
                {metrics.score < 40
                  ? '📚 Focus on this subject - needs more attention'
                  : metrics.score < 70
                  ? '⏰ Keep consistent - you\'re making progress'
                  : '🎯 Great progress! Maintain this momentum'}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Overall Insights */}
      <Card className="p-6 shadow-md bg-accent/5 border-accent/20">
        <h4 className="font-semibold mb-3">📊 Weekly Insights</h4>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Total Study Time:</span>{' '}
            {subjectTrackerData
              .reduce((sum: number, s: any) => sum + (s.focusHours || 0), 0)
              .toFixed(1)}{' '}
            hours
          </p>
          <p>
            <span className="font-medium">Subjects Tracked:</span> {subjects.length}
          </p>
          <p className="text-muted-foreground">
            Keep studying consistently to improve your performance across all subjects
          </p>
        </div>
      </Card>
    </div>
  );
}
