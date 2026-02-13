import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface RepCounterProps {
  count: number;
  target: number;
  isTimeBased: boolean;
  elapsed: number;
  targetSeconds: number;
}

export default function RepCounter({ count, target, isTimeBased, elapsed, targetSeconds }: RepCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, scaleAnim]);

  if (isTimeBased) {
    const progress = Math.min(elapsed / targetSeconds, 1);
    const remaining = Math.max(0, Math.ceil(targetSeconds - elapsed));
    const circumference = 2 * Math.PI * 50;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.container}>
        <View style={styles.circleContainer}>
          <View style={[styles.circleBackground]} />
          <View
            style={[
              styles.progressRing,
              {
                borderColor: COLORS.acid,
                borderWidth: 4,
                borderRadius: 54,
                width: 108,
                height: 108,
                opacity: progress,
              },
            ]}
          />
          <Text style={styles.timeText}>{remaining}s</Text>
        </View>
        <Text style={styles.label}>HOLD</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={styles.countText}>
          <Text style={styles.currentCount}>{count}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.targetCount}>{target}</Text>
        </Text>
      </Animated.View>
      <Text style={styles.label}>REPS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    flexDirection: 'row',
  },
  currentCount: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.hero,
    fontWeight: 'bold',
  },
  separator: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xxl,
  },
  targetCount: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xxl,
  },
  label: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.sm,
    marginTop: SPACING.xs,
    letterSpacing: 4,
  },
  circleContainer: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: COLORS.muted,
  },
  progressRing: {
    position: 'absolute',
  },
  timeText: {
    color: COLORS.acid,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xxl,
    fontWeight: 'bold',
  },
});
