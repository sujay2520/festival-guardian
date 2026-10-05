'use client';

import { ShieldAlert, Siren, Wallet, UserRound } from 'lucide-react';
import { Alert, AlertType } from '@/types';

export interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onClear: () => void;
}

interface AlertConfig {
  icon: typeof ShieldAlert;
  color: string;
  label: string;
}

const ALERT_CONFIG: Record<AlertType, AlertConfig> = {
  [AlertType.CROWD_RISK]: {
    icon: ShieldAlert,
    color: 'text-surge',
    label: 'Crowd Risk',
  },
  [AlertType.SOS_HELP]: {
    icon: Siren,
    color: 'text-crit',
    label: 'SOS Emergency',
  },
  [AlertType.THEFT]: {
    icon: Wallet,
    color: 'text-surge',
    label: 'Theft Report',
  },
  [AlertType.VOLUNTEER_REQUEST]: {
    icon: UserRound,
    color: 'text-accent',
    label: 'Volunteer Request',
  },
  [AlertType.VOLUNTEER_RESPONSE]: {
    icon: UserRound,
    color: 'text-accent',
    label: 'Volunteer Response',
  },
};

function formatTimeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AlertPanel({
  alerts,
  onDismiss,
  onClear,
}: AlertPanelProps) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">Alert feed</h2>
          <p className="text-sm text-muted">Names and coordinates are demo telemetry.</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-muted hover:text-fg transition-colors pt-1"
          >
            Clear all
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-border bg-surface px-5 py-10 text-center">
          <p className="text-sm font-medium text-fg">No alerts yet</p>
          <p className="mt-1 text-xs text-muted">
            Run the Live demo to simulate incoming alerts and crowd telemetry.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {alerts.map((alert) => {
            const config = ALERT_CONFIG[alert.type] || {
              icon: ShieldAlert,
              color: 'text-surge',
              label: alert.type || 'Alert',
            };
            const Icon = config.icon;
            const details =
              alert.message ||
              (alert.senderName ? `Reported by ${alert.senderName}` : 'Incident reported');

            return (
              <div
                key={alert.id}
                className="flex gap-3 rounded-[16px] border border-border bg-surface p-3"
              >
                <div className="size-10 rounded-[12px] bg-surface-2 flex items-center justify-center shrink-0">
                  <Icon className={`size-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-fg">
                      {config.label}
                    </span>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-xs text-subtle hover:text-fg transition-colors"
                      aria-label="Dismiss alert"
                    >
                      Dismiss
                    </button>
                  </div>

                  <p className="text-xs text-muted mt-0.5 truncate">
                    {details}
                    {alert.senderName && !alert.message?.includes(alert.senderName)
                      ? ` · ${alert.senderName}`
                      : ''}
                  </p>

                  <div className="text-xs text-subtle mt-1 font-mono flex items-center gap-1.5 flex-wrap">
                    <span>
                      {alert.ttlHops ?? 1} {alert.ttlHops === 1 ? 'hop' : 'hops'}
                    </span>
                    <span>·</span>
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                    {alert.lat !== 0 && alert.lng !== 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
