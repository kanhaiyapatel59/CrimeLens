# 🚔 CrimeLens
### AI-Powered Crime Analytics & Intelligence Platform

<div align="center">

### Karnataka State Police (KSP) Datathon 2026 Submission

*Transforming Crime Data into Actionable Intelligence through Artificial Intelligence, Data Analytics, and Interactive Visualization.*

[![Live Frontend](https://img.shields.io/badge/🌐_Live_Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://crime-lens-eta.vercel.app)
[![Live Backend](https://img.shields.io/badge/⚡_Live_Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://crimelens-backends.onrender.com)
[![Developer Portfolio](https://img.shields.io/badge/Developer_Portfolio-Kanhaiya_Patel-7C3AED?style=for-the-badge)](https://portfolio-kanhaiya-patel.vercel.app/)

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js_24-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express_4-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb)](https://mongodb.com/)

</div>

---

## 🌐 Live URLs & Deployment Links

- **Frontend Application (Vercel)**: [https://crime-lens-eta.vercel.app](https://crime-lens-eta.vercel.app)
- **Backend API Server (Render)**: [https://crimelens-backends.onrender.com](https://crimelens-backends.onrender.com)
- **Backend Health Check**: [https://crimelens-backends.onrender.com/health](https://crimelens-backends.onrender.com/health)
- **Cloud Database Seed Route**: [https://crimelens-backends.onrender.com/api/seed](https://crimelens-backends.onrender.com/api/seed)

---

## 🔑 Demo Access Credentials

| User Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@crimelens.com` | `Admin@123` | Full System & Admin Privileges |
| **SCRB State Officer** | `scrb@crimelens.com` | `SCRB@123` | State Records & Analytics |

---

## 📌 Overview

CrimeLens is an enterprise-grade AI-powered crime intelligence and analytics platform developed for the **Karnataka State Police (KSP) Datathon 2026**.

The platform empowers law enforcement officers, station house officers (SHOs), and intelligence analysts to monitor real-time crime incidents, predict high-risk spatial hotspots, profile repeat criminal syndicates, run socio-economic correlation matrices, optimize tactical patrol deployments, and generate official briefings.

---

## ✨ Key Features & Capabilities

### 📊 Real-Time Crime Analytics & Dashboard (`/dashboard`)
- **State-wide Incident Metrics**: Live incident counters, high-risk case distributions, and real-time case resolution rates.
- **District-Level Comparison**: Comparative crime metrics across Karnataka districts (*Bengaluru Urban, Mysuru, Hubballi-Dharwad, Mangaluru, Belagavi, Kalaburagi, etc.*).
- **Diurnal Time-Series Trends**: Peak crime hour tracking, day-of-week patterns, and severity classification breakdown.
- **Defensive Chart Containers**: Auto-bounding responsive layout preventing resize overflow warnings.

### 📁 Smart Bulk FIR Ingestion Engine (`/crimes`)
- **Multi-Policy Duplicate Handling**:
  - **Update Existing (Upsert)**: Update existing database records matching uploaded FIR numbers without rejection.
  - **Auto-rename Duplicates**: Auto-generate unique FIR suffixes (`_DUP`) so test batches can be imported side-by-side.
  - **Skip Duplicates**: Ignore duplicate FIRs gracefully without failing the batch.
  - **Strict (Reject Duplicates)**: Flag duplicate FIR numbers for strict data auditing.
- **Sample CSV Generator**: One-click **"Sample CSV"** download providing a pre-formatted template compliant with system schemas.
- **Excel & Encoding Protection**: Automatic UTF-8 BOM (`\uFEFF`) sanitization and flexible column header alias matching (`firNumber`, `CrimeNo`, `case_number`, etc.).
- **Granular Progress & Error Breakdown**: Clear status chips for *Created*, *Updated*, *Skipped*, and *Failed* with per-row FIR error chips.

### 🚔 Tactical Patrol Deployment & Route Optimizer (`/api/tactical`)
- **Shift-Based Route Generation**: Morning, evening, and night shift patrol itineraries ranked by historical hotspot density.
- **Priority Waypoints**: Checkpoint sequencing linking critical risk zones to nearby police station jurisdictions.
- **Modus Operandi (MO) Linkage**: Pattern-matching engine linking recurring crime signatures, keywords, and suspect modus operandi.

### 🔬 Forensic Intelligence & Evidence Hub (`/forensics`)
- Ballistics analysis, digital evidence tracking, chain-of-custody verification, and lab status management.

### 🤖 AI Assistant & Conversational Intelligence (`/ai-chat`)
- Powered by **Groq Llama 3.3 70B** and domain-specific crime intelligence prompting.
- **Voice Dictation (Speech-to-Text)**: Officer voice command input via Web Speech API.
- **Text-to-Speech (Read Aloud)**: Audio playback of synthesized tactical briefings.
- **Quick Prompts**: 7-day hotspot matrix, repeat offender profiling, and SCRB executive summaries.
- Export chat transcripts directly as Markdown files.

### 📄 Persistent Reports & Data Export (`/reports`)
- Configure briefings by report type (Crime Summary, Network Analysis, AI Insights, District Comparison, Trend Analysis).
- **Real File Exports**: Export live FIR incident datasets directly into **CSV spreadsheets** and **JSON payloads**.
- Real-time MongoDB persistence for saved reports with view/print/delete controls.

### 🗺️ Interactive Geographic Heatmaps (`/map`)
- Leaflet map clusters displaying incident locations, police stations, and risk scores.
- Spatial filtering by severity, district, and date ranges.

### 🕸️ Criminal Network Analysis (`/network`)
- Graph visualization linking offenders, suspects, gang syndicates, victims, and shared modus operandi (MO).

### 📈 Socio-Economic Correlation Analysis
- Pearson correlation matrix evaluating crime rates against socio-economic factors (unemployment, literacy, poverty, urbanization).

### 🎨 Neumorphic Modern UI System
- Ergonomic Neumorphic soft-shadow interface with sticky non-scrolling sidebars, smooth transitions, and accessible contrast.
- Global AI Copilot drawer accessible from every screen.

---

## 🏗️ System Architecture

```
                       +-----------------------------------+
                       |      Vercel React 18 Frontend     |
                       |  (Redux Toolkit, Tailwind, MUI)   |
                       +-----------------+-----------------+
                                         |
                                REST API (JSON)
                                         |
                       +-----------------v-----------------+
                       |     Render Express Node.js Server |
                       |    (JWT Auth, RBAC, Controllers)   |
                       +-----------------+-----------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
    +----------v----------+                             +----------v----------+
    |   MongoDB Atlas     |                             |  CrimeLens AI       |
    |  Cloud Database     |                             |  Intelligence Engine|
    +---------------------+                             +---------------------+
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit & React Query
- **Styling**: Tailwind CSS & Material-UI (MUI v5)
- **Visualization**: Recharts, Leaflet, Framer Motion
- **Markdown & Speech**: React Markdown, Web Speech API

### Backend
- **Runtime**: Node.js 24 & Express.js
- **Database**: MongoDB Atlas (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Security & Logging**: Winston Logger, Helmet, CORS, Rate Limiting, Express Validator

---

## 📂 Project Structure

```
CrimeLens
├── backend
│   ├── src
│   │   ├── config/             # Database & environment configurations
│   │   ├── controllers/        # Auth, Crime, Report, Dashboard, Tactical, AI controllers
│   │   ├── database/seeds/     # Database seeders (roles, districts, users, crimes)
│   │   ├── middlewares/        # Authentication & error handling middleware
│   │   ├── models/             # Mongoose models (User, CrimeIncident, Suspect, etc.)
│   │   ├── routes/             # Express API routes (auth, crimes, dashboard, tactical)
│   │   ├── services/           # AIService, TacticalService, CorrelationService
│   │   └── server.js           # Express server entry point
│   ├── package.json
│   └── render.yaml             # Render deployment configuration
│
├── frontend
│   ├── src
│   │   ├── api/                # Axios API service instances
│   │   ├── components/         # Reusable Neumorphic UI components & layouts
│   │   │   ├── charts/         # Responsive Recharts wrappers
│   │   │   ├── crimes/         # CrimeDetail, CrimeForm, BulkUpload
│   │   │   ├── layout/         # Header, Fixed Sidebar, Navbar, Footer
│   │   │   └── common/         # GlobalAiCopilot, StatCard, ErrorBoundary
│   │   ├── pages/              # Dashboard, Crimes, Map, Network, Reports, AIChat, Forensics
│   │   ├── redux/              # Redux slices for auth & application state
│   │   └── main.jsx            # App entry point
│   ├── vercel.json             # Vercel SPA routing configuration
│   └── vite.config.js
│
├── sample_csv_data/            # Original batch CSV sample data
├── sample_csv_data_2/          # 10 batch CSV files (200 records ready for manual upload)
├── sample_csv_data_3/          # 10 batch CSV files (multi-district ready-to-test batches)
├── sample_csv_data_4/          # 10 batch CSV files (200 fresh non-colliding records, 20 per file)
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Clone Repository

```bash
git clone git@github.com:kanhaiyapatel59/CrimeLens.git
cd CrimeLens
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/crimelens
JWT_SECRET=super_secure_jwt_secret_key_2026
JWT_ACCESS_SECRET=super_secure_jwt_access_secret_key_2026
JWT_REFRESH_SECRET=super_secure_jwt_refresh_secret_key_2026
ADMIN_EMAIL=admin@crimelens.com
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
```

Start Backend Server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5001
```

Start Frontend Dev Server:
```bash
npm run dev
```

---

## 👥 Team

| Name | Role |
| :--- | :--- |
| **Kanhaiya Patel** | Lead Full Stack & AI Developer |
| **Ranjit Shah Kanu** | Backend Systems & Database Engineer |
| **Astha Gupta** | Frontend UI/UX Engineer |
| **Manish Basnet** | AI & Predictive Analytics Engineer |
| **Mansur Ansari** | QA & Documentation Lead |

---

## 🏆 Developed For

**Karnataka State Police (KSP) Datathon 2026**

---

## 📄 License

This project is developed for the **Karnataka State Police (KSP) Datathon 2026**.