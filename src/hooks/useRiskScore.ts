'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { RiskData, BoundingBox, DemoScenario, DETECTION_INTERVAL_MS } from '@/types';
import {
  loadDetector,
  detectPersons,
  isModelLoaded,
} from '@/lib/person-detector';
import { pushFrameCount, computeRisk, resetScorer } from '@/lib/risk-scorer';

function generateDemoBoxes(count: number, width = 640, height = 480): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  for (let i = 0; i < count; i++) {
    const bw = 45 + Math.random() * 30;
    const bh = 85 + Math.random() * 55;
    const bx = 20 + Math.random() * (width - bw - 40);
    const by = 60 + Math.random() * (height - bh - 80);
    boxes.push({
      x: bx,
      y: by,
      width: bw,
      height: bh,
      confidence: Math.round((0.82 + Math.random() * 0.16) * 100) / 100,
      label: 'person',
    });
  }
  return boxes;
}

export function useRiskScore(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
  demoScenario: DemoScenario = 'off'
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

  // Demo simulation mode
  useEffect(() => {
    if (demoScenario === 'off') return;

    const runSimulation = () => {
      let count = 14;
      let score = 20;
      let level: RiskData['level'] = 'safe';
      let density = 0.56;
      let flowRate = 0.25;

      if (demoScenario === 'safe') {
        count = 12 + Math.floor(Math.random() * 5);
        density = Math.round((count / 25) * 100) / 100;
        flowRate = 0.2 + Math.random() * 0.2;
        score = Math.round(18 + Math.random() * 6);
        level = 'safe';
      } else if (demoScenario === 'surge') {
        count = 28 + Math.floor(Math.random() * 6);
        density = Math.round((count / 25) * 100) / 100;
        flowRate = 1.1 + Math.random() * 0.4;
        score = Math.round(62 + Math.random() * 8);
        level = 'warning';
      } else if (demoScenario === 'critical') {
        count = 46 + Math.floor(Math.random() * 6);
        density = Math.round((count / 25) * 100) / 100;
        flowRate = 1.8 + Math.random() * 0.5;
        score = Math.round(89 + Math.random() * 8);
        level = 'critical';
      }

      setDetections(generateDemoBoxes(count));
      setRiskData({
        score: Math.min(score, 100),
        personCount: count,
        density,
        flowRate: Math.round(flowRate * 100) / 100,
        level,
        timestamp: Date.now(),
      });
    };

    runSimulation();
    const simInterval = setInterval(runSimulation, 600);
    return () => clearInterval(simInterval);
  }, [demoScenario]);

  // Real camera inference loop
  useEffect(() => {
    if (!isActive || !isModelReady || demoScenario !== 'off') return;

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
  }, [isActive, isModelReady, videoRef, demoScenario]);

  useEffect(() => {
    if (!isActive && demoScenario === 'off') {
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
  }, [isActive, demoScenario]);

  return {
    riskData,
    detections,
    isModelReady,
    isLoading,
    initModel,
  };
}
