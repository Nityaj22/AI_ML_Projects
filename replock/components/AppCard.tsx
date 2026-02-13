import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LockedApp } from '../types';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface AppCardProps {
  app: LockedApp;
  isUnlocked: boolean;
  remainingMs: number;
  onEarnPress: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function AppCard({ app, isUnlocked, remainingMs, onEarnPress }: AppCardProps) {
  return (
    <View style={[styles.card, isUnlocked && styles.cardUnlocked]}>
      <Text style={styles.emoji}>{app.emoji}</Text>
      <Text style={styles.name}>{app.name}</Text>
      {isUnlocked ? (
        <View style={styles.unlockInfo}>
          <Text style={styles.unlockIcon}>🔓</Text>
          <Text style={styles.timer}>{formatTime(remainingMs)}</Text>
        </View>
      ) : (
        <View style={styles.lockInfo}>
          <Text style={styles.lockIcon}>🔒</Text>
          <TouchableOpacity style={styles.earnButton} onPress={onEarnPress}>
            <Text style={styles.earnButtonText}>Earn Access</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.mid,
    borderRadius: 8,
    padding: SPACING.md,
    width: 140,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardUnlocked: {
    borderColor: COLORS.success,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  name: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  unlockInfo: {
    alignItems: 'center',
  },
  unlockIcon: {
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  timer: {
    color: COLORS.success,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
  },
  lockInfo: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  earnButton: {
    backgroundColor: COLORS.acid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  earnButtonText: {
    color: COLORS.black,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
    fontWeight: 'bold',
  },
});
