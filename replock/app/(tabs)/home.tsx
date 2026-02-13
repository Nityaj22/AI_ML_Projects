import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../context/AppContext';
import { useStats } from '../../hooks/useStats';
import { UnlockSession } from '../../types';
import AppCard from '../../components/AppCard';
import TimerBar from '../../components/TimerBar';
import StreakBadge from '../../components/StreakBadge';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAppContext();
  const { todayStats, streak, loadToday, loadWeek } = useStats();
  const [sessions, setSessions] = useState<Record<string, UnlockSession>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    const newSessions: Record<string, UnlockSession> = {};
    for (const app of state.lockedApps) {
      const raw = await AsyncStorage.getItem(`session_${app.id}`);
      if (raw) {
        const s: UnlockSession = JSON.parse(raw);
        if (Date.now() < s.expiresAt) {
          newSessions[app.id] = s;
        } else {
          await AsyncStorage.removeItem(`session_${app.id}`);
        }
      }
    }
    setSessions(newSessions);
  }, [state.lockedApps]);

  useEffect(() => {
    loadToday();
    loadWeek();
    loadSessions();
  }, [loadToday, loadWeek, loadSessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, number> = {};
      for (const [appId, session] of Object.entries(sessions)) {
        const rem = Math.max(0, session.expiresAt - Date.now());
        if (rem > 0) {
          times[appId] = rem;
        } else {
          AsyncStorage.removeItem(`session_${appId}`);
        }
      }
      setRemainingTimes(times);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadToday();
    await loadWeek();
    await loadSessions();
    setRefreshing(false);
  }, [loadToday, loadWeek, loadSessions]);

  const lockedApps = state.lockedApps.filter((a) => a.isLocked);
  const activeSessions = Object.entries(sessions).filter(([_, s]) => Date.now() < s.expiresAt);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.acid} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>REPLOCK</Text>
        <View style={styles.repSummary}>
          <Text style={styles.repCount}>{todayStats?.totalReps ?? 0}</Text>
          <Text style={styles.repLabel}>reps today</Text>
        </View>
      </View>

      {/* Locked Apps */}
      {lockedApps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locked Apps</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appScroll}>
            {lockedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isUnlocked={!!sessions[app.id]}
                remainingMs={remainingTimes[app.id] || 0}
                onEarnPress={() => router.push(`/(tabs)/exercise?appId=${app.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {lockedApps.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No apps locked yet.</Text>
          <Text style={styles.emptySubtext}>Go to Settings to select apps to lock.</Text>
        </View>
      )}

      {/* Active Unlocks */}
      {activeSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Unlocks</Text>
          {activeSessions.map(([appId, session]) => {
            const app = state.lockedApps.find((a) => a.id === appId);
            if (!app) return null;
            const totalMs = session.expiresAt - session.unlockedAt;
            return (
              <TimerBar
                key={appId}
                appName={app.name}
                appEmoji={app.emoji}
                remainingMs={remainingTimes[appId] || 0}
                totalMs={totalMs}
              />
            );
          })}
        </View>
      )}

      {/* Bottom Summary */}
      <View style={styles.bottomSummary}>
        <StreakBadge streak={streak} />
        <View style={styles.todayStat}>
          <Text style={styles.todayLabel}>Unlocks earned</Text>
          <Text style={styles.todayValue}>{todayStats?.unlocksEarned ?? 0}</Text>
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
  header: {
    marginBottom: SPACING.lg,
  },
  wordmark: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xl,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: SPACING.sm,
  },
  repSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  repCount: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.hero,
    fontWeight: 'bold',
  },
  repLabel: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
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
  appScroll: {
    paddingRight: SPACING.lg,
  },
  emptyState: {
    backgroundColor: COLORS.mid,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
  },
  bottomSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  todayStat: {
    alignItems: 'flex-end',
  },
  todayLabel: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
  },
  todayValue: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xl,
    fontWeight: 'bold',
  },
});
