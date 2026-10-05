'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PackageX, AlertTriangle, HeartPulse } from 'lucide-react';

interface SosButtonProps {
  onSos: () => void;
  onTheft: () => void;
  onVolunteerRequest: () => void;
  onFirstAid?: () => void;
}

export default function SosButton({
  onSos,
  onTheft,
  onVolunteerRequest,
  onFirstAid,
}: SosButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const holdDuration = 800; // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        triggerSos();
      }
    }, 16);
  };

  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progress < 1) {
      setIsHolding(false);
      setProgress(0);
    }
  };

  const triggerSos = () => {
    setIsHolding(false);
    setProgress(0);
    onSos();
    showToast('🆘 Critical SOS Emergency Alert Broadcasted!');
  };

  const handleFirstAid = () => {
    onFirstAid?.();
    showToast('🚑 Medical First Aid Request Dispatched via Mesh!');
  };

  const handleTheft = () => {
    onTheft();
    showToast('📦 Theft Incident Report Dispatched to Security!');
  };

  const handleHelp = () => {
    onVolunteerRequest();
    showToast('🙋 Volunteer Assistance Requested at Your Sector!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const size = 96;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      <div className="relative flex items-center justify-center mb-2">
        {/* Progress Ring */}
        <svg
          width={size}
          height={size}
          className="absolute pointer-events-none -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* SOS Button */}
        <motion.button
          animate={isHolding ? { scale: 1.1 } : { scale: 1 }}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white select-none touch-none ${
            isHolding ? 'bg-red-600' : 'bg-red-500'
          } ${!isHolding ? 'sos-pulse' : ''}`}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
        >
          <ShieldAlert className="w-8 h-8 mb-0.5" />
          <span className="font-bold text-sm">SOS</span>
        </motion.button>
      </div>

      <p className="text-[10px] sm:text-xs text-guardian-cyan mb-6 font-mono tracking-wider uppercase text-center font-semibold">
        HOLD 0.8S FOR ZERO-INTERNET MESH BROADCAST
      </p>

      {/* 3 Tactical Emergency Cards Row matching screenshot */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
        {/* Theft */}
        <button
          onClick={handleTheft}
          className="flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-mono transition-all active:scale-95 shadow-md hover:bg-amber-500/15 group"
        >
          <PackageX className="w-5 h-5 mb-1.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-wide">Theft</span>
        </button>

        {/* Medical */}
        <button
          onClick={handleFirstAid}
          className="flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-red-500/10 border border-red-500/30 hover:border-red-400 text-red-400 font-mono transition-all active:scale-95 shadow-md hover:bg-red-500/15 group"
        >
          <HeartPulse className="w-5 h-5 mb-1.5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-wide">Medical</span>
        </button>

        {/* Need Help */}
        <button
          onClick={handleHelp}
          className="flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-mono transition-all active:scale-95 shadow-md hover:bg-cyan-500/15 group"
        >
          <AlertTriangle className="w-5 h-5 mb-1.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">Need Help</span>
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl shadow-red-600/40 flex items-center gap-2 z-50 whitespace-nowrap border border-white/20"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
