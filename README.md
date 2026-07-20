# 🚔 CrimeLens
### AI-Powered Crime Analytics & Investigation Platform

<div align="center">

### Karnataka State Police (KSP) Datathon 2026 Submission

*Transforming Crime Data into Actionable Intelligence through Artificial Intelligence, Data Analytics, and Interactive Visualization.*

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-000000?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-Hackathon-blue)

</div>

---

# 📌 Overview

CrimeLens is an AI-powered crime analytics platform developed for the **Karnataka State Police (KSP) Datathon 2026**.

The platform helps law enforcement agencies analyze crime records, discover hidden relationships, identify crime hotspots, visualize trends, and generate actionable insights from large crime datasets.

CrimeLens combines secure data management, interactive dashboards, network analysis, statistical analytics, and machine learning techniques to support faster and more informed decision-making.

---

# 🎯 Problem Statement

Traditional crime analysis often involves manually reviewing large volumes of records, making it difficult to:

- Identify crime hotspots
- Detect emerging crime trends
- Analyze criminal relationships
- Compare district-level crime patterns
- Support evidence-based policing

CrimeLens addresses these challenges by providing a unified platform for crime analytics and visualization.

---

# 💡 Solution

CrimeLens transforms raw crime data into meaningful intelligence through:

- AI-assisted analytics
- Interactive dashboards
- Heatmap visualization
- Network relationship analysis
- Crime trend monitoring
- Statistical reporting
- Secure role-based access

---

# ✨ Key Features

## 📊 Crime Analytics Dashboard

- Crime statistics
- District-wise comparison
- Monthly crime trends
- Category analysis
- Yearly reports

---

## 🗺 Geographic Crime Visualization

- Crime Heatmaps
- District analytics
- Location-based filtering
- Interactive visualization

---

## 🕸 Criminal Network Analysis

- Criminal relationship graphs
- Victim-offender mapping
- Investigation support
- Link analysis

---

## 📈 Advanced Analytics

- Correlation Analysis
- Statistical reports
- Crime pattern discovery
- Trend identification

---

## 🔐 Secure Authentication

- JWT Authentication
- Role-Based Access Control
- Secure APIs
- Protected routes

---

## 📁 Crime Management

- Crime Incident Management
- FIR Records
- Criminal Database
- Victim Database
- Evidence Management

---

# 🧠 AI & Analytics Components

The platform incorporates analytical techniques including:

- Crime Trend Analysis
- Crime Correlation Analysis
- Pattern Recognition
- District Performance Analytics
- Data Visualization
- Network Relationship Analysis

---

# 🏗 System Architecture

```
                   +----------------------+
                   |     React Frontend   |
                   +----------+-----------+
                              |
                              |
                    REST API Requests
                              |
                              |
                 +------------v------------+
                 |     Express Backend     |
                 +------------+------------+
                              |
       +----------------------+----------------------+
       |                                             |
+------v------+                              +--------v--------+
| Authentication|                            | Business Logic  |
+-------------+                              +----------------+
                                                     |
                                                     |
                                            +--------v--------+
                                            |    MongoDB      |
                                            +--------+--------+
                                                     |
                                                     |
                                            +--------v--------+
                                            | Analytics Engine|
                                            +-----------------+
```

---

# 🛠 Technology Stack

## Frontend

- React.js
- Redux Toolkit
- Tailwind CSS
- React Router
- Axios
- Recharts
- Leaflet

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

---

## Database

- MongoDB Atlas

---

## Analytics

- Correlation Analysis
- Network Analysis
- Statistical Processing

---

# 📂 Project Structure

```
CrimeLens
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── redux
│   │   ├── utils
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone git@github.com:kanhaiyapatel59/CrimeLens.git
```

```
cd CrimeLens
```

---

## Backend Setup

```
cd backend
npm install
```

Create `.env`

```
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
NODE_ENV=development
```

Run Backend

```
npm run dev
```

---

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# 🔑 Authentication

The application uses:

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Authorization

---

# 📊 Core Modules

✅ Dashboard

✅ Crime Management

✅ Criminal Records

✅ FIR Management

✅ Victim Management

✅ District Analytics

✅ Correlation Analysis

✅ Network Analysis

✅ Heatmap Visualization

✅ Reports

---

# 📸 Screenshots

> screenshots 

Example:

```
screenshots/

dashboard.png

crime-map.png

analytics.png

network-analysis.png

login.png
```

---

# 🚀 Future Enhancements

- Predictive Crime Forecasting
- AI Investigation Assistant
- Natural Language Crime Query
- Mobile Application
- Real-Time Alert System
- CCTV Integration

---

# 👥 Team

| Name | Role |
|------|------|
| Kanhaiya Patel | Full Stack Developer |
| Ranjit Shah Kanu | Backend |
| Astha Gupta | Frontend |
| Manish Basnet | AI / Analytics |
| Mansur Ansari | Testing & Documentation |

---

# 🏆 Developed For

**Karnataka State Police (KSP) Datathon 2026**

---

# 🙏 Acknowledgements

- Karnataka State Police
- Hack2Skill
- MongoDB
- React Community
- Node.js Community
- Open Source Contributors

---

# 📄 License

This project has been developed exclusively as a submission for the **Karnataka State Police (KSP) Datathon 2026**.

---

<div align="center">

### ⭐ Thank you for reviewing CrimeLens ⭐

Empowering Data-Driven Policing Through AI & Analytics

</div>