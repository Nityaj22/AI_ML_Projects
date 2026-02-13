import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { EXERCISES } from '../../constants/exercises';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export default function SettingsScreen() {
  const { state, toggleAppLock, saveDailyGoal, saveNotifications } = useAppContext();
  const [localGoal, setLocalGoal] = useState(state.dailyGoal);

  const adjustGoal = (delta: number) => {
    const newGoal = Math.max(10, Math.min(200, localGoal + delta));
    setLocalGoal(newGoal);
  };

  const handleSave = () => {
    saveDailyGoal(localGoal);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Apps to Lock */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apps to Lock</Text>
        {state.lockedApps.map((app) => (
          <View key={app.id} style={styles.settingRow}>
            <View style={styles.appInfo}>
              <Text style={styles.appEmoji}>{app.emoji}</Text>
              <Text style={styles.appName}>{app.name}</Text>
            </View>
            <Switch
              value={app.isLocked}
              onValueChange={() => toggleAppLock(app.id)}
              trackColor={{ false: COLORS.muted, true: COLORS.acid }}
              thumbColor={COLORS.white}
            />
          </View>
        ))}
      </View>

      {/* Daily Rep Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Rep Goal</Text>
        <View style={styles.goalRow}>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => adjustGoal(-10)}
          >
            <Text style={styles.goalButtonText}>-10</Text>
          </TouchableOpacity>
          <Text style={styles.goalValue}>{localGoal}</Text>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => adjustGoal(10)}
          >
            <Text style={styles.goalButtonText}>+10</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Unlock Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unlock Rules</Text>
        {Object.values(EXERCISES).map((ex) => (
          <View key={ex.id} style={styles.ruleRow}>
            <Text style={styles.ruleExercise}>
              {ex.emoji} {ex.name}
            </Text>
            <Text style={styles.ruleDetail}>
              {ex.isTimeBased ? `${ex.holdSeconds}s hold` : `${ex.repsRequired} reps`}
              {' → '}
              {ex.unlockMinutes} min
            </Text>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Daily reminder</Text>
          <Switch
            value={state.notificationsEnabled}
            onValueChange={saveNotifications}
            trackColor={{ false: COLORS.muted, true: COLORS.acid }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.versionText}>REPLOCK v1.0.0 (MVP)</Text>
        <Text style={styles.noteText}>
          App locking is soft-lock only in this version.
        </Text>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.mid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  appName: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  settingLabel: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  goalButton: {
    backgroundColor: COLORS.mid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalButtonText: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    fontWeight: 'bold',
  },
  goalValue: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.hero,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ruleExercise: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
  },
  ruleDetail: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
  },
  saveButton: {
    backgroundColor: COLORS.acid,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  saveButtonText: {
    color: COLORS.black,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    fontWeight: 'bold',
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.xs,
  },
  noteText: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xs,
    textAlign: 'center',
  },
});
