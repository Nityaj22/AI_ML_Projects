import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.count}>{streak}</Text>
      <Text style={styles.label}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flame: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  count: {
    color: COLORS.orange,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  label: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
  },
});
