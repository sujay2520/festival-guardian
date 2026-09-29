import { Alert, RelayMessage, RELAY_CHANNEL_NAME, MAX_ALERT_HISTORY } from '@/types';

type AlertHandler = (alert: Alert) => void;

class MeshRelay {
  private channel: BroadcastChannel | null = null;
  private seenAlertIds = new Set<string>();
  private handlers: AlertHandler[] = [];
  private peerId: string;
  private _isActive = false;

  constructor() {
    this.peerId = `peer-${Math.random().toString(36).substring(2, 9)}`;
  }

  start(): void {
    if (this._isActive || typeof BroadcastChannel === 'undefined') return;

    this.channel = new BroadcastChannel(RELAY_CHANNEL_NAME);
    this.channel.onmessage = (event: MessageEvent<RelayMessage>) => {
      this.handleMessage(event.data);
    };
    this._isActive = true;

    this.broadcast({
      type: 'PEER_ANNOUNCE',
      payload: this.peerId,
      senderId: this.peerId,
      timestamp: Date.now(),
    });

    console.log(`[MeshRelay] Started with peer ID: ${this.peerId}`);
  }

  stop(): void {
    if (this.channel) {
      this.broadcast({
        type: 'PEER_LEAVE',
        payload: this.peerId,
        senderId: this.peerId,
        timestamp: Date.now(),
      });
      this.channel.close();
      this.channel = null;
    }
    this._isActive = false;
  }

  onAlert(handler: AlertHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  sendAlert(alert: Alert): void {
    if (!this._isActive) return;

    this.seenAlertIds.add(alert.id);
    this.trimSeenCache();

    this.broadcast({
      type: 'ALERT',
      payload: alert,
      senderId: this.peerId,
      timestamp: Date.now(),
    });
  }

  private handleMessage(message: RelayMessage): void {
    if (message.senderId === this.peerId) return;

    if (message.type === 'ALERT') {
      const alert = message.payload as Alert;

      if (this.seenAlertIds.has(alert.id)) return;
      this.seenAlertIds.add(alert.id);
      this.trimSeenCache();

      this.handlers.forEach((h) => h(alert));

      if (alert.ttlHops > 0) {
        const relayed = { ...alert, ttlHops: alert.ttlHops - 1 };
        this.broadcast({
          type: 'ALERT',
          payload: relayed,
          senderId: this.peerId,
          timestamp: Date.now(),
        });
      }
    }
  }

  private broadcast(message: RelayMessage): void {
    try {
      this.channel?.postMessage(message);
    } catch (e) {
      console.error('[MeshRelay] Broadcast failed:', e);
    }
  }

  private trimSeenCache(): void {
    if (this.seenAlertIds.size > MAX_ALERT_HISTORY * 2) {
      const arr = Array.from(this.seenAlertIds);
      this.seenAlertIds = new Set(arr.slice(arr.length - MAX_ALERT_HISTORY));
    }
  }

  getPeerId(): string {
    return this.peerId;
  }

  getIsActive(): boolean {
    return this._isActive;
  }
}

export const meshRelay = new MeshRelay();
