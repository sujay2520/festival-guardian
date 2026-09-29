'use client';
import { motion } from 'framer-motion';
import { Shield, Wifi, WifiOff, Users } from 'lucide-react';

interface HeaderProps {
  isRelayActive: boolean;
  peerCount: number;
}

export default function Header({ isRelayActive, peerCount }: HeaderProps) {
  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield className="w-7 h-7 text-guardian-accent" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-guardian-accent to-guardian-green bg-clip-text text-transparent">
            Festival Guardian
          </h1>
          <p className="text-[10px] text-guardian-muted -mt-0.5">
            AI Crowd Safety
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isRelayActive ? (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1"
            >
              <Wifi className="w-4 h-4 text-guardian-green" />
              <span className="text-xs text-guardian-green">Mesh</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-1">
              <WifiOff className="w-4 h-4 text-guardian-muted" />
              <span className="text-xs text-guardian-muted">Off</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-guardian-border/50 rounded-full px-2 py-1">
          <Users className="w-3.5 h-3.5 text-guardian-accent" />
          <span className="text-xs font-medium">{peerCount}</span>
        </div>
      </div>
    </header>
  );
}
