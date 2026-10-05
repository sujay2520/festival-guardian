'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Camera, Radio, AlertTriangle, Users, LayoutDashboard, HeartPulse, X } from 'lucide-react';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-guardian-card border border-guardian-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl my-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF6600]/25 via-red-600/15 to-transparent border-b border-guardian-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-red-600 flex items-center justify-center shadow-md">
                    <Shield className="w-6 h-6 text-black fill-black" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                      HOW TO USE THE APP
                    </h2>
                    <p className="text-[11px] text-guardian-muted">
                      Festival Guardian · Crowd Safety & Mesh Emergency
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-guardian-muted hover:text-white transition-colors p-1.5 rounded-lg bg-black/40 border border-white/5"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simple Step-by-Step Instructions */}
            <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto text-slate-200">
              {/* Step 1: Scanner */}
              <div className="flex gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-guardian-green/20 border border-guardian-green/30 flex-shrink-0 flex items-center justify-center text-guardian-green mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white font-mono uppercase tracking-wide">
                    1. AI Crowd Scanner
                  </p>
                  <p className="text-guardian-muted mt-1 leading-relaxed">
                    Tap <span className="text-guardian-green font-semibold">CAMERA</span> to monitor a real gate, or tap <span className="text-guardian-cyan font-semibold">EVENT</span> / <span className="text-guardian-cyan font-semibold">VIDEO 1</span> / <span className="text-guardian-cyan font-semibold">VIDEO 2</span> to test actual concert footage. The on-device AI tracks people and warns when density exceeds safety limits.
                  </p>
                </div>
              </div>

              {/* Step 2: Emergency SOS */}
              <div className="flex gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0 flex items-center justify-center text-red-400 mt-0.5">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white font-mono uppercase tracking-wide">
                    2. Emergency SOS & 1-Tap Help
                  </p>
                  <p className="text-guardian-muted mt-1 leading-relaxed">
                    Under the <span className="text-red-400 font-semibold">SOS</span> tab, hold the big red button for 0.8s for critical danger. Use 1-tap buttons for <span className="text-amber-400 font-semibold">Theft</span>, <span className="text-red-400 font-semibold">Medical</span>, or <span className="text-cyan-400 font-semibold">Need Help</span>.
                  </p>
                </div>
              </div>

              {/* Step 3: Zero-Internet Mesh */}
              <div className="flex gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-guardian-cyan/20 border border-guardian-cyan/30 flex-shrink-0 flex items-center justify-center text-guardian-cyan mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white font-mono uppercase tracking-wide">
                    3. Works Without Internet / SIM
                  </p>
                  <p className="text-guardian-muted mt-1 leading-relaxed">
                    When festival cellular towers get jammed, alerts hop phone-to-phone across the local mesh network with zero Wi-Fi or cellular needed.
                  </p>
                </div>
              </div>

              {/* Step 4: Two Roles (People vs Organizer) */}
              <div className="flex gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex-shrink-0 flex items-center justify-center text-amber-400 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white font-mono uppercase tracking-wide">
                    4. People vs Organizer View
                  </p>
                  <p className="text-guardian-muted mt-1 leading-relaxed">
                    Use the role toggle in the header or top bar:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]" />
                      <strong className="text-white">PEOPLE:</strong> Scanner, local alerts, and SOS.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-guardian-cyan" />
                      <strong className="text-white">ORGANIZER:</strong> Multi-zone heatmaps, CCTV security streams, and dispatch.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 pt-1 bg-black/20 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6600] to-red-600 text-white font-bold font-mono tracking-wider text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6600]/20"
              >
                GOT IT · START USING THE APP
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
