import { useState, useEffect, useRef, useCallback } from 'react';
import { PoseResult, Keypoint } from '../types';
import { initPoseDetector, detectPose, isDetectorReady } from '../engine/poseDetector';
import { CONFIG } from '../constants/config';

export function usePoseDetection() {
  const [isReady, setIsReady] = useState(false);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    initPoseDetector()
      .then(() => {
        setIsReady(isDetectorReady());
      })
      .catch((err) => {
        setError('Failed to initialize pose detector');
        console.log('[usePoseDetection] Init error:', err);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startDetection = useCallback(
    (camera: any) => {
      cameraRef.current = camera;

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (!cameraRef.current) return;

        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: CONFIG.CAMERA_QUALITY,
            base64: true,
            skipProcessing: true,
          });

          if (photo) {
            const result = await detectPose(photo);
            if (result && result.keypoints.length > 0) {
              setKeypoints(result.keypoints);
            }
          }
        } catch {
          // Frame dropped — continue
        }
      }, CONFIG.POSE_DETECTION_INTERVAL_MS);
    },
    []
  );

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    cameraRef.current = null;
    setKeypoints([]);
  }, []);

  return { isReady, keypoints, error, startDetection, stopDetection };
}
