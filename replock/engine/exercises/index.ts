import { Keypoint, ExerciseId, FormResult, RepState } from '../../types';
import { analyzePushup } from './pushup';
import { analyzeSquat } from './squat';
import { analyzeLunge } from './lunge';
import { analyzePlank } from './plank';
import { analyzeJumpingJack } from './jumpingJack';

export function analyzeExercise(
  exerciseId: ExerciseId,
  keypoints: Keypoint[],
  currentRepState: RepState,
  holdElapsed = 0,
  targetSeconds = 60
): FormResult {
  switch (exerciseId) {
    case 'pushup':
      return analyzePushup(keypoints, currentRepState);
    case 'squat':
      return analyzeSquat(keypoints, currentRepState);
    case 'lunge':
      return analyzeLunge(keypoints, currentRepState);
    case 'jumpingJack':
      return analyzeJumpingJack(keypoints, currentRepState);
    case 'plank':
      return analyzePlank(keypoints, holdElapsed, targetSeconds);
    default:
      return analyzeSquat(keypoints, currentRepState);
  }
}
