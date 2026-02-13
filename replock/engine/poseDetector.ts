import { PoseResult, Keypoint } from '../types';

// TF.js imports — these will be loaded when available
// In Expo Go, pose detection runs via camera snapshot + model inference
let detector: any = null;

export async function initPoseDetector(): Promise<void> {
  if (detector) return;

  try {
    const tf = require('@tensorflow/tfjs');
    const poseDetection = require('@tensorflow-models/pose-detection');

    // Initialize TF.js backend
    await tf.ready();

    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      }
    );
  } catch (error) {
    console.log('[PoseDetector] TF.js not available, using mock mode:', error);
    detector = null;
  }
}

export async function detectPose(imageData: any): Promise<PoseResult | null> {
  if (!detector) {
    // Return null when detector isn't available
    return null;
  }

  try {
    const poses = await detector.estimatePoses(imageData);
    if (!poses || poses.length === 0) return null;

    const pose = poses[0];
    const keypoints: Keypoint[] = pose.keypoints.map((kp: any) => ({
      x: kp.x,
      y: kp.y,
      score: kp.score ?? 0,
      name: kp.name ?? '',
    }));

    return { keypoints, score: pose.score ?? 0 };
  } catch {
    return null;
  }
}

export function isDetectorReady(): boolean {
  return detector !== null;
}
