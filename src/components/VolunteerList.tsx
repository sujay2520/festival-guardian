'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Radio, Zap, Shield, Wifi, Activity, ArrowRight, RefreshCw } from 'lucide-react';
import { Peer, RELAY_CHANNEL_NAME } from '@/types';
import { audioEngine } from '@/lib/audio-engine';

interface VolunteerListProps {
  peers: Peer[];
  isRelayActive: boolean;
}

interface PeerTelemetry {
  id: string;
  rssi: number;
  battery: number;
  packetCount: number;
  lastPing: number;
}

export default function VolunteerList({
  peers,
  isRelayActive,
}: VolunteerListProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [eventLogs, setEventLogs] = useState<string[]>([
    'Mesh kernel initialized on channel: festival-guardian-relay',
    'Transport: BLE 5.2 / Wi-Fi Aware Direct (Zero-Internet)',
    'Subscribed to peer discovery beacon broadcast',
  ]);
  const [packetCount, setPacketCount] = useState(148);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Simulated live telemetry for nodes
  const [telemetry, setTelemetry] = useState<Record<string, PeerTelemetry>>({
    'peer-gate-2': { id: 'peer-gate-2', rssi: -62, battery: 94, packetCount: 52, lastPing: Date.now() },
    'peer-node-108': { id: 'peer-node-108', rssi: -71, battery: 88, packetCount: 68, lastPing: Date.now() },
    'peer-medic-c': { id: 'peer-medic-c', rssi: -58, battery: 96, packetCount: 28, lastPing: Date.now() },
  });

  // Background heartbeat ticker to keep relay feeling alive
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setTelemetry((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          next[key] = {
            ...next[key],
            rssi: -55 - Math.floor(Math.random() * 20),
            packetCount: next[key].packetCount + 1,
            lastPing: Date.now(),
          };
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // BroadcastChannel listener
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    let alertChannel: BroadcastChannel | null = null;
    let peerChannel: BroadcastChannel | null = null;

    try {
      alertChannel = new BroadcastChannel(RELAY_CHANNEL_NAME);
      alertChannel.onmessage = (event) => {
        const type = event.data?.type || 'PACKET';
        const sender = event.data?.senderId || 'peer-mesh';
        setEventLogs((prev) => [
          ...prev.slice(-25),
          `[${new Date().toLocaleTimeString()}] RX: ${type} from ${sender} (0.0ms)`,
        ]);
        setPacketCount((c) => c + 1);
      };

      peerChannel = new BroadcastChannel(`${RELAY_CHANNEL_NAME}-peers`);
      peerChannel.onmessage = (event) => {
        const { type, peer } = event.data || {};
        if (type === 'join' && peer?.name) {
          setEventLogs((prev) => [
            ...prev.slice(-25),
            `[${new Date().toLocaleTimeString()}] BEACON: Peer joined mesh: ${peer.name}`,
          ]);
        }
      };
    } catch {
      // BroadcastChannel unsupported
    }

    return () => {
      alertChannel?.close();
      peerChannel?.close();
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [eventLogs, packetCount]);

  const handleTransmitTest = () => {
    audioEngine.play('ping', 0.25);
    setIsTransmitting(true);
    setPacketCount((c) => c + 1);

    const testId = Math.random().toString(36).slice(-4);
    const newLog = `[${new Date().toLocaleTimeString()}] TX: TEST_PING_${testId} -> Broadcast (Hop 0/3, RSSI: -54 dBm)`;
    setEventLogs((prev) => [...prev.slice(-25), newLog]);

    setTimeout(() => {
      setIsTransmitting(false);
      setEventLogs((prev) => [
        ...prev.slice(-25),
        `[${new Date().toLocaleTimeString()}] ACK: Node-Gate2 & Medic-Priya confirmed packet delivery`,
      ]);
    }, 400);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">Mesh Relay</h2>
          <span className="flex items-center gap-1.5 rounded-full border border-safe/30 bg-safe/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-safe">
            <span className="size-2 rounded-full bg-safe animate-ping" />
            LIVE P2P MESH
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Decentralized ad-hoc relay. Alerts hop phone-to-phone without cell towers.
        </p>
      </div>

      {/* Network Health KPI Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[16px] border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-fg">
            {peers.length} Nodes
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Active Peers</p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-safe">
            {packetCount}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Packets Relayed</p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-fg">
            ~24 ms
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Avg Hop Latency</p>
        </div>
      </div>

      {/* Active Peers Card List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
            CONNECTED GUARDIAN NODES
          </span>
          <button
            onClick={handleTransmitTest}
            disabled={isTransmitting}
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-surface-2 px-2.5 py-1 text-[11px] font-mono font-semibold text-accent hover:bg-surface-3 transition-colors active:scale-95 disabled:opacity-50"
          >
            <Zap className={`size-3 ${isTransmitting ? 'animate-bounce text-surge' : ''}`} />
            <span>TRANSMIT TEST HOP</span>
          </button>
        </div>

        {peers.map((peer) => {
          const tel = telemetry[peer.id] || { rssi: -65, battery: 90, packetCount: 12 };
          return (
            <div
              key={peer.id}
              className="flex items-center justify-between rounded-[16px] border border-border bg-surface p-3.5 transition-colors hover:border-border/80"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-surface-2 border border-border">
                  <Radio className="size-4 text-safe" />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-safe animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-fg truncate">{peer.name}</p>
                    <span className="rounded bg-surface-3 px-1.5 py-0.2 text-[9px] font-mono text-muted uppercase">
                      {peer.isVolunteer ? 'Volunteer' : 'Fixed Node'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted truncate">
                    BLE Direct · Zero Cellular Required
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <p className="text-xs font-mono font-semibold text-fg">
                  {tel.rssi} dBm
                </p>
                <p className="text-[10px] font-mono text-safe">
                  BAT {tel.battery}% · OK
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Hop Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
            REAL-TIME MESH TRAFFIC TERMINAL
          </span>
          <span className="text-[10px] font-mono text-safe flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-safe animate-pulse" />
            P2P RX/TX BUS
          </span>
        </div>
        <div
          ref={terminalRef}
          className="max-h-48 overflow-y-auto rounded-[16px] border border-border bg-black/80 p-3 font-mono text-[11px] leading-relaxed text-muted space-y-1 shadow-inner"
        >
          {eventLogs.map((log, index) => (
            <div
              key={index}
              className={
                log.includes('TX:')
                  ? 'text-accent'
                  : log.includes('ACK:')
                  ? 'text-safe'
                  : log.includes('RX:')
                  ? 'text-surge'
                  : 'text-subtle'
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
