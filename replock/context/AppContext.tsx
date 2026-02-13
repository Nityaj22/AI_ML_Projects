import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LockedApp, UnlockSession, DayStats, ExerciseId } from '../types';
import { LOCKABLE_APPS } from '../constants/apps';

interface AppState {
  lockedApps: LockedApp[];
  activeSessions: UnlockSession[];
  dailyGoal: number;
  notificationsEnabled: boolean;
}

type AppAction =
  | { type: 'SET_LOCKED_APPS'; apps: LockedApp[] }
  | { type: 'TOGGLE_APP_LOCK'; appId: string }
  | { type: 'SET_SESSIONS'; sessions: UnlockSession[] }
  | { type: 'ADD_SESSION'; session: UnlockSession }
  | { type: 'REMOVE_SESSION'; appId: string }
  | { type: 'SET_DAILY_GOAL'; goal: number }
  | { type: 'SET_NOTIFICATIONS'; enabled: boolean };

const initialState: AppState = {
  lockedApps: LOCKABLE_APPS,
  activeSessions: [],
  dailyGoal: 50,
  notificationsEnabled: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOCKED_APPS':
      return { ...state, lockedApps: action.apps };
    case 'TOGGLE_APP_LOCK':
      return {
        ...state,
        lockedApps: state.lockedApps.map((app) =>
          app.id === action.appId ? { ...app, isLocked: !app.isLocked } : app
        ),
      };
    case 'SET_SESSIONS':
      return { ...state, activeSessions: action.sessions };
    case 'ADD_SESSION':
      return {
        ...state,
        activeSessions: [...state.activeSessions.filter((s) => s.appId !== action.session.appId), action.session],
      };
    case 'REMOVE_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.filter((s) => s.appId !== action.appId),
      };
    case 'SET_DAILY_GOAL':
      return { ...state, dailyGoal: action.goal };
    case 'SET_NOTIFICATIONS':
      return { ...state, notificationsEnabled: action.enabled };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toggleAppLock: (appId: string) => void;
  saveDailyGoal: (goal: number) => void;
  saveNotifications: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadPersistedState();
  }, []);

  async function loadPersistedState() {
    try {
      const lockedIds = await AsyncStorage.getItem('locked_apps');
      if (lockedIds) {
        const ids: string[] = JSON.parse(lockedIds);
        const apps = LOCKABLE_APPS.map((app) => ({
          ...app,
          isLocked: ids.includes(app.id),
        }));
        dispatch({ type: 'SET_LOCKED_APPS', apps });
      }

      const goal = await AsyncStorage.getItem('daily_goal');
      if (goal) dispatch({ type: 'SET_DAILY_GOAL', goal: parseInt(goal, 10) });

      const notif = await AsyncStorage.getItem('notifications_enabled');
      if (notif !== null) dispatch({ type: 'SET_NOTIFICATIONS', enabled: notif === 'true' });

      // Load active sessions
      const sessions: UnlockSession[] = [];
      for (const app of LOCKABLE_APPS) {
        const raw = await AsyncStorage.getItem(`session_${app.id}`);
        if (raw) {
          const s: UnlockSession = JSON.parse(raw);
          if (Date.now() < s.expiresAt) {
            sessions.push(s);
          } else {
            await AsyncStorage.removeItem(`session_${app.id}`);
          }
        }
      }
      dispatch({ type: 'SET_SESSIONS', sessions });
    } catch {}
  }

  const toggleAppLock = async (appId: string) => {
    dispatch({ type: 'TOGGLE_APP_LOCK', appId });
    const updatedApps = state.lockedApps.map((app) =>
      app.id === appId ? { ...app, isLocked: !app.isLocked } : app
    );
    const lockedIds = updatedApps.filter((a) => a.isLocked).map((a) => a.id);
    await AsyncStorage.setItem('locked_apps', JSON.stringify(lockedIds));
  };

  const saveDailyGoal = async (goal: number) => {
    dispatch({ type: 'SET_DAILY_GOAL', goal });
    await AsyncStorage.setItem('daily_goal', goal.toString());
  };

  const saveNotifications = async (enabled: boolean) => {
    dispatch({ type: 'SET_NOTIFICATIONS', enabled });
    await AsyncStorage.setItem('notifications_enabled', enabled.toString());
  };

  return (
    <AppContext.Provider value={{ state, dispatch, toggleAppLock, saveDailyGoal, saveNotifications }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
