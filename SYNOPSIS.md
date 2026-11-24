# MINI PROJECT SYNOPSIS

## Project Title
**AI-Based Pothole Detection, Severity Assessment and Geo-Spatial Road Maintenance Mapping System**  
*(Platform Name: Namma Parishkara AI)*

---

## 1. Introduction

Road potholes are a major transportation and public safety problem that can cause vehicle damage, severe traffic congestion, and fatal road accidents, especially for two-wheeler and pedestrian commuters. Traditional methods of identifying potholes manually and prioritizing road repairs are reactive, slow, time-consuming, and prone to administrative delay.

This project implements an end-to-end, AI-powered civic infrastructure monitoring system that automatically detects road potholes and surface distress from camera imagery or live CCTV feeds, estimates their physical severity level, stamps tamper-evident geographic coordinates (GPS Geo-Tagging), and displays their real-time locations on an interactive geospatial map. The system provides an automated dispatch and tracking mechanism to assist municipal road authorities (PWD / City Municipal Corporation) in identifying and prioritizing urgent road maintenance.

---

## 2. Problem Statement

Traditional pothole identification and road repair management suffer from several critical shortcomings:
* Heavy reliance on manual road inspection surveys and delayed citizen physical complaints.
* Lack of objective, standardized severity assessment to prioritize dangerous craters over minor cracks.
* Absence of tamper-evident geospatial location tagging, leading to dispatch confusion and misallocated repair crews.
* Delay in identifying life-threatening road hazards, resulting in preventable two-wheeler skidding accidents.
* Difficulty in maintaining transparent historical records of repair status, SLA turnaround, and photographic resolution proof.

An automated, intelligent system is required to detect potholes in real-time using computer vision, categorize their risk severity, geolocate affected corridors on an interactive map, and generate automated maintenance priority schedules.

---

## 3. Objectives

