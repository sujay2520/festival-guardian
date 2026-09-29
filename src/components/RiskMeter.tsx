'use client';
import { motion } from 'framer-motion';
import { RiskData } from '@/types';

interface RiskMeterProps {
  riskData: RiskData;
  size?: number;
}

export default function RiskMeter({ riskData, size = 200 }: RiskMeterProps) {
  const { score, level, personCount, density } = riskData;

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colors: Record<string, string> = {
    safe: '#22c55e',
    caution: '#84cc16',
    warning: '#f59e0b',
    danger: '#f97316',
    critical: '#ef4444',
  };

  const color = colors[level] || colors.safe;
  const cx = size / 2;
  const cy = size / 2 + 10;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: size, height: size * 0.7 }}
    >
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size * 0.6}`}
      >
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <motion.path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>

      {/* Score number */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingTop: size * 0.05 }}
      >
        <motion.span
          key={score}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-guardian-muted uppercase tracking-wider mt-0.5">
          {level}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-1">
        <div className="text-center">
          <span className="text-sm font-semibold">{personCount}</span>
          <p className="text-[10px] text-guardian-muted">People</p>
        </div>
        <div className="text-center">
          <span className="text-sm font-semibold">{density}</span>
          <p className="text-[10px] text-guardian-muted">per m²</p>
        </div>
      </div>
    </div>
  );
}
