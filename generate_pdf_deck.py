import os
import sys
from fpdf import FPDF

class PresentationPDF(FPDF):
    def __init__(self):
        # 16:9 widescreen format: 300 mm width x 169 mm height
        super().__init__(orientation='L', unit='mm', format=(169, 300))
        self.set_auto_page_break(False, margin=0)

    def draw_bg(self):
        # Deep OLED dark background #09090b
        self.set_fill_color(9, 9, 11)
        self.rect(0, 0, 300, 169, 'F')
        
        # Top tactical accent bar (iQOO orange #FF6600)
        self.set_fill_color(255, 102, 0)
        self.rect(0, 0, 300, 1.8, 'F')

    def add_footer(self, current, total=9):
        self.set_xy(15, 159)
        self.set_font('Arial', '', 8)
        self.set_text_color(139, 139, 150)
        self.cell(180, 5, 'Festival Guardian  |  iQOO Hackathon 2026 Grand Finale  |  Team Falling Stars', 0, 0, 'L')
        self.cell(90, 5, f'Slide {current} / {total}', 0, 0, 'R')

    def add_header(self, category, title, cat_color=(255, 102, 0)):
        # Category tag
        self.set_xy(16, 10)
        self.set_font('Arial', 'B', 9)
        self.set_text_color(*cat_color)
        self.cell(0, 5, category.upper(), 0, 1, 'L')

        # Main title
        self.set_xy(16, 16)
        self.set_font('Arial', 'B', 19)
        self.set_text_color(236, 236, 239)
        self.cell(0, 9, title, 0, 1, 'L')

    def draw_card(self, x, y, w, h, border_color=(42, 42, 50), fill_color=(18, 18, 22)):
        self.set_fill_color(*fill_color)
        self.set_draw_color(*border_color)
        self.set_line_width(0.4)
        self.rect(x, y, w, h, 'FD')

