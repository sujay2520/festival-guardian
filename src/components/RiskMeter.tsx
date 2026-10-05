'use client';

import { motion } from 'framer-motion';
import { RiskData } from '@/types';

interface RiskMeterProps {
  riskData: RiskData;
  size?: number;
}

const colorMap: Record<string, string> = {
  safe: '#22C55E', // guardian-green
  caution: '#84CC16',
  warning: '#F59E0B', // guardian-amber
  danger: '#FF6600', // guardian-accent / iqoo-orange
  critical: '#EF4444', // guardian-red
};

export default function RiskMeter({ riskData, size = 200 }: RiskMeterProps) {
  const { score, level, personCount, density } = riskData;
  const color = colorMap[level?.toLowerCase()] || colorMap.safe;
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  
  // Calculate dash offset based on score (0-100)
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size / 2 + 60 }}>
      <div className="relative" style={{ width: size, height: size / 2 + strokeWidth }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2 + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + strokeWidth / 2}`}
            fill="none"
            stroke="#21262D"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2 + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + strokeWidth / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.div
            key={score}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold font-mono tabular-nums leading-none"
            style={{ color }}
          >
            {score}
          </motion.div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-[#7D8590]">
            {level}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <div className="bg-[#0D1117] border border-white/5 rounded-full px-4 py-1.5 flex flex-col items-center">
          <span className="text-[#E6EDF3] font-mono text-sm font-semibold">{personCount}</span>
          <span className="text-[#7D8590] text-[10px] uppercase">People</span>
        </div>
        <div className="bg-[#0D1117] border border-white/5 rounded-full px-4 py-1.5 flex flex-col items-center">
          <span className="text-[#E6EDF3] font-mono text-sm font-semibold">{typeof density === 'number' ? density.toFixed(1) : density}</span>
          <span className="text-[#7D8590] text-[10px] uppercase">per m²</span>
        </div>
      </div>
    </div>
  );
}
