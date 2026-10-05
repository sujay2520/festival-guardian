'use client';

import { useState, useRef, useEffect } from 'react';

interface SosButtonProps {
  onSos: () => void;
  onTheft: () => void;
  onVolunteerRequest: () => void;
  onFirstAid?: () => void;
}

type TriggerType = 'sos' | 'theft' | 'help';

export default function SosButton({
  onSos,
  onTheft,
  onVolunteerRequest,
  onFirstAid,
}: SosButtonProps) {
  const [holdingAction, setHoldingAction] = useState<TriggerType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isFirstAidDismissed, setIsFirstAidDismissed] = useState(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const startHold = (
    action: TriggerType,
    e?: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (e && e.currentTarget && typeof e.currentTarget.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture failures
      }
    }

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }

    setHoldingAction(action);

    holdTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // Ignore vibration failures
        }
      }

      if (action === 'sos') {
        onSos();
        showToast('Emergency SOS alert broadcasted');
      } else if (action === 'theft') {
        onTheft();
        showToast('Theft incident alert dispatched');
      } else if (action === 'help') {
        onVolunteerRequest();
        showToast('Assistance request broadcasted');
      }

      setHoldingAction(null);
      holdTimerRef.current = null;
    }, 600);
  };

  const cancelHold = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (e && e.currentTarget && typeof e.currentTarget.releasePointerCapture === 'function') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore release failures
      }
    }

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldingAction(null);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-lg font-semibold text-fg">
          Emergency triggers
        </h2>
        <p className="mt-1 text-sm text-muted">
          Same mesh as crowd alerts. Hold to fire — tap does nothing.
        </p>
      </div>

      {/* 3 Action Cards */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {/* Card 1: SOS */}
        <button
          type="button"
          onPointerDown={(e) => startHold('sos', e)}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative h-24 overflow-hidden rounded-[20px] bg-crit text-fg flex flex-col items-center justify-center select-none touch-none transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crit ${
            holdingAction === 'sos' ? 'brightness-110' : ''
          }`}
        >
          <span className="font-display text-xl font-bold tracking-tight">SOS</span>
          <span className="mt-1 text-xs font-mono opacity-80">Hold 0.6s</span>
          <div
            className={`absolute bottom-0 left-0 h-1 bg-fg transition-all ${
              holdingAction === 'sos'
                ? 'w-full opacity-80 duration-[600ms] ease-linear'
                : 'w-0 opacity-0 duration-150 ease-out'
            }`}
          />
        </button>

        {/* Card 2: Theft */}
        <button
          type="button"
          onPointerDown={(e) => startHold('theft', e)}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative h-24 overflow-hidden rounded-[20px] bg-surge text-accent-fg flex flex-col items-center justify-center select-none touch-none transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surge ${
            holdingAction === 'theft' ? 'brightness-110' : ''
          }`}
        >
          <span className="font-display text-xl font-bold tracking-tight">Theft</span>
          <span className="mt-1 text-xs font-mono opacity-80">Hold 0.6s</span>
          <div
            className={`absolute bottom-0 left-0 h-1 bg-accent-fg transition-all ${
              holdingAction === 'theft'
                ? 'w-full opacity-80 duration-[600ms] ease-linear'
                : 'w-0 opacity-0 duration-150 ease-out'
            }`}
          />
        </button>

        {/* Card 3: Need help */}
        <button
          type="button"
          onPointerDown={(e) => startHold('help', e)}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative h-24 overflow-hidden rounded-[20px] bg-surface-3 text-fg border border-border flex flex-col items-center justify-center select-none touch-none transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border ${
            holdingAction === 'help' ? 'bg-surface-2' : ''
          }`}
        >
          <span className="font-display text-lg font-semibold tracking-tight">Need help</span>
          <span className="mt-1 text-xs font-mono text-muted">Hold 0.6s</span>
          <div
            className={`absolute bottom-0 left-0 h-1 bg-fg transition-all ${
              holdingAction === 'help'
                ? 'w-full opacity-80 duration-[600ms] ease-linear'
                : 'w-0 opacity-0 duration-150 ease-out'
            }`}
          />
        </button>
      </div>

      {/* First Aid Section */}
      {!isFirstAidDismissed ? (
        <div className="rounded-[20px] border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-fg">
              Voice-guided first aid
            </h3>
            <button
              type="button"
              onClick={() => setIsFirstAidDismissed(true)}
              className="text-xs text-muted hover:text-fg transition-colors"
            >
              Dismiss
            </button>
          </div>

          <ol className="mt-3 list-decimal pl-4 space-y-1.5 text-sm text-muted">
            <li>Ensure immediate perimeter is safe and clear of crowd surge.</li>
            <li>Check person&apos;s responsiveness and keep their airway open.</li>
            <li>Loosen restrictive clothing around neck and chest to aid breathing.</li>
            <li>Maintain position while festival mesh relays your emergency location.</li>
          </ol>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
            <p className="text-xs text-subtle">
              Guidance only — not a medical device.
            </p>
            {onFirstAid && (
              <button
                type="button"
                onClick={() => {
                  onFirstAid();
                  showToast('Voice-guided first aid initiated');
                }}
                className="rounded-[12px] bg-surface-2 hover:bg-surface-3 px-3 py-1.5 text-xs font-mono text-fg border border-border transition-colors whitespace-nowrap"
              >
                Activate audio
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsFirstAidDismissed(false)}
            className="text-xs text-muted hover:text-fg transition-colors"
          >
            Show first aid guidance
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-[12px] border border-border bg-surface-2 px-4 py-2 text-xs font-mono text-fg shadow-xl pointer-events-none whitespace-nowrap"
        >
          <span className="h-2 w-2 rounded-full bg-safe animate-pulse" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
