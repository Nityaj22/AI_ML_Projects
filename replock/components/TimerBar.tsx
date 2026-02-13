import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface TimerBarProps {
  appName: string;
  appEmoji: string;
  remainingMs: number;
  totalMs: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function TimerBar({ appName, appEmoji, remainingMs, totalMs }: TimerBarProps) {
  const progress = totalMs > 0 ? remainingMs / totalMs : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appInfo}>
          {appEmoji} {appName}
        </Text>
        <Text style={styles.time}>{formatTime(remainingMs)}</Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(0, Math.min(100, progress * 100))}%`,
              backgroundColor: progress > 0.2 ? COLORS.acid : COLORS.error,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.mid,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appInfo: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  time: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
  },
  barBackground: {
    height: 4,
    backgroundColor: COLORS.muted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