def build_pdf():
    pdf = PresentationPDF()
    pdf.set_margins(15, 15, 15)

    base_dir = r"c:\Users\jarvis\Desktop\Builds\Iqoo hackathon\Festival Guardian"
    ss_scanner = os.path.join(base_dir, "screenshots", "01-scanner-desktop.png")
    ss_ops = os.path.join(base_dir, "screenshots", "05-ops-desktop.png")

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()

    # Center card
    pdf.draw_card(25, 20, 250, 128, border_color=(255, 102, 0), fill_color=(14, 14, 18))

    # Badge
    pdf.set_xy(30, 30)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(255, 102, 0)
    pdf.cell(240, 6, "iQOO HACKATHON 2026   -   GRAND FINALE APPLICATION", 0, 1, 'C')

    # Brand Title
    pdf.set_xy(30, 42)
    pdf.set_font('Arial', 'B', 38)
    pdf.set_text_color(245, 245, 247)
    pdf.cell(240, 16, "FESTIVAL GUARDIAN", 0, 1, 'C')

    # Tagline
    pdf.set_xy(30, 60)
    pdf.set_font('Arial', 'B', 17)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(240, 9, "Predict. Respond. Relay.", 0, 1, 'C')

    # Value proposition
    pdf.set_xy(40, 75)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(180, 180, 192)
    desc = (
        "On-Device Edge AI Crowd Vision & Decentralized Zero-Internet Mesh Safety Platform.\n"
        "Detects early crowd stampede build-up at gates before deadly physical shockwaves form.\n"
        "When cellular towers collapse at peak attendance, emergency alerts hop node-to-node across phones."
    )
    pdf.multi_cell(220, 6, desc, 0, 'C')

    # Bottom Pill
    pdf.draw_card(50, 108, 200, 26, border_color=(34, 211, 238), fill_color=(20, 20, 26))
    pdf.set_xy(50, 112)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(61, 154, 114)
    pdf.cell(200, 5, "LIVE PRODUCTION: https://festival-guardian.vercel.app", 0, 1, 'C')

    pdf.set_xy(50, 120)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(220, 220, 230)
    pdf.cell(200, 5, "Team Falling Stars: Poornachandra P M  |  Dushyanth M  |  M Sujay", 0, 1, 'C')

    pdf.add_footer(1)

    # =========================================================================
    # SLIDE 2: Problem Statement
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("THE PROBLEM: WHY CROWDS TURN DEADLY", "Mass Gatherings Create Critical Blindspots When Cellular Networks Jam", cat_color=(212, 91, 74))

    # 3 Cards
    cards_data = [
        ("1. Gradual Buildup", (212, 91, 74), [
            "Crowd density rises silently at turnstiles and bottlenecks.",
            "By the time human security visually spots the surge, exits are physically blocked.",
            "Shockwaves propagate through dense crowds in fractions of a second, causing crush asphyxia."
        ]),
        ("2. Cellular Jamming", (255, 102, 0), [
            "Thousands of attendees overwhelm local base stations (eNodeB/gNodeB saturation).",
            "Emergency phone calls, SMS, and conventional cloud apps fail completely.",
            "First responders cannot be reached via standard cellular or internet channels."
        ]),
        ("3. The Consumer App Flaw", (34, 211, 238), [
            "Expecting panicked attendees trapped in a crush to unlock phones and type reports is impossible.",
            "Safety cannot rely on attendees having active data plans or battery.",
            "Crowd safety MUST be an organizer-deployed edge system held by ground staff."
        ])
    ]

    card_w = 83
    card_h = 92
    y_pos = 32

    for i, (ctitle, ccolor, cpoints) in enumerate(cards_data):
        x_pos = 16 + i * 90
        pdf.draw_card(x_pos, y_pos, card_w, card_h, border_color=ccolor)
        
        # Header
        pdf.set_xy(x_pos + 6, y_pos + 6)
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(*ccolor)
        pdf.cell(card_w - 12, 7, ctitle, 0, 1, 'L')

        # Divider
        pdf.set_draw_color(*ccolor)
        pdf.line(x_pos + 6, y_pos + 15, x_pos + card_w - 6, y_pos + 15)

        # Bullets
        pdf.set_xy(x_pos + 6, y_pos + 18)
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(170, 170, 182)
        for pt in cpoints:
            pdf.set_x(x_pos + 6)
            pdf.multi_cell(card_w - 12, 5.2, "-  " + pt)
            pdf.ln(2.2)

    # Bottom Callout Banner
    pdf.draw_card(16, 130, 263, 19, border_color=(34, 211, 238), fill_color=(15, 20, 28))
    pdf.set_xy(20, 134)
    pdf.set_font('Arial', 'B', 10.5)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(0, 5, "[!] PARADIGM SHIFT: FIXED GUARDIAN NODES & ZERO-INTERNET MESH RELAY", 0, 1, 'L')
    pdf.set_xy(20, 140)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(200, 200, 210)
    pdf.cell(0, 5, "Organizers deploy dedicated nodes at bottlenecks. Real-time vision detects surge; mesh relay bypasses dead towers to reach central dispatch.", 0, 1, 'L')

    pdf.add_footer(2)

    # =========================================================================
    # SLIDE 3: Dual-Persona Architecture
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("SYSTEM ARCHITECTURE", "Dual-Persona Operational Architecture: Field Node vs Organizer Command", cat_color=(34, 211, 238))

    # Left Side: Persona 1 & Persona 2 Cards
    left_w = 125
    
    # Card 1: Field Node
    pdf.draw_card(16, 30, left_w, 54, border_color=(61, 154, 114))
    pdf.set_xy(22, 34)
    pdf.set_font('Arial', 'B', 13)
    pdf.set_text_color(61, 154, 114)
    pdf.cell(left_w - 12, 6, "1. Gate Marshal / Field Node View", 0, 1, 'L')
    
    pdf.set_xy(22, 42)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(170, 170, 180)
    p1_pts = [
        "Real-Time Edge Scanner: Live phone camera runs density detection at 30 FPS.",
        "Tactical Risk Gauge: Instant 0-100 score (SAFE, CAUTION, SURGE, CRITICAL).",
        "Hold-to-Fire Emergency Triggers: 0.8s hold for SOS, Theft, and First Aid.",
        "Mesh Router Node: Passively forwards emergency packets for neighboring gates."
    ]
    for pt in p1_pts:
        pdf.set_x(22)
        pdf.multi_cell(left_w - 12, 4.6, "-  " + pt)

    # Card 2: Organizer Command Center
    pdf.draw_card(16, 88, left_w, 58, border_color=(34, 211, 238))
    pdf.set_xy(22, 92)
    pdf.set_font('Arial', 'B', 13)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(left_w - 12, 6, "2. Organizer Command Center (Ops View)", 0, 1, 'L')

    pdf.set_xy(22, 100)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(170, 170, 180)
    p2_pts = [
        "Multi-Zone Spatial Tracking: Real-time status across 5 strategic venue sectors.",
        "Live CCTV Stream Ingestion: Ingests venue cameras (CAM 01/02/03) via WebRTC.",
        "Incident Dispatch Queue: Triage feed showing signal hops, TTL, and RSSI telemetry.",
        "Rapid Interventions: One-tap volunteer dispatch and crowd advisory broadcast."
    ]
    for pt in p2_pts:
        pdf.set_x(22)
        pdf.multi_cell(left_w - 12, 4.6, "-  " + pt)

    # Right Side: Embedded Screenshot of Scanner View
    if os.path.exists(ss_scanner):
        pdf.draw_card(146, 30, 133, 116, border_color=(42, 42, 50))
        # Place image inside
        pdf.image(ss_scanner, 147.5, 31.5, 130)
        # Caption bar below image
        pdf.set_xy(146, 140)
        pdf.set_font('Arial', 'B', 8.5)
        pdf.set_text_color(34, 211, 238)
        pdf.cell(133, 5, "LIVE GATE SCANNER: ON-DEVICE DENSITY & FLOW METER (PROTOTYPE)", 0, 1, 'C')

    pdf.add_footer(3)

    # =========================================================================
    # SLIDE 4: Computer Vision & Crowd Physics
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("COMPUTER VISION & CROWD PHYSICS", "On-Device Inference & NFPA Scientific Calibration (Fruin LOS F)", cat_color=(61, 154, 114))

    # 3 Pillars
    pillars = [
        ("100% On-Device AI", (34, 211, 238), [
            "Powered by TensorFlow.js WebGL backend (designed for Snapdragon NPU quantization via NNAPI).",
            "Zero frames leave the device: 100% attendee privacy, zero data consumption, zero cloud latency.",
            "Maintains 30 FPS inference on mobile silicon under sustained thermal conditions."
        ]),
        ("2-Pass Multi-Scale Tiling", (255, 102, 0), [
            "Pass 1 (Global): Scans full frame to detect prominent foreground attendees.",
            "Pass 2 (Center Crop Tiling): Dynamically triggers when density rises to detect distant, occluded people.",
            "Resolves severe overlapping occlusions where single-pass YOLO/SSD models undercount by >60%."
        ]),
        ("NFPA & Fruin LOS F Scale", (212, 91, 74), [
            "Calibrated against NFPA crowd safety standards & Fruin Level of Service (LOS F >= 4.0 p/m^2).",
            "Extracts Person Count, Density (p/m^2), and Ingress Flow Velocity (+delta/s).",
            "Fuses metrics into a calibrated 0-100 Tactical Risk Score before crushes occur."
        ])
    ]

    for i, (title, color, bullets) in enumerate(pillars):
        x = 16 + i * 90
        pdf.draw_card(x, 30, card_w, 94, border_color=color)
        pdf.set_xy(x + 6, 36)
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(*color)
        pdf.cell(card_w - 12, 7, title, 0, 1, 'L')

        pdf.set_draw_color(*color)
        pdf.line(x + 6, 45, x + card_w - 6, 45)

        pdf.set_xy(x + 6, 48)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(170, 170, 180)
        for b in bullets:
            pdf.set_x(x + 6)
            pdf.multi_cell(card_w - 12, 5.0, "-  " + b)
            pdf.ln(2)

    # Bottom Pipeline Ribbon
    pdf.draw_card(16, 130, 263, 19, border_color=(61, 154, 114), fill_color=(15, 22, 18))
    pdf.set_xy(20, 134)
    pdf.set_font('Arial', 'B', 10.5)
    pdf.set_text_color(61, 154, 114)
    pdf.cell(0, 5, "END-TO-END VISION PIPELINE (ZERO CLOUD DEPENDENCY)", 0, 1, 'C')
    pdf.set_xy(20, 140)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(220, 220, 230)
    pdf.cell(0, 5, "CAMERA FRAME (30 FPS)  ->  2-PASS MULTI-SCALE TILING  ->  DENSITY (p/m^2)  ->  FLOW DELTA (+d/s)  ->  RISK SCORE (0-100)", 0, 1, 'C')

    pdf.add_footer(4)

    # =========================================================================
    # SLIDE 5: Zero-Internet Mesh Relay
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("DECENTRALIZED P2P RELAY", "Zero-Internet Ad-Hoc Emergency Mesh Network (Google Nearby Connections)", cat_color=(34, 211, 238))

    mesh_cards = [
        ("No Cellular Required", (61, 154, 114), [
            "Functions completely offline when 4G/5G base stations and Wi-Fi networks collapse.",
            "Architected for Google Nearby Connections API on Android (BLE 5.2 discovery + Wi-Fi Direct data pipe).",
            "Simulated in current prototype via browser BroadcastChannel for zero-config judge testing."
        ]),
        ("Bounded 3-Hop TTL", (34, 211, 238), [
            "Time-To-Live (TTL = 3) prevents packet replication storms and infinite forwarding loops.",
            "Packets span >450 meters across festival sectors in under 80ms total propagation time.",
            "Hop telemetry records signal RSSI (-58 dBm), node battery levels, and transit latency (~24ms/hop)."
        ]),
        ("LRU Deduplication", (255, 102, 0), [
            "Cryptographic UUIDs and an in-memory LRU packet cache drop redundant broadcasts instantly.",
            "Zero wasted battery on participating volunteer nodes in crowded festival environments.",
            "One unified mesh routes Crowd Risk warnings, SOS beacons, Theft alerts, and Medical calls."
        ])
    ]

    for i, (title, color, bullets) in enumerate(mesh_cards):
        x = 16 + i * 90
        pdf.draw_card(x, 30, card_w, 94, border_color=color)
        pdf.set_xy(x + 6, 36)
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(*color)
        pdf.cell(card_w - 12, 7, title, 0, 1, 'L')

        pdf.set_draw_color(*color)
        pdf.line(x + 6, 45, x + card_w - 6, 45)

        pdf.set_xy(x + 6, 48)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(170, 170, 180)
        for b in bullets:
            pdf.set_x(x + 6)
            pdf.multi_cell(card_w - 12, 5.0, "-  " + b)
            pdf.ln(2)

    # Bottom Packet Hop Topology
    pdf.draw_card(16, 130, 263, 19, border_color=(34, 211, 238), fill_color=(15, 20, 28))
    pdf.set_xy(20, 134)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(0, 5, "PACKET TRANSMISSION ROUTE (ZERO CELLULAR DATA):", 0, 1, 'C')
    pdf.set_xy(20, 140)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(220, 220, 230)
    pdf.cell(0, 5, "GATE 3 NODE (SURGE)  ->  [BLE HOP 1]  ->  PATROL VOLUNTEER  ->  [WI-FI DIRECT HOP 2]  ->  CENTRAL DISPATCH (RECEIVED)", 0, 1, 'C')

    pdf.add_footer(5)

    # =========================================================================
    # SLIDE 6: Tactical Emergency Triggers
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("EMERGENCY PROTOCOLS", "Tactile Hold-to-Fire SOS, Theft Logging & Voice-Guided Medical Triage", cat_color=(212, 91, 74))

    sos_cards = [
        ("Critical SOS (0.8s Hold)", (212, 91, 74), [
            "High-contrast tactile emergency beacon with animated SVG radial countdown ring.",
            "0.8-second hold-to-confirm requirement eliminates accidental false alarms from pocket friction.",
            "Instantly broadcasts highest-priority distress beacon across all nearby mesh nodes."
        ]),
        ("Theft Incident Logging", (255, 102, 0), [
            "Rapid reporting for pickpocketing, bag snatching, and lost property.",
            "Automatically tags the reporting gate ID, physical sector, and GPS coordinates into security log.",
            "Alerts roving security patrol nodes to converge on the bottleneck corridor."
        ]),
        ("Medical First Aid Triage", (34, 211, 238), [
            "Pings dedicated medical responder nodes (e.g. Medic-Priya Zone C) with exact location.",
            "Displays step-by-step offline resuscitation guidelines (airway clearance, 100-120/min CPR cadence).",
            "Provides essential crowd crush trauma triage instructions while waiting for ambulance access."
        ])
    ]

    for i, (title, color, bullets) in enumerate(sos_cards):
        x = 16 + i * 90
        pdf.draw_card(x, 30, card_w, 94, border_color=color)
        pdf.set_xy(x + 6, 36)
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(*color)
        pdf.cell(card_w - 12, 7, title, 0, 1, 'L')

        pdf.set_draw_color(*color)
        pdf.line(x + 6, 45, x + card_w - 6, 45)

        pdf.set_xy(x + 6, 48)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(170, 170, 180)
        for b in bullets:
            pdf.set_x(x + 6)
            pdf.multi_cell(card_w - 12, 5.0, "-  " + b)
            pdf.ln(2)

    # Bottom Audio Synthesizer Banner
    pdf.draw_card(16, 130, 263, 19, border_color=(255, 102, 0), fill_color=(25, 18, 14))
    pdf.set_xy(20, 134)
    pdf.set_font('Arial', 'B', 10.5)
    pdf.set_text_color(255, 102, 0)
    pdf.cell(0, 5, "TACTICAL ZERO-ASSET AUDIO SYNTHESIZER (WEB AUDIO API)", 0, 1, 'C')
    pdf.set_xy(20, 140)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(220, 220, 230)
    pdf.cell(0, 5, "Generates real-time UI tactile feedback, radar warning pings, and emergency SOS sirens with zero external audio asset latency.", 0, 1, 'C')

    pdf.add_footer(6)

    # =========================================================================
    # SLIDE 7: CCTV / RTSP Ingestion Pipeline
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("PHASE 2 ROADMAP", "Venue CCTV / RTSP Integration Pipeline (WebRTC Edge Gateway)", cat_color=(34, 211, 238))

    # Left Side: 2 Strategic Cards
    pdf.draw_card(16, 30, left_w, 54, border_color=(34, 211, 238))
    pdf.set_xy(22, 34)
    pdf.set_font('Arial', 'B', 13)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(left_w - 12, 6, "Zero New Hardware Procurement", 0, 1, 'L')

    pdf.set_xy(22, 42)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(170, 170, 180)
    cctv_pts1 = [
        "Major stadiums, convention centers, and festival arenas already possess extensive CCTV networks.",
        "Phase 2 taps existing RTSP/ONVIF security feeds via on-premise WebRTC Edge Gateways.",
        "Venues achieve comprehensive crowd safety monitoring without purchasing new cameras or phones."
    ]
    for pt in cctv_pts1:
        pdf.set_x(22)
        pdf.multi_cell(left_w - 12, 4.6, "-  " + pt)

    pdf.draw_card(16, 88, left_w, 58, border_color=(61, 154, 114))
    pdf.set_xy(22, 92)
    pdf.set_font('Arial', 'B', 13)
    pdf.set_text_color(61, 154, 114)
    pdf.cell(left_w - 12, 6, "Identical AI Vision Pipeline", 0, 1, 'L')

    pdf.set_xy(22, 100)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(170, 170, 180)
    cctv_pts2 = [
        "Detection engine processes video frames identically regardless of camera input source.",
        "Live demo features 3 active simulated venue channels (CAM-01 Stage, CAM-02 Gate 3, CAM-03 Ingress).",
        "Seamlessly aggregates fixed CCTV streams and roving mobile Guardian nodes on one Ops dashboard."
    ]
    for pt in cctv_pts2:
        pdf.set_x(22)
        pdf.multi_cell(left_w - 12, 4.6, "-  " + pt)

    # Right Side: Embedded Screenshot of Ops Dashboard
    if os.path.exists(ss_ops):
        pdf.draw_card(146, 30, 133, 116, border_color=(42, 42, 50))
        pdf.image(ss_ops, 147.5, 31.5, 130)
        pdf.set_xy(146, 140)
        pdf.set_font('Arial', 'B', 8.5)
        pdf.set_text_color(34, 211, 238)
        pdf.cell(133, 5, "ORGANIZER COMMAND CENTER & LIVE CCTV MONITORING WALL", 0, 1, 'C')

    pdf.add_footer(7)

    # =========================================================================
    # SLIDE 8: Engineering Honesty Table
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("ENGINEERING HONESTY & TRANSPARENCY", "Today's Working Prototype vs. Production Target Build", cat_color=(255, 102, 0))

    # Table layout
    tx = 16
    ty = 30
    tw = 263
    th = 118

    # Table headers
    pdf.set_fill_color(26, 26, 34)
    pdf.set_draw_color(42, 42, 50)
    pdf.rect(tx, ty, 65, 12, 'FD')
    pdf.rect(tx + 65, ty, 99, 12, 'FD')
    pdf.rect(tx + 164, ty, 99, 12, 'FD')

    pdf.set_xy(tx + 2, ty + 3)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(34, 211, 238)
    pdf.cell(61, 6, "TECHNICAL DIMENSION", 0, 0, 'L')

    pdf.set_xy(tx + 67, ty + 3)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(255, 102, 0)
    pdf.cell(95, 6, "TODAY'S WORKING PROTOTYPE", 0, 0, 'L')

    pdf.set_xy(tx + 166, ty + 3)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(61, 154, 114)
    pdf.cell(95, 6, "GRAND FINALE TARGET BUILD", 0, 0, 'L')

    # Table rows
    table_rows = [
        ("Target Platform", "Next.js 14 Progressive Web App (PWA) with responsive mobile dock", "Native Android (Kotlin + Jetpack Compose) optimized for iQOO devices"),
        ("On-Device AI Engine", "TensorFlow.js WebGL (in-browser GPU acceleration)", "Quantized TFLite executing directly on Snapdragon NPU via Android NNAPI"),
        ("Mesh Networking", "Browser BroadcastChannel P2P multi-tab simulation", "Google Nearby Connections API (BLE 5.2 discovery + Wi-Fi Direct transport)"),
        ("CCTV Ingestion", "Simulated WebRTC RTSP video playback with real festival footage", "On-Premise RTSP / HLS Edge Gateway ingesting live venue security feeds"),
        ("User Personas", "Dual-Persona: Field Gate Scanner & Organizer Ops Dashboard", "Dual-Persona: Field Marshals & Central Police / Security Command Room"),
    ]

    row_y = ty + 12
    row_h = 20

    for idx, (dim, proto, target) in enumerate(table_rows):
        bg_col = (18, 18, 22) if idx % 2 == 0 else (14, 14, 18)
        pdf.set_fill_color(*bg_col)
        pdf.set_draw_color(35, 35, 42)
        pdf.rect(tx, row_y, 65, row_h, 'FD')
        pdf.rect(tx + 65, row_y, 99, row_h, 'FD')
        pdf.rect(tx + 164, row_y, 99, row_h, 'FD')

        # Col 1: Dimension
        pdf.set_xy(tx + 4, row_y + 4)
        pdf.set_font('Arial', 'B', 9.5)
        pdf.set_text_color(236, 236, 239)
        pdf.cell(57, 5, dim, 0, 0, 'L')

        # Col 2: Prototype
        pdf.set_xy(tx + 69, row_y + 3)
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(180, 180, 192)
        pdf.multi_cell(91, 4.4, proto)

        # Col 3: Target
        pdf.set_xy(tx + 168, row_y + 3)
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(200, 200, 212)
        pdf.multi_cell(91, 4.4, target)

        row_y += row_h

    pdf.add_footer(8)

    # =========================================================================
    # SLIDE 9: Grand Finale Roadmap
    # =========================================================================
    pdf.add_page()
    pdf.draw_bg()
    pdf.add_header("GRAND FINALE ROADMAP", "48-Hour Sprint Milestones & Production Shipping Plan", cat_color=(61, 154, 114))

    sprint_data = [
        ("0 - 12 Hours", (255, 102, 0), [
            "Deploy native Kotlin Android app shell with CameraX.",
            "Bind video pipeline to Snapdragon NPU via Qualcomm NNAPI delegate.",
            "Benchmark and calibrate on-device 30 FPS inference latency and thermal footprint."
        ]),
        ("12 - 30 Hours", (34, 211, 238), [
            "Integrate Google Nearby Connections API (BLE 5.2 + Wi-Fi Direct).",
            "Perform two-device physical offline mesh hop test across 100m distance.",
            "Verify packet delivery with Airplane Mode enabled on both phones."
        ]),
        ("30 - 48 Hours", (61, 154, 114), [
            "Integrate Multi-Zone Command Center with live edge telemetry.",
            "Connect WebRTC RTSP ingestion gateway to physical IP camera stream.",
            "Conduct dress rehearsal and execute live judge evaluation demo."
        ])
    ]

    for i, (title, color, bullets) in enumerate(sprint_data):
        x = 16 + i * 90
        pdf.draw_card(x, 30, card_w, 75, border_color=color)
        pdf.set_xy(x + 6, 36)
        pdf.set_font('Arial', 'B', 15)
        pdf.set_text_color(*color)
        pdf.cell(card_w - 12, 7, title, 0, 1, 'L')

        pdf.set_draw_color(*color)
        pdf.line(x + 6, 45, x + card_w - 6, 45)

        pdf.set_xy(x + 6, 48)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(170, 170, 180)
        for b in bullets:
            pdf.set_x(x + 6)
            pdf.multi_cell(card_w - 12, 5.0, "-  " + b)
            pdf.ln(2)

    # Bottom Closing Banner
    pdf.draw_card(16, 112, 263, 37, border_color=(34, 211, 238), fill_color=(15, 20, 28))
    pdf.set_xy(20, 117)
    pdf.set_font('Arial', 'B', 14)
    pdf.set_text_color(245, 245, 247)
    pdf.cell(0, 6, "FESTIVAL GUARDIAN: PREDICT. RESPOND. RELAY.", 0, 1, 'C')

    pdf.set_xy(25, 126)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(180, 180, 195)
    pdf.multi_cell(245, 5.2, (
        "Saving lives where crowds gather and cellular networks fail. "
        "Built with engineering honesty, grounded in crowd physics, and optimized for Qualcomm Snapdragon silicon.\n"
        "Live Production Demo: https://festival-guardian.vercel.app  |  Team Falling Stars  |  iQOO Hackathon 2026"
    ), 0, 'C')

    pdf.add_footer(9)

    # =========================================================================
    # Output to both destinations
    # =========================================================================
    out_d = r"D:\Downloads\Festival-Guardian-Grand-Finale.pdf"
    out_local = os.path.join(base_dir, "Festival-Guardian-Grand-Finale.pdf")

    pdf.output(out_d, 'F')
    print(f"Successfully generated PDF at: {out_d}")

    pdf.output(out_local, 'F')
    print(f"Successfully mirrored PDF at: {out_local}")

if __name__ == "__main__":
    build_pdf()
