# ನಮ್ಮ ತುಮಕೂರು ಪರಿಷ್ಕಾರ (Namma Tumakuru Parishkara)
### Civic Issue Reporting & Transparent Resolution Platform for Tumkur District, Karnataka

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-5a67d8.svg)](https://prisma.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-10b981.svg)](https://leafletjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-f59e0b.svg)](https://web.dev/progressive-web-apps/)

**Namma Tumakuru Parishkara** is a full-stack, mobile-first, installable Progressive Web Application (PWA) built specifically for Tumkur district, Karnataka. It connects citizens directly with local municipal bodies and district departments (Tumkur City Corporation, PWD, BESCOM, KUWSDB, Gram Panchayats, Health & Education) to report, track, and transparently resolve civic grievances.

---

## 🌟 Key Features

1. **Bilingual by Design (Kannada Default + English)**:
   - Full localization using `react-i18next` with complete translation catalogs (`kn.json`, `en.json`).
   - One-click language switch with persistent user preference.
2. **Kannada Voice Input (ಧ್ವನಿ ಮೂಲಕ ದೂರು)**:
   - Native integration with the Web Speech API (`kn-IN`) allowing citizens in rural or urban areas to dictate issue descriptions by voice.
3. **Live Camera with Civic Geo-Tag Watermark**:
   - Clicking on the photo button immediately triggers the **Live Geo-Tag Camera** (viewfinder with target reticle, camera flip, and shutter).
   - Automatically retrieves high-accuracy GPS coordinates (`navigator.geolocation`) and burns a tamper-evident civic Geo-Stamp watermark onto the photo canvas:
     - 📍 Platform banner: `ನಮ್ಮ ತುಮಕೂರು ಪರಿಷ್ಕಾರ | Verified Civic Issue`
     - 🌐 Exact GPS Coordinates: `LAT: 13.340912° N | LON: 77.101034° E`
     - 📅 Timestamp: Date, Time & Accuracy index (`±5m`)
     - 🏛️ Taluk & Landmark name
   - Auto-syncs the pinned OpenStreetMap coordinates to the photo's exact capture location.
4. **Immediate Emergency Phase on the Picture Itself**:
   - Just by looking at the picture, the emergency urgency phase is immediately visible:
     - 🚨 **PHASE 4: EMERGENCY HAZARD (12h SLA)**: Bold pulsing red banner across the photo with flashing flame icon and 12-hour urgent dispatch timer.
     - ⚠️ **PHASE 3: HIGH PRIORITY (24h SLA)**: High-contrast orange banner across the photo.
     - ⚡ **PHASE 2: MEDIUM CIVIC (48h SLA)**: Amber banner.
     - ℹ️ **PHASE 1: ROUTINE ACTION (72h SLA)**: Green banner.
5. **Tumkur Taluks & Category Explorer**:
   - Interactive directory featuring all 11 Tumkur district taluks.
   - Shows active categories, open issue counters, and glowing emergency alerts per taluk.
   - One-click filtering for taluks, categories, and wards.
6. **Interactive GPS Location & Draggable Map Pin**:
   - Auto-detects GPS coordinates with one click.
   - Draggable OpenStreetMap pin powered by Leaflet to pinpoint exact pothole or leak locations.
7. **AI-Assisted Classification & Spatial Duplicate Detection**:
   - Bilingual NLP classifier auto-suggests category, department, and urgency level from description keywords or Gemini API.
   - **Haversine Distance Engine**: Detects existing unresolved issues within 75–100m to prevent duplicate tickets and encourage community upvoting.
8. **Rigorous Issue Lifecycle & SLA Timers**:
   - `SUBMITTED` &rarr; `VERIFIED` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED`.
   - Real-time SLA countdown timers with overdue alert indicators.
   - **Citizen Reopen Option**: If a citizen is dissatisfied with a resolution, they can reopen the ticket with notes.
9. **Officer Dashboard & Proof of Resolution**:
   - Department officers can view assigned queues, dispatch field crews, and upload photographic proof of resolution with field notes before closing.
10. **District Administration Governance & CSV Export**:
    - Taluk-wise distribution and resolution rates across all 11 Tumkur taluks.
    - Department SLA performance leaderboard.
    - 1-click export of grievance reports to CSV.
11. **Public Transparency & Accountability Portal**:
    - Live public statistics comparing resolved vs. pending complaints.
    - Published SLA standards by department.
12. **Offline-First Resilience (Rural Connectivity Support)**:
    - Built as an installable PWA with service worker caching.
    - Offline submission queue stored in `localStorage` / `IndexedDB` that auto-synchronizes when internet connectivity resumes (`online` event listener).

---

## 🏛️ Tumkur-Specific Configuration

### 11 Taluks Seeded
- **Tumkur City (ತುಮಕೂರು ನಗರ)** *(Urban)*
- **Tumkur Rural (ತುಮಕೂರು ಗ್ರಾಮಾಂತರ)**
- **Gubbi (ಗುಬ್ಬಿ)**
- **Tiptur (ತಿಪಟೂರು)**
- **Kunigal (ಕುಣಿಗಲ್)**
- **Sira (ಶಿರಾ)**
- **Madhugiri (ಮಧುಗಿರಿ)**
- **Pavagada (ಪಾವಗಡ)**
- **Koratagere (ಕೊರಟಗೆರೆ)**
- **Chikkanayakanahalli (ಚಿಕ್ಕನಾಯಕನಹಳ್ಳಿ)**
- **Turuvekere (ತುರುವೇಕೆರೆ)**

### Sample Tumkur City Wards
- Ward 1: Mandipet (ಮಂಡಿಪೇಟೆ)
- Ward 2: Ashok Nagar (ಅಶೋಕ ನಗರ)
- Ward 3: Kyathsandra (ಕ್ಯಾತಸಂದ್ರ)
- Ward 4: SS Puram / Siddaganga Extension (ಎಸ್.ಎಸ್. ಪುರಂ)
- Ward 5: Belagumba (ಬೆಳಗುಂಬ)
- Ward 6: Batwadi (ಬಟವಾಡಿ)
- Ward 7: Melekote (ಮೇಳೆಕೋಟೆ)
- Ward 8: Maralur (ಮರಳೂರು)
- Ward 9: Gandhinagar (ಗಾಂಧಿನಗರ)
- Ward 10: Vinobhanagar (ವಿನೋಬಾನಗರ)

### Government Departments & SLAs
- **TCC (Tumkur City Corporation)**: Garbage (24h), Drainage (24h), Public Toilets (24h), Stray Animals (48h)
- **PWD (Public Works Department)**: Potholes & Road Damage (72h), Footpath encroachment
- **BESCOM (Electricity)**: Dangling High-Voltage Cables (12h - Emergency), Streetlights Out (48h)
- **KUWSDB (Water Supply & Drainage Board)**: Pipeline Burst (24h), Drinking Water Supply (24h)
- **Gram Panchayat (Rural Development)**: Village Borewell & Sanitation (48h)
- **Health & Family Welfare**: Mosquito & Dengue Fogging (48h)
- **Education Department**: Government School Infrastructure Repair (120h)

---

## 👥 Demo Logins & Credentials

For instant demonstration and evaluation, the login page features **1-click quick login shortcuts** or manual sign-in:

| Role | Username / Mobile | Password / OTP | Notes |
|:---|:---|:---|:---|
| **Citizen** | `9880000005` | `1234` | Ramesh Gowda (Tumkur City) |
| **Citizen (2)** | `9880000006` | `1234` | Kavitha Murthy |
| **PWD Officer** | `9880000003` | `tumkur123` | Anand Kumar (Junior Engineer) |
| **TCC Officer** | `9880000002` | `tumkur123` | Suresh Patil (Health Inspector) |
| **BESCOM Officer** | `9880000004` | `tumkur123` | Manjunath Swamy (Gubbi Lineman) |
| **District Admin** | `9880000001` or `admin` | `admin123` | District Collector / Superadmin |

*Note: For any citizen phone number entered during registration/login, the demo OTP is `1234`.*

---

## 🚀 Quick Start Guide (Zero External Dependencies)

### Prerequisites
- Node.js v18+ and npm installed

### 1. Start the Backend API Server
```bash
cd server
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start
```
*The backend starts at `http://localhost:5000` with pre-seeded Tumkur taluks, wards, departments, categories, and realistic sample issues.*

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🐳 Docker Compose Deployment (PostgreSQL + PostGIS)

To launch the complete production stack including PostgreSQL with PostGIS, Express API, and Nginx-served React PWA:

```bash
docker-compose up --build -d
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL Port: `5432`

---

## ☁️ Free Tier Cloud Deployment Guide

### Option A: Render.com (Recommended Free Tier)
1. **Database**: Create a free PostgreSQL instance on [Render](https://render.com). Copy the `Internal Database URL`.
2. **Backend**:
   - Create a Web Service pointing to `/server`.
   - Build Command: `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js`
   - Start Command: `node src/index.js`
   - Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
3. **Frontend**:
   - Create a Static Site pointing to `/client`.
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Set Environment Variable: `VITE_API_URL` pointing to your Render backend URL.

### Option B: Vercel + Supabase
- **Database**: Free Postgres on [Supabase](https://supabase.com).
- **Backend**: Deploy on Railway or Render.
- **Frontend**: One-click deploy on [Vercel](https://vercel.com).

---

## 📁 Repository Structure

```
├── docker-compose.yml        # PostgreSQL + PostGIS + Express + React multi-container setup
├── .env.example              # Environment variables template
├── README.md                 # Setup and architecture documentation
│
├── server/                   # Node.js + Express + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma     # SQLite & PostgreSQL compatible database schema
│   │   └── seed.js           # Seed script for 11 Taluks, 10 Wards, 7 Depts, 6 sample issues
│   ├── src/
│   │   ├── index.js          # Express entrypoint
│   │   ├── config/           # Database & Tumkur constants
│   │   ├── middleware/       # JWT Auth, Multer photo upload, role-based checks
│   │   ├── services/         # Bilingual NLP classifier, Haversine duplicate check, SMS logger
│   │   ├── controllers/      # Auth, Issue CRUD, Taluks, AI, Analytics
│   │   └── routes/           # REST endpoints
│   └── uploads/              # Citizen issue photos and resolution proofs
│
└── client/                   # React 18 + Vite + Tailwind CSS (Mobile-first PWA)
    ├── public/
    │   ├── manifest.json     # PWA Web App Manifest
    │   ├── sw.js             # Service Worker for offline asset caching
    │   └── icons/            # 192x192 & 512x512 PWA icons
    └── src/
        ├── i18n/             # react-i18next setup with kn.json & en.json
        ├── context/          # AuthContext (roles) & OfflineContext (sync queue)
        ├── components/       # Navbar, BottomNav, VoiceInput, GeoCameraModal, IssueCard, IssueMap, Timeline
        ├── utils/            # geoTag.js (Canvas watermark engine)
        └── pages/            # Home, ReportIssue, IssueDetail, MapView, MyReports,
                              # OfficerDashboard, AdminDashboard, Transparency, Login
```

---

## 📜 License
Developed for Tumkur District Civic Governance. Licensed under the MIT License.
