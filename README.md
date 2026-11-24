# 🚀 AI-Based Pothole Detection, Severity Assessment and Geo-Spatial Road Maintenance Mapping System

### Namma Parishkara AI — Smart Civic Issue Detection & Complaint Automation Platform

[![Academic Project](https://img.shields.io/badge/Project-Academic%20Mini%20Project-purple.svg)](SYNOPSIS.md)
![AI](https://img.shields.io/badge/AI-RAG%20%2B%20Computer%20Vision-blue)
![Python](https://img.shields.io/badge/Python-Backend-yellow)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![YOLO](https://img.shields.io/badge/Object%20Detection-YOLO11n%20%2F%20YOLOv8-green)
![License](https://img.shields.io/badge/Open%20Source-Hackathon-orange)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-5a67d8.svg)](https://prisma.io/)
[![PWA](https://img.shields.io/badge/PWA-Installable-f59e0b.svg)](https://web.dev/progressive-web-apps/)

> **📄 Official Project Documentation**: Complete academic project synopsis available in [SYNOPSIS.md](SYNOPSIS.md).

---

# 🌍 Overview

**Namma Parishkara AI** (ನಮ್ಮ ಪರಿಷ್ಕಾರ AI / ನಮ್ಮ ತುಮಕೂರು ಪರಿಷ್ಕಾರ) is an intelligent civic infrastructure monitoring and grievance automation platform designed for Tumkur District and urban municipalities. It empowers citizens to report local civic issues and automates municipal department dispatching:

* 🕳️ **Potholes & Road Distress** (PWD / City Corporation)
* 🗑️ **Garbage Overflow & Solid Waste** (Health & Sanitation)
* 🌧 **Drain Blockage & Sewage Leakage** (KUWSDB / TCC)
* 💡 **Streetlight Failure & Dark Spots** (BESCOM)
* ⚡ **Live Dangling Wires & Electrical Hazards** (BESCOM Emergency)
* 🚰 **Drinking Water Pipeline Bursts** (KUWSDB)

The system leverages **Artificial Intelligence, Computer Vision (YOLO11n / YOLOv8), and Retrieval-Augmented Generation (RAG)** to:

✔ Detect road hazards and potholes directly from camera photos with bounding boxes  
✔ Analyze distress severity and auto-escalate to **Phase 4: Emergency Hazard (12h SLA)**  
✔ Retrieve municipal policies, citizen charters, and SLA deadlines using RAG  
✔ Generate structured civic complaints and official dispatch tickets automatically  
✔ Stamp tamper-evident GPS coordinates and date/time watermarks onto images (Geo-Tag)  

The project demonstrates how **Edge AI and Generative Governance improve Smart City administration.**

---

# 🧠 Core AI Technologies

| Technology | Purpose | Implementation |
| :--- | :--- | :--- |
| **YOLO11n / YOLOv8** | Detects potholes, craters, and road cracks from images | Ultralytics YOLO11 Nano (2.6M params, 640x640) + PyTorch / Node CV |
| **RAG Engine** | Knowledge retrieval from municipal civic policy documents | Policy embeddings + Vector search over Tumkur municipal bylaws |
| **NLP Classifier** | Categorizes citizen complaints in Kannada & English | Multilingual keyword & semantic classifier + Gemini API |
| **Interactive Chatbot** | Answers citizen policy questions & auto-drafts complaints | Built-in RAG Civic Assistant + Ollama / Mistral local LLM |
| **Geo-Tag Engine** | Burns GPS coordinates, Taluk, accuracy, & time on canvas | WebRTC live camera + HTML5 Canvas dynamic watermark |

---

# 🏗 System Architecture

```
Citizen (PWA Web App / Mobile)
   │
   ├─► Live Camera with GPS Geo-Tagging Watermark
   │
   ▼
Frontend (React 18 + Vite + TailwindCSS + Leaflet OSM)
   │
   ├─► Visual Emergency Phase Badge (Phase 1 to Phase 4)
   ├─► Interactive YOLO11n Bounding Box Overlay
   ├─► Kannada Voice Input (Web Speech API)
   │
   ▼
Backend REST API (Node.js Express + Python CV)
   │
   ├── Computer Vision Engine (YOLO11n / YOLOv8)
   │      │
   │      ├─ Anchor-free Pothole Detection Head
   │      ├─ Bounding Box Coordinates [x, y, w, h] & Confidence %
   │      └─ Severity & Emergency SLA Escalation (12h - 72h)
   │
   ├── RAG & NLP Engine
   │      │
   │      ├─ Municipal Policy Documents & Citizen Charters
   │      ├─ Vector Search & Similarity Matcher
   │      └─ Local LLM / Ollama (Mistral) & Gemini
   │
   ▼
Automated Complaint Generator & Lifecycle Tracker
   │
   ▼
Municipal Department Dispatch (PWD, TCC, BESCOM, KUWSDB, Gram Panchayat)
```

---

# 🤖 RAG Pipeline (Civic Policy Retrieval)

The **Retrieval-Augmented Generation (RAG)** system allows citizens and officers to query municipal bylaws, turnaround standards, and citizen rights offline or online:

```
User Question (Kannada or English)
     │
     ▼
Embedding & Semantic Query Analyzer
     │
     ▼
Vector Similarity Search
     │
     ▼
Retrieve Relevant Municipal Policies & SLAs
     │
     ▼
LLM Response & Complaint Ticket Generation
     │
     ▼
Structured Civic Answer & Actionable Dispatch
```

### Benefits:
✔ **Zero Hallucination**: Directly cites municipal bylaws and government orders (G.O.).  
✔ **Works Offline & Edge**: Pre-indexed policy store for rural areas with spotty internet.  
✔ **Actionable Output**: Converts chat conversations directly into a registered complaint ticket.

---

# 📸 Image Detection System (YOLO11n / YOLOv8)

The platform detects road distress and potholes using an **Ultralytics YOLO11 Nano (yolo11n)** model with 2.6M parameters:

```
User Takes Photo (Live Camera)
      │
      ▼
Geo-Tag Stamp Applied (GPS Lat/Lon + Timestamp)
      │
      ▼
YOLO11n Neural Inference (640x640)
      │
      ▼
Bounding Box Regression & Confidence Scoring (e.g. 96.2%)
      │
      ▼
Severity Classification (Critical / High / Medium)
      │
      ▼
Auto Emergency Phase Escalation (Phase 4: 12h SLA)
      │
      ▼
Auto Complaint Drafted to PWD / City Corporation
```

### Example Output:
```json
{
  "detectedIssue": "Pothole",
  "confidence": 0.962,
  "depthEstimate": "Deep Crater (~14 cm)",
  "severity": "CRITICAL",
  "department": "Public Works Department (PWD)",
  "category": "Potholes & Road Damage",
  "emergencyPhase": "PHASE_4_EMERGENCY",
  "targetSLA": "12 Hours Urgent Dispatch"
}
```

---

# 💻 Frontend Application

The mobile-first, installable Progressive Web Application (PWA) provides an intuitive civic experience:

### Features:
✔ **Bilingual Kannada & English**: Full localization (`kn.json`, `en.json`) with persistent toggle.  
✔ **Kannada Voice Input (ಧ್ವನಿ ಮೂಲಕ ದೂರು)**: Speech-to-text dictation for rural citizens.  
✔ **Geo-Tag Live Viewfinder**: Embedded camera with crosshairs, camera flip, and watermark burn.  
✔ **Interactive YOLO11n Vision Overlay**: Glowing neon bounding boxes with toggle button `[👁️ YOLO11n ON/OFF]`.  
✔ **Visual Emergency Phase Banners**: Immediate hazard level stamped directly on photos:
  - 🚨 **Phase 4: Emergency Hazard (12h SLA)**
  - ⚠️ **Phase 3: High Priority (24h SLA)**
  - ⚡ **Phase 2: Standard Civic (48h SLA)**
  - ℹ️ **Phase 1: Routine Maintenance (72h SLA)**  
✔ **11 Tumkur Taluks Directory**: Interactive directory with active issue counters and emergency badges.  
✔ **Draggable OpenStreetMap Pin**: Powered by Leaflet to fine-tune exact pothole coordinates.  
✔ **AI Proximity Duplicate Detection**: Haversine distance engine checks 75–100m radius to prevent duplicate tickets.  
✔ **Officer Resolution Proof**: Compulsory upload of post-repair photos before closing tickets.  
✔ **Citizen Reopen Option**: Citizen can reopen issues if unsatisfied with the repair.  
✔ **Offline Support**: Local IndexedDB queue auto-syncs when internet resumes.

---

# 🏛️ Tumkur District Configuration

### 11 Taluks Configured & Seeded:
1. **Tumkur City (ತುಮಕೂರು ನಗರ)** *(10 Wards Seeded)*
2. **Tumkur Rural (ತುಮಕೂರು ಗ್ರಾಮಾಂತರ)**
3. **Gubbi (ಗುಬ್ಬಿ)**
4. **Tiptur (ತಿಪಟೂರು)**
5. **Kunigal (ಕುಣಿಗಲ್)**
6. **Sira (ಶಿರಾ)**
7. **Madhugiri (ಮಧುಗಿರಿ)**
8. **Pavagada (ಪಾವಗಡ)**
9. **Koratagere (ಕೊರಟಗೆರೆ)**
10. **Chikkanayakanahalli (ಚಿಕ್ಕನಾಯಕನಹಳ್ಳಿ)**
11. **Turuvekere (ತುರುವೇಕೆರೆ)**

### Departments & SLA Standards:
- **PWD (Public Works Department)**: Road Damage (72h), Deep Crater Emergency (12h)
- **TCC (Tumkur City Corporation)**: Garbage Dumps (24h), Blocked Drainage (24h), Public Toilets (24h)
- **BESCOM (Electricity)**: Dangling Live Wire (12h Emergency), Streetlight Out (48h)
- **KUWSDB (Water Supply)**: Pipeline Burst (24h), Drinking Water Contamination (24h)
- **Gram Panchayat**: Rural Water Motor / Borewell (48h)
- **Health Department**: Dengue / Malaria Fogging (48h)
- **Education Department**: Government School Infrastructure Repair (120h)

---

# 👥 Demo Logins & Credentials

| Role | Username / Phone | Password / OTP | Purpose |
| :--- | :--- | :--- | :--- |
| **Citizen** | `9880000005` | `1234` | Citizen reporting & upvoting |
| **Citizen (2)** | `9880000006` | `1234` | Kavitha Murthy (Rural citizen) |
| **PWD Officer** | `9880000003` | `tumkur123` | Road engineer dispatch & resolution proof |
| **TCC Officer** | `9880000002` | `tumkur123` | Municipal health inspector |
| **BESCOM Officer** | `9880000004` | `tumkur123` | Electricity safety lineman |
| **District Admin** | `9880000001` or `admin` | `admin123` | DC & SLA Governance Leaderboard |

*Note: For any newly entered citizen mobile number, the demo OTP is `1234`.*

---

# ⚙ Installation & Quick Start

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/vidyashreegowda34-netizen/AI-pothole-detection-system-.git
cd AI-pothole-detection-system-
```

---

## 2️⃣ Backend Setup (Node.js REST API + YOLO11n Engine)

```bash
cd server
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start
```
*API running at `http://localhost:5000` with 11 taluks, departments, and seed data.*

---

## 3️⃣ Frontend Setup (React PWA)

```bash
cd client
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 4️⃣ Python YOLO11n & RAG Environment (Optional)

```bash
cd server/ai_models
pip install -r requirements.txt

# Run inference on test image
python yolo11n_pothole_detector.py --image ../uploads/test.jpg --save-json

# Run with local Ollama LLM (Mistral)
ollama pull mistral
ollama run mistral
```

---

## 5️⃣ Docker Compose Deployment

```bash
docker-compose up --build -d
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL Port: `5432`

---

# 🖼 Project Screenshots

### 1. Landing Page & 11 Taluks Directory
![Landing Page](https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80)

### 2. Live Geo-Tag Camera & Stamping Engine
![Camera Viewfinder](https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=1200&auto=format&fit=crop&q=80)

### 3. YOLO11n Neural Bounding Box Detection Overlay
![YOLO11n Overlay](https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80)

### 4. Officer Resolution Proof & Administrative Analytics
![Officer Dashboard](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80)

---

# 🚀 Future Improvements

* 🛰️ Live CCTV highway monitoring integration
* 📡 Smart city IoT water pressure sensor alerts
* 📈 Predictive road degradation modeling
* 🚁 Drone-based survey image batch processing

---

# 🏆 Hackathon Impact

This project demonstrates how **Edge AI, Computer Vision, and RAG** modernize civic governance by:
* Slashing complaint registration time from days to seconds
* Preventing fatal two-wheeler pothole accidents with Phase 4 (12h) priority
* Enforcing transparent photographic proof before tickets can be closed
* Empowering non-literate citizens through native Kannada voice dictation

---

# 👨‍💻 Authors & Team

* **Punith**
* **Poornima V**
* **Pihu Ojha**
* **PunyaShree G**

---

⭐ If you like this project, consider starring the repository!
