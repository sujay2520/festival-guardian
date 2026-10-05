# 🛡️ Festival Guardian
> **Predict. Respond. Relay.**  
> *An organizer-deployed edge intelligence and decentralized mesh network for crowd stampede prevention, incident dispatch, and offline safety telemetry.*

[![Live Prototype](https://img.shields.io/badge/Production_App-festival--guardian.vercel.app-FF6600?style=for-the-badge&logo=vercel)](https://festival-guardian.vercel.app)
[![Main Repo](https://img.shields.io/badge/Main_Repository-sujay2520%2Ffestival--guardian-cyan?style=for-the-badge&logo=github)](https://github.com/sujay2520/festival-guardian)
[![Team](https://img.shields.io/badge/Team-Falling_Stars-amber?style=for-the-badge)](https://iqoo.reskilll.com/dashboard/iqoo-finale)

---

## 📌 Problem Statement

Mass gatherings—including major religious festivals (e.g., Kumbh Mela, Puri Rath Yatra, Tirupati), stadium concerts, and transit corridors—are uniquely vulnerable to crowd crushes and stampedes. Dangerous crowd turbulence develops gradually at narrow chokepoints, gate barricades, and corridor bottlenecks. By the time visual panic is apparent to humans, crowd compression is often fatal.

Exacerbating this, ultra-dense congregations inevitably cause local cellular base stations (eNodeB/gNodeB) to saturate. Mobile towers face severe uplink/downlink congestion, causing standard cellular voice calls, SMS, and internet-based emergency dispatch apps to fail entirely at the moment of crisis.

Most conventional crowd safety apps operate on an unrealistic premise: expecting frightened attendees in a high-density surge to unlock smartphones, open an app, and report incidents. 

**Festival Guardian** solves this from the organizer's operational perspective. It is an edge-deployed surveillance and decentralized communication framework: Guardian Nodes are stationed at critical chokepoints and operated by staff/volunteers or integrated directly with existing venue CCTV infrastructure. If cellular infrastructure collapses, safety alerts hop node-to-node across a local peer-to-peer mesh until reaching dispatch commanders.

---

## 👥 Dual-Persona Architecture

Festival Guardian is engineered around two distinct operational personas designed to bridge ground-level situational awareness with tactical command dispatch:

```mermaid
flowchart TD
    subgraph Ground["Field Guardian Node (Gate / Chokepoint)"]
        Cam["Mobile Camera / Tripod Mount"] --> TF["On-Device Vision AI (TF.js / WebGL)"]
        TF --> Scorer["Density & Flow Scorer (NFPA 101 / Fruin LOS F)"]
        Scorer --> Threshold{"Risk >= 85 (Critical)?"}
        Threshold -- "Auto-Trigger" --> Bus["Typed Alert Bus"]
        SOS["Tactile SOS (0.8s Hold) / Theft / Volunteer Buttons"] --> Bus
        Bus --> MeshEngine["Offline Mesh Relay Engine"]
    end

    subgraph MeshTransport["Decentralized P2P Transport (Offline Resilient)"]
        MeshEngine -->|"Broadcast Alert (TTL=5)"| NodeA["Neighbor Guardian Node A"]
        NodeA -->|"Relay Hop (TTL=4)"| NodeB["Neighbor Guardian Node B"]
        NodeB -->|"Relay Hop (TTL=3)"| Gateway["Edge Gateway / Connected Node"]
    end

    subgraph CommandHQ["Organizer Control Room (Command Center)"]
        Gateway --> Hub["Central Dispatch & Telemetry Engine"]
        CCTV["Venue CCTV / RTSP Cameras"] --> WebRTCGW["WebRTC / RTSP Edge Ingestion"]
        WebRTCGW --> CCTVInference["Centralized Stream AI Vision"]
        CCTVInference --> Map["Multi-Zone Density Map & Heatmap"]
        Hub --> Map
        Hub --> Queue["Incident Dispatch Queue (Hop Telemetry, GPS, Time)"]
        Queue --> ResponseSquad["Dispatch First-Responders & Gate Marshals"]
    end
```

### 1. Field Guardian Node (Volunteer / Staff at Gates)
* **Target Users**: On-ground event volunteers, gate marshals, corridor security personnel stationed at ingress/egress points, turnstiles, and narrow barricaded walkways.
* **On-Device Vision AI**: Executes real-time object detection directly on the device GPU (TensorFlow.js WebGL pipeline) at ~3 FPS with zero cloud round-trips. Privacy is preserved as video frames never leave the device.
* **Local Density & Flow Scoring**: Computes continuous crowd density ($\text{people}/\text{m}^2$) and flow rate differential ($\Delta\text{flow}$), mapping telemetry into a 0–100 calibrated risk index.
* **Fail-Safe Tactile Incident Actions**:
  * **Emergency SOS**: Requires a deliberate 0.8-second hold-to-activate trigger, preventing accidental triggers in packed or jostling environments.
  * **Theft Incident Reporting**: Instant one-tap logging for localized criminal activity.
  * **Volunteer Assistance Request**: Dispatches peer assistance to relieve bottlenecks or provide first aid.
* **Offline Mesh Broadcast**: Emits typed, cryptographically stamped alert packets with Time-to-Live (TTL) hop counters over the local peer mesh, completely bypassing cellular networks.

### 2. Organizer Control Room (Command Center / Dispatch)
* **Target Users**: Event operations directors, police watch commanders, medical triage supervisors, and stadium security officers.
* **Aggregate Multi-Zone Density Map**: Synthesizes real-time telemetry from all distributed Guardian Nodes into an intuitive bird's-eye map. Zones are dynamically color-coded by risk status (🟢 Safe, 🟡 Caution, 🟠 Warning, 🔴 Danger/Critical).
* **Incident Dispatch Queue with Hop Telemetry**: Centralized triage table recording every inbound alert packet. Tracks originating node identifier, precise GPS coordinates, transit latency, and hop count history (`ttlHops` remaining vs. initial), allowing dispatchers to trace alert pathways across dark zones.
* **Live Venue CCTV / RTSP Camera Ingestion**: Integrates stationary stadium and perimeter cameras into the identical vision pipeline, enabling operators to monitor blind spots without requiring dedicated personnel at every post.

---

## 📹 CCTV / RTSP Ingestion Architecture (Phase 2 Roadmap)

Large-scale venues (cricket stadiums, festival arenas, temple complexes) rarely require purchasing hundreds of dedicated mobile phones for monitoring. Instead, these facilities are already wired with dozens of high-mounted, pan-tilt-zoom (PTZ) IP surveillance cameras.

Festival Guardian introduces a zero-hardware-cost ingestion framework that turns existing venue surveillance cameras into autonomous Guardian Nodes:

```mermaid
flowchart LR
    subgraph VenueInfra["Existing Venue Infrastructure (Zero New Hardware)"]
        CAM1["Gate 1 IP Camera (RTSP)"]
        CAM2["Corridor B ONVIF Dome"]
        CAM3["North Plaza PTZ Camera"]
    end

    subgraph IngestionGW["WebRTC Edge Gateway (Local Server / NVR)"]
        RTSPIn["RTSP / ONVIF Demuxer"]
        Transcode["H.264 / H.265 HW Passthrough"]
        WebRTCSrv["WebRTC Media Server (go2rtc / MediaSoup / Janus)"]
        RTSPIn --> Transcode --> WebRTCSrv
    end

    subgraph InferenceLayer["Guardian Vision Engine (Identical AI Pipeline)"]
        ClientStream["Ultra-Low Latency Stream (<200ms)"]
        TFPipeline["TensorFlow / NPU Vision Engine"]
        FruinScorer["Fruin LOS F Density Calibration"]
        WebRTCSrv --> ClientStream --> TFPipeline --> FruinScorer
    end

    subgraph ActionMesh["Autonomous Action"]
        FruinScorer -->|"Score >= 85"| AutoAlert["Auto-Generate CROWD_RISK Alert"]
        AutoAlert --> LocalMesh["Inject into Mesh P2P Relay"]
    end

    CAM1 & CAM2 & CAM3 --> RTSPIn
```

### Ingestion Pipeline Details:
1. **Protocol Demuxing & Normalization**:
   * Stadium cameras output standard RTSP (`rtsp://user:pass@192.168.1.x:554/live`) or ONVIF Profile S streams encoded in H.264/H.265.
   * A lightweight local edge gateway (such as a local Docker container running `go2rtc` or a GStreamer pipeline on the venue NVR) ingests multiple RTSP feeds without cloud dependencies.
2. **Sub-200ms WebRTC Delivery**:
   * Traditional streaming formats like HLS or RTMP introduce 3–15 seconds of buffering latency—unacceptable for stampede detection where 10 seconds can dictate life or death.
   * The gateway repackages the video into WebRTC (RTP/SRTP) peer streams, streaming low-latency video feeds directly to the Control Room dashboard or distributed Guardian nodes over local Wi-Fi or LAN backhaul.
3. **Identical Vision AI Pipeline**:
   * Ingested video feeds bind directly to the existing HTML5 `<video>` elements and GPU canvas buffers.
   * The same `person-detector.ts` and `risk-scorer.ts` engines process the CCTV feeds identically to physical phone cameras.
4. **Economic & Operational Value**:
   * **Eliminates Hardware Procurement**: Saves organizers hundreds of thousands of rupees in dedicated mobile phone or tablet leases.
   * **Superior Overhead Vantage**: Fixed ceiling-mounted CCTV streams provide perpendicular wide-angle perspectives with significantly less human occlusion than handheld eye-level phone cameras.

---

## 🧮 Mathematical Foundations & Crowd Risk Calibration

Festival Guardian replaces arbitrary threshold guesses with models calibrated to **NFPA 101 Life Safety Code** and **Dr. John Fruin's Level of Service (LOS)** pedestrian dynamics:

$$\text{Density} = \frac{\bar{N}_{\text{window}}}{\text{Monitored Area } (m^2)}$$

```
Fruin Level of Service (LOS) Scale:
• LOS A–C (< 1.08 p/m²): Free pedestrian flow, normal walking speeds.
• LOS D–E (1.08 - 2.17 p/m²): Constrained movement, severe bypass difficulty.
• LOS F   (> 3.8 - 4.0 p/m²): Physical contact, shockwave propagation, stampede risk.
```

### Calibration Equation

Our multi-frame risk function suppresses momentary single-frame false alarms while aggressively tracking compression turbulence:

$$\text{Risk Score} = \min\left(100, \; S_{\text{density}} + S_{\text{flow}}\right)$$

Where:
* **Base Density Score**:
  $$S_{\text{density}} = \min\left(80, \; \left(\frac{\text{Density}}{4.0 \text{ p/m}^2}\right) \times 80\right)$$
* **Flow Turbulence Score**:
  $$S_{\text{flow}} = \left(\frac{\Delta \text{flow}}{\text{Max Flow}}\right) \times 20 \times \text{Gating}(\text{Density})$$
* **Density Gating Function**:
  $$\text{Gating}(\text{Density}) = \text{clamp}\left(\frac{\text{Density} - 1.0}{2.5}, \; 0.0, \; 1.0\right)$$

> [!NOTE]
> Flow turbulence ($\Delta \text{flow}$) is only scored when density exceeds $1.0\text{ p/m}^2$. A single person running in an empty hallway does not trigger a false stampede panic; turbulence only poses stampede risk when crowd density reaches elevated thresholds.

---

## 🔬 Architecture: Today's Prototype vs. Grand Finale Target Build

To maintain engineering honesty and transparency during hackathon evaluation:

| Dimension | Today's Working Prototype (Phase 1) | Grand Finale Target Build (48-Hour Finale) |
|---|---|---|
| **Personas & Views** | Adaptive responsive web interface toggling between **Field Scanner**, **Dispatch Queue**, **Mesh Relay**, and **SOS** | Split Native Suite: **Field Guardian Client** (optimized for rugged outdoor phones) & **Organizer Command Console** (multi-screen dispatch dashboard) |
| **Video Stream Pipeline** | Smartphone Camera (`navigator.mediaDevices`) + WebRTC / Sample Event Footage simulation | Direct RTSP/ONVIF ingestion via local WebRTC Edge Gateway + Android CameraX zero-copy direct buffer decoding |
| **Vision AI Engine** | TensorFlow.js (`mobilenet_v2` COCO-SSD) on client WebGL GPU shaders | TensorFlow Lite / ONNX Runtime INT8 quantized, compiled for **Snapdragon NPU** execution |
| **Mesh P2P Hop Protocol** | `BroadcastChannel` event bus with TTL decrement, seen-set deduplication, and synthetic peer discovery | Google Play Services **Nearby Connections API** (`P2P_CLUSTER`) over Wi-Fi Direct & BLE with physical multi-device hop |
| **Alert Schema & Reliability** | Typed JSON packets with LRU cache deduplication & local audio synth sirens | Signed protobuf binary packets with cryptographic node verification & mesh storage-and-forward buffers |
| **Deployment** | 24/7 Global Edge CDN on Vercel (`festival-guardian.vercel.app`) | Standalone APK installed on iQOO Android test hardware with background service daemons |
| **Verification Method** | Multi-tab local peer simulation & live mobile camera feed testing | Multi-device physical mesh testing in cellular-deadened Faraday/shielded environments |

---

## 🎮 Live Demo & Walkthrough

Visit **[festival-guardian.vercel.app](https://festival-guardian.vercel.app)** on your smartphone or desktop:

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ FESTIVAL GUARDIAN 2          [RELAY ACTIVE: 3 PEERS]    │
├─────────────────────────────────────────────────────────────┤
│  [ SCANNER ]   [ DISPATCH (2) ]   [ RELAY ]   [ SOS TRIGGER ]│
│                                                             │
│  HUD: SCORE: 92/100  CRITICAL RISK    EST. DENSITY: 4.8 p/m²│
│  LIVE BOUNDING BOXES: [Person 1] [Person 2] ...             │
│                                                             │
│  [ PRESET: SAFE ]  [ PRESET: SURGE ]  [ PRESET: CRITICAL ]  │
│  [ CAMERA ON ]     [ EVENT VIDEO ]    [ RTSP SIMULATION ]   │
└─────────────────────────────────────────────────────────────┘
```

1. **Live Camera AI**: Tap **"Camera"** to run live on-device person detection directly on your mobile browser.
2. **Real Event Video**: Tap **"Event"** to evaluate the vision model against pre-recorded festival crowd footage.
3. **Scenario Presets**: Instantly simulate crowd dynamics using presets:
   * 🟢 **Safe (18)**: Dispersed pedestrian flow.
   * 🟡 **Surge (65)**: Gate bottleneck triggering caution advisory.
   * 🔴 **Critical (92)**: High-density stampede risk automatically dispatching alerts to the mesh.
4. **Multi-Tab Mesh Relay Test**:
   * Open two browser windows at `https://festival-guardian.vercel.app`.
   * On Window 1, navigate to **SOS** and hold the button for 0.8 seconds.
   * Window 2 instantly receives the alert across the mesh bus with audible siren chimes and hop telemetry.

---

## 🛠️ Project Structure

```
Festival Guardian/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Tab orchestrator & responsive mobile/desktop shell
│   │   ├── layout.tsx             # Root layout, PWA tags & dark mode viewport
│   │   └── globals.css            # Tactical radar effects, glassmorphic styling
│   ├── components/
│   │   ├── CameraRiskScreen.tsx   # Live video/CCTV canvas with bounding box renderer
│   │   ├── RiskMeter.tsx          # Dynamic SVG gauge & Fruin LOS telemetry
│   │   ├── SosButton.tsx          # 0.8s tactile hold emergency trigger
│   │   ├── AlertPanel.tsx         # Organizer dispatch queue with hop count & status
│   │   ├── VolunteerList.tsx      # Mesh peer discovery & presence status
│   │   ├── Header.tsx             # System status, relay pulse & peer count
│   │   └── OnboardingModal.tsx    # Guardian Node operational guide & walkthrough
│   ├── hooks/
│   │   ├── useCamera.ts           # MediaDevices & sample video stream controller
│   │   ├── useRiskScore.ts        # Detection loop & density calculation engine
│   │   ├── useAlerts.ts           # Alert lifecycle, deduplication & delivery
│   │   ├── useMeshRelay.ts        # P2P channel lifecycle & peer tracking
│   │   └── useGeolocation.ts      # Edge GPS coordinate telemetry
│   ├── lib/
│   │   ├── person-detector.ts     # TensorFlow.js COCO-SSD inference wrapper
│   │   ├── risk-scorer.ts         # NFPA 101 & Fruin LOS F density scoring algorithm
│   │   ├── alert-factory.ts       # Typed immutable Alert packet factory
│   │   ├── mesh-relay.ts          # Relay protocol, TTL hop decrement & cache
│   │   └── delivery-bridge.ts     # Web Audio synth, haptics & native notifications
│   └── types/
│       └── index.ts               # Core domain interfaces, thresholds & packet types
├── screenshots/                   # Pitch deck high-resolution captures
├── package.json
└── vercel.json
```

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/sujay2520/festival-guardian.git
cd festival-guardian

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 👥 Team Falling Stars & Contributors

| Name | Role / Focus | GitHub Profile |
| :--- | :--- | :--- |
| **M Sujay** | Edge AI Vision, System Architecture & UI | [@sujay2520](https://github.com/sujay2520) |
| **Poornachandra P M** | Decentralized Mesh Relay & Data Pipelines | [@humanoid-co](https://github.com/humanoid-co) |
| **Dushyanth M** | Computer Vision Scorer & Android Telemetry | [@Dushyanthm07](https://github.com/Dushyanthm07) |

*Built with passion for the iQOO Hackathon 2026 Grand Finale.*
