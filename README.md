# CrimeLens
### AI-Powered Crime Analytics & Investigation Platform

CrimeLens is an intelligent crime analytics platform developed for the **Karnataka State Police (KSP) Datathon 2026**. The platform leverages Artificial Intelligence, Machine Learning, Data Visualization, and Network Analysis to help law enforcement agencies analyze crime patterns, identify hotspots, discover criminal connections, and make data-driven decisions.

---

# Features

## AI Crime Analytics
- Crime trend analysis
- Crime hotspot prediction
- District-wise crime comparison
- Time-based crime analytics
- Predictive crime insights

## Interactive Dashboard
- Real-time analytics dashboard
- Crime statistics visualization
- Charts and graphs
- Heatmaps
- Geographic crime distribution

## Network Analysis
- Criminal relationship graph
- Victim-offender connections
- Gang and organization mapping
- Investigation support
- Link analysis

## Crime Management
- Crime incident management
- FIR record management
- Criminal database
- Victim records
- Evidence tracking

## AI Features
- Crime prediction
- Pattern recognition
- Intelligent recommendations
- Risk assessment
- Automated analytics

## Security
- JWT Authentication
- Role-Based Access Control
- Secure API
- Protected Routes
- Encrypted Passwords

---

# Technology Stack

## Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- React Router
- Axios
- Recharts
- Leaflet Maps

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Multer

## AI & Analytics
- Python
- Machine Learning
- Correlation Analysis
- Network Graph Analysis
- Statistical Analytics

---

# System Architecture

```
Frontend (React)
        │
        ▼
REST API (Express.js)
        │
        ▼
Authentication Layer
        │
        ▼
Business Logic
        │
        ▼
MongoDB Database
        │
        ▼
Analytics Engine
        │
        ▼
AI Prediction Module
```

---

# Project Structure

```
CrimeLens/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone git@github.com:kanhaiyapatel59/CrimeLens.git
```

```bash
cd CrimeLens
```

---

# Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create environment file

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Run backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm run dev
```

---

# API Features

- Authentication
- User Management
- Crime Management
- Dashboard Analytics
- Crime Prediction
- Correlation Analysis
- Network Analysis
- Heatmap Analytics
- Report Generation

---

# Database

MongoDB collections include

- Users
- CrimeIncidents
- Criminals
- Victims
- PoliceStations
- Districts
- FIR
- Evidence
- CrimeCategories
- Investigations
- CrimePredictions
- Analytics

---

# AI Modules

- Crime Trend Prediction
- Crime Correlation Analysis
- Criminal Network Detection
- Hotspot Identification
- Risk Assessment
- District Analytics

---

# Security Features

- JWT Authentication
- Password Hashing
- Protected APIs
- Role-Based Authorization
- Secure Database Access

---

# Future Enhancements

- Real-time CCTV Analytics
- Face Recognition Integration
- Voice-Based Crime Query Assistant
- Mobile Application
- Advanced Deep Learning Models
- Live Crime Monitoring

---

# Contributors

- Kanhaiya Patel
- Manish basnet
- Mansur Ansari
- Astha Gupta
- Ranjit shah kan
- CrimeLens Team

---

# License

This project was developed for educational and hackathon purposes as part of the **Karnataka State Police (KSP) Datathon 2026**.

---

# Acknowledgements

- Karnataka State Police
- Hack2Skill
- MongoDB
- React
- Node.js
- Express.js
- Open Source Community