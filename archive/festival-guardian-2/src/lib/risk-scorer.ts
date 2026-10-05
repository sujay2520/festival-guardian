import {
  RiskData,
  MAX_SAFE_DENSITY,
  MAX_FLOW,
  RISK_THRESHOLDS,
  FRAME_BUFFER_SIZE,
} from '@/types';

const countBuffer: number[] = [];

export function pushFrameCount(count: number): void {
  countBuffer.push(count);
  if (countBuffer.length > FRAME_BUFFER_SIZE) {
    countBuffer.shift();
  }
}

export function computeRisk(frameAreaM2: number = 8): RiskData {
  if (countBuffer.length === 0) {
    return {
      score: 0,
      personCount: 0,
      density: 0,
      flowRate: 0,
      level: 'safe',
      timestamp: Date.now(),
    };
  }

  const avgCount =
    countBuffer.reduce((a, b) => a + b, 0) / countBuffer.length;
  const latestCount = countBuffer[countBuffer.length - 1];
  const density = avgCount / frameAreaM2;

  let flowRate = 0;
  if (countBuffer.length >= 2) {
    const changes: number[] = [];
    for (let i = 1; i < countBuffer.length; i++) {
      changes.push(Math.abs(countBuffer[i] - countBuffer[i - 1]));
    }
    flowRate = changes.reduce((a, b) => a + b, 0) / changes.length;
  }

  // Calibrated crowd risk following NFPA 101 and Fruin Level of Service standards
  // At low density (<1.0 p/m²), normal pedestrian flow is safe and should not trigger false alarms.
  const densityRatio = density / MAX_SAFE_DENSITY; // MAX_SAFE_DENSITY = 4.0
  const baseDensityScore = Math.min(densityRatio * 80, 80);

  // Flow turbulence is only dangerous when crowd density is elevated (>1.0 p/m²)
  const flowFactor = Math.min(flowRate / MAX_FLOW, 1.0);
  const densityGating = Math.max(0, Math.min((density - 1.0) / 2.5, 1.0));
  const flowScore = flowFactor * 20 * densityGating;

  const score = Math.round(Math.min(baseDensityScore + flowScore, 100));

  const level =
    score >= RISK_THRESHOLDS.danger
      ? 'critical'
      : score >= RISK_THRESHOLDS.warning
        ? 'danger'
        : score >= RISK_THRESHOLDS.caution
          ? 'warning'
          : score >= RISK_THRESHOLDS.safe
            ? 'caution'
            : 'safe';

  return {
    score,
    personCount: latestCount,
    density: Math.round(density * 100) / 100,
    flowRate: Math.round(flowRate * 100) / 100,
    level,
    timestamp: Date.now(),
  };
}

export function resetScorer(): void {
  countBuffer.length = 0;
}
