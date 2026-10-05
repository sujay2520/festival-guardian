'use client';

import React from 'react';
import { Info } from 'lucide-react';

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
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg px-4 py-3">
      <div className="mx-auto flex max-w-[480px] items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-[10px] border border-border bg-surface-2 font-display text-xs font-bold text-accent flex items-center justify-center shrink-0">
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

        {/* Right: Actions & StatusChip */}
        <div className="flex items-center gap-2">
          {onOpenInfo && (
            <button
              type="button"
              onClick={onOpenInfo}
              aria-label="App info"
              className="size-8 rounded-[10px] border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-fg hover:bg-surface-3 transition-colors shrink-0"
            >
              <Info className="size-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-fg shrink-0">
            <span
              className={`size-1.5 rounded-full ${
                isRelayActive ? 'bg-safe' : 'bg-muted'
              }`}
            />
            <span>
              {peerCount > 0
                ? `${peerCount} ${peerCount === 1 ? 'node' : 'nodes'}`
                : isRelayActive
                ? 'relay active'
                : 'standby'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
