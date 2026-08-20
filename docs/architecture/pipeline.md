# KrishiNetra System Pipelines & Architecture

This document describes the primary data processing and AI pipelines in the **KrishiNetra** satellite smart farming platform.

---

## 1. Machine Learning & Advisory Pipeline

```
Sentinel-2 (Optical) + Sentinel-1 (SAR)
                  │
                  ▼
   Feature Extractor (`agriculture.prediction.feature_extractor`)
   - 10 Optical Bands (B2, B3, B4, B5, B6, B7, B8, B8A, B11, B12)
   - 3 Radar Polarizations (VV, VH, VV/VH ratio)
   - Vegetation Indices: NDVI, NDRE, NDWI, EVI, SAVI
   - Polarimetric Indices: RVI, Pol_Diff, DPSVI
   - Temporal Dynamics: Mean, Std, Min, Max, Quantiles across 36 timestamps
                  │
                  ▼
     Model Inference (`agriculture.prediction.predict`)
     - Random Forest Classifier (19 crop classes)
     - Outputs: Predicted Crop Name, Confidence Score, Class Probabilities
                  │
                  ▼
   Weather & Geo Engine (`agriculture.weather` & `coordinate_converter`)
   - Open-Meteo Weather API integration (5-minute memory caching)
   - WGS84 Lat/Lon <-> UTM conversion
                  │
                  ▼
     Advisory Engine (`agriculture.advisory`)
     - Soil Moisture Estimation (`moisture.py`)
     - Crop Water Requirement & Irrigation Schedule (`irrigation.py`)
     - Comprehensive Agricultural Advisory Report (`advisor.py`)
```

---

## 2. Voice AI Agent Pipeline

```
Farmer Audio (WebM/WAV/MP4) / Text
                  │
                  ▼
  Speech-to-Text (`backend.services.sarvam`)
  - Sarvam AI Saaras STT
  - Supports Hindi (`hi-IN`), English (`en-IN`), and Indian regional languages
                  │
                  ▼
  Voice Orchestrator (`backend.voice.orchestrator`)
  - Intent classification & context parsing
  - Tool Invocation (`backend.voice.tools`):
      * `GET_CURRENT_WEATHER`: Fetches real-time weather & 24h precipitation
      * `GET_MOISTURE_STATUS`: Satellite SAR-derived soil moisture analysis
      * `GET_IRRIGATION_ADVICE`: Crop-specific water requirement & schedules
      * `GET_CROP_HEALTH`: Multi-spectral NDVI/EVI health assessment
      * `GET_FIELD_REPORT`: Comprehensive synthesis for the field
                  │
                  ▼
  Text-to-Speech (`backend.services.sarvam`)
  - Sarvam AI Bulbul TTS
  - Generates realistic Indian farmer accent audio (Base64 WAV)
                  │
                  ▼
  Live Avatar Synchronization (`LiveAvatar.js`)
  - Animated lip-sync video playback during active speech
  - HeyGen WebRTC live streaming integration (when configured)
```
