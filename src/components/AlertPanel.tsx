'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  PackageX,
  Users,
  CheckCircle,
  X,
  Clock,
  MapPin,
} from 'lucide-react';
import { Alert, AlertType } from '@/types';

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onClear: () => void;
}

const alertConfig: Record<
  AlertType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  [AlertType.CROWD_RISK]: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    label: 'Crowd Risk',
  },
  [AlertType.SOS_HELP]: {
    icon: ShieldAlert,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    label: 'SOS Emergency',
  },
  [AlertType.THEFT]: {
    icon: PackageX,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    label: 'Theft Report',
  },
  [AlertType.VOLUNTEER_REQUEST]: {
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    label: 'Volunteer Needed',
  },
  [AlertType.VOLUNTEER_RESPONSE]: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    label: 'Volunteer Responding',
  },
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function AlertPanel({
  alerts,
  onDismiss,
  onClear,
}: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <ShieldAlert className="w-10 h-10 text-guardian-border mx-auto mb-2" />
        <p className="text-sm text-guardian-muted">No alerts yet</p>
        <p className="text-xs text-guardian-muted/60 mt-1">
          Alerts from your device and the mesh network will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-guardian-muted uppercase tracking-wider">
          Alerts ({alerts.length})
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-guardian-muted hover:text-guardian-text transition-colors"
        >
          Clear all
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              className={`${config.bg} border rounded-xl p-3 flex items-start gap-3`}
            >
              <div className={`mt-0.5 ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  {alert.senderName && (
                    <span className="text-xs text-guardian-muted">
                      from {alert.senderName}
                    </span>
                  )}
                </div>
                {alert.message && (
                  <p className="text-xs text-guardian-muted mt-0.5 truncate">
                    {alert.message}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-guardian-muted/70">
                    <Clock className="w-3 h-3" />
                    {timeAgo(alert.timestamp)}
                  </span>
                  {alert.lat !== 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-guardian-muted/70">
                      <MapPin className="w-3 h-3" />
                      {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-guardian-muted/50 hover:text-guardian-text transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
