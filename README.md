# CrimeLens

## Overview
CrimeLens is a crime intelligence web application that allows users to:
- Manage crime incidents (CRUD)
- Visualize analytics such as stats, trends, hotspots, and maps
- Perform AI-assisted analysis via a Python ML module (prediction/training/risk scoring)

## Repository Structure
- `frontend/` — React UI
- `backend/` — Node/Express + MongoDB REST API
- `ai-module/` — Python ML models, training, inference and analysis endpoints

## Key Fix (Crime Update 500: ObjectId CastError)
### Problem
While editing a crime, the UI would fail with:
- **500 Internal Server Error** on `PUT /api/crimes/:id`
- Backend log error (example):
  > Cast to ObjectId failed for value "" (type string) at path "location.address.policeStation" because of BSONError

### Root Cause
The frontend was sending empty strings (`""`) for ObjectId fields that are optional on update:
- `location.address.policeStation`
- (also commonly) `location.address.district`
- (also commonly) `crimeType`

When `runValidators: true` is enabled in the backend update path, Mongoose attempts to cast these empty strings to ObjectId and throws, causing the 500.

### Fix Implemented
**File:** `frontend/src/components/crimes/CrimeForm.jsx`

**What changed:**
- In `handleSubmit`, the payload is deep-cloned into `payload`.
- Before calling the API (`crimeAPI.update` / `crimeAPI.create`), the code removes empty-string values for ObjectId fields:
  - `payload.crimeType` if `''`
  - `payload.location.address.district` if `''`
  - `payload.location.address.policeStation` if `''`

This ensures the backend never receives `""` for ObjectId fields during update/create.

### How to Verify
1. Start backend:
   ```bash
   cd /Users/kanhaiyapatel/CrimeLens && npm --prefix backend run dev
   ```
2. Open the Crime section in the UI.
3. Edit a crime leaving District / Police Station unselected (blank).
4. Click **Update**.
5. Confirm:
   - No backend 500 occurs.
   - The update succeeds.

## Running the Project
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### AI Module (Python)
```bash
cd ai-module
pip install -r requirements.txt
python app.py
```

## Notes
- Ensure MongoDB is running and environment variables are configured.
- If you change backend port mappings, also update `frontend/.env` (`VITE_API_URL`).

