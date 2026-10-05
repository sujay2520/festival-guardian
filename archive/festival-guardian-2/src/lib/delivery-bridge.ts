import { Alert, AlertType } from '@/types';

export async function deliverAlert(alert: Alert): Promise<void> {
  await sendBrowserNotification(alert);
  triggerHapticFeedback(alert);
  playAlertSound(alert);
}

async function sendBrowserNotification(alert: Alert): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const titles: Record<AlertType, string> = {
      [AlertType.CROWD_RISK]: '⚠️ Crowd Density Alert',
      [AlertType.SOS_HELP]: '🆘 SOS Emergency!',
      [AlertType.THEFT]: '🚨 Theft Alert!',
      [AlertType.VOLUNTEER_REQUEST]: '🙋 Volunteer Needed',
      [AlertType.VOLUNTEER_RESPONSE]: '✅ Volunteer Responding',
    };

    new Notification(titles[alert.type], {
      body:
        alert.message ||
        `Alert at ${new Date(alert.timestamp).toLocaleTimeString()}`,
      icon: '/favicon.svg',
      tag: alert.id,
    });
  }
}

function triggerHapticFeedback(alert: Alert): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;

  switch (alert.type) {
    case AlertType.SOS_HELP:
      navigator.vibrate([300, 100, 300, 100, 300]);
      break;
    case AlertType.THEFT:
      navigator.vibrate([200, 50, 200]);
      break;
    case AlertType.CROWD_RISK:
      navigator.vibrate([100, 50, 100]);
      break;
    default:
      navigator.vibrate(100);
  }
}

function playAlertSound(alert: Alert): void {
  try {
    if (typeof window === 'undefined') return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const isUrgent =
      alert.type === AlertType.SOS_HELP || alert.type === AlertType.THEFT;
    oscillator.frequency.value = isUrgent ? 880 : 440;
    oscillator.type = isUrgent ? 'sawtooth' : 'sine';

    gainNode.gain.value = 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio context may not be available
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied' as NotificationPermission);
  }
  return Notification.requestPermission();
}
