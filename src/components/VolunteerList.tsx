'use client';

import { useEffect, useRef, useState } from 'react';
import { Peer, RELAY_CHANNEL_NAME } from '@/types';

interface VolunteerListProps {
  peers: Peer[];
  isRelayActive: boolean;
}

function getPeerRole(peer: Peer): string {
  if (peer.name.includes('(Ops)')) return 'Operations Coordinator';
  if (peer.name.includes('Medic')) return 'Medical Responder';
  if (peer.isVolunteer) return 'Volunteer Responder';
  return 'Mesh Relay Node';
}

export default function VolunteerList({
  peers,
  isRelayActive,
}: VolunteerListProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    let alertChannel: BroadcastChannel | null = null;
    let peerChannel: BroadcastChannel | null = null;

    try {
      alertChannel = new BroadcastChannel(RELAY_CHANNEL_NAME);
      alertChannel.onmessage = (event) => {
        const type = event.data?.type || 'PACKET';
        const sender = event.data?.senderId || 'peer-unknown';
        setEventLogs((prev) => [
          ...prev.slice(-20),
          `Relay packet received: [${type}] from ${sender}`,
        ]);
      };

      peerChannel = new BroadcastChannel(`${RELAY_CHANNEL_NAME}-peers`);
      peerChannel.onmessage = (event) => {
        const { type, peer } = event.data || {};
        if (type === 'join' && peer?.name) {
          setEventLogs((prev) => [
            ...prev.slice(-20),
            `Peer joined mesh: ${peer.name} (${peer.id})`,
          ]);
        } else if (type === 'leave' && peer?.id) {
          setEventLogs((prev) => [
            ...prev.slice(-20),
            `Peer departed mesh: ${peer.id}`,
          ]);
        }
      };
    } catch {
      // BroadcastChannel unsupported or blocked
    }

    return () => {
      alertChannel?.close();
      peerChannel?.close();
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [peers, eventLogs, isRelayActive]);

  return (
    <div className="w-full">
      <div>
        <h2 className="font-display text-lg font-semibold text-fg">Mesh relay</h2>
        <p className="mt-1 text-sm text-muted">
          Local simulation of phone-to-phone hops. Production maps to Nearby Connections.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {peers.length === 0 ? (
          <div className="flex items-center justify-center rounded-[16px] border border-border bg-surface px-3 py-4 text-xs text-muted">
            No peers in range. Open another tab or window to simulate a hop.
          </div>
        ) : (
          peers.map((peer) => {
            const isRecent = Boolean(
              isRelayActive &&
                (peer.lastSeen ? Date.now() - peer.lastSeen < 180000 : true)
            );
            return (
              <div
                key={peer.id}
                className="flex items-center gap-3 rounded-[16px] border border-border bg-surface px-3 py-3"
              >
                <span
                  className={`size-2.5 rounded-full shrink-0 ${
                    isRecent ? 'bg-safe' : 'bg-subtle'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-fg truncate">
                    {peer.name}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {getPeerRole(peer)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        ref={terminalRef}
        className="mt-4 max-h-48 overflow-y-auto rounded-[16px] border border-border bg-surface p-3 font-mono text-[11px] leading-5 text-muted"
      >
        <div>Relay channel: festival-guardian-relay</div>
        <div>BroadcastChannel active: {String(isRelayActive)}</div>
        <div>Transport: phone-to-phone hops (Nearby Connections simulation)</div>
        {peers.map((peer) => (
          <div key={peer.id}>
            Peer connected: {peer.name} ({peer.id})
          </div>
        ))}
        {eventLogs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
        {peers.length === 0 && (
          <div>Listening for peer broadcasts on frequency...</div>
        )}
      </div>
    </div>
  );
}
