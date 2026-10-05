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

const INITIAL_SURGE_BOXES: BoundingBox[] = [
  { x: 140, y: 150, width: 62, height: 110, confidence: 0.91, label: 'person' },
  { x: 220, y: 170, width: 58, height: 105, confidence: 0.88, label: 'person' },
  { x: 310, y: 140, width: 65, height: 120, confidence: 0.94, label: 'person' },
  { x: 420, y: 160, width: 60, height: 115, confidence: 0.86, label: 'person' },
  { x: 170, y: 230, width: 70, height: 130, confidence: 0.92, label: 'person' },
  { x: 280, y: 250, width: 72, height: 135, confidence: 0.95, label: 'person' },
  { x: 380, y: 220, width: 68, height: 125, confidence: 0.89, label: 'person' },
  { x: 90, y: 290, width: 75, height: 140, confidence: 0.93, label: 'person' },
  { x: 210, y: 300, width: 80, height: 145, confidence: 0.97, label: 'person' },
  { x: 330, y: 295, width: 78, height: 142, confidence: 0.91, label: 'person' },
  { x: 440, y: 285, width: 76, height: 138, confidence: 0.87, label: 'person' },
];

export function useRiskScore(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
  demoScenario: DemoScenario = 'surge'
) {
  const [riskData, setRiskData] = useState<RiskData>(() => {
    if (demoScenario === 'surge') {
      return {
        score: 65,
        personCount: 28,
        density: 1.12,
        flowRate: 1.25,
        level: 'warning',
        timestamp: Date.now(),
      };
    }
    return {
      score: 0,
      personCount: 0,
      density: 0,
      flowRate: 0,
      level: 'safe',
      timestamp: Date.now(),
    };
  });
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<BoundingBox[]>(() => {
    return demoScenario === 'surge' ? INITIAL_SURGE_BOXES : [];
  });
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

  // Real camera inference loop with sequential non-overlapping execution
  useEffect(() => {
    if (!isActive || !isModelReady || demoScenario !== 'off') return;

    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    let isProcessing = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const runInferenceCycle = async () => {
      if (isCancelled) return;

      if (!isProcessing && video.readyState >= 2 && !video.paused && !video.ended) {
        isProcessing = true;
        try {
          const boxes = await detectPersons(video);
          if (!isCancelled) {
            setDetections(boxes);
            pushFrameCount(boxes.length);
            const risk = computeRisk();
            setRiskData(risk);
          }
        } catch {
          // Detection skipped this frame
        } finally {
          isProcessing = false;
        }
      }

      if (!isCancelled) {
        // 420ms cooldown AFTER frame finishes: prevents tensor queuing and mobile GPU thermal throttling
        timeoutId = setTimeout(runInferenceCycle, 420);
      }
    };

    runInferenceCycle();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
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
