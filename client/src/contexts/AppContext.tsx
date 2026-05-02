import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState, Task } from '@/lib/types';
import { loadAppState, saveAppState, saveAppStateWithSync } from '@/lib/storage';
import { subscribeToFirestoreState } from '@/lib/firebase';
import { updateSubjectPerformance } from '@/lib/subject-tracker';

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
      setState(remote);
      saveAppState(remote); // keep local cache aligned with cloud state
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

    saveAppState(state);
  }, [state]);

  const addNewTask = useCallback((task: Task) => {
    setState(prevState => {
      const newState = { ...prevState };
      newState.today.mission.tasks.push(task);
      return newState;
    });
  }, []);

  const completeTaskById = useCallback((taskId: string) => {
    setState(prevState => {
      let newState = { ...prevState };
      const task = newState.today.mission.tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        task.completed = true;
        task.completedAt = new Date();
        
        // Award XP based on priority
        let xpReward = 0;
        if (task.priority === 'MUST_DO') {
          xpReward = 20;
        } else if (task.priority === 'SHOULD_DO') {
          xpReward = 15;
        } else if (task.priority === 'BONUS') {
          xpReward = 10;
        }
        
        if (xpReward > 0) {
          newState.user.stats.totalXP += xpReward;
          newState.user.stats.currentLevel.currentXP += xpReward;
        }
        
        // Track subject performance if subject is specified
        if (task.subject) {
          const focusDuration = task.estimatedTime || 25;
          newState = updateSubjectPerformance(newState, task, xpReward, focusDuration);
        }
      }
      return newState;
    });
  }, []);

  const addXPToUser = useCallback((amount: number) => {
    setState(prevState => {
      const newState = { ...prevState };
      newState.user.stats.totalXP += amount;
      newState.user.stats.currentLevel.currentXP += amount;
      return newState;
    });
  }, []);

  const updateState = useCallback((newState: AppState | ((prevState: AppState) => AppState)) => {
    setState(prevState =>
      typeof newState === 'function'
        ? (newState as (prevState: AppState) => AppState)(prevState)
        : newState
    );
  }, []);

  const toggleEmergencyMode = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      emergencyModeActive: !prevState.emergencyModeActive,
    }));
  }, []);

  const unlockProjects = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      projectsLocked: false,
    }));
  }, []);

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
