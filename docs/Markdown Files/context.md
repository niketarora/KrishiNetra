# Project Context: ISRO Smart Farming (KrishiSat / KrishiNetra)

## Overview
**ISRO Smart Farming** is a satellite-powered precision agriculture application. It leverages multi-spectral Sentinel-1 SAR (Synthetic Aperture Radar) and Sentinel-2 Optical imagery from the **PASTIS-R** dataset to perform automated crop classification, soil moisture estimation, live weather integration, and bilingual (English & Hindi) irrigation advisory generation for agricultural parcels.

---

## Technical Stack

- **Backend Framework**: Python 3, FastAPI, Uvicorn
- **Machine Learning**: `scikit-learn` (RandomForestClassifier), `joblib`, `pandas`, `numpy`
- **Geospatial & Data Processing**: `pyproj` (Lambert-93 to WGS84 reprojection), `GeoJSON`, `Open-Meteo API` (live weather)
- **Frontend Framework**: React (Create React App), Tailwind CSS, Lucide React, Leaflet GIS Map components
- **Dataset**: **PASTIS-R PixelSet** dataset (`DATA_S2`, `DATA_S1A`, `DATA_S1D`, `metadata.geojson`, `metadata_parcel.csv`)

---

## Directory & File Architecture

```
ISRO-Smart-Farming-main/
├── backend/                  FastAPI Web Service & Routes
│   ├── app.py                FastAPI application initialization with CORS middleware
│   ├── routes.py             API endpoints (e.g. POST /predict)
│   └── schemas.py            Pydantic request & response schemas (FieldRequest, PredictionResponse)
│
├── models/                   Machine Learning, Feature Extraction & Advisory Core
│   ├── loader.py             Loaders for Sentinel-2, Sentinel-1 Ascending & Sentinel-1 Descending .npy arrays
│   ├── feature_extractor.py  Aggregates band statistics across S1 and S2 time series
│   ├── train.py              Trains Random Forest classifier on dataset features
│   ├── predict.py            Inference engine for crop classification & confidence scoring
│   ├── moisture.py           Calculates soil moisture combining NDVI (60%) and SAR backscatter (40%)
│   ├── weather.py            Fetch live weather metrics (temp, humidity, rain) via Open-Meteo API
│   ├── advisor.py            Unified decision engine (`generate_report` / `smart_advisor`) producing bilingual advice
│   ├── irrigation.py       Threshold-based moisture fallback logic
│   └── label_names.py      Dictionary mapping 19 PASTIS-R numerical labels to crop names
│
├── scripts/                  Data pipeline, training wrappers & test suites
│   ├── dataset_builder.py    Builds feature CSV from raw PASTIS-R pixel sets
│   ├── train_model.py        Script trigger to train and serialize classifier model
│   └── test_*.py             Unit test execution scripts for model modules
│
├── utils/                    Geospatial Utilities
│   └── coordinate_converter.py  Resolves parcel ID to (Latitude, Longitude) via GeoJSON centroid reprojection
│
├── frontend/                 React Web Dashboard (KrishiSat / KrishiNetra UI)
│   ├── src/
│   │   ├── App.js            Main application shell with navigation routing & view states
│   │   ├── components/
│   │   │   ├── Navbar.js             Global top bar with view toggle and language selection (EN/HI)
│   │   │   ├── Home.js               Landing page with search, statistics & quick actions
│   │   │   ├── GisMap.js             Interactive parcel mapping UI
│   │   │   ├── FarmerDashboard.js    Farmer-facing crop predictions & irrigation recommendations
│   │   │   ├── OfficerDashboard.js   Agricultural officer analytics & region stats
│   │   │   ├── AdminDashboard.js     System configuration & model management console
│   │   │   └── LeafLoader.js         Custom loading animation overlay
│   │   └── lib/
│   │       └── api.js                API client layer (supports Mock Data & Live Backend integration)
│   ├── package.json          Frontend dependencies & build scripts
│   └── tailwind.config.js    Tailwind CSS visual theme configuration
│
└── outputs/                  Generated Artifacts (Git-ignored)
    ├── features.csv          Extracted features table from dataset
    └── crop_classifier.pkl   Serialized Random Forest model pipeline
```

---

## Workflow & System Mechanics

1. **Feature Extraction & Training**:
   - `dataset_builder.py` iterates over pixel sets in `PASTIS-R` and extracts temporal band statistics across S2 optical and S1 SAR channels, saving to `outputs/features.csv`.
   - `train.py` filters rare crop classes, splits data, fits a `RandomForestClassifier(n_estimators=100)`, evaluates metrics, and exports `crop_classifier.pkl`.

2. **Inference & Advisory Flow**:
   - `POST /predict` accepts a `field_id` (parcel ID).
   - `coordinate_converter.py` resolves the parcel's polygon centroid from `metadata.geojson`, reprojecting EPSG:2154 (Lambert-93) to EPSG:4326 (WGS84 lat/lon).
   - `predict.py` extracts current parcel features and passes them to `crop_classifier.pkl` to obtain the predicted crop label and confidence percentage.
   - `moisture.py` reads S1 and S2 channels to compute NDVI and SAR backscatter, deriving a normalized 0-100% soil moisture score.
   - `weather.py` queries Open-Meteo API using the parcel coordinates for live rainfall, temperature, and humidity.
   - `advisor.py` synthesizes moisture and weather forecasts to output actionable irrigation recommendations in English and Hindi.

3. **Frontend Integration**:
   - The React frontend toggles between mock mode and real backend mode (`USE_REAL_BACKEND` in `api.js`).
   - Supports role-based views for Farmers, Agricultural Officers, and Administrators.

---

## Getting Started & Execution

### Prerequisites
- Python 3.9+ with dependencies (`fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `numpy`, `pyproj`, `requests`, `joblib`)
- Node.js & npm (for `frontend/`)

### Backend API Execution
```bash
# From workspace root
uvicorn backend.app:app --reload --port 8000
```

### Frontend Application Execution
```bash
cd frontend
npm install
npm start
```
