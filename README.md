# 🛡️ Festival Guardian
> **Predict. Respond. Relay.**  
> *Point your phone at a crowd and get a live stampede-risk score. If the network jams, alerts hop phone-to-phone until they reach help.*

[![Live Prototype](https://img.shields.io/badge/Live_Prototype-festival--guardian.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://festival-guardian.vercel.app)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TensorFlow.js](https://img.shields.io/badge/AI_Vision-TensorFlow.js_WebGL-orange?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)
[![Team](https://img.shields.io/badge/Team-Falling_Stars-amber?style=for-the-badge)](https://iqoo.reskilll.com/dashboard/iqoo-finale)

---

## 📌 Problem Statement
Crowds at festivals, religious gatherings (temple queues), and transit hubs turn dangerous gradually — by the time visual panic sets in, exits are already bottlenecked. Worse, high crowd density congests local cellular towers, causing standard SOS calls and messaging apps to fail at the exact moment of crisis.

---

## 💡 Solution Overview
**Festival Guardian** addresses this with an offline-resilient, on-device crowd safety system:

1. **On-Device Vision AI**: Analyzes live video to detect person counts, calculating crowd density ($\text{people}/\text{m}^2$) and movement flow rate into a responsive 0–100 stampede risk score.
2. **Unified Alert Engine**: A shared typed alert bus supporting 4 distinct triggers:
   * ⚠️ **Crowd Risk**: Automatically fired when density crosses critical safety thresholds ($>85$).
   * 🆘 **Emergency SOS**: Tactile 0.8s hold-to-send trigger preventing accidental pocket fires.
   * 🚨 **Theft Incident**: One-tap situational awareness reporting.
   * 🙋 **Volunteer Assistance**: Immediate dispatch for first-aid or crowd control.
3. **Decentralized Relay**: When network bars drop to zero, alerts hop device-to-device with TTL deduplication until reaching a connected node with cellular signal or local emergency responders.

---

## 🔬 Architecture: Today's Prototype vs. Finale Build

To maintain complete engineering honesty and transparency during hackathon evaluation:

| Dimension | Today's Working Prototype (Phase 1) | Grand Finale Target Build (48-Hour) |
|---|---|---|
| **Platform** | Responsive Web App (Next.js 14, TypeScript) | Native Android App (Kotlin, Jetpack Compose) |
| **Vision AI** | TensorFlow.js (`mobilenet_v2` COCO-SSD) on client WebGL GPU | TensorFlow Lite / ONNX Runtime quantized for Snapdragon NPU |
| **P2P Relay** | `BroadcastChannel` event bus with TTL, dedup, and simulated peer telemetry | Google Play Services **Nearby Connections API** (`P2P_CLUSTER`) |
| **Deployment** | 24/7 Global Edge CDN on Vercel | Standalone APK on iQOO hardware |
| **Verification** | Verified live in mobile browsers & multi-tab test environments | Multi-phone over-the-air Bluetooth / Wi-Fi Direct physical hop |

---

## 🎮 Live Demo & Walkthrough

Visit **[festival-guardian.vercel.app](https://festival-guardian.vercel.app)** on your smartphone or desktop:

1. **Camera Mode**: Tap **"Start Camera"** to analyze a live crowd feed directly on your device GPU.
2. **Auto Demo Crowd**: Tap **"Auto Demo Crowd"** to toggle simulated telemetry across 3 real-world scenarios:
   * 🟢 **Safe Flow (18)**: Normal attendee dispersion.
   * 🟡 **Surge at Gate 3 (65)**: Ingress bottleneck triggering automated advisory.
   * 🔴 **Stampede Risk (92)**: High-density threshold triggering critical emergency state.
3. **Multi-Trigger SOS**: Long-press the red **SOS button** to broadcast an emergency packet across the mesh bus with audible frequency alarms and haptic feedback.

---

## 🛠️ Project Structure

```
Festival Guardian/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Primary dashboard orchestration
│   │   ├── layout.tsx             # Responsive mobile shell & metadata
│   │   └── globals.css            # Dark mode UI, glassmorphism, radar styles
│   ├── components/
│   │   ├── CameraRiskScreen.tsx   # Live video / simulation radar with bounding boxes
│   │   ├── RiskMeter.tsx          # Dynamic SVG arc gauge & density telemetry
│   │   ├── SosButton.tsx          # Hold-to-activate emergency trigger
│   │   ├── AlertPanel.tsx         # Multi-type active incident feed
│   │   ├── VolunteerList.tsx      # Mesh peer discovery & presence status
│   │   └── Header.tsx             # Branding, network state & peer counter
│   ├── hooks/
│   │   ├── useCamera.ts           # MediaDevices camera stream controller
│   │   ├── useRiskScore.ts        # Detection loop & density calculation engine
│   │   ├── useAlerts.ts           # Alert lifecycle, deduplication & delivery
│   │   ├── useMeshRelay.ts        # P2P channel lifecycle & peer tracking
│   │   └── useGeolocation.ts      # Browser GPS coordinate telemetry
│   ├── lib/
│   │   ├── person-detector.ts     # TensorFlow.js COCO-SSD inference wrapper
│   │   ├── risk-scorer.ts         # NFPA-based density & flow rate algorithms
│   │   ├── alert-factory.ts       # Standardized typed Alert builder
│   │   ├── mesh-relay.ts          # Relay protocol, TTL hop decrement & cache
│   │   └── delivery-bridge.ts     # Web Audio synth, haptics & notifications
│   └── types/
│       └── index.ts               # Core domain interfaces & thresholds
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
# Open http://localhost:3000
```

---

## 👥 Team Falling Stars
* **Poornachandra P M**
* **Dushyanth M**
* **M Sujay**

*Built for the iQOO Hackathon 2026.*
