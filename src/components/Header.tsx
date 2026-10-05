'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, LayoutDashboard, Info } from 'lucide-react';

export interface HeaderProps {
  isRelayActive: boolean;
  peerCount: number;
  currentRole?: 'people' | 'organizer';
  onRoleChange?: (role: 'people' | 'organizer') => void;
  onOpenInfo?: () => void;
}

export default function Header({
  isRelayActive,
  peerCount,
  currentRole = 'people',
  onRoleChange,
  onOpenInfo,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-tactical-glass border-b border-guardian-border/80 h-14 px-3 sm:px-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Shield Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6600] to-red-600 flex items-center justify-center shadow-sm shrink-0">
          <Shield className="w-5 h-5 text-black fill-black" />
        </div>

        {/* Title and Subtitle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-mono text-xs sm:text-sm tracking-wider sm:tracking-widest font-semibold text-guardian-text uppercase truncate">
              Festival Guardian
            </h1>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#FF6600]/40 text-[#FF6600] bg-[#FF6600]/10 tracking-wider shrink-0">
              iQOO
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse shadow-[0_0_5px_#22C55E]"></span>
            <span className="text-[9px] sm:text-[10px] font-mono text-guardian-muted tracking-wide truncate">
              ON-DEVICE · WEBGL · 30 FPS
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Role Toggle Pill */}
        {onRoleChange && (
          <div className="bg-black/60 border border-white/10 rounded-lg p-0.5 flex items-center text-[10px] font-mono">
            <button
              onClick={() => onRoleChange('people')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                currentRole === 'people'
                  ? 'bg-[#FF6600] text-black font-bold shadow-[0_0_8px_rgba(255,102,0,0.4)]'
                  : 'text-guardian-muted hover:text-white'
              }`}
              title="People View (Attendee & Crowd Monitoring)"
            >
              <Shield size={11} />
              <span className="hidden xs:inline">PEOPLE</span>
            </button>
            <button
              onClick={() => onRoleChange('organizer')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                currentRole === 'organizer'
                  ? 'bg-guardian-cyan text-black font-bold shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                  : 'text-guardian-muted hover:text-white'
              }`}
              title="Organizer Control Room (Command Center & CCTV Feeds)"
            >
              <LayoutDashboard size={11} />
              <span className="hidden xs:inline">ORGANIZER</span>
            </button>
          </div>
        )}

        {/* Info & Instructions Button */}
        {onOpenInfo && (
          <button
            onClick={onOpenInfo}
            className="bg-black/50 hover:bg-black/80 border border-white/10 hover:border-[#FF6600]/40 rounded-lg px-2 sm:px-2.5 py-1.5 flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-colors shrink-0"
            title="App Instructions & Safety Guide"
          >
            <Info className="w-3.5 h-3.5 text-[#FF6600]" />
            <span className="hidden xs:inline">INFO</span>
          </button>
        )}

        {/* Mesh Node Count Indicator */}
        <div className="bg-black/50 border border-white/10 rounded-lg px-2 sm:px-2.5 py-1.5 flex items-center gap-1.5 sm:gap-2 shrink-0">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-guardian-cyan" />
          </motion.div>
          <span className="text-xs sm:text-sm font-semibold text-guardian-cyan font-mono leading-none">
            {peerCount}
          </span>
          <span className="text-[9px] sm:text-[10px] text-guardian-muted font-mono tracking-widest uppercase leading-none hidden sm:inline">
            Nodes
          </span>
        </div>
      </div>
    </header>
  );
}
