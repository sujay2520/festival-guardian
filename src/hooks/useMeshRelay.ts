'use client';
import { useState, useEffect, useCallback } from 'react';
import { Peer, RELAY_CHANNEL_NAME } from '@/types';
import { meshRelay } from '@/lib/mesh-relay';

const INITIAL_PEERS: Peer[] = [
  {
    id: 'peer-gate-2',
    name: 'Guardian-Gate2 (Volunteer)',
    connectedAt: Date.now() - 1000 * 60 * 15,
    lastSeen: Date.now(),
    isVolunteer: true,
  },
  {
    id: 'peer-iqoo-108',
    name: 'iQOO-Node-108 (Ops)',
    connectedAt: Date.now() - 1000 * 60 * 22,
    lastSeen: Date.now(),
    isVolunteer: false,
  },
  {
    id: 'peer-medic-c',
    name: 'Medic-Priya (Zone C)',
    connectedAt: Date.now() - 1000 * 60 * 8,
    lastSeen: Date.now(),
    isVolunteer: true,
  },
];

export function useMeshRelay() {
  const [isActive, setIsActive] = useState(false);
  const [peers, setPeers] = useState<Peer[]>(INITIAL_PEERS);
  const [peerCount, setPeerCount] = useState(INITIAL_PEERS.length);

  useEffect(() => {
    meshRelay.start();
    setIsActive(true);

    let peerChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      peerChannel = new BroadcastChannel(RELAY_CHANNEL_NAME + '-peers');
      peerChannel.onmessage = (event) => {
        const { type, peer } = event.data;
        if (type === 'join') {
          setPeers((prev) => {
            if (prev.some((p) => p.id === peer.id)) return prev;
            return [...prev, peer];
          });
        } else if (type === 'leave') {
          setPeers((prev) => prev.filter((p) => p.id !== peer.id));
        }
      };

      peerChannel.postMessage({
        type: 'join',
        peer: {
          id: meshRelay.getPeerId(),
          name: `Guardian-${meshRelay.getPeerId().slice(-4)}`,
          connectedAt: Date.now(),
          lastSeen: Date.now(),
          isVolunteer: false,
        },
      });
    }

    return () => {
      if (peerChannel) {
        peerChannel.postMessage({
          type: 'leave',
          peer: { id: meshRelay.getPeerId() },
        });
        peerChannel.close();
      }
      meshRelay.stop();
      setIsActive(false);
      setPeers([]);
    };
  }, []);

  useEffect(() => {
    setPeerCount(peers.length);
  }, [peers]);

  const stopRelay = useCallback(() => {
    meshRelay.stop();
    setIsActive(false);
    setPeers([]);
  }, []);

  return { isActive, peers, peerCount, stopRelay };
}
