import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRepCounter } from '../hooks/useRepCounter';
import { useStats } from '../hooks/useStats';
import { ExerciseId, Keypoint, UnlockSession } from '../types';
import { EXERCISES } from '../constants/exercises';
import { LOCKABLE_APPS } from '../constants/apps';
import RepCounter from '../components/RepCounter';
import FormFeedback from '../components/FormFeedback';
import PoseOverlay from '../components/PoseOverlay';
import UnlockSuccess from '../components/UnlockSuccess';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { CONFIG } from '../constants/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const { exerciseId, appId } = useLocalSearchParams<{ exerciseId: string; appId: string }>();
  const [permission, requestPermission] = useCameraPermissions();

  const exercise = EXERCISES[exerciseId || 'pushup'];
  const app = LOCKABLE_APPS.find((a) => a.id === appId);

  const {
    repCount,
    feedback,
    isComplete,
    holdElapsed,
    processFrame,
    reset,
  } = useRepCounter(
    (exerciseId || 'pushup') as ExerciseId,
    exercise?.repsRequired || 10
  );

  const { recordReps } = useStats();
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const cameraRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo mode: simulate pose detection for testing without TF.js
  const frameCount = useRef(0);
  const demoRepState = useRef<'idle' | 'up' | 'down'>('idle');

  useEffect(() => {
    if (isComplete && !showSuccess) {
      handleCompletion();
    }
  }, [isComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCompletion = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Record stats
    await recordReps(
      (exerciseId || 'pushup') as ExerciseId,
      exercise?.repsRequired || 10,
      exercise?.unlockMinutes || 30
    );

    // Start unlock session
    if (appId) {
      const now = Date.now();
      const session: UnlockSession = {
        appId,
        unlockedAt: now,
        expiresAt: now + (exercise?.unlockMinutes || 30) * 60 * 1000,
        exerciseId: (exerciseId || 'pushup') as ExerciseId,
      };
      await AsyncStorage.setItem(`session_${appId}`, JSON.stringify(session));
    }

    setShowSuccess(true);
  };

  const startDetection = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      frameCount.current++;

      // Try real camera detection first
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: CONFIG.CAMERA_QUALITY,
            base64: true,
            skipProcessing: true,
          });

          if (photo) {
            // In a production build with TF.js available, we'd process the image here
            // For now, feed demo keypoints for UI testing
          }
        } catch {
          // Camera snapshot failed, continue with demo data
        }
      }

      // Generate demo keypoints for UI testing
      // In production, these come from the pose detector
      const demoKeypoints = generateDemoKeypoints(frameCount.current);
      setKeypoints(demoKeypoints);
      processFrame(demoKeypoints);

      // Update form validity based on feedback
      setFormIsValid(!feedback.includes('Move into') && !feedback.includes('Step back'));
    }, CONFIG.POSE_DETECTION_INTERVAL_MS);
  }, [processFrame, feedback]);

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    router.back();
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    reset();
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          REPLOCK needs camera access to verify your exercise form.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onCameraReady={startDetection}
      />

      {/* Pose Overlay */}
      <PoseOverlay keypoints={keypoints} canvasWidth={SCREEN_WIDTH} canvasHeight={SCREEN_HEIGHT} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
          <Text style={styles.stopText}>Stop</Text>
        </TouchableOpacity>
        <Text style={styles.exerciseName}>{exercise?.name || 'Exercise'}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Rep Counter */}
      <View style={styles.counterContainer}>
        <RepCounter
          count={repCount}
          target={exercise?.repsRequired || 10}
          isTimeBased={exercise?.isTimeBased || false}
          elapsed={holdElapsed}
          targetSeconds={exercise?.holdSeconds || 60}
        />
      </View>

      {/* Form Feedback */}
      <FormFeedback feedback={feedback} isValid={formIsValid} />

      {/* Success Overlay */}
      {showSuccess && (
        <UnlockSuccess
          appName={app?.name || 'App'}
          minutes={exercise?.unlockMinutes || 30}
          onDismiss={handleDismissSuccess}
        />
      )}
    </View>
  );
}

/**
 * Generate demo keypoints for UI testing.
 * Simulates a person doing exercises with oscillating joint angles.
 */
function generateDemoKeypoints(frame: number): Keypoint[] {
  const cx = SCREEN_WIDTH / 2;
  const cy = SCREEN_HEIGHT / 2;
  const t = frame * 0.05;

  // Oscillate between up and down positions
  const phase = Math.sin(t);
  const armBend = phase > 0 ? 170 : 80; // Simulates arm extension/flexion

  // Generate basic human skeleton keypoints
  const noseY = cy - 150;
  const shoulderY = cy - 100;
  const hipY = cy + 20;
  const kneeY = cy + 120;
  const ankleY = cy + 220;

  const elbowOffset = phase > 0 ? 30 : 60;
  const wristOffset = phase > 0 ? 20 : 80;

  return [
    { name: 'nose', x: cx, y: noseY, score: 0.9 },
    { name: 'left_eye', x: cx - 15, y: noseY - 10, score: 0.9 },
    { name: 'right_eye', x: cx + 15, y: noseY - 10, score: 0.9 },
    { name: 'left_shoulder', x: cx - 60, y: shoulderY, score: 0.9 },
    { name: 'right_shoulder', x: cx + 60, y: shoulderY, score: 0.9 },
    { name: 'left_elbow', x: cx - 80, y: shoulderY + elbowOffset, score: 0.9 },
    { name: 'right_elbow', x: cx + 80, y: shoulderY + elbowOffset, score: 0.9 },
    { name: 'left_wrist', x: cx - 90, y: shoulderY + elbowOffset + wristOffset, score: 0.9 },
    { name: 'right_wrist', x: cx + 90, y: shoulderY + elbowOffset + wristOffset, score: 0.9 },
    { name: 'left_hip', x: cx - 40, y: hipY, score: 0.9 },
    { name: 'right_hip', x: cx + 40, y: hipY, score: 0.9 },
    { name: 'left_knee', x: cx - 45, y: kneeY + (phase > 0 ? 0 : -40), score: 0.9 },
    { name: 'right_knee', x: cx + 45, y: kneeY + (phase > 0 ? 0 : -40), score: 0.9 },
    { name: 'left_ankle', x: cx - 50, y: ankleY, score: 0.9 },
    { name: 'right_ankle', x: cx + 50, y: ankleY, score: 0.9 },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  stopButton: {
    backgroundColor: 'rgba(255,59,48,0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  stopText: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    fontWeight: 'bold',
  },
  exerciseName: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  counterContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: {
    color: COLORS.white,
    fontFamily: FONT.mono,
    fontSize: FONT.size.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionText: {
    color: COLORS.muted,
    fontFamily: FONT.mono,
    fontSize: FONT.size.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  grantButton: {
    backgroundColor: COLORS.acid,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  grantButtonText: {
    color: COLORS.black,
    fontFamily: FONT.mono,
    fontSize: FONT.size.lg,
    fontWeight: 'bold',
  },
});
