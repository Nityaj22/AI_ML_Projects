import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnlockSession, ExerciseId } from '../types';

export function useUnlockTimer(appId: string) {
  const [session, setSession] = useState<UnlockSession | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(`session_${appId}`);
      if (!raw) return;
      const s: UnlockSession = JSON.parse(raw);
      if (Date.now() < s.expiresAt) {
        setSession(s);
        setIsUnlocked(true);
      } else {
        await AsyncStorage.removeItem(`session_${appId}`);
      }
    } catch {}
  }, [appId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!session) return;
    intervalRef.current = setInterval(() => {
      const rem = Math.max(0, session.expiresAt - Date.now());
      setRemaining(rem);
      if (rem === 0) {
        setIsUnlocked(false);
        setSession(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
        AsyncStorage.removeItem(`session_${appId}`);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, appId]);

  const startUnlock = useCallback(
    async (minutes: number, exerciseId: ExerciseId) => {
      const now = Date.now();
      const s: UnlockSession = {
        appId,
        unlockedAt: now,
        expiresAt: now + minutes * 60 * 1000,
        exerciseId,
      };
      await AsyncStorage.setItem(`session_${appId}`, JSON.stringify(s));
      setSession(s);
      setIsUnlocked(true);
    },
    [appId]
  );

  return { isUnlocked, remaining, startUnlock, loadSession };
}
