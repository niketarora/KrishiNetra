# KrishiNetra — API Contract Record

This document records the exact endpoint signatures, request payloads, response structures, and environment variable dependencies across KrishiNetra. These contracts are frozen invariants during the repository reorganization.

---

## 1. Agriculture Endpoints

### `POST /predict`
- **Handler**: `smart_advisor` / `generate_report`
- **Frontend Caller**: `frontend/src/lib/agricultureApi.js` (`fetchParcel`)
- **Request Body**:
  ```json
  {
    "field_id": 10011413
  }
  ```
- **Response Body**:
  ```json
  {
    "label": 2,
    "crop_name": "Soft Winter Wheat",
    "confidence": 94.2,
    "latitude": 46.603354,
    "longitude": 1.888334,
    "moisture": 58.4,
    "temperature": 28.5,
    "humidity": 65.0,
    "rain": 0.0,
    "english": "Monitor the field. Irrigate if dry conditions continue.",
    "hindi": "खेत की निगरानी करें। यदि सूखा बना रहे तो सिंचाई करें।"
  }
  ```

---

## 2. Voice AI Endpoints

### `POST /api/voice/text-query`
- **Handler**: `process_voice_query_text`
- **Frontend Caller**: `frontend/src/lib/voiceApi.js` (`sendVoiceTextQuery`)
- **Request Body**:
  ```json
  {
    "text": "Mitti mein nami kaisi hai?",
    "field_id": "P0001",
    "language": "hi",
    "session_id": "session-001"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "transcript": "Mitti mein nami kaisi hai?",
    "response": "फ़ील्ड P0001 में मिट्टी की नमी 58.4% है। उपग्रह विश्लेषण के अनुसार फसल स्वस्थ है।",
    "language": "hi",
    "tool_used": "get_moisture_status",
    "field_id": "P0001",
    "session_id": "session-001",
    "telemetry": {
      "stt_latency_ms": 0,
      "gemini_router_latency_ms": 12,
      "tool_latency_ms": 5,
      "gemini_response_latency_ms": 210,
      "tts_latency_ms": 0,
      "total_latency_ms": 227
    },
    "audio_base64": null
  }
  ```

### `POST /api/voice/query`
- **Handler**: `process_voice_query`
- **Frontend Caller**: `frontend/src/lib/voiceApi.js` (`sendVoiceAudioQuery`)
- **Request Form-Data**:
  - `audio`: binary upload (optional)
  - `transcript`: text string (optional)
  - `field_id`: string (e.g. `"P0001"`)
  - `language`: string (e.g. `"hi"`)
  - `session_id`: string (e.g. `"session-001"`)
- **Response Body**:
  Same shape as `VoiceQueryResponse` above, including base64 TTS audio if audio was returned.

---

## 3. HeyGen LiveAvatar Endpoints

### `POST /api/avatar/session`
- **Handler**: `heygen_service.create_streaming_token`
- **Frontend Caller**: `frontend/src/lib/avatarApi.js` (`createAvatarSession`)
- **Request Body**: Empty / None
- **Response Body**:
  ```json
  {
    "enabled": true,
    "token": "...",
    "session_id": "..."
  }
  ```

### `POST /api/avatar/close`
- **Handler**: `heygen_service.close_streaming_session`
- **Frontend Caller**: `frontend/src/lib/avatarApi.js` (`closeAvatarSession`)
- **Request Body**:
  ```json
  {
    "session_id": "..."
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```
