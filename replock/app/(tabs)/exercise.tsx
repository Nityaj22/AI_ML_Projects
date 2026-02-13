import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '../../context/AppContext';
import { useExerciseSession } from '../../context/ExerciseSessionContext';
import ExerciseCard from '../../components/ExerciseCard';
import { EXERCISE_LIST } from '../../constants/exercises';
import { ExerciseId } from '../../types';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export default function ExerciseScreen() {
  const router = useRouter();
  const { appId } = useLocalSearchParams<{ appId: string }>();
  const { state } = useAppContext();
  const { startSession } = useExerciseSession();

  const targetApp = state.lockedApps.find((a) => a.id === appId);

  const handleExerciseSelect = (exerciseId: ExerciseId) => {
    if (appId) {
      startSession(exerciseId, appId);
      router.push(`/camera?exerciseId=${exerciseId}&appId=${appId}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Earn Access</Text>
        {targetApp && (
          <View style={styles.targetApp}>
            <Text style={styles.targetEmoji}>{targetApp.emoji}</Text>
            <Text style={styles.targetName}>{targetApp.name}</Text>
          </View>
        )}
      </View>

      {/* Exercise Grid */}
      <Text style={styles.sectionTitle}>Choose Exercise</Text>
      <View style={styles.grid}>
        {EXERCISE_LIST.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPress={() => handleExerciseSelect(exercise.id)}
          />
        ))}
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
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xl,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  targetApp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  targetEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  targetName: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
});
