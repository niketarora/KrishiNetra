# KrishiNetra · ISRO Smart Farming

KrishiNetra — AI-powered smart farming platform using satellite data, machine learning, weather intelligence, and multilingual voice assistance to provide field-level crop insights, soil moisture estimation, irrigation advisory, and real-time agricultural recommendations.

Uses the **PASTIS-R** dataset (Sentinel-1 SAR + Sentinel-2 optical) to identify crops on agricultural parcels and recommend irrigation in English and Hindi.

## Project Structure

```
ISRO-Smart-Farming/
├── api/            Vercel Serverless Function entrypoint (index.py)
├── backend/        FastAPI REST & Voice AI Service
│   ├── app.py          App + CORS + Static mounts
│   ├── routes.py       POST /predict & Voice AI endpoints
│   ├── voice_orchestrator.py  Voice AI agent tool router
│   └── sarvam.py       Sarvam AI Saaras STT & Bulbul TTS client
├── models/         ML & Analytics core
│   ├── loader.py           Load Sentinel .npy + metadata
│   ├── feature_extractor.py  Band statistics
│   ├── train.py            Train Random Forest
│   ├── predict.py          Crop prediction engine
│   ├── moisture.py         NDVI + SAR soil moisture
│   ├── weather.py          Open-Meteo live weather
│   └── advisor.py          Bilingual irrigation advisory engine
├── scripts/        Dev/build scripts & dataset builders
├── utils/          Geospatial coordinate converter
└── frontend/       React (CRA + Tailwind CSS) Dashboard
```

## Setup & Running Locally

### 1. Data & Training (Optional for real dataset)
```bash
python scripts/dataset_builder.py   # -> outputs/features.csv
python scripts/train_model.py       # -> outputs/crop_classifier.pkl
```

### 2. Backend Service
```bash
python -m uvicorn backend.app:app --reload --port 8000
```
Runs at `http://localhost:8000`.

### 3. Frontend Dashboard
```bash
cd frontend
npm install
npm start
```
Runs at `http://localhost:3000`.

