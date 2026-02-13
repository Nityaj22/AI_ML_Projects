import { Keypoint, FormResult } from '../../types';
import { calculateAngle, getKP, isVisible } from '../angleCalculator';

export function analyzePlank(keypoints: Keypoint[], holdElapsed: number, targetSeconds: number): FormResult {
  const leftShoulder = getKP(keypoints, 'left_shoulder');
  const leftHip = getKP(keypoints, 'left_hip');
  const leftAnkle = getKP(keypoints, 'left_ankle');

  if (!isVisible(leftShoulder) || !isVisible(leftHip) || !isVisible(leftAnkle)) {
    return {
      isValid: false,
      feedback: 'Full body must be visible from side',
      repState: 'idle',
      repCompleted: false,
      jointAngles: {},
    };
  }

  const bodyAngle = calculateAngle(leftShoulder!, leftHip!, leftAnkle!);
  const isAligned = bodyAngle > 155 && bodyAngle < 200;

  const remaining = targetSeconds - holdElapsed;
  const repCompleted = holdElapsed >= targetSeconds;

  return {
    isValid: isAligned,
    feedback: isAligned
      ? repCompleted
        ? 'Done! Amazing plank!'
        : `Hold — ${Math.ceil(remaining)}s remaining`
      : bodyAngle < 155
        ? 'Raise your hips — back too low'
        : 'Lower hips — back too high',
    repState: 'down',
    repCompleted,
    jointAngles: { body: bodyAngle },
  };
}
