# SmartFin AI – Multi-Agent Personal Finance Assistant

SmartFin AI is an intermediate-level, AI-powered personal finance management mobile application built with React Native (Expo) and a Python (FastAPI) backend using LangGraph multi-agent architecture, Google Gemini, and MongoDB Atlas.

---

## Technology Stack

- **Mobile Frontend:** React Native, Expo, TypeScript, Expo Router, NativeWind, Gifted Charts, Lucide Icons, Axios, React Hook Form, Zod.
- **Backend:** Python 3.13, FastAPI, LangGraph, Google Gemini API, Motor (async MongoDB driver), Beanie ODM, Pydantic v2, Pandas, ReportLab.
- **Database:** MongoDB Atlas (`smartfin_ai`), MongoDB Compass / Atlas Data Explorer for management.

---

## Getting Started

### 1. Database Setup (MongoDB Atlas)
1. Ensure your MongoDB Atlas cluster is active, a database user with `Read and write to any database` role exists, and Network Access (`0.0.0.0/0` or your IP) is enabled.
2. Copy your Python connection string (`mongodb+srv://...`).
3. You do not need to create collections manually—the backend automatically creates `smartfin_ai`, all 9 collections, indexes, and seeds default categories on startup.

### 2. Backend Setup
1. Open terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
   Edit `backend/.env` and paste your `MONGODB_URI` and `GEMINI_API_KEY`.

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Visit `http://localhost:8000/api/health` or `http://localhost:8000/docs` to verify!

### 3. Mobile Frontend Setup
1. Open terminal and navigate to `mobile/`:
   ```bash
   cd mobile
   ```
2. Install packages (if not already done):
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npx expo start -c
   ```
