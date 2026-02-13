import { Keypoint, FormResult, RepState } from '../../types';
import { getKP, isVisible } from '../angleCalculator';

export function analyzeJumpingJack(keypoints: Keypoint[], currentState: RepState): FormResult {
  const leftWrist = getKP(keypoints, 'left_wrist');
  const rightWrist = getKP(keypoints, 'right_wrist');
  const leftShoulder = getKP(keypoints, 'left_shoulder');
  const rightShoulder = getKP(keypoints, 'right_shoulder');
  const leftAnkle = getKP(keypoints, 'left_ankle');
  const rightAnkle = getKP(keypoints, 'right_ankle');
  const leftHip = getKP(keypoints, 'left_hip');
  const rightHip = getKP(keypoints, 'right_hip');

  if (!isVisible(leftWrist) || !isVisible(rightWrist) || !isVisible(leftAnkle) || !isVisible(rightAnkle)) {
    return {
      isValid: false,
      feedback: 'Step back — full body must be visible',
      repState: currentState,
      repCompleted: false,
      jointAngles: {},
    };
  }

  const armsUp = leftWrist!.y < leftShoulder!.y && rightWrist!.y < rightShoulder!.y;

  const hipWidth = Math.abs(leftHip!.x - rightHip!.x);
  const ankleWidth = Math.abs(leftAnkle!.x - rightAnkle!.x);
  const legsWide = ankleWidth > hipWidth * 1.3;

  let feedback = '';
  let repCompleted = false;
  let newState = currentState;

  if (armsUp && legsWide) {
    if (currentState === 'down') repCompleted = true;
    newState = 'up';
    feedback = 'Out position! Jump back in';
  } else if (!armsUp && !legsWide) {
    if (currentState === 'up') newState = 'down';
    feedback = 'In position! Jump out — arms up, legs wide';
  } else {
    newState = 'transition';
    feedback = armsUp ? 'Wider legs!' : 'Arms all the way up!';
  }

  return {
    isValid: true,
    feedback,
    repState: newState,
    repCompleted,
    jointAngles: {},
  };
}
