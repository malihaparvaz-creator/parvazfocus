/*
  Parvaz Focus - Reminder System
  Water reminder every 45 mins
  Entertainment: 1hr & 2hr warnings
  Creative: 2hr & 4hr milestones
  Study: 3hr & 5hr celebrations
  All system notifications except smart reminders (biology, weakest subject, no creative today)
*/

import { useEffect, useRef, useState } from 'react';
import { useTracking } from '@/contexts/TrackingContext';
import { X, Droplets, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { showNotificationNow, requestNotificationPermission } from '@/lib/notifications';

interface Reminder {
  id: string;
  type: 'water' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  icon: 'water' | 'warning' | 'clock' | 'trophy';
}

// Category time thresholds
const CATEGORY_REMINDERS = [
  { category: 'ENTERTAINMENT' as const, threshold: 60*60, title: '1 Hour of Entertainment', message: "You've been on entertainment for an hour. Intentional rest or drift?", type: 'warning' as const, icon: 'warning' as const },
  { category: 'ENTERTAINMENT' as const, threshold: 2*60*60, title: '2 Hours Gone', message: "Two hours on entertainment. What's one thing you could do right now?", type: 'warning' as const, icon: 'warning' as const },
  { category: 'CREATIVE' as const, threshold: 2*60*60, title: '2 Hours of Creative Work', message: "Solid creative session! Take a 10-min break — your brain needs to consolidate.", type: 'info' as const, icon: 'clock' as const },
  { category: 'CREATIVE' as const, threshold: 4*60*60, title: '4 Hours Creating', message: "Incredible output today. Make sure you eat, hydrate, and rest.", type: 'achievement' as const, icon: 'trophy' as const },
  { category: 'STUDY' as const, threshold: 3*60*60, title: '3 Hours of Deep Study', message: "Elite focus! Take a proper break now — your hippocampus needs to consolidate.", type: 'achievement' as const, icon: 'trophy' as const },
  { category: 'STUDY' as const, threshold: 5*60*60, title: '5 Hours Studied Today', message: "You're in the top 1% of focus today. Rest well tonight.", type: 'achievement' as const, icon: 'trophy' as const },
];

const SHOWN_KEY = 'parvaz-reminders-shown';
const WATER_KEY = 'parvaz-water-last';
const WATER_INTERVAL = 45 * 60 * 1000; // 45 mins

function getShownToday(): Set<string> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = JSON.parse(localStorage.getItem(SHOWN_KEY) || '{}');
    return new Set(raw[today] || []);
  } catch { return new Set(); }
}

function markShown(id: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = JSON.parse(localStorage.getItem(SHOWN_KEY) || '{}');
    if (!raw[today]) raw[today] = [];
    if (!raw[today].includes(id)) raw[today].push(id);
    const keys = Object.keys(raw).sort().slice(-7);
    const trimmed: Record<string, string[]> = {};
    keys.forEach(k => { trimmed[k] = raw[k]; });
    localStorage.setItem(SHOWN_KEY, JSON.stringify(trimmed));
  } catch {}
}

