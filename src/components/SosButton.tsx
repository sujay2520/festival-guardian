'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, PackageX } from 'lucide-react';

interface SosButtonProps {
  onSos: () => void;
  onTheft: () => void;
  onVolunteerRequest: () => void;
}

export default function SosButton({
  onSos,
  onTheft,
  onVolunteerRequest,
}: SosButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const HOLD_DURATION = 800; // ms

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        onSos();
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 2000);
      }
    }, 16);
  }, [onSos]);

  const endHold = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SOS Button */}
      <div className="relative">
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all ${
            isHolding
              ? 'bg-red-600 scale-110'
              : 'bg-red-500 hover:bg-red-600 sos-pulse'
          }`}
          whileTap={{ scale: 1.1 }}
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
              className="transition-all duration-75"
            />
          </svg>
          <div className="flex flex-col items-center z-10">
            <ShieldAlert className="w-7 h-7" />
            <span className="text-xs mt-0.5">SOS</span>
          </div>
        </motion.button>
        <p className="text-[10px] text-guardian-muted text-center mt-1">
          Hold to send
        </p>
      </div>

      {/* Secondary buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onTheft}
          className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 px-4 py-2 rounded-xl text-sm transition-colors border border-amber-500/20"
        >
          <PackageX className="w-4 h-4" />
          Theft
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onVolunteerRequest}
          className="flex items-center gap-1.5 bg-guardian-accent/15 hover:bg-guardian-accent/25 text-guardian-accent px-4 py-2 rounded-xl text-sm transition-colors border border-guardian-accent/20"
        >
          <AlertTriangle className="w-4 h-4" />
          Need Help
        </motion.button>
      </div>

      {/* Confirmation toast */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 font-medium z-50"
          >
            🆘 SOS Alert Sent!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
