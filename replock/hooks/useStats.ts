import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayStats, ExerciseId } from '../types';

function todayKey() {
  return `stats_${new Date().toISOString().split('T')[0]}`;
}

function dateKey(date: Date) {
  return `stats_${date.toISOString().split('T')[0]}`;
}

export function useStats() {
  const [todayStats, setTodayStats] = useState<DayStats | null>(null);
  const [streak, setStreak] = useState(0);
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);

  const loadToday = useCallback(async () => {
    const key = todayKey();
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      setTodayStats(JSON.parse(raw));
    } else {
      setTodayStats({
        date: key,
        totalReps: 0,
        exerciseCounts: {} as Record<ExerciseId, number>,
        unlocksEarned: 0,
        minutesEarned: 0,
      });
    }
  }, []);

  const loadWeek = useCallback(async () => {
    const stats: DayStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        stats.push(JSON.parse(raw));
      } else {
        stats.push({
          date: key,
          totalReps: 0,
          exerciseCounts: {} as Record<ExerciseId, number>,
          unlocksEarned: 0,
          minutesEarned: 0,
        });
      }
    }
    setWeekStats(stats);

    // Calculate streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const dayData: DayStats = JSON.parse(raw);
        if (dayData.totalReps > 0) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        if (i === 0) continue; // Today hasn't had data yet
        break;
      }
    }
    setStreak(currentStreak);
  }, []);

  const recordReps = useCallback(
    async (exerciseId: ExerciseId, reps: number, minutesEarned: number) => {
      const key = todayKey();
      const raw = await AsyncStorage.getItem(key);
      const stats: DayStats = raw
        ? JSON.parse(raw)
        : {
            date: key,
            totalReps: 0,
            exerciseCounts: {} as Record<ExerciseId, number>,
            unlocksEarned: 0,
            minutesEarned: 0,
          };

      stats.totalReps += reps;
      stats.exerciseCounts[exerciseId] = (stats.exerciseCounts[exerciseId] || 0) + reps;
      stats.unlocksEarned += 1;
      stats.minutesEarned += minutesEarned;

      await AsyncStorage.setItem(key, JSON.stringify(stats));
      setTodayStats(stats);
    },
    []
  );

  return { todayStats, streak, weekStats, loadToday, loadWeek, recordReps };
}
