import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayStats, ExerciseId } from '../types';

function dateKey(date: Date) {
  return `stats_${date.toISOString().split('T')[0]}`;
}

export async function getTodayStats(): Promise<DayStats> {
  const key = dateKey(new Date());
  const raw = await AsyncStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  return {
    date: key,
    totalReps: 0,
    exerciseCounts: {} as Record<ExerciseId, number>,
    unlocksEarned: 0,
    minutesEarned: 0,
  };
}

export async function getWeekStats(): Promise<DayStats[]> {
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
  return stats;
}

export async function getStreak(): Promise<number> {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const data: DayStats = JSON.parse(raw);
      if (data.totalReps > 0) {
        streak++;
      } else {
        break;
      }
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export async function getPersonalBest(): Promise<{ date: string; reps: number }> {
  let best = { date: '', reps: 0 };
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const data: DayStats = JSON.parse(raw);
      if (data.totalReps > best.reps) {
        best = { date: data.date, reps: data.totalReps };
      }
    }
  }
  return best;
}
