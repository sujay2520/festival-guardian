'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Users,
  Video,
  Radio,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Send,
  Zap,
  ArrowRight,
  BatteryCharging,
  Wifi,
  Eye,
  Check,
  Megaphone
} from 'lucide-react';
import type { Alert, AlertType, Peer } from '@/types';
import { audioEngine } from '@/lib/audio-engine';
import CctvStreamPlayer, { CctvCameraFeed } from './CctvStreamPlayer';

export interface OrganizerControlRoomProps {
  alerts: Alert[];
  peers: Peer[];
  onDismissAlert: (id: string) => void;
  onClearAlerts: () => void;
  onDispatchVolunteer?: (alertId: string) => void;
  onBroadcastAdvisory?: (message: string) => void;
  onSwitchToFieldNode: () => void;
}

interface VenueZone {
  id: string;
  name: string;
  location: string;
  riskScore: number;
  density: number;
  status: 'SURGE ADVISORY' | 'ELEVATED' | 'OPTIMAL' | 'CLEAR' | 'UNOBSTRUCTED';
  attendeeEstimate: number;
  assignedStation: string;
  cameraId: string;
  trend: string;
}

const VENUE_ZONES: VenueZone[] = [
  {
    id: 'ZONE-A',
    name: 'Gate 3 Ingress Bottleneck',
    location: 'South Perimeter Turnstiles',
    riskScore: 68,
    density: 4.2,
    status: 'SURGE ADVISORY',
    attendeeEstimate: 1420,
    assignedStation: 'Guardian-Gate3',
    cameraId: 'CAM-02',
    trend: '+0.8 p/m² (Surging)',
  },
  {
    id: 'ZONE-B',
    name: 'Main Concert Stage Front',
    location: 'Central Lawn & Pit Barricade',
    riskScore: 54,
    density: 3.4,
    status: 'ELEVATED',
    attendeeEstimate: 4850,
    assignedStation: 'Guardian-Stage7',
    cameraId: 'CAM-01',
    trend: '+0.2 p/m² (Dense)',
  },
  {
    id: 'ZONE-C',
    name: 'Gate 1 Main Entrance',
    location: 'North Ingress Plaza',
    riskScore: 22,
    density: 1.8,
    status: 'OPTIMAL',
    attendeeEstimate: 890,
    assignedStation: 'Guardian-Gate1',
    cameraId: 'CAM-03',
    trend: '-0.3 p/m² (Flowing)',
  },
  {
    id: 'ZONE-D',
    name: 'North Food Court & Water Stations',
    location: 'Hydration Station & Vendor Row',
    riskScore: 14,
    density: 0.9,
    status: 'CLEAR',
    attendeeEstimate: 620,
    assignedStation: 'Guardian-Food4',
    cameraId: 'CAM-03',
    trend: 'Stable · Normal flow',
  },
  {
    id: 'ZONE-E',
    name: 'Emergency Medical Evacuation Lane',
    location: 'Zone C Rapid Evac Corridor',
    riskScore: 8,
    density: 0.3,
    status: 'UNOBSTRUCTED',
    attendeeEstimate: 45,
    assignedStation: 'Medic-Zone-C',
    cameraId: 'CAM-02',
    trend: 'Clear · 100% Flow',
  },
];

