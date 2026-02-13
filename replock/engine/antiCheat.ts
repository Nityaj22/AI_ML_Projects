import { Keypoint } from '../types';

const VELOCITY_THRESHOLD = 150;
const MIN_MOVEMENT_THRESHOLD = 5;

let previousKeypoints: Keypoint[] = [];
let previousTimestamp = 0;

/**
 * Basic liveness check: ensures keypoints are moving (not a static image)
 */
export function checkLiveness(keypoints: Keypoint[]): boolean {
  if (previousKeypoints.length === 0) {
    previousKeypoints = keypoints;
    previousTimestamp = Date.now();
    return true;
  }

  let totalMovement = 0;
  let matchedPoints = 0;

  for (const kp of keypoints) {
    const prev = previousKeypoints.find(p => p.name === kp.name);
    if (prev && kp.score > 0.4 && prev.score > 0.4) {
      const dx = kp.x - prev.x;
      const dy = kp.y - prev.y;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
      matchedPoints++;
    }
  }

  previousKeypoints = keypoints;
  const now = Date.now();
  const dt = (now - previousTimestamp) / 1000;
  previousTimestamp = now;

  if (matchedPoints === 0 || dt === 0) return true;

  const avgMovement = totalMovement / matchedPoints;

  // If no movement at all for extended period, might be static image
  if (avgMovement < MIN_MOVEMENT_THRESHOLD && dt > 2) {
    return false;
  }

  return true;
}

/**
 * Velocity check: ensures movements aren't impossibly fast (video playback)
 */
export function checkVelocity(keypoints: Keypoint[]): boolean {
  if (previousKeypoints.length === 0) return true;

  for (const kp of keypoints) {
    const prev = previousKeypoints.find(p => p.name === kp.name);
    if (prev && kp.score > 0.4 && prev.score > 0.4) {
      const dx = kp.x - prev.x;
      const dy = kp.y - prev.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      if (velocity > VELOCITY_THRESHOLD) {
        return false;
      }
    }
  }

  return true;
}

export function resetAntiCheat() {
  previousKeypoints = [];
  previousTimestamp = 0;
}
