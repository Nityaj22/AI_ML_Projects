import { Keypoint, FormResult, RepState } from '../../types';
import { calculateAngle, getKP, isVisible } from '../angleCalculator';

export function analyzeLunge(keypoints: Keypoint[], currentState: RepState): FormResult {
  const leftHip = getKP(keypoints, 'left_hip');
  const leftKnee = getKP(keypoints, 'left_knee');
  const leftAnkle = getKP(keypoints, 'left_ankle');

  const rightHip = getKP(keypoints, 'right_hip');
  const rightKnee = getKP(keypoints, 'right_knee');
  const rightAnkle = getKP(keypoints, 'right_ankle');

  const hip = leftHip || rightHip;
  const knee = leftKnee || rightKnee;
  const ankle = leftAnkle || rightAnkle;

  if (!isVisible(hip) || !isVisible(knee) || !isVisible(ankle)) {
    return {
      isValid: false,
      feedback: 'Step back — full legs must be visible',
      repState: currentState,
      repCompleted: false,
      jointAngles: {},
    };
  }

  const kneeAngle = calculateAngle(hip!, knee!, ankle!);

  let feedback = '';
  let repCompleted = false;
  let newState = currentState;

  if (kneeAngle > 160) {
    if (currentState === 'down') repCompleted = true;
    newState = 'up';
    feedback = 'Standing — step forward into a lunge';
  } else if (kneeAngle < 110) {
    newState = 'down';
    feedback = 'Good depth! Push back up';
  } else {
    newState = 'transition';
    feedback = 'Go deeper — back knee near floor';
  }

  return {
    isValid: true,
    feedback,
    repState: newState,
    repCompleted,
    jointAngles: { knee: kneeAngle },
  };
}
