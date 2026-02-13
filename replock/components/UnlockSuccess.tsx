import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT, SPACING } from '../constants/theme';

interface UnlockSuccessProps {
  appName: string;
  minutes: number;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

function Particle({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const startX = Math.random() * width;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -200 - Math.random() * 200,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 200,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, translateY, translateX, opacity]);

  const colors = [COLORS.acid, COLORS.orange, COLORS.white, '#ff00ff', '#00ffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: height / 2,
        left: startX,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

export default function UnlockSuccess({ appName, minutes, onDismiss }: UnlockSuccessProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const particles = Array.from({ length: 20 }, (_, i) => (
    <Particle key={i} delay={i * 50} />
  ));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {particles}
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>UNLOCKED!</Text>
        <Text style={styles.subtitle}>
          {appName} — {minutes} minutes
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onDismiss}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.acid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkmark: {
    fontSize: 48,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.hero,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: COLORS.acid,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    fontWeight: 'bold',
  },
});
