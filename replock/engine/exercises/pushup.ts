import { Keypoint, FormResult, RepState } from '../../types';
import { calculateAngle, getKP, isVisible } from '../angleCalculator';

export function analyzePushup(keypoints: Keypoint[], currentState: RepState): FormResult {
  const leftShoulder = getKP(keypoints, 'left_shoulder');
  const leftElbow = getKP(keypoints, 'left_elbow');
  const leftWrist = getKP(keypoints, 'left_wrist');
  const leftHip = getKP(keypoints, 'left_hip');
  const leftAnkle = getKP(keypoints, 'left_ankle');

  const rightShoulder = getKP(keypoints, 'right_shoulder');
  const rightElbow = getKP(keypoints, 'right_elbow');
  const rightWrist = getKP(keypoints, 'right_wrist');

  const shoulder = leftShoulder || rightShoulder;
  const elbow = leftElbow || rightElbow;
  const wrist = leftWrist || rightWrist;

  if (!isVisible(shoulder) || !isVisible(elbow) || !isVisible(wrist)) {
    return {
      isValid: false,
      feedback: 'Move into frame — full body visible',
      repState: currentState,
      repCompleted: false,
      jointAngles: {},
    };
  }

  const elbowAngle = calculateAngle(shoulder!, elbow!, wrist!);

  let backStraight = true;
  let backFeedback = '';
  if (leftShoulder && leftHip && leftAnkle) {
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    backStraight = hipAngle > 160;
    if (!backStraight) backFeedback = 'Keep your back straight';
  }

  let feedback = '';
  let repCompleted = false;
  let newState = currentState;

  if (elbowAngle > 160) {
    if (currentState === 'down') {
      repCompleted = true;
    }
    newState = 'up';
    feedback = backStraight ? 'Good — lower yourself down' : backFeedback;
  } else if (elbowAngle < 100) {
    newState = 'down';
    feedback = backStraight ? 'Good — push back up!' : backFeedback;
  } else {
    newState = 'transition';
    feedback = backStraight ? 'Keep going...' : backFeedback;
  }

  return {
    isValid: backStraight,
    feedback,
    repState: newState,
    repCompleted,
    jointAngles: { elbow: elbowAngle },
  };
}

export function resetPushup() {
  // Reset any module-level state if needed
}