export default function OrganizerControlRoom({
  alerts,
  peers,
  onDismissAlert,
  onClearAlerts,
  onDispatchVolunteer,
  onBroadcastAdvisory,
  onSwitchToFieldNode,
}: OrganizerControlRoomProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cctv' | 'queue' | 'mesh'>('overview');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-02');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const cctvRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleDispatch = (alertId: string, nodeName: string) => {
    audioEngine.play('ping', 0.25);
    onDispatchVolunteer?.(alertId);
    showToast(`✅ Dispatched Volunteer Marshal to ${nodeName}!`);
  };

  const handleBroadcast = () => {
    audioEngine.play('sos', 0.3);
    const msg = broadcastMessage.trim() || 'Advisory: Gate 3 attendees, please redirect to East Concourse.';
    onBroadcastAdvisory?.(msg);
    showToast('📢 Mesh Advisory Broadcast Dispatched to All Units!');
    setBroadcastMessage('');
    setIsBroadcastOpen(false);
  };

  const handleViewFeed = (cameraId: string) => {
    audioEngine.play('click', 0.2);
    setSelectedCameraId(cameraId);
    setSelectedTab('cctv');
    setTimeout(() => {
      cctvRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xl border border-white/20 text-center"
          >
            {feedbackToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Advisory Modal */}
      <AnimatePresence>
        {isBroadcastOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-[#0D1117] border border-guardian-cyan/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-guardian-cyan">
                <Megaphone size={18} />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Broadcast Mesh Crowd Advisory
                </h3>
              </div>
              <p className="text-xs text-guardian-muted">
                This packet will be broadcast across all connected volunteer nodes even without cellular service.
              </p>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter advisory (e.g. Redirect Gate 3 queue to Gate 1 East Ingress)..."
                rows={3}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-guardian-cyan"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  className="px-4 py-1.5 rounded-lg bg-guardian-cyan text-black text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Send size={12} /> Broadcast
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Room Master Header */}
      <div className="bg-gradient-to-r from-guardian-card via-[#0F141C] to-guardian-surface border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-guardian-cyan to-blue-600 flex items-center justify-center text-black font-black shadow-md shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-mono font-bold tracking-wider text-white uppercase">
                  Organizer Control Room
                </h2>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono tracking-wider">
                  DISPATCH
                </span>
              </div>
              <p className="text-[11px] text-guardian-muted">
                Aggregate Venue Density · Incident Triage · CCTV Stream Ingestion
              </p>
            </div>
          </div>

          {/* Prominent Switch to People View Button */}
          <button
            onClick={onSwitchToFieldNode}
            className="px-3.5 py-2 rounded-xl bg-[#FF6600]/20 hover:bg-[#FF6600]/30 border border-[#FF6600]/50 text-[#FF6600] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Shield size={14} />
            <span>SWITCH TO PEOPLE VIEW</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Executive Stats Overview (Clean, Responsive, No Overlapping Text) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-white/5">
          {/* Card 1: Venue Density */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted">
              <span className="uppercase tracking-wider">VENUE DENSITY</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ELEVATED
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-white leading-tight">2.6</span>
              <span className="text-xs font-mono text-guardian-muted">p/m²</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted border-t border-white/5 pt-1">
              <span className="text-amber-400 font-semibold">+0.4 p/m² (Gate 3)</span>
              <span>Limit: 4.0 p/m²</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 w-[65%]" />
            </div>
          </div>

          {/* Card 2: Active Volunteer Units */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted">
              <span className="uppercase tracking-wider">VOLUNTEER NODES</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-guardian-cyan leading-tight">
                {peers.length + 1}
              </span>
              <span className="text-xs font-mono text-guardian-muted">Stations</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted border-t border-white/5 pt-1">
              <span className="text-guardian-green font-semibold">Mesh Relay Synced</span>
              <span>~12ms Hop</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-guardian-cyan w-[100%]" />
            </div>
          </div>

          {/* Card 3: Active Incidents */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted">
              <span className="uppercase tracking-wider">ACTIVE INCIDENTS</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                QUEUED
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-red-400 leading-tight">
                {alerts.length}
              </span>
              <span className="text-xs font-mono text-guardian-muted">Alerts</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted border-t border-white/5 pt-1">
              <span className="text-zinc-300">1 Surge · 1 First Aid</span>
              <span>Real-Time</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-red-500 w-[50%]" />
            </div>
          </div>

          {/* Card 4: Primary Bottleneck */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted">
              <span className="uppercase tracking-wider">CHOKEPOINT FOCUS</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ZONE A
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-mono font-bold text-white truncate">
                Gate 3 Ingress
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted border-t border-white/5 pt-1">
              <span className="text-amber-400 font-semibold">Risk: 68/100 (4.2 p/m²)</span>
              <button
                onClick={() => handleViewFeed('CAM-02')}
                className="text-guardian-cyan hover:underline"
              >
                Ingest Feed
              </button>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-amber-500 w-[68%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Room Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-guardian-surface/60 p-1 rounded-xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            selectedTab === 'overview'
              ? 'bg-guardian-cyan text-black shadow-md'
              : 'text-guardian-muted hover:text-white'
          }`}
        >
          <Activity size={13} />
          <span>MULTI-ZONE STATUS</span>
        </button>

        <button
          onClick={() => setSelectedTab('cctv')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            selectedTab === 'cctv'
              ? 'bg-guardian-cyan text-black shadow-md'
              : 'text-guardian-muted hover:text-white'
          }`}
        >
          <Video size={13} />
          <span>CCTV / RTSP FEEDS</span>
          <span className="text-[8px] bg-black/40 text-cyan-200 px-1 py-0.2 rounded font-mono">PHASE 2</span>
        </button>

        <button
          onClick={() => setSelectedTab('queue')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            selectedTab === 'queue'
              ? 'bg-guardian-cyan text-black shadow-md'
              : 'text-guardian-muted hover:text-white'
          }`}
        >
          <ShieldAlert size={13} />
          <span>DISPATCH QUEUE ({alerts.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('mesh')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            selectedTab === 'mesh'
              ? 'bg-guardian-cyan text-black shadow-md'
              : 'text-guardian-muted hover:text-white'
          }`}
        >
          <Radio size={13} />
          <span>MESH TOPOLOGY</span>
        </button>
      </div>

      {/* TAB 1: MULTI-ZONE VENUE STATUS GRID (Properly Aligned, 1 or 2 Columns, No Squeezing) */}
      {selectedTab === 'overview' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                5 Strategic Festival Zones & Chokepoints
              </h3>
              <p className="text-[11px] text-guardian-muted">
                Real-time spatial density telemetry computed by assigned Guardian surveillance nodes
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="text-xs font-mono text-guardian-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Send size={11} /> Broadcast Crowd Advisory
            </button>
          </div>

          {/* Responsive 1-Column or 2-Column Grid (Ensures full readability on any screen size) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VENUE_ZONES.map((zone) => (
              <div
                key={zone.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  zone.status === 'SURGE ADVISORY'
                    ? 'bg-gradient-to-br from-red-950/30 via-guardian-card to-guardian-surface border-red-500/40 shadow-lg'
                    : zone.status === 'ELEVATED'
                    ? 'bg-gradient-to-br from-amber-950/20 via-guardian-card to-guardian-surface border-amber-500/30'
                    : 'bg-guardian-card border-white/10 hover:border-white/20'
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-guardian-muted">
                        {zone.id}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {zone.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-guardian-muted mt-0.5">
                      {zone.location}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      zone.status === 'SURGE ADVISORY'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : zone.status === 'ELEVATED'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>

                {/* Risk Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted">
                    <span>CROWD RISK INDEX</span>
                    <span className="font-bold text-white">{zone.riskScore} / 100</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        zone.riskScore >= 65
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : zone.riskScore >= 40
                          ? 'bg-gradient-to-r from-green-500 to-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(zone.riskScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-1.5 px-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-guardian-muted block">DENSITY</span>
                    <strong className="text-white text-xs">{zone.density}</strong> <span className="text-[9px] text-zinc-400">p/m²</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-guardian-muted block">ATTENDEES</span>
                    <strong className="text-white text-xs">~{zone.attendeeEstimate.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-guardian-muted block">STATION</span>
                    <span className="text-guardian-cyan text-[10px] truncate block">{zone.assignedStation}</span>
                  </div>
                </div>

                {/* Bottom Row: Trend and View CCTV Feed */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                  <span className="text-guardian-muted text-[10px]">{zone.trend}</span>
                  <button
                    onClick={() => handleViewFeed(zone.cameraId)}
                    className="text-xs font-mono font-bold text-guardian-cyan hover:underline flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30"
                  >
                    <Eye size={13} />
                    <span>VIEW CCTV ({zone.cameraId})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VENUE CCTV / RTSP STREAMS */}
      {selectedTab === 'cctv' && (
        <div ref={cctvRef} className="space-y-3">
          <CctvStreamPlayer selectedCameraId={selectedCameraId} />
        </div>
      )}

      {/* TAB 3: ACTIVE DISPATCH QUEUE */}
      {selectedTab === 'queue' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Incoming Mesh Incident Queue ({alerts.length})
              </h3>
              <p className="text-[11px] text-guardian-muted">
                Emergency packets relayed by volunteer nodes across the festival grounds
              </p>
            </div>
            {alerts.length > 0 && (
              <button
                onClick={onClearAlerts}
                className="text-xs font-mono text-guardian-muted hover:text-white"
              >
                Clear all
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="bg-guardian-card border border-white/10 rounded-2xl p-8 text-center">
              <CheckCircle size={32} className="text-guardian-green mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">All Clear · Zero Active Incidents</h4>
              <p className="text-xs text-guardian-muted mt-1">
                Emergency packets broadcasted by volunteer nodes or CCTV cameras will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-guardian-card border border-white/10 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          {alert.type}
                        </span>
                        <p className="text-xs text-zinc-300 mt-0.5">{alert.message || 'Immediate action required'}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-guardian-muted border border-white/5 shrink-0">
                      TTL: {alert.ttlHops} hops
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-guardian-muted">
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-guardian-cyan" />
                      <span>{alert.senderName || 'Guardian-Node'}</span>
                      <span>•</span>
                      <span>{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDispatch(alert.id, alert.senderName || 'Gate 3')}
                        className="px-2.5 py-1 rounded-lg bg-guardian-cyan hover:bg-[#38bdf8] text-black font-bold font-mono text-[10px] transition-colors flex items-center gap-1"
                      >
                        <Zap size={11} /> DISPATCH VOLUNTEER
                      </button>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] transition-colors"
                      >
                        RESOLVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MESH RELAY TOPOLOGY */}
      {selectedTab === 'mesh' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Mesh Relay Topology & Volunteer Stations
              </h3>
              <p className="text-[11px] text-guardian-muted">
                Off-grid communication cluster routing packets node-to-node
              </p>
            </div>
            <span className="text-[10px] font-mono text-guardian-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
              PEER-TO-PEER CLUSTER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Local Coordinator Node */}
            <div className="bg-gradient-to-br from-guardian-cyan/10 to-guardian-card border border-guardian-cyan/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-guardian-cyan">CENTRAL DISPATCH (THIS CONSOLE)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-guardian-cyan/20 text-guardian-cyan">
                  COORDINATOR
                </span>
              </div>
              <p className="text-xs text-zinc-300">Station: Main Operations Command Center</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted pt-1 border-t border-white/5">
                <span className="flex items-center gap-1"><Wifi size={11} className="text-guardian-green" /> Direct Fiber / LAN</span>
                <span className="text-emerald-400 font-bold">100% ONLINE</span>
              </div>
            </div>

            {/* Field Nodes */}
            {peers.map((peer, idx) => (
              <div
                key={peer.id}
                className="bg-guardian-card border border-white/10 rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{peer.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5">
                    {peer.isVolunteer ? 'VOLUNTEER PATROL' : 'GATE SURVEILLANCE'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Sector: {idx === 0 ? 'Gate 3 Ingress' : idx === 1 ? 'Gate 1 Plaza' : 'Medical Tent'}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-guardian-muted pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Radio size={11} className="text-guardian-cyan" /> 1 Hop Distance
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <BatteryCharging size={11} className="text-green-400" /> {96 - idx * 4}% BATTERY
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
