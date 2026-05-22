/*
  Parvaz Focus - Live Tracker (Simplified)
  Shows Study / Creative / Entertainment with a single play/pause per category
  No individual app names shown
*/

import { useTracking } from '@/contexts/TrackingContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Clock, Play, Square, BookOpen, Palette, Tv } from 'lucide-react';
import { TrackingCategory } from '@/lib/realtime-tracker';

export function LiveTracker() {
  const { state } = useAppContext();
  const { categoryTotals, isTracking, activeApp, activeCategories, startApp, stopApp, formatTime } = useTracking();

  const studyApps = state.studyAppsSetup ?? [];
  const creativeApps = state.creativeAppsSetup ?? [];
  const entertainmentApps = state.entertainmentAppsSetup ?? [];

  const categories: { key: TrackingCategory; label: string; icon: typeof BookOpen; apps: string[]; sentinel: string; token: 'accent' | 'secondary' | 'destructive' }[] = [
    { key: 'STUDY', label: 'Study', icon: BookOpen, apps: studyApps, sentinel: '__STUDY__', token: 'accent' },
    { key: 'CREATIVE', label: 'Creative', icon: Palette, apps: creativeApps, sentinel: '__CREATIVE__', token: 'secondary' },
    { key: 'ENTERTAINMENT', label: 'Entertainment', icon: Tv, apps: entertainmentApps, sentinel: '__ENTERTAINMENT__', token: 'destructive' },
  ];

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Live Time Tracker</h3>
        </div>
        {isTracking && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block" />
            <span className="text-xs text-muted-foreground">Tracking active</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map(({ key, label, icon: Icon, apps, sentinel, token }) => {
          const isCategoryActive = isTracking && (activeCategories || []).includes(key);
          // Use first real app if available, otherwise use sentinel for direct category tracking
          const trackTarget = apps.length > 0 ? apps[0] : sentinel;

          const handleToggle = () => {
            if (isCategoryActive) {
              stopApp();
            } else {
              startApp(trackTarget);
            }
          };

          return (
            <div
              key={key}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isCategoryActive ? `bg-${token}/10 border-${token}/20` : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCategoryActive ? `bg-${token}/10` : ''}`}>
                  <Icon className={`w-4 h-4 ${isCategoryActive ? `text-${token}` : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(categoryTotals[key])} today</p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${isCategoryActive ? `bg-${token} text-${token}-foreground` : `bg-${token}/20 text-${token}`}`}>
                {isCategoryActive
                  ? <><Square className="w-3 h-3" /> Stop</>
                  : <><Play className="w-3 h-3" /> Start</>
                }
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
