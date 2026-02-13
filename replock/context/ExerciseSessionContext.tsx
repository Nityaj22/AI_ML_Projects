import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExerciseId } from '../types';

interface ExerciseSessionState {
  selectedExerciseId: ExerciseId | null;
  targetAppId: string | null;
  isSessionActive: boolean;
}

interface ExerciseSessionContextValue {
  session: ExerciseSessionState;
  startSession: (exerciseId: ExerciseId, appId: string) => void;
  endSession: () => void;
}

const ExerciseSessionContext = createContext<ExerciseSessionContextValue | undefined>(undefined);

export function ExerciseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ExerciseSessionState>({
    selectedExerciseId: null,
    targetAppId: null,
    isSessionActive: false,
  });

  const startSession = (exerciseId: ExerciseId, appId: string) => {
    setSession({
      selectedExerciseId: exerciseId,
      targetAppId: appId,
      isSessionActive: true,
    });
  };

  const endSession = () => {
    setSession({
      selectedExerciseId: null,
      targetAppId: null,
      isSessionActive: false,
    });
  };

  return (
    <ExerciseSessionContext.Provider value={{ session, startSession, endSession }}>
      {children}
    </ExerciseSessionContext.Provider>
  );
}

export function useExerciseSession() {
  const ctx = useContext(ExerciseSessionContext);
  if (!ctx) throw new Error('useExerciseSession must be used within ExerciseSessionProvider');
  return ctx;
}