1. **Automated Computer Vision Detection**: Use state-of-the-art YOLO (YOLO11n / YOLOv8) object detection models to locate potholes and draw bounding boxes around road distress areas in real-time.
2. **Multi-Tier Severity Assessment**: Classify detected potholes into **Low (Routine)**, **Medium**, **High**, and **Critical / Emergency (Phase 4)** severity categories based on visible surface area and estimated crater depth.
3. **Geospatial Location Tagging**: Associate pothole reports with high-precision GPS coordinates (`latitude`, `longitude`, `timestamp`, `taluk`) using WebRTC camera geo-tag stamping.
4. **Interactive Geospatial Visualization**: Display pothole locations, density clusters, and severity markers on an interactive Leaflet + OpenStreetMap interface.
5. **End-to-End Database Lifecycle Tracking**: Maintain a centralized database tracking issues across their complete lifecycle (`SUBMITTED` &rarr; `VERIFIED` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED` &rarr; `REOPENED`).
6. **Prioritized Maintenance Recommendations**: Generate automated SLA turnaround recommendations (12-hour emergency dispatch for deep craters vs 72-hour routine repair) and predictive road degradation indices across regional corridors.

---

## 4. Proposed Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PROPOSED WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
     [Citizen Photo Upload]                       [Live CCTV Highway Stream]
               │                                             │
               ▼                                             ▼
    1. Image Collection                           1. CCTV Frame Capture
  (Camera / Mobile PWA)                         (Corridor Video Surveillance)
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      │
                                      ▼
                      2. Image Preprocessing & Geo-Tagging
                    (Canvas GPS Watermark: Lat/Lon + Time)
                                      │
                                      ▼
                      3. YOLO11n / YOLOv8 Object Detection
                    (Anchor-Free Pothole Bounding Box Heads)
                                      │
                                      ▼
                      4. Severity & Hazard Assessment
             (Area Ratio & Depth Estimation -> Emergency Phase 1-4)
                                      │
                                      ▼
                      5. Geospatial Coordinate Mapping
                     (Leaflet / OpenStreetMap Color Markers)
                                      │
                                      ▼
                      6. Automated Complaint & SLA Prioritization
                    (12h Emergency SLA for Phase 4 Critical Hazards)
                                      │
                                      ▼
                      7. Administrative Governance & Resolution
                  (Officer Dispatch, Resolution Proof & Reopen Audit)
```

### Detailed Pipeline Steps:
1. **Image Collection**: Capture road imagery via mobile camera, user gallery uploads, or live corridor CCTV feeds.
2. **Image Processing & Geo-Tagging**: Retrieve device GPS coordinates and dynamic timestamp; stamp a tamper-evident civic Geo-Tag watermark onto the image canvas.
3. **Pothole Detection**: Execute Ultralytics YOLO11n / YOLOv8 neural inference (640x640 input resolution) to generate normalized bounding boxes `[x, y, w, h]` and confidence metrics (e.g., 96.2%).
4. **Severity Assessment**: Calculate surface distress area ratio and depth indicators to classify into:
   - **Phase 4 (Emergency Hazard - 12h SLA)**: Deep craters (>10cm), multi-pothole clusters, high skidding risk.
   - **Phase 3 (High Priority - 24h SLA)**: Medium-to-large pothole on transit arteries.
   - **Phase 2 (Standard Civic - 48h SLA)**: Moderate asphalt depression.
   - **Phase 1 (Routine - 72h SLA)**: Surface hairline cracks.
5. **Location Identification**: Map coordinates to administrative Taluks, Wards, and local road corridors.
6. **Risk Mapping**: Render color-coded map pins (Red = Critical, Orange = High, Amber = Medium, Green = Low) on an interactive Leaflet OpenStreetMap.
7. **Maintenance Prioritization**: Auto-assign tickets to the Public Works Department (PWD) or City Municipal Corporation with real-time countdown timers.
8. **Dashboard & Reporting**: Provide real-time analytics, resolution proof inspection, and CSV grievance export for municipal engineers and district collectors.

---

## 5. Technologies Used

| Domain | Technology / Tool | Purpose in Project |
|:---|:---|:---|
| **Programming Languages** | Python, JavaScript (ES6+), HTML5, CSS3 | Full-stack development & AI inference |
| **AI & Computer Vision** | Ultralytics YOLO11n, YOLOv8, PyTorch | Pothole detection, bounding box regression |
| **Image Processing** | OpenCV, HTML5 Canvas API | Geo-tag stamping, contrast & frame processing |
| **NLP & RAG** | Retrieval-Augmented Generation, Mistral (Ollama) | Municipal policy retrieval & complaint drafting |
| **Frontend Framework** | React 18, Vite, Tailwind CSS, Lucide Icons | Mobile-first installable Progressive Web App (PWA) |
| **Backend API** | Node.js, Express.js REST API | Business logic, authentication, and routing |
| **Database & ORM** | Prisma ORM, SQLite / PostgreSQL (PostGIS) | Relational data persistence & spatial queries |
| **Mapping Engine** | Leaflet.js, OpenStreetMap | Interactive geospatial road hazard mapping |
| **DevOps & Containers** | Docker, Docker Compose | Multi-container microservice deployment |

---

## 6. Implementation Architecture in Codebase

| Methodology Stage | Codebase Implementation | Location in Project |
|:---|:---|:---|
| **YOLO11n / YOLOv8 Detection** | Computer Vision service with bounding box regression | [`server/src/services/yoloService.js`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/server/src/services/yoloService.js) |
| **Python YOLO11 CLI Pipeline** | Standalone script for PyTorch inference & ONNX export | [`server/ai_models/yolo11n_pothole_detector.py`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/server/ai_models/yolo11n_pothole_detector.py) |
| **Camera Geo-Tag Stamping** | WebRTC camera viewfinder with GPS canvas watermark | [`client/src/utils/geoTag.js`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/utils/geoTag.js) & [`client/src/components/GeoCameraModal.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/components/GeoCameraModal.jsx) |
| **Severity Assessment** | Phase 1 to Phase 4 automated SLA prioritization | [`server/src/services/aiService.js`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/server/src/services/aiService.js) |
| **Geospatial Mapping** | Color-coded severity pins on OpenStreetMap | [`client/src/components/IssueMap.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/components/IssueMap.jsx) & [`client/src/pages/MapView.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/pages/MapView.jsx) |
| **Live CCTV Monitoring** | Corridor video surveillance with real-time detection | [`client/src/pages/CctvMonitoring.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/pages/CctvMonitoring.jsx) & [`server/src/services/smartCityService.js`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/server/src/services/smartCityService.js) |
| **Predictive Road Repair** | Road Degradation Index (RDI) for regional taluks | [`client/src/pages/PredictiveRepair.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/pages/PredictiveRepair.jsx) |
| **RAG Civic Policy Chatbot** | Answers bylaws and auto-drafts complaints | [`client/src/components/AiCivicChatbot.jsx`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/client/src/components/AiCivicChatbot.jsx) & [`server/src/services/ragService.js`](file:///c:/Users/Vidyashree%20Gowda/mini%20project/server/src/services/ragService.js) |

---

## 7. Expected Outcomes

* **Automated Detection**: Real-time identification of road potholes with >95% confidence from uploaded photos and CCTV feeds.
* **Transparent Prioritization**: Zero-ambiguity risk escalation ensuring hazardous craters receive a 12-hour emergency SLA.
* **Geospatial Visibility**: Complete regional map showing active potholes, hotspot clusters, and maintenance progress.
* **Administrative Accountability**: Compulsory pre-and-post resolution photographic proof before tickets can be closed.
* **Proactive Savings**: 52.4% projected cost savings using predictive maintenance forecasting over reactive patching.

---

## 8. Applications

1. **Municipal Road Maintenance Departments (PWD / NHAI / City Municipalities)**: Real-time work order allocation and field crew monitoring.
2. **Smart City Operations Centers (SCOC)**: Automated surveillance stream analysis and IoT sensor grid alerts.
3. **Public Road Safety & Accident Prevention**: Immediate elimination of dangerous craters before vehicular damage or fatality occurs.
4. **Civic Engagement & Citizen Grievance Redressal**: Transparent platform enabling citizens to report issues in seconds with Kannada and English voice support.

---

## 9. Conclusion

The **AI-Based Pothole Detection, Severity Assessment and Geo-Spatial Road Maintenance Mapping System** integrates artificial intelligence, computer vision, geospatial mapping, and relational database management into a unified civic governance solution. By automating pothole detection, visually classifying hazard severity, and geolocating damaged roads on an interactive map, the platform bridges the gap between citizens and municipal authorities, ensuring safer roads, rapid repairs, and data-driven infrastructure maintenance planning.

---

## 👥 Project Authors & Team
* **Punith**
* **Poornima V**
* **Pihu Ojha**
* **PunyaShree G**
*(Under Guidance / Academic Project Submission)*
