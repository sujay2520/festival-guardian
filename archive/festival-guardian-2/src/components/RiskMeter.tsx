'use client';

import React from 'react';
import type { RiskData } from '@/types';

interface RiskMeterProps {
  riskData: RiskData;
  size?: number;
}

export default function RiskMeter({ riskData }: RiskMeterProps) {
  const { score, level } = riskData;

  const tone =
    level === 'critical' || level === 'danger'
      ? 'text-crit'
      : level === 'warning' || level === 'caution'
      ? 'text-surge'
      : 'text-safe';

  const fill =
    level === 'critical' || level === 'danger'
      ? 'bg-crit'
      : level === 'warning' || level === 'caution'
      ? 'bg-surge'
      : 'bg-safe';

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <p className={`font-display text-5xl font-semibold tabular-nums tracking-tight ${tone}`}>
        {score}
      </p>
      <p className={`mt-1 text-xs font-medium uppercase tracking-[0.16em] ${tone}`}>
        {level} risk
      </p>
      <div className="mt-3 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-surface-3">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
