'use client';
import { useState, useCallback, useEffect } from 'react';
import { Alert, MAX_ALERT_HISTORY } from '@/types';
import { meshRelay } from '@/lib/mesh-relay';
import { deliverAlert } from '@/lib/delivery-bridge';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

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
