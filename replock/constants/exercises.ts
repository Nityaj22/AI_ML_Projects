import { Exercise } from '../types';

export const EXERCISES: Record<string, Exercise> = {
  pushup: {
    id: 'pushup',
    name: 'Push-Ups',
    emoji: '💪',
    repsRequired: 10,
    unlockMinutes: 30,
    description: 'Full push-up with chest near floor',
    formCues: ['Keep back straight', 'Chest to ground', 'Full arm extension'],
    isTimeBased: false,
  },
  squat: {
    id: 'squat',
    name: 'Squats',
    emoji: '🦵',
    repsRequired: 15,
    unlockMinutes: 45,
    description: 'Hip crease below knee depth',
    formCues: ['Knees over toes', 'Sit back into hips', 'Chest up'],
    isTimeBased: false,
  },
  lunge: {
    id: 'lunge',
    name: 'Lunges',
    emoji: '🏃',
    repsRequired: 10,
    unlockMinutes: 20,
    description: '10 reps each leg, alternating',
    formCues: ['90° front knee', 'Back knee near floor', 'Torso upright'],
    isTimeBased: false,
  },
  jumpingJack: {
    id: 'jumpingJack',
    name: 'Jumping Jacks',
    emoji: '⭐',
    repsRequired: 30,
    unlockMinutes: 25,
    description: 'Full range — arms above head, legs wide',
    formCues: ['Arms reach fully overhead', 'Legs shoulder-width apart', 'Land softly'],
    isTimeBased: false,
  },
  plank: {
    id: 'plank',
    name: 'Plank Hold',
    emoji: '🧘',
    repsRequired: 1,
    unlockMinutes: 60,
    description: 'Hold for 60 seconds with correct form',
    formCues: ['Straight back', 'Hips level', 'Head neutral'],
    isTimeBased: true,
    holdSeconds: 60,
  },
};

export const EXERCISE_LIST = Object.values(EXERCISES);
