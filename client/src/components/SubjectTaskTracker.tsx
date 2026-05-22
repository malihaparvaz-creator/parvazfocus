/*
  Parvaz Focus - Subject Task Tracker
  Bar chart showing tasks completed per subject
  Subjects come from Settings > Subjects section
  Auto-updates as tasks are completed
*/

import { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen } from 'lucide-react';

const COLORS = [
  '#a78bfa', '#d8b4fe', '#c4b5fd', '#818cf8',
  '#93c5fd', '#6ee7b7', '#fca5a5', '#fde68a',
  '#f9a8d4', '#a5b4fc', '#86efac', '#fdba74',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { subject: string; tasks: number; sessions: number } }[];
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border/50 rounded-xl px-4 py-3 shadow-xl">
      <p className="font-bold text-foreground text-sm mb-1">{d.subject}</p>
      <p className="text-xs text-muted-foreground">{d.tasks} tasks completed</p>
    </div>
  );
}

export function SubjectTaskTracker() {
  const { state } = useAppContext();
  const subjects = state.user.subjectSettings.subjects;
  const tasks = state.today.mission.tasks;

  const chartData = useMemo(() => {
    const buckets = subjects.filter(Boolean).map((subject, index) => ({
      subject,
      tasks: 0,
      total: 0,
      color: COLORS[index % COLORS.length],
    }));

    const otherBucket = {
      subject: 'Other',
      tasks: 0,
      total: 0,
      color: COLORS[buckets.length % COLORS.length],
    };

    tasks.forEach(task => {
      const taskSubject = (task as any).subject?.trim() || '';
      const matchedSubject = subjects.find(subject => subject.toLowerCase() === taskSubject.toLowerCase());
      const bucket = matchedSubject
        ? buckets.find(b => b.subject === matchedSubject)
        : otherBucket;

      if (bucket) {
        bucket.total += 1;
        if (task.completed) {
          bucket.tasks += 1;
        }
      }
    });

    return buckets.concat(otherBucket.total > 0 ? [otherBucket] : []);
  }, [subjects, tasks]);

  if (subjects.length === 0 && chartData.length === 0) {
    return (
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold">Subject Task Progress</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Add subjects in the <strong>Subjects</strong> tab to see your task progress per subject here.
        </p>
      </Card>
    );
  }

  const maxTasks = Math.max(...chartData.map(d => d.tasks), 1);

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">Subject Task Progress</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Tasks completed per subject — updates automatically as you complete tasks.
      </p>

      {/* Bar Chart */}
      <div className="w-full" style={{ height: Math.max(220, subjects.length * 44) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mergedData}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
            barCategoryGap="30%"
          >
            <XAxis
              type="number"
              domain={[0, maxTasks + 1]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="subject"
              type="category"
              width={100}
              tick={{ fontSize: 12, fill: 'var(--foreground)', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167,139,250,0.06)' }} />
            <Bar dataKey="tasks" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={entry.subject} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {chartData.map((d, i) => (
          <div key={d.subject} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground truncate">{d.subject}</span>
            <span className="text-xs font-bold text-foreground ml-auto">{d.tasks}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
