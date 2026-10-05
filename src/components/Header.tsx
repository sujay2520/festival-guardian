'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { audioEngine } from '@/lib/audio-engine';

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
  currentRole: _currentRole,
  onRoleChange: _onRoleChange,
  onOpenInfo,
}: HeaderProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-[480px] lg:max-w-5xl items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-[10px] border border-border bg-surface-2 font-display text-xs font-bold text-accent flex items-center justify-center shrink-0 shadow-sm">
            FG
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold text-fg leading-tight">
              Festival Guardian
            </span>
            <span className="text-[11px] text-muted leading-tight">
              Predict. Respond. Relay.
            </span>
          </div>
        </div>

        {/* Right: Explicit INFO Guide Button & Active Node StatusChip */}
        <div className="flex items-center gap-2">
          {onOpenInfo && (
            <button
              type="button"
              onClick={() => {
                audioEngine.play('click');
                onOpenInfo();
              }}
              aria-label="Open Festival Guardian Guide"
              className="h-8 px-2.5 rounded-full border border-border bg-surface-2 flex items-center gap-1.5 text-xs font-medium text-fg hover:bg-surface-3 hover:border-accent/40 transition-all shrink-0 shadow-sm active:scale-95"
            >
              <Info className="size-3.5 text-accent" />
              <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">INFO</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-fg shrink-0">
            <span
              className={`size-2 rounded-full ${
                isRelayActive ? 'bg-safe animate-pulse' : 'bg-muted'
              }`}
            />
            <span className="font-mono text-[10px] font-semibold tracking-wider">
              {peerCount > 0
                ? `${peerCount} NODES`
                : isRelayActive
                ? 'RELAY ON'
                : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
