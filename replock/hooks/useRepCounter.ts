import { useState, useCallback, useRef } from 'react';
import { ExerciseId, RepState, FormResult, Keypoint } from '../types';
import { analyzeExercise } from '../engine/exercises';

export function useRepCounter(exerciseId: ExerciseId, targetReps: number) {
  const [repCount, setRepCount] = useState(0);
  const [repState, setRepState] = useState<RepState>('idle');
  const [feedback, setFeedback] = useState('Get into position...');
  const [isComplete, setIsComplete] = useState(false);
  const [holdElapsed, setHoldElapsed] = useState(0);
  const holdStart = useRef<number | null>(null);

  const processFrame = useCallback(
    (keypoints: Keypoint[]) => {
      const elapsed = holdStart.current ? (Date.now() - holdStart.current) / 1000 : 0;
      const result: FormResult = analyzeExercise(exerciseId, keypoints, repState, elapsed, 60);

      setFeedback(result.feedback);
      setRepState(result.repState);

      if (exerciseId === 'plank') {
        if (result.isValid && !holdStart.current) holdStart.current = Date.now();
        if (!result.isValid) holdStart.current = null;
        setHoldElapsed(elapsed);
        if (result.repCompleted) setIsComplete(true);
      } else {
        if (result.repCompleted) {
          setRepCount((prev) => {
            const next = prev + 1;
            if (next >= targetReps) setIsComplete(true);
            return next;
          });
        }
      }
    },
    [exerciseId, repState, targetReps]
  );

  const reset = useCallback(() => {
    setRepCount(0);
    setRepState('idle');
    setFeedback('Get into position...');
    setIsComplete(false);
    setHoldElapsed(0);
    holdStart.current = null;
  }, []);

  return { repCount, repState, feedback, isComplete, holdElapsed, processFrame, reset };
}
