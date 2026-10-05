// ─── Alert Types ───────────────────────────────────────────
export enum AlertType {
  CROWD_RISK = "CROWD_RISK",
  SOS_HELP = "SOS_HELP",
  THEFT = "THEFT",
  VOLUNTEER_REQUEST = "VOLUNTEER_REQUEST",
  VOLUNTEER_RESPONSE = "VOLUNTEER_RESPONSE",
}

export interface Alert {
  id: string;
  type: AlertType;
  lat: number;
  lng: number;
  timestamp: number;
  message?: string;
  riskScore?: number;
  senderName?: string;
  ttlHops: number;
}

// ─── Risk Types ────────────────────────────────────────────
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
}

export interface RiskData {
  score: number;
  personCount: number;
  density: number;
  flowRate: number;
  level: "safe" | "caution" | "warning" | "danger" | "critical";
  timestamp: number;
}

// ─── Peer Types ────────────────────────────────────────────
export interface Peer {
  id: string;
  name: string;
  connectedAt: number;
  lastSeen: number;
  isVolunteer: boolean;
}

// ─── Relay Message Types ───────────────────────────────────
export interface RelayMessage {
  type: "ALERT" | "PEER_ANNOUNCE" | "PEER_LEAVE" | "VOLUNTEER_ACK";
  payload: Alert | Peer | string;
  senderId: string;
  timestamp: number;
}

export type DemoScenario = 'off' | 'safe' | 'surge' | 'critical';

// ─── App State ─────────────────────────────────────────────
export interface AppState {
  riskData: RiskData;
  alerts: Alert[];
  peers: Peer[];
  isCameraActive: boolean;
  isRelayActive: boolean;
  userName: string;
}

// ─── Constants ─────────────────────────────────────────────
export const MAX_SAFE_DENSITY = 4.0; // people per m² (NFPA crowd safety threshold)
export const MAX_FLOW = 2.0;         // max flow rate for scoring
export const RISK_THRESHOLDS = {
  safe: 25,
  caution: 50,
  warning: 70,
  danger: 85,
  critical: 100,
} as const;

export const RELAY_CHANNEL_NAME = "festival-guardian-relay";
export const MAX_ALERT_HISTORY = 50;
export const DETECTION_INTERVAL_MS = 300; // throttle inference to ~3fps
export const FRAME_BUFFER_SIZE = 10;      // rolling window for scoring
