import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Keypoint } from '../types';
import { COLORS } from '../constants/theme';

interface PoseOverlayProps {
  keypoints: Keypoint[];
  canvasWidth: number;
  canvasHeight: number;
}

const CONNECTED_PAIRS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

const KEYPOINT_SIZE = 8;
const MIN_CONFIDENCE = 0.4;

export default function PoseOverlay({ keypoints, canvasWidth, canvasHeight }: PoseOverlayProps) {
  const getKP = (name: string): Keypoint | null => {
    const kp = keypoints.find((k) => k.name === name);
    return kp && kp.score > MIN_CONFIDENCE ? kp : null;
  };

  const renderKeypoints = () => {
    return keypoints
      .filter((kp) => kp.score > MIN_CONFIDENCE)
      .map((kp, index) => (
        <View
          key={`kp-${index}`}
          style={[
            styles.keypoint,
            {
              left: kp.x - KEYPOINT_SIZE / 2,
              top: kp.y - KEYPOINT_SIZE / 2,
            },
          ]}
        />
      ));
  };

  const renderLines = () => {
    return CONNECTED_PAIRS.map(([from, to], index) => {
      const kpFrom = getKP(from);
      const kpTo = getKP(to);

      if (!kpFrom || !kpTo) return null;

      const dx = kpTo.x - kpFrom.x;
      const dy = kpTo.y - kpFrom.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return (
        <View
          key={`line-${index}`}
          style={[
            styles.line,
            {
              left: kpFrom.x,
              top: kpFrom.y,
              width: length,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            },
          ]}
        />
      );
    });
  };

  if (keypoints.length === 0) return null;

  return (
    <View style={[styles.container, { width: canvasWidth, height: canvasHeight }]}>
      {renderLines()}
      {renderKeypoints()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  keypoint: {
    position: 'absolute',
    width: KEYPOINT_SIZE,
    height: KEYPOINT_SIZE,
    borderRadius: KEYPOINT_SIZE / 2,
    backgroundColor: COLORS.acid,
    opacity: 0.7,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.acid,
    opacity: 0.7,
  },
});
