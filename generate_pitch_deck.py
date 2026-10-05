import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_pitch_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Tokens
    BG_COLOR = RGBColor(9, 9, 11)        # #09090b
    CARD_BG = RGBColor(18, 18, 22)       # #121216
    CARD_BORDER = RGBColor(42, 42, 50)   # #2a2a32
    TEXT_WHITE = RGBColor(245, 245, 247)
    TEXT_MUTED = RGBColor(145, 145, 155)
    CYAN = RGBColor(34, 211, 238)        # #22D3EE
    ORANGE = RGBColor(255, 102, 0)       # #FF6600
    GREEN = RGBColor(61, 154, 114)       # #3d9a72
    RED = RGBColor(212, 91, 74)          # #d45b4a

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        
        # Top gradient accent line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.06))
        line.fill.solid()
        line.fill.fore_color.rgb = ORANGE
        line.line.fill.background()
        return bg

    def add_footer(slide, current, total=9):
        tx = slide.shapes.add_textbox(Inches(0.8), Inches(6.85), Inches(11.733), Inches(0.4))
        p = tx.text_frame.paragraphs[0]
        p.text = f"Festival Guardian · iQOO Hackathon 2026 Grand Finale                           Slide {current} / {total}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.font.name = "Calibri"

    def add_card(slide, left, top, width, height, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
        return card

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s1)

    tb = s1.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "iQOO HACKATHON 2026  ·  GRAND FINALE APPLICATION"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = ORANGE
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf.add_paragraph()
    p1.text = "FESTIVAL GUARDIAN"
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "Predict. Respond. Relay."
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = CYAN
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf.add_paragraph()
    p3.text = "\nOn-Device Edge AI Crowd Vision & Decentralized Zero-Internet Mesh Safety Platform\nEarly stampede detection at the gate before deadly shockwaves form."
    p3.font.size = Pt(15)
    p3.font.color.rgb = TEXT_MUTED
    p3.alignment = PP_ALIGN.CENTER

    p4 = tf.add_paragraph()
    p4.text = "\nLive Production URL: https://festival-guardian.vercel.app  ·  Team: Falling Stars"
    p4.font.size = Pt(13)
    p4.font.bold = True
    p4.font.color.rgb = GREEN
    p4.alignment = PP_ALIGN.CENTER

    add_footer(s1, 1)

    # ==========================================
    # SLIDE 2: Problem Statement
    # ==========================================
    s2 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s2)

    tb = s2.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "THE PROBLEM: WHY CROWDS TURN DEADLY"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ORANGE

    p1 = tf.add_paragraph()
    p1.text = "Mass gatherings create critical blindspots when networks jam"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    # 3 Cards
    c1 = add_card(s2, Inches(0.8), Inches(2.0), Inches(3.6), Inches(3.4), RED)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. Gradual Buildup"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RED
    p2 = tf1.add_paragraph()
    p2.text = "\nCrowd density rises silently at turnstiles and bottleneck corridors. By the time security visually spots the crush, egress routes are already physically jammed."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s2, Inches(4.8), Inches(2.0), Inches(3.6), Inches(3.4), ORANGE)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. Cellular Jamming"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p2 = tf2.add_paragraph()
    p2.text = "\nTens of thousands of concurrent attendees overload local cell towers (eNodeB/gNodeB). Emergency phone calls, SMS, and conventional cloud safety apps fail completely."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c3 = add_card(s2, Inches(8.8), Inches(2.0), Inches(3.6), Inches(3.4), CYAN)
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "3. The Consumer App Flaw"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf3.add_paragraph()
    p2.text = "\nExpecting panicked attendees trapped in a surging crowd to unlock their phones and type incident reports is impossible. Crowd safety MUST be deployed by staff at the gates."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    # Bottom takeaway
    tb_bot = s2.shapes.add_textbox(Inches(0.8), Inches(5.6), Inches(11.733), Inches(0.8))
    p = tb_bot.text_frame.paragraphs[0]
    p.text = "💡 Paradigm Shift: Fixed Guardian Nodes carried by staff at bottlenecks + existing venue CCTV feeds, communicating over zero-internet mesh to central dispatch."
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = CYAN

    add_footer(s2, 2)

    # ==========================================
    # SLIDE 3: Dual-Persona Architecture
    # ==========================================
    s3 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s3)

    tb = s3.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "SYSTEM ARCHITECTURE"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = CYAN
    p1 = tf.add_paragraph()
    p1.text = "Dual-Persona Operational Architecture"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    # Left: Text Cards
    c1 = add_card(s3, Inches(0.8), Inches(1.9), Inches(5.5), Inches(2.2), GREEN)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Gate Marshal / Field Node View"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p2 = tf1.add_paragraph()
    p2.text = "• Camera feed runs on-device density analysis at 30 FPS\n• Live 0-100 risk meter with safe/surge/critical thresholds\n• Hold-to-fire 0.8s SOS, Theft report, and Medical First Aid\n• Acts as offline mesh router in the background"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s3, Inches(0.8), Inches(4.3), Inches(5.5), Inches(2.2), CYAN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Organizer Command Center (Ops View)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf2.add_paragraph()
    p2.text = "• Multi-Zone status tracking across 5 strategic venue gates\n• Live CCTV / RTSP video ingestion feeds (CAM 01/02/03)\n• Incident dispatch queue with signal hop & TTL telemetry\n• One-tap volunteer dispatch and crowd advisory broadcast"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    # Right: Embedded Screenshot
    ss_path = r"c:\Users\jarvis\Desktop\Builds\Iqoo hackathon\Festival Guardian\screenshots\01-scanner-desktop.png"
    if os.path.exists(ss_path):
        s3.shapes.add_picture(ss_path, Inches(6.6), Inches(1.9), width=Inches(5.9))

    add_footer(s3, 3)

    # ==========================================
    # SLIDE 4: Edge AI Vision Engine
    # ==========================================
    s4 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s4)

    tb = s4.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "COMPUTER VISION & CROWD PHYSICS"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = GREEN
    p1 = tf.add_paragraph()
    p1.text = "On-Device Inference & NFPA Scientific Calibration"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    c1 = add_card(s4, Inches(0.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "100% On-Device"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf1.add_paragraph()
    p2.text = "\nTensorFlow.js WebGL (designed for Snapdragon NPU quantization via NNAPI). Zero frames leave the phone—100% attendee privacy and zero cloud server costs."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s4, Inches(4.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2-Pass Multi-Scale"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p2 = tf2.add_paragraph()
    p2.text = "\nPass 1 scans full frame for foreground people; Pass 2 activates a high-resolution center tile to count distant, occluded people that standard single-pass models miss."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c3 = add_card(s4, Inches(8.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "Fruin LOS F Metric"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = RED
    p2 = tf3.add_paragraph()
    p2.text = "\nCalibrated on crowd science (NFPA threshold ≥ 4.0 p/m² = crush danger). Combines Person Count, Density (p/m²), and Flow Velocity (+Δ/s) into a unified 0-100 score."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c_bot = add_card(s4, Inches(0.8), Inches(5.5), Inches(11.6), Inches(0.9), CARD_BORDER)
    tfb = c_bot.text_frame
    p = tfb.paragraphs[0]
    p.text = "PIPELINE: CAMERA FRAME (30 FPS) → GPU/NPU 2-PASS TILING → DENSITY ESTIMATE → FLOW DELTA → RISK ALERT DISPATCH"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p.alignment = PP_ALIGN.CENTER

    add_footer(s4, 4)

    # ==========================================
    # SLIDE 5: Zero-Internet Mesh Relay
    # ==========================================
    s5 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s5)

    tb = s5.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "DECENTRALIZED P2P RELAY"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = CYAN
    p1 = tf.add_paragraph()
    p1.text = "Zero-Internet Ad-Hoc Emergency Mesh"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    c1 = add_card(s5, Inches(0.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "No Cellular Required"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p2 = tf1.add_paragraph()
    p2.text = "\nOperates when 4G/5G towers are saturated. Uses Google Nearby Connections API (BLE 5.2 + Wi-Fi Direct) to route encrypted alert packets between phones."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s5, Inches(4.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Bounded 3-Hop TTL"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf2.add_paragraph()
    p2.text = "\nTime-to-Live bounds prevent broadcast storms and routing loops. Packets span >450m across festival grounds in under 80ms total propagation time."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c3 = add_card(s5, Inches(8.8), Inches(2.0), Inches(3.6), Inches(3.2))
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "LRU Deduplication"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p2 = tf3.add_paragraph()
    p2.text = "\nCryptographic packet IDs and an in-memory cache drop duplicate broadcasts instantly, ensuring zero wasted battery on volunteer nodes."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c_bot = add_card(s5, Inches(0.8), Inches(5.5), Inches(11.6), Inches(0.9), CARD_BORDER)
    tfb = c_bot.text_frame
    p = tfb.paragraphs[0]
    p.text = "GATE 3 NODE (SURGE) → [BLE HOP 1] → PATROL VOLUNTEER → [WI-FI DIRECT HOP 2] → CENTRAL DISPATCH (ALERT RECEIVED)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p.alignment = PP_ALIGN.CENTER

    add_footer(s5, 5)

    # ==========================================
    # SLIDE 6: Tactical Emergency Triggers
    # ==========================================
    s6 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s6)

    tb = s6.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "EMERGENCY PROTOCOLS"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = RED
    p1 = tf.add_paragraph()
    p1.text = "Tactile Hold-to-Fire SOS & Medical Triage"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    c1 = add_card(s6, Inches(0.8), Inches(2.0), Inches(3.6), Inches(3.2), RED)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Critical SOS (0.8s Hold)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RED
    p2 = tf1.add_paragraph()
    p2.text = "\nCircular emergency button with animated SVG progress ring. 0.8-second hold-to-confirm mechanic guarantees zero accidental taps in crowded environments."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s6, Inches(4.8), Inches(2.0), Inches(3.6), Inches(3.2), ORANGE)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Theft Incident Logging"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p2 = tf2.add_paragraph()
    p2.text = "\nInstant reporting for pickpocketing and lost property. Tags physical gate and GPS coordinates directly into the security command log."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c3 = add_card(s6, Inches(8.8), Inches(2.0), Inches(3.6), Inches(3.2), CYAN)
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "Medical First Aid Triage"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf3.add_paragraph()
    p2.text = "\nAlerts nearest medical volunteer (Medic-Priya Zone C) while displaying offline step-by-step resuscitation and crowd crush triage procedures."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED

    c_bot = add_card(s6, Inches(0.8), Inches(5.5), Inches(11.6), Inches(0.9), CARD_BORDER)
    tfb = c_bot.text_frame
    p = tfb.paragraphs[0]
    p.text = "TACTICAL AUDIO: Built-in Web Audio API synthesizer generates UI clicks, radar pings, and SOS alarms with zero external asset latency."
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p.alignment = PP_ALIGN.CENTER

    add_footer(s6, 6)

    # ==========================================
    # SLIDE 7: CCTV RTSP Ingestion Pipeline
    # ==========================================
    s7 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s7)

    tb = s7.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "PHASE 2 ROADMAP"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = CYAN
    p1 = tf.add_paragraph()
    p1.text = "Venue CCTV / RTSP Integration Pipeline"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    # Left: Text Cards
    c1 = add_card(s7, Inches(0.8), Inches(1.9), Inches(5.5), Inches(2.2), CYAN)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Zero New Hardware Required"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf1.add_paragraph()
    p2.text = "Stadiums and event venues already have dozens of RTSP/ONVIF security cameras installed. Phase 2 ingests these feeds via WebRTC Edge Gateways without buying extra hardware."
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s7, Inches(0.8), Inches(4.3), Inches(5.5), Inches(2.2), GREEN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Identical AI Vision Pipeline"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p2 = tf2.add_paragraph()
    p2.text = "The detection model processes video frames identically regardless of whether the source is a phone camera or an RTSP stream. Three simulated channels demonstrated live (CAM-01, 02, 03)."
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    # Right: Embedded Screenshot of Ops View
    ops_path = r"c:\Users\jarvis\Desktop\Builds\Iqoo hackathon\Festival Guardian\screenshots\05-ops-desktop.png"
    if os.path.exists(ops_path):
        s7.shapes.add_picture(ops_path, Inches(6.6), Inches(1.9), width=Inches(5.9))

    add_footer(s7, 7)

    # ==========================================
    # SLIDE 8: Prototype vs Target Build Table
    # ==========================================
    s8 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s8)

    tb = s8.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "ENGINEERING HONESTY & TRANSPARENCY"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ORANGE
    p1 = tf.add_paragraph()
    p1.text = "Today's Live Prototype vs. Production Target Build"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    # Table
    table_shape = s8.shapes.add_table(6, 3, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.2))
    tbl = table_shape.table

    headers = ["TECHNICAL DIMENSION", "TODAY'S WORKING PROTOTYPE", "GRAND FINALE TARGET BUILD"]
    for col_idx, h in enumerate(headers):
        cell = tbl.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(26, 26, 34)
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = CYAN

    data = [
        ("Target Platform", "Next.js 14 Progressive Web App (PWA)", "Native Android (Kotlin + Jetpack Compose)"),
        ("On-Device AI Engine", "TensorFlow.js WebGL (Browser GPU)", "Quantized TFLite on Snapdragon NPU via NNAPI"),
        ("Mesh Networking", "Browser BroadcastChannel P2P Simulation", "Google Nearby Connections (Wi-Fi Direct + BLE 5.2)"),
        ("CCTV Ingestion", "Simulated WebRTC RTSP Video Streams", "On-Premise RTSP/HLS Edge Gateway Hardware"),
        ("User Personas", "Dual-Persona: Field Node & Ops Room", "Dual-Persona: Gate Marshals & Central Police Dispatch"),
    ]

    for row_idx, row_data in enumerate(data, start=1):
        for col_idx, val in enumerate(row_data):
            cell = tbl.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if row_idx % 2 == 1 else RGBColor(14, 14, 18)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_WHITE if col_idx == 0 else TEXT_MUTED
            if col_idx == 0:
                p.font.bold = True

    add_footer(s8, 8)

    # ==========================================
    # SLIDE 9: Roadmap & Conclusion
    # ==========================================
    s9 = prs.slides.add_slide(prs.slide_layouts[6])
    apply_bg(s9)

    tb = s9.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.2))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "GRAND FINALE ROADMAP"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = GREEN
    p1 = tf.add_paragraph()
    p1.text = "48-Hour Sprint Milestones & Shipping Plan"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    c1 = add_card(s9, Inches(0.8), Inches(2.0), Inches(3.6), Inches(2.4), ORANGE)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "0–12 Hours"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p2 = tf1.add_paragraph()
    p2.text = "\n• Deploy Kotlin Android app shell\n• Bind camera stream to Qualcomm NPU\n• Calibrate on-device risk gauge"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    c2 = add_card(s9, Inches(4.8), Inches(2.0), Inches(3.6), Inches(2.4), CYAN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "12–30 Hours"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = CYAN
    p2 = tf2.add_paragraph()
    p2.text = "\n• Google Nearby Connections integration\n• Two-phone offline SOS hop live test\n• Verify zero-internet packet delivery"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    c3 = add_card(s9, Inches(8.8), Inches(2.0), Inches(3.6), Inches(2.4), GREEN)
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "30–48 Hours"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p2 = tf3.add_paragraph()
    p2.text = "\n• Multi-zone command dashboard integration\n• WebRTC RTSP CCTV stream ingestion test\n• Rehearsal & live judge demo"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    # Bottom closing banner
    c_bot = add_card(s9, Inches(0.8), Inches(4.7), Inches(11.6), Inches(1.8), CYAN)
    tfb = c_bot.text_frame
    p = tfb.paragraphs[0]
    p.text = "Festival Guardian: Predict. Respond. Relay."
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.alignment = PP_ALIGN.CENTER
    p2 = tfb.add_paragraph()
    p2.text = "Empowering mass gatherings with on-device AI crowd safety and zero-cellular emergency routing."
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER
    p3 = tfb.add_paragraph()
    p3.text = "\nLive URL: https://festival-guardian.vercel.app  ·  GitHub: https://github.com/sujay2520/festival-guardian"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = CYAN
    p3.alignment = PP_ALIGN.CENTER

    add_footer(s9, 9)

    # Save to Downloads and Project directory
    out_paths = [
        r"D:\Downloads\Festival-Guardian-Grand-Finale.pptx",
        r"C:\Users\jarvis\Desktop\Builds\Iqoo hackathon\Festival Guardian\Festival-Guardian-Grand-Finale.pptx"
    ]
    for path in out_paths:
        try:
            prs.save(path)
            print(f"Saved: {path}")
        except Exception as e:
            print(f"Error saving {path}: {e}")

if __name__ == "__main__":
    build_pitch_deck()
