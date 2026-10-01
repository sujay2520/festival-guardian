'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Radio, UserCheck, Clock } from 'lucide-react';
import { Peer } from '@/types';

interface VolunteerListProps {
  peers: Peer[];
  isRelayActive: boolean;
}

function timeSince(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export default function VolunteerList({
  peers,
  isRelayActive,
}: VolunteerListProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-guardian-accent" />
          <h3 className="text-sm font-semibold">Mesh Network</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isRelayActive ? 'bg-guardian-green animate-pulse' : 'bg-guardian-muted'
            }`}
          />
          <span className="text-xs font-medium text-guardian-green">
            {isRelayActive ? 'Active (Simulated Relay)' : 'Inactive'}
          </span>
        </div>
      </div>

      {peers.length === 0 ? (
        <div className="text-center py-6">
          <Radio className="w-8 h-8 text-guardian-border mx-auto mb-2 animate-pulse" />
          <p className="text-xs text-guardian-muted">
            Scanning for nearby guardians...
          </p>
          <p className="text-[10px] text-guardian-muted/60 mt-1">
            Open this app in another tab to connect
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {peers.map((peer) => (
              <motion.div
                key={peer.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-guardian-bg/50 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-guardian-accent/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-guardian-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{peer.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-guardian-muted/60" />
                    <span className="text-[10px] text-guardian-muted/60">
                      Connected {timeSince(peer.connectedAt)}
                    </span>
                  </div>
                </div>
                {peer.isVolunteer && (
                  <span className="text-[10px] bg-guardian-green/20 text-guardian-green px-2 py-0.5 rounded-full">
                    Volunteer
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="text-center pt-2">
            <p className="text-[10px] text-guardian-muted/50">
              {peers.length} guardian{peers.length !== 1 ? 's' : ''} connected
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
