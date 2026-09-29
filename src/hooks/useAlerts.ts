'use client';
import { useState, useCallback, useEffect } from 'react';
import { Alert, AlertType, MAX_ALERT_HISTORY } from '@/types';
import { meshRelay } from '@/lib/mesh-relay';
import { deliverAlert } from '@/lib/delivery-bridge';

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'demo-alert-1',
    type: AlertType.CROWD_RISK,
    lat: 12.9716,
    lng: 77.5946,
    timestamp: Date.now() - 1000 * 60 * 4,
    message: 'Gate 3 ingress surged: 4.2 people/m² (Caution)',
    riskScore: 68,
    senderName: 'iQOO-Node-Gate3',
    ttlHops: 4,
  },
  {
    id: 'demo-alert-2',
    type: AlertType.VOLUNTEER_REQUEST,
    lat: 12.9721,
    lng: 77.5952,
    timestamp: Date.now() - 1000 * 60 * 12,
    message: 'First Aid Volunteer needed near East Food Court',
    senderName: 'Volunteer-Priya',
    ttlHops: 5,
  },
];

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  useEffect(() => {
    const unsubscribe = meshRelay.onAlert((alert) => {
      setAlerts((prev) => {
        if (prev.some((a) => a.id === alert.id)) return prev;
        const updated = [alert, ...prev];
        if (updated.length > MAX_ALERT_HISTORY) updated.pop();
        return updated;
      });
      deliverAlert(alert);
    });

    return unsubscribe;
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => {
      if (prev.some((a) => a.id === alert.id)) return prev;
      const updated = [alert, ...prev];
      if (updated.length > MAX_ALERT_HISTORY) updated.pop();
      return updated;
    });

    meshRelay.sendAlert(alert);
    deliverAlert(alert);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, addAlert, clearAlerts, dismissAlert };
}
