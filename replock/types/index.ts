export type ExerciseId = 'pushup' | 'squat' | 'lunge' | 'jumpingJack' | 'plank' | 'burpee';

export type RepState = 'idle' | 'up' | 'down' | 'transition';

export interface Exercise {
  id: ExerciseId;
  name: string;
  emoji: string;
  repsRequired: number;
  unlockMinutes: number;
  description: string;
  formCues: string[];
  isTimeBased: boolean;
  holdSeconds?: number;
}

export interface LockedApp {
  id: string;
  name: string;
  bundleId: string;
  packageName: string;
  emoji: string;
  isLocked: boolean;
}

export interface UnlockSession {
  appId: string;
  unlockedAt: number;
  expiresAt: number;
  exerciseId: ExerciseId;
}

export interface DayStats {
  date: string;
  totalReps: number;
  exerciseCounts: Record<ExerciseId, number>;
  unlocksEarned: number;
  minutesEarned: number;
}

export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface PoseResult {
  keypoints: Keypoint[];
  score: number;
}

export interface FormResult {
  isValid: boolean;
  feedback: string;
  repState: RepState;
  repCompleted: boolean;
  jointAngles: Record<string, number>;
}
