import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState, Task } from '@/lib/types';
import { loadAppState, saveAppState, saveAppStateWithSync, migrateAppState } from '@/lib/storage';
import { subscribeToFirestoreState } from '@/lib/firebase';
import { updateSubjectPerformance } from '@/lib/subject-tracker';
import { updateStreak, updateLevel } from '@/lib/time-aggregation';
import { updateTrustScore, updateFocusRank } from '@/lib/xp-system';

interface AppContextType {
  state: AppState;
  addNewTask: (task: Task) => void;
  completeTaskById: (taskId: string) => void;
  addXPToUser: (amount: number) => void;
  updateState: (newState: AppState | ((prevState: AppState) => AppState)) => void;
  toggleEmergencyMode: () => void;
  unlockProjects: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const remoteBootstrappedRef = useRef(false);
  const skipNextCloudSyncRef = useRef(false);
  const lastRemoteUpdatedAtRef = useRef(0);
  const latestStateRef = useRef<AppState>(state);

  // Keep a ref copy of the latest state for unload/visibility save handlers
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  // On mount: subscribe to Firestore (cross-device real-time sync)
  useEffect(() => {
    const bootstrapFallback = setTimeout(() => {
      remoteBootstrappedRef.current = true;
    }, 3000);

    const unsubscribe = subscribeToFirestoreState((remote, remoteUpdatedAtMs) => {
      clearTimeout(bootstrapFallback);
      remoteBootstrappedRef.current = true;

      if (!remote || !remoteUpdatedAtMs) return;
      if (remoteUpdatedAtMs <= lastRemoteUpdatedAtRef.current) return;

      lastRemoteUpdatedAtRef.current = remoteUpdatedAtMs;
      skipNextCloudSyncRef.current = true;
      // Ensure remote state is migrated (merge new store items etc.) before applying
      const migrated = migrateAppState(remote);
      latestStateRef.current = migrated;
      setState(migrated);
      saveAppState(migrated); // keep local cache aligned with cloud state
    });

    return () => {
      clearTimeout(bootstrapFallback);
      unsubscribe();
    };
  }, []);

  // Persist every state change: local instantly + cloud after 2s debounce.
  // Skip first cloud push until remote bootstrap finishes to avoid overwriting cloud data.
  useEffect(() => {
    if (!remoteBootstrappedRef.current) {
      saveAppState(state);
      return;
    }

    if (skipNextCloudSyncRef.current) {
      skipNextCloudSyncRef.current = false;
      saveAppState(state);
      return;
    }

    saveAppStateWithSync(state);
  }, [state]);

  useEffect(() => {
    const handleSave = () => {
      saveAppState(latestStateRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveAppState(latestStateRef.current);
      }
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setAndPersistState = useCallback((nextStateOrUpdater: AppState | ((prevState: AppState) => AppState)) => {
    setState((prevState) => {
      const nextState = typeof nextStateOrUpdater === 'function'
        ? (nextStateOrUpdater as (prevState: AppState) => AppState)(prevState)
        : nextStateOrUpdater;

      latestStateRef.current = nextState;
      saveAppState(nextState);
      return nextState;
    });
  }, []);

  const addNewTask = useCallback((task: Task) => {
    setAndPersistState(prevState => {
      const newState = { ...prevState };
      newState.today.mission.tasks.push(task);
      return newState;
    });
  }, [setAndPersistState]);

  const completeTaskById = useCallback((taskId: string) => {
    setAndPersistState(prevState => {
      let newState = { ...prevState };
      const task = newState.today.mission.tasks.find(t => t.id === taskId);
      if (task) {
        const xpReward = task.priority === 'MUST_DO' ? 20 : task.priority === 'SHOULD_DO' ? 15 : 10;
        newState.today.mission.tasks = newState.today.mission.tasks.filter(t => t.id !== taskId);
        newState.user.stats.totalTasksCompleted = (newState.user.stats.totalTasksCompleted || 0) + 1;

        // Parse multiple subjects (comma-separated)
        const subjectInput = task.subject?.trim() || '';
        const subjectList = subjectInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        // If no subjects provided, treat as single 'Other'
        const subjectsToProcess = subjectList.length > 0 ? subjectList : ['Other'];

        // Total XP is awarded per subject occurrence
        const totalXP = xpReward * subjectsToProcess.length;
        if (totalXP > 0) {
          newState.user.stats.totalXP += totalXP;
          newState.user.stats.currentLevel.currentXP += totalXP;
        }

        // Normalize defined subjects for comparison
        const definedSubjects = newState.user.subjectSettings.subjects;

        // Update subject performance for each subject occurrence
        subjectsToProcess.forEach(subjRaw => {
          const matchedSubject = definedSubjects.find(ds => ds.toLowerCase() === subjRaw.toLowerCase());
          const bucket = matchedSubject || 'Other';
          newState = updateSubjectPerformance(newState, { ...task, subject: bucket, completed: true }, xpReward, task.estimatedTime || 25);
        });

        newState = updateLevel(newState);
        newState = updateTrustScore(newState);
        newState = updateFocusRank(newState);
      }
      return newState;
    });
  }, [setAndPersistState]);

  const addXPToUser = useCallback((amount: number) => {
    setAndPersistState(prevState => {
      let newState = { ...prevState };
      newState.user.stats.totalXP += amount;
      newState.user.stats.currentLevel.currentXP += amount;
      
      // Update streak when XP is earned
      newState = updateStreak(newState);
      
      // Update level based on new currentXP
      newState = updateLevel(newState);
      
      // Update trust score and focus rank based on new stats
      newState = updateTrustScore(newState);
      newState = updateFocusRank(newState);
      
      return newState;
    });
  }, [setAndPersistState]);

  const updateState = useCallback((newState: AppState | ((prevState: AppState) => AppState)) => {
    setAndPersistState(newState);
  }, [setAndPersistState]);

  const toggleEmergencyMode = useCallback(() => {
    setAndPersistState(prevState => ({
      ...prevState,
      emergencyModeActive: !prevState.emergencyModeActive,
    }));
  }, [setAndPersistState]);

  const unlockProjects = useCallback(() => {
    setAndPersistState(prevState => ({
      ...prevState,
      projectsLocked: false,
    }));
  }, [setAndPersistState]);

  return (
    <AppContext.Provider
      value={{
        state,
        addNewTask,
        completeTaskById,
        addXPToUser,
        updateState,
        toggleEmergencyMode,
        unlockProjects,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
