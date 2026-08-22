# KrishiNetra · ISRO Smart Farming Platform

**KrishiNetra** is an AI-powered smart farming platform leveraging Sentinel-1 SAR and Sentinel-2 optical Earth observation satellite data, weather intelligence, machine learning, and multilingual Voice AI assistance. It provides field-level crop classification, soil moisture estimation, irrigation scheduling, agricultural advisory, and trade marketplace tools for Indian farmers and agriculture officials.

---

## 🏗️ Architecture & Directory Structure

```
KrishiNetra/
├── agriculture/             # Domain-specific agriculture logic & ML inference
│   ├── prediction/          # Multi-spectral crop classification engine
│   │   ├── labels.py        # 19 PASTIS-R crop class definitions
│   │   ├── loader.py        # Sentinel-1/2 time series pixel loader
│   │   ├── feature_extractor.py # Statistical band & index extractor
│   │   └── predict.py       # Inference pipeline & confidence scoring
│   ├── advisory/            # Agricultural advisory subsystem
│   │   ├── moisture.py      # SAR + NDVI soil moisture estimation
│   │   ├── irrigation.py    # Crop water requirement & scheduling
│   │   └── advisor.py       # Bilingual (Hindi/English) advisory report generator
│   ├── weather.py           # Open-Meteo weather API client with 5-min caching
│   └── coordinate_converter.py # Geospatial coordinate transformations (WGS84 <-> UTM)
├── backend/                 # FastAPI REST API & Voice AI pipeline
│   ├── routes/              # Modular route handlers
│   │   ├── agriculture.py   # Crop prediction & field advisory endpoints
│   │   ├── voice.py         # Voice query (audio & text) endpoints
│   │   └── avatar.py        # Live Avatar session endpoints
│   ├── schemas/             # Pydantic request/response validation schemas
│   ├── services/            # External AI client integrations (Sarvam AI STT/TTS)
│   ├── voice/               # Voice AI agent orchestration & tool engine
│   └── app.py               # FastAPI application entry point
├── frontend/                # React 18 frontend with Tailwind CSS & Leaflet
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboards/  # Farmer, Officer, and Admin dashboards
│   │   │   ├── gis/         # GIS interactive map & multi-layer satellite viewer
│   │   │   ├── marketplace/ # Crop trading & farm inputs marketplace
│   │   │   ├── voice/       # Voice assistant modal & Live Avatar integration
│   │   │   ├── layout/      # Navbar, loaders, and global layout wrappers
│   │   │   └── shared/      # Reusable UI primitives and vector icons
│   │   ├── data/            # Demo datasets (mock parcels, districts, users)
│   │   ├── lib/             # Modular API clients (agriculture, voice, avatar)
│   │   └── App.js           # Root application component
│   └── public/
│       └── assets/          # Static images and video assets
├── data/                    # Data storage (gitignored raw / generated files)
│   ├── raw/                 # Raw GeoJSON & Sentinel pixel data
│   └── generated/           # Extracted feature CSVs
├── models/                  # Serialized ML models (crop_classifier.pkl)
├── scripts/                 # Utilities, training, and test suite
│   ├── training/            # Dataset builders, feature verification & training
│   ├── tests/               # Comprehensive regression & unit test suite
│   └── utilities/           # Avatar processing and helper utilities
├── docs/                    # Architecture, API contracts, and design docs
│   ├── architecture/        # API contracts & pipeline specifications
│   ├── ui-designs/          # UI wireframes, screens, and design notes
│   └── plans/               # Historical implementation plans
└── api/                     # Vercel serverless deployment entrypoint
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn backend.app:app --reload --port 8000
```
Backend API will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will be available at `http://localhost:3000`.

### 4. Running Tests
Run the test suite across all subsystems:
```powershell
python scripts/tests/test_predict.py
python scripts/tests/test_advisor.py
python scripts/tests/test_weather.py
python scripts/tests/test_moisture.py
python scripts/tests/test_voice_agent.py
python scripts/tests/test_voice_pipeline.py
```

---

## 🛰️ Earth Observation & AI Stack
- **Sentinel-2 (Optical):** 10 bands (B2–B12) providing NDVI, NDRE, NDWI, EVI, and SAVI vegetation health indices.
- **Sentinel-1 (SAR Radar):** Dual-polarization (VV/VH) microwave radar for cloud-penetrating soil moisture dynamics.
- **Machine Learning:** Multi-temporal Random Forest Classifier trained on the PASTIS-R benchmark dataset across 19 crop classes.
- **Voice AI:** Multilingual Voice Agent powered by Sarvam AI (Saaras STT and Bulbul TTS) supporting Hindi and English with live lip-synced avatar presentation.
