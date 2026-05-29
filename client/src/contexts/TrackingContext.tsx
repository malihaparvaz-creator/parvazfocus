/*
  Parvaz Focus - Real-Time Tracking Context
  Provides live app tracking to all components
*/

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { showNotificationNow } from '@/lib/notifications';
import { toast } from 'sonner';
import {
  RealTimeTrackingState,
  TrackingCategory,
  CategoryTotals,
  AppTimeData,
  loadTrackingState,
  saveTrackingState,
  startTracking,
  stopTracking,
  getCategoryTotals,
  getAppTodaySeconds,
  getTodayActiveApps,
  formatDuration,
  TICK_MS,
} from '@/lib/realtime-tracker';
import { useAppContext } from '@/contexts/AppContext';
import { addTrackedDuration } from '@/lib/time-aggregation';

interface TrackingContextType {
  trackingState: RealTimeTrackingState;
  categoryTotals: CategoryTotals;
  activeApps: AppTimeData[];
  isTracking: boolean;
  activeApp: string | null;
  activeCategories: TrackingCategory[];
  startApp: (appName: string) => void;
  stopApp: () => void;
  getAppSeconds: (appName: string) => number;
  formatTime: (seconds: number) => string;
  // Refresh tick counter for re-rendering live
  tick: number;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { state, updateState: updateAppState } = useAppContext();
  const [trackingState, setTrackingState] = useState<RealTimeTrackingState>(() => loadTrackingState());
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestTrackingStateRef = useRef<RealTimeTrackingState>(trackingState);

  // Keep a ref copy of the latest tracking state for unload/visibility save handlers
  useEffect(() => {
    latestTrackingStateRef.current = trackingState;
  }, [trackingState]);

  // Get user-configured app lists
  const studyApps = state.studyAppsSetup ?? [];
  const creativeApps = state.creativeAppsSetup ?? [];
  const entertainmentApps = state.entertainmentAppsSetup ?? [];

  // Tick every second to update live display
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTick(t => t + 1);
    }, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Persist tracking state on changes
  useEffect(() => {
    saveTrackingState(trackingState);
  }, [trackingState]);

  // Auto-save active session every 30s in case of crash
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (trackingState.activeApp) {
        saveTrackingState(trackingState);
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [trackingState]);

  useEffect(() => {
    const handleSave = () => saveTrackingState(latestTrackingStateRef.current);

    const handleVisibilityChange = () => {
      // When app is hidden (device closed/suspended), auto-pause active live tracker
      if (document.visibilityState === 'hidden') {
        const latest = latestTrackingStateRef.current;
        if (latest.activeApp) {
          // store paused info so we can notify on resume
          try {
            sessionStorage.setItem('parvaz_livetracker_autopaused', JSON.stringify({
              app: latest.activeApp,
              categories: latest.activeCategories || [],
              timestamp: Date.now(),
            }));
          } catch {}

          // call stopApp if available (use ref to avoid stale closure)
          if (stopAppRef.current) stopAppRef.current();
        }

        // Always persist state when hidden
        saveTrackingState(latestTrackingStateRef.current);
      }

      // When app becomes visible again, notify user if we auto-paused
      if (document.visibilityState === 'visible') {
        try {
          const raw = sessionStorage.getItem('parvaz_livetracker_autopaused');
          if (raw) {
            const info = JSON.parse(raw);
            sessionStorage.removeItem('parvaz_livetracker_autopaused');
            const title = 'Live Tracker Paused While Away';
            const body = info && info.app
              ? `Your live tracker (${info.app}) was paused while your device was closed. Open the app to resume.`
              : 'Your live tracker was paused while your device was closed. Open the app to resume.';
            try { showNotificationNow(title, body, 'livetracker-resume'); } catch { try { toast(`${title} — ${body}`); } catch {} }
          }
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Keep a ref to stopApp so visibility handler can call it without stale closures
  const stopAppRef = useRef<() => void | null>(null);

  // Computed values (re-computed each tick for live display)
  const categoryTotals = getCategoryTotals(trackingState);
  const activeApps = getTodayActiveApps(trackingState);

  const startApp = useCallback((appName: string) => {
    setTrackingState(prev => {
      const next = startTracking(prev, appName, studyApps, creativeApps, entertainmentApps);
      latestTrackingStateRef.current = next;
      saveTrackingState(next);
      return next;
    });
  }, [studyApps, creativeApps, entertainmentApps]);

  const stopApp = useCallback(() => {
    setTrackingState(prev => {
      if (!prev.activeApp || !prev.activeSessionStart) return prev;
      const elapsed = Math.floor((Date.now() - prev.activeSessionStart) / 1000);
      const next = stopTracking(prev);
      latestTrackingStateRef.current = next;
      saveTrackingState(next);

      // Wire elapsed time into AppContext with category-specific rules
      if (elapsed > 30) {
        setTimeout(() => {
          updateAppState((appState) => {
            const categories = prev.activeCategories || [];
            let nextState = appState;
            if (categories.includes('STUDY')) {
              nextState = addTrackedDuration(nextState, elapsed, 'STUDY', 'livetracker');
            }
            if (categories.includes('CREATIVE')) {
              nextState = addTrackedDuration(nextState, elapsed, 'CREATIVE', 'livetracker');
            }
            if (categories.includes('ENTERTAINMENT')) {
              nextState = addTrackedDuration(nextState, elapsed, 'ENTERTAINMENT', 'livetracker');
            }
            return nextState;
          });
        }, 0);
      }
      return next;
    });
  }, [updateAppState]);

  useEffect(() => { stopAppRef.current = stopApp; }, [stopApp]);

  const getAppSeconds = useCallback((appName: string) => {
    return getAppTodaySeconds(trackingState, appName);
  }, [trackingState, tick]); // tick dep ensures live update

  return (
    <TrackingContext.Provider value={{
      trackingState,
      categoryTotals,
      activeApps,
      isTracking: trackingState.activeApp !== null,
      activeApp: trackingState.activeApp,
      activeCategories: trackingState.activeCategories,
      startApp,
      stopApp,
      getAppSeconds,
      formatTime: formatDuration,
      tick,
    }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking(): TrackingContextType {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within TrackingProvider');
  return ctx;
}
