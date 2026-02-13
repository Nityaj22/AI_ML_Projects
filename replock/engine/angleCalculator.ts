import { Keypoint } from '../types';

/**
 * Calculate angle (degrees) at point B formed by points A-B-C
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Get a keypoint by name from the pose keypoints array
 */
export function getKP(keypoints: Keypoint[], name: string): Keypoint | null {
  const kp = keypoints.find(k => k.name === name);
  return kp && kp.score > 0.4 ? kp : null;
}

/**
 * Check if a keypoint is visible with sufficient confidence
 */
export function isVisible(kp: Keypoint | null, threshold = 0.4): boolean {
  return kp !== null && kp.score >= threshold;
}