const STYLE = {
  water: { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1', iconColor: '#38bdf8' },
  warning: { bg: '#fdf2f8', border: '#f0abfc', text: '#86198f', iconColor: '#c026d3' },
  info: { bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6', iconColor: '#7c3aed' },
  achievement: { bg: '#fdf4ff', border: '#e879f9', text: '#701a75', iconColor: '#a21caf' },
};

type StyleKey = keyof typeof STYLE;

export function TimeReminders() {
  const { state } = useAppContext();
  const { categoryTotals } = useTracking();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const shownRef = useRef<Set<string>>(getShownToday());
  const lastWaterRef = useRef<number>(
    parseInt(localStorage.getItem(WATER_KEY) || '0') || Date.now()
  );

  const dismiss = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const isSmart = (id: string): boolean => {
    return id.startsWith('smart_');
  };

  const addReminder = (r: Reminder) => {
    setReminders(prev => [...prev.filter(x => x.id !== r.id), r]);
    
    // Send system notifications for non-smart reminders
    if (!isSmart(r.id)) {
      showNotificationNow(r.title, r.message);
    }
  };

  // Check reminders every 30s
  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission().catch(() => {});

    const daysSince = (date: Date) => {
      const now = new Date();
      const then = new Date(date);
      const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const thenStart = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
      return Math.floor((nowStart - thenStart) / (1000 * 60 * 60 * 24));
    };

    const maybeAddSmartReminders = () => {
      const subjectData = state.user.stats.subjectTracker.subjects || [];
      const biology = subjectData.find(s => s.subject.toLowerCase() === 'biology');
      if (biology?.lastStudiedAt && daysSince(new Date(biology.lastStudiedAt)) >= 3) {
        const id = 'smart_biology_3d';
        if (!shownRef.current.has(id)) {
          shownRef.current.add(id);
          markShown(id);
          addReminder({
            id,
            type: 'warning',
            title: "You haven't studied Biology in 3 days",
            message: 'Do one focused Biology block today to protect retention.',
            icon: 'warning',
          });
        }
      }

      const weakest = state.user.stats.subjectTracker.allTimeStats.weakestSubject;
      const hasWeeklyHistory = (state.user.timeTracking.weeklyStudyLog || []).length > 0;
      if (weakest && hasWeeklyHistory) {
        const id = `smart_weakest_${weakest}`;
        if (!shownRef.current.has(id)) {
          shownRef.current.add(id);
          markShown(id);
          addReminder({
            id,
            type: 'info',
            title: `${weakest} was your weakest subject last week`,
            message: `Start today with ${weakest} to improve your weekly trend.`,
            icon: 'clock',
          });
        }
      }

      const creativeToday = state.user.timeTracking.creativeTime || 0;
      const hour = new Date().getHours();
      if (creativeToday === 0 && hour >= 12) {
        const id = 'smart_no_creative_today';
        if (!shownRef.current.has(id)) {
          shownRef.current.add(id);
          markShown(id);
          addReminder({
            id,
            type: 'info',
            title: "You haven't logged any Creative time today",
            message: 'A short 20-30 minute creative block keeps momentum alive.',
            icon: 'clock',
          });
        }
      }
    };

    const check = () => {
      // Water reminder — only when screen is active
      const now = Date.now();
      // If device was off/tab hidden for a very long time, reset the water clock
      // so we don't spam reminders immediately on return
      if (now - lastWaterRef.current > WATER_INTERVAL * 3) {
        lastWaterRef.current = now - WATER_INTERVAL + 60000; // 1 min until next
        localStorage.setItem(WATER_KEY, String(lastWaterRef.current));
      }
      if (now - lastWaterRef.current >= WATER_INTERVAL) {
        lastWaterRef.current = now;
        localStorage.setItem(WATER_KEY, String(now));
        addReminder({
          id: `water_${now}`,
          type: 'water',
          title: 'Time to Drink Water',
          message: "45 minutes have passed. Hydration keeps your brain sharp — drink a glass now!",
          icon: 'water',
        });
      }

      // Category reminders
      for (const template of CATEGORY_REMINDERS) {
        const seconds = categoryTotals[template.category];
        const rid = `${template.category}_${template.threshold}`;
        if (seconds >= template.threshold && !shownRef.current.has(rid)) {
          shownRef.current.add(rid);
          markShown(rid);
          addReminder({
            id: rid,
            type: template.type,
            title: template.title,
            message: template.message,
            icon: template.icon,
          });
        }
      }

      maybeAddSmartReminders();
    };

    // Only run water check when screen/tab is visible (device is on and active)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        check(); // run immediately when user comes back
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    check();
    // Check every 30s but only when tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, 30000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [categoryTotals, state]);

  if (reminders.length === 0) return null;

  const getIcon = (icon: Reminder['icon']) => {
    switch (icon) {
      case 'water': return <Droplets className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
    }
  };

  const getStyle = (r: Reminder): StyleKey => {
    if (r.type === 'water') return 'water';
    if (r.type === 'warning') return 'warning';
    if (r.type === 'info') return 'info';
    return 'achievement';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" style={{ maxWidth: 320 }}>
      {reminders.map(reminder => {
        const s = STYLE[getStyle(reminder)];
        return (
          <div
            key={reminder.id}
            className="rounded-2xl p-4 shadow-2xl border flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300"
            style={{ backgroundColor: s.bg, borderColor: s.border }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0" style={{ color: s.iconColor }}>
                {getIcon(reminder.icon)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: s.text }}>{reminder.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: s.text, opacity: 0.8 }}>{reminder.message}</p>
              </div>
              <button
                onClick={() => dismiss(reminder.id)}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: s.text }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => dismiss(reminder.id)}
              className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: s.border, color: s.text }}
            >
              Got it 💪
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useNotificationPermission() {
  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);
}
