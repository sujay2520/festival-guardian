'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { RiskData, BoundingBox, DETECTION_INTERVAL_MS } from '@/types';
import {
  loadDetector,
  detectPersons,
  isModelLoaded,
} from '@/lib/person-detector';
import { pushFrameCount, computeRisk, resetScorer } from '@/lib/risk-scorer';

export function useRiskScore(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean
) {
  const [riskData, setRiskData] = useState<RiskData>({
    score: 0,
    personCount: 0,
    density: 0,
    flowRate: 0,
    level: 'safe',
    timestamp: Date.now(),
  });
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<BoundingBox[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initModel = useCallback(async () => {
    if (isModelReady || isLoading) return;
    setIsLoading(true);
    try {
      await loadDetector();
      setIsModelReady(true);
    } catch (e) {
      console.error('Failed to load detection model:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isModelReady, isLoading]);

  useEffect(() => {
    if (!isActive || !isModelReady) return;

    const video = videoRef.current;
    if (!video) return;

    intervalRef.current = setInterval(async () => {
      if (video.readyState < 2) return;

      try {
        const boxes = await detectPersons(video);
        setDetections(boxes);
        pushFrameCount(boxes.length);
        const risk = computeRisk();
        setRiskData(risk);
      } catch {
        // Detection failed this frame, skip
      }
    }, DETECTION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isModelReady, videoRef]);

  useEffect(() => {
    if (!isActive) {
      resetScorer();
      setRiskData({
        score: 0,
        personCount: 0,
        density: 0,
        flowRate: 0,
        level: 'safe',
        timestamp: Date.now(),
      });
      setDetections([]);
    }
  }, [isActive]);

  return {
    riskData,
    detections,
    isModelReady,
    isLoading,
    initModel,
  };
}
