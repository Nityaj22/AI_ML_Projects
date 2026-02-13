import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Exercise } from '../types';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
}

export default function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.emoji}>{exercise.emoji}</Text>
      <Text style={styles.name}>{exercise.name}</Text>
      <View style={styles.details}>
        <Text style={styles.reps}>
          {exercise.isTimeBased ? `${exercise.holdSeconds}s hold` : `${exercise.repsRequired} reps`}
        </Text>
        <Text style={styles.unlock}>{exercise.unlockMinutes} min</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {exercise.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.mid,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    margin: SPACING.xs,
    minWidth: '45%',
  },
  emoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  name: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  reps: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    fontWeight: 'bold',
  },
  unlock: {
    color: COLORS.orange,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
  },
  description: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
  },
});
