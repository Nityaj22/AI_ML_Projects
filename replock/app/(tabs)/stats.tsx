import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayStats, ExerciseId } from '../../types';
import { EXERCISES } from '../../constants/exercises';
import { COLORS, FONT, SPACING } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import StreakBadge from '../../components/StreakBadge';

function dateKey(date: Date) {
  return `stats_${date.toISOString().split('T')[0]}`;
}

export default function StatsScreen() {
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [streak, setStreak] = useState(0);
  const [personalBest, setPersonalBest] = useState({ date: '', reps: 0 });

  useEffect(() => {
    loadAllStats();
  }, []);

  async function loadAllStats() {
    // Load week stats
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
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const data: DayStats = JSON.parse(raw);
        if (data.totalReps > 0) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        if (i === 0) continue;
        break;
      }
    }
    setStreak(currentStreak);

    // Personal best
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
    setPersonalBest(best);
  }

  const weekTotal = weekStats.reduce((sum, d) => sum + d.totalReps, 0);
  const weekMinutes = weekStats.reduce((sum, d) => sum + d.minutesEarned, 0);
  const screenTimeSaved = Math.round(weekMinutes * CONFIG.SCREEN_TIME_SAVED_FACTOR);

  // Aggregate exercise counts for the week
  const exerciseTotals: Record<string, number> = {};
  for (const day of weekStats) {
    for (const [exId, count] of Object.entries(day.exerciseCounts || {})) {
      exerciseTotals[exId] = (exerciseTotals[exId] || 0) + count;
    }
  }
  const maxExerciseCount = Math.max(1, ...Object.values(exerciseTotals));

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Stats</Text>

      {/* Week Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{weekTotal}</Text>
          <Text style={styles.statLabel}>Week Reps</Text>
        </View>
        <View style={styles.statBox}>
          <StreakBadge streak={streak} />
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.chart}>
          {weekStats.map((day, i) => {
            const maxDayReps = Math.max(1, ...weekStats.map((d) => d.totalReps));
            const height = day.totalReps > 0 ? (day.totalReps / maxDayReps) * 120 : 4;
            return (
              <View key={i} style={styles.chartBar}>
                <Text style={styles.chartValue}>{day.totalReps || ''}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: day.totalReps > 0 ? COLORS.acid : COLORS.muted,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{dayLabels[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Exercise Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reps by Exercise</Text>
        {Object.entries(exerciseTotals).map(([exId, count]) => {
          const exercise = EXERCISES[exId];
          if (!exercise) return null;
          const width = `${(count / maxExerciseCount) * 100}%`;
          return (
            <View key={exId} style={styles.exerciseRow}>
              <Text style={styles.exerciseLabel}>
                {exercise.emoji} {exercise.name}
              </Text>
              <View style={styles.exerciseBarBg}>
                <View style={[styles.exerciseBarFill, { width: width as any }]} />
              </View>
              <Text style={styles.exerciseCount}>{count}</Text>
            </View>
          );
        })}
        {Object.keys(exerciseTotals).length === 0 && (
          <Text style={styles.emptyText}>No exercises recorded yet</Text>
        )}
      </View>

      {/* Additional Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Screen time saved</Text>
          <Text style={styles.insightValue}>{screenTimeSaved} min</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Personal best</Text>
          <Text style={styles.insightValue}>
            {personalBest.reps > 0 ? `${personalBest.reps} reps` : '--'}
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Week unlocks</Text>
          <Text style={styles.insightValue}>
            {weekStats.reduce((sum, d) => sum + d.unlocksEarned, 0)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xl,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.hero,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    backgroundColor: COLORS.mid,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartValue: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
    marginBottom: SPACING.xs,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
    marginTop: SPACING.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseLabel: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    width: 120,
  },
  exerciseBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.mid,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  exerciseBarFill: {
    height: '100%',
    backgroundColor: COLORS.acid,
    borderRadius: 4,
  },
  exerciseCount: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  emptyText: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  insightLabel: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  insightValue: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
  },
});
