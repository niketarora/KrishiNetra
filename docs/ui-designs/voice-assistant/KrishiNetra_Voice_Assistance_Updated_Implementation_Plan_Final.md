# KrishiNetra Voice Assistance — Updated Implementation Plan

## 1. Scope

This plan is **only for the Voice Assistance feature**.

Do not spend development time on:

- Marketplace
- RAG
- new dashboard features
- unrelated ML improvements
- redesigning the existing KrishiNetra application

The goal is to take the **already implemented Sarvam-based voice foundation** and complete it into a production-quality hackathon MVP with:

```text
Microphone
   ↓
Sarvam STT
   ↓
Gemini 2.5 Flash
   ↓
Intent + Entity Extraction
   ↓
Secure Tool Calling
   ↓
Existing KrishiNetra ML / APIs
   ↓
Gemini 2.5 Flash response generation
   ↓
Sarvam TTS
   ↓
HeyGen LiveAvatar
   ↓
Farmer hears + sees the answer
```

The earlier Bhashini plan is obsolete for this implementation.

---

# 2. Current Starting Point

The repository already contains the important foundation:

```text
backend/
├── sarvam.py
├── voice_orchestrator.py
├── voice_schemas.py
└── voice_tools.py

frontend/src/components/
├── VoiceAssistantModal.js
└── VoiceTriggerButton.js
```

Already available:

- microphone UI
- audio recording
- text-query fallback
- voice-query endpoint
- Sarvam STT
- Sarvam TTS
- voice orchestrator
- allowlisted agricultural tools
- weather tool
- crop prediction tool
- moisture tool
- irrigation tool
- crop health tool
- field details tool
- Hindi/English response support
- audio playback
- voice state UI

Therefore **do not rebuild the voice system from scratch**.

The implementation should extend the existing code.

---

# 3. Final Technology Decisions

| Component | Final Choice |
|---|---|
| Frontend | Existing React application |
| Backend | Existing FastAPI application |
| STT | **Sarvam Saaras** |
| LLM | **Gemini 2.5 Flash** |
| LLM access | Google Gemini API / Google AI Studio |
| TTS | **Sarvam Bulbul** |
| Avatar | **HeyGen LiveAvatar / realtime avatar** |
| RAG | **Not implemented now** |
| Agricultural intelligence | Existing KrishiNetra ML/backend |
| Tool execution | Existing `voice_tools.py` + secure backend |
| Authentication | Existing KrishiNetra auth/session |
| Conversation context | Backend session context |

Gemini 2.5 Flash is currently documented as `gemini-2.5-flash` and has a free tier, with rate limits. Use the free tier for the MVP and design the integration so the model can be changed later if required. citeturn0search1turn0search5

Official Gemini setup uses a `GEMINI_API_KEY` environment variable and the Google GenAI SDK. citeturn0search4

---

# 4. Target Architecture

```text
                         FARMER
                            │
                            ▼
                    Voice Assistant UI
                            │
                            ▼
                     Browser Mic
                            │
                            ▼
                       Audio Blob
                            │
                            ▼
                   FastAPI Voice API
                            │
                            ▼
                      Sarvam STT
                            │
                            ▼
                       Transcript
                            │
                            ▼
                  Gemini 2.5 Flash
                            │
              ┌─────────────┼─────────────┐
              │             │             │
           Intent        Entities        Tool
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                    Tool Validation
                            │
                            ▼
                     Tool Executor
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
      ML Models         Weather API       KrishiNetra DB
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
                     Verified Result
                            │
                            ▼
                  Gemini 2.5 Flash
                            │
                            ▼
                    Farmer Language
                            │
                            ▼
                    Sarvam Bulbul
                            │
                            ▼
                         Audio
                            │
                            ▼
                    HeyGen LiveAvatar
                            │
                            ▼
                 Realtime Farmer Avatar
                            │
                            ▼
                         FARMER
```

---

# 5. Phase 0 — Secure the Existing Sarvam Integration

Before adding Gemini or HeyGen, clean the existing voice implementation.

## Tasks

### 5.1 Remove API key from source

`backend/sarvam.py` must never contain a real credential fallback.

Use:

```env
SARVAM_API_KEY=
```

only.

### 5.2 Rotate exposed credentials

If a real Sarvam key has ever been committed to the repository:

1. revoke/rotate it
2. create a new key
3. add it to local `.env`
4. add it to deployment environment variables
5. ensure `.env` is ignored by Git

### 5.3 Add Gemini key

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

### 5.4 Add HeyGen credentials

Keep HeyGen secrets backend-only.

Example:

```env
HEYGEN_API_KEY=
HEYGEN_AVATAR_ID=
```

Do not expose `HEYGEN_API_KEY` to React.

---

# 6. Phase 1 — Fix Existing Audio Recording

The current frontend voice implementation should be made reliable before adding the LLM.

## Current problem

The frontend should not assume every `MediaRecorder` output is WAV.

Browsers commonly produce formats such as:

```text
audio/webm
audio/webm;codecs=opus
```

depending on browser support.

## Required implementation

Use:

```text
mediaRecorder.mimeType
```

and send the actual MIME type to the backend.

Target:

```text
Browser
 ↓
MediaRecorder
 ↓
Actual MIME type
 ↓
FastAPI
 ↓
Sarvam STT
```

Test at minimum:

- Chrome
- Edge
- microphone permission granted
- microphone permission denied
- empty recording
- short recording
- long recording

---

# 7. Phase 2 — Create Gemini Service

Add a dedicated service instead of putting Gemini calls directly inside the orchestrator.

Recommended structure:

```text
backend/
├── services/
│   └── gemini.py
│
├── sarvam.py
├── voice_orchestrator.py
├── voice_tools.py
└── voice_schemas.py
```

The service should expose functions conceptually similar to:

```text
route_voice_query()
generate_farmer_response()
```

Keep Gemini isolated so the provider can be changed later.

---

# 8. Phase 3 — Gemini Tool Router

This is the most important remaining software task.

## Replace current approach

Current:

```text
Transcript
 ↓
keyword matching
 ↓
intent
 ↓
tool
```

Target:

```text
Transcript
 ↓
Gemini 2.5 Flash
 ↓
structured tool decision
 ↓
tool name + arguments
```

Gemini's API supports structured outputs and tools/function calling, which is the correct direction for this architecture. citeturn0search4

---

# 9. Gemini System Prompt

Create a strict agricultural assistant system prompt.

The LLM must be told:

```text
You are the KrishiNetra agricultural voice assistant.

You do not directly access APIs.

You do not invent agricultural data.

You can only request registered KrishiNetra tools.

When live/field data is required, call the appropriate tool.

Use the authenticated farmer context supplied by the backend.

Never invent:
- weather
- market prices
- crop health
- moisture
- irrigation values
- field information
- dealer information

Return structured tool calls when a tool is required.

If no registered tool can answer the question,
return that the system cannot provide verified information.
```

---

# 10. Tool Definitions for Gemini

Expose only safe registered tools.

Initial tool set:

```text
get_current_weather
get_weather_forecast
get_crop_prediction
get_moisture_status
get_irrigation_advisory
get_crop_health
get_field_details
```

Do not expose:

```text
database query
arbitrary HTTP request
shell execution
environment variables
raw API endpoints
```

---

# 11. Tool Schema

Each tool should have:

```text
name
description
arguments
argument types
required fields
```

Example:

```json
{
  "name": "get_weather_forecast",
  "description": "Get verified weather forecast for the farmer's selected field.",
  "parameters": {
    "type": "object",
    "properties": {
      "field_id": {
        "type": "string"
      },
      "forecast_days": {
        "type": "integer"
      }
    },
    "required": ["field_id"]
  }
}
```

The exact schema should match the existing backend implementation.

---

# 12. Phase 4 — Entity Extraction

Gemini must understand entities instead of only recognizing keywords.

Examples:

### Query

```text
Kal mere khet mein baarish hogi?
```

Expected:

```json
{
  "intent": "weather_forecast",
  "field_id": "current_field",
  "forecast_days": 1
}
```

### Query

```text
Mere khet mein paani kab dena chahiye?
```

Expected:

```json
{
  "intent": "irrigation_advisory",
  "field_id": "current_field"
}
```

### Query

```text
Meri fasal healthy hai?
```

Expected:

```json
{
  "intent": "crop_health",
  "field_id": "current_field"
}
```

---

# 13. Phase 5 — Backend Validation

Never execute the Gemini tool call directly.

Use:

```text
Gemini
 ↓
Tool call
 ↓
Pydantic/schema validation
 ↓
Authentication
 ↓
Field authorization
 ↓
Tool executor
```

The backend remains the authority.

For example:

```text
Gemini:
get_field_details(field_id="P0007")

Backend:
Is P0007 owned/accessible by this user?

YES → execute
NO → reject
```

---

# 14. Phase 6 — Existing Tool Execution

Reuse the existing `voice_tools.py`.

Do not duplicate agricultural logic.

Example:

```text
Gemini
 ↓
get_irrigation_advisory
 ↓
voice_tools.py
 ↓
models/advisor.py
models/irrigation.py
 ↓
verified recommendation
```

This ensures:

```text
Dashboard
+
GIS
+
Voice
```

all use the same agricultural intelligence.

---

# 15. Phase 7 — Gemini Response Generation

After a tool returns data:

```text
User Question
+
Tool Result
+
Language
+
Relevant Context
 ↓
Gemini 2.5 Flash
 ↓
Final Farmer Response
```

The second Gemini step should not perform another tool call unless deliberately designed to do so.

Its job is to turn verified data into a concise farmer-friendly answer.

---

# 16. Response Rules

Gemini response must:

- stay in the farmer's language
- be short
- be understandable
- use verified tool output only
- never invent missing values
- mention uncertainty when appropriate
- mention that data is current/live when relevant
- avoid unnecessary technical terms

Example:

```text
Tool result:
rain_probability = 72%

Response:

"Kal aapke khet ke aas-paas baarish ki sambhavna 72% hai. Agar mitti mein nami pehle se achhi hai, toh sinchai ko thoda rokna behtar ho sakta hai."
```

The irrigation recommendation must come from the actual irrigation tool when one is required.

---

# 17. Phase 8 — Conversation Context

Add lightweight session memory.

Do not build a huge memory system.

Store:

```text
session_id
user_id
language
selected_field_id
last_question
last_intent
last_tool
last_tool_result
recent_messages
```

Keep only the recent conversation needed for follow-up questions.

Example:

```text
Farmer:
Kal baarish hogi?

Assistant:
Kal baarish ki sambhavna 72% hai.

Farmer:
Toh paani dena chahiye?
```

Gemini should understand:

```text
"paani dena chahiye?"
```

refers to the same field and previous weather context.

---

# 18. Phase 9 — Voice State Machine

Use:

```text
IDLE
 ↓
LISTENING
 ↓
TRANSCRIBING
 ↓
THINKING
 ↓
TOOL_EXECUTION
 ↓
GENERATING
 ↓
SPEAKING
 ↓
IDLE
```

Error states:

```text
STT_ERROR
LLM_ERROR
TOOL_ERROR
TTS_ERROR
AVATAR_ERROR
```

Frontend should display an appropriate status rather than appearing frozen.

---

# 19. Phase 10 — Sarvam TTS

The current Sarvam TTS integration should remain.

Target:

```text
Gemini response
 ↓
Sarvam Bulbul
 ↓
audio
```

Do not send the raw Gemini response directly to the avatar until the TTS/audio flow has been verified.

Test:

- Hindi
- English
- supported regional languages
- short answer
- long answer
- punctuation
- numbers
- percentages
- agricultural terms

---

# 20. Phase 11 — HeyGen LiveAvatar Setup

This is the largest remaining frontend/realtime integration.

The target is **not a generated MP4 video**.

Do not use a normal asynchronous video-generation workflow.

The requirement is:

```text
Realtime avatar
+
live speaking
+
lip sync
+
facial movement
```

HeyGen's current documentation and API ecosystem distinguish realtime/interactive avatar functionality from ordinary generated avatar videos. Use the realtime/LiveAvatar/streaming integration appropriate to the account and current SDK access rather than the archived video-generation APIs. citeturn1search0turn1search15

---

# 21. HeyGen Account Setup

Before coding:

1. Create/login to HeyGen.
2. Enable the required realtime/avatar API access.
3. Create/select the farmer avatar.
4. Obtain the required avatar identifier.
5. Obtain API credentials.
6. Confirm the account has access to the realtime/streaming feature.
7. Test the avatar independently before integrating it into KrishiNetra.

Important:

> Do not assume that having a normal HeyGen API key automatically means the account has every realtime/streaming capability.

---

# 22. HeyGen Backend Token Flow

The browser should not receive the permanent HeyGen API key.

Use:

```text
React
  ↓
POST /api/avatar/session
  ↓
FastAPI
  ↓
HeyGen authentication/session API
  ↓
temporary session/token
  ↓
React
  ↓
LiveAvatar session
```

Conceptually:

```text
HEYGEN_API_KEY
       │
       ▼
FastAPI only
       │
       ▼
temporary client session/token
       │
       ▼
browser
```

HeyGen's current documentation and developer discussions reference streaming session/token flows and WebRTC-based realtime avatar sessions. Verify the exact current endpoint/SDK contract against the account's enabled LiveAvatar API before implementation. citeturn1search5turn1search15

---

# 23. Phase 12 — Voice Assistance UI & LiveAvatar Frontend Component

The Voice Assistant UI has been completely refreshed based on the visual design reference in [`docs/Voice Assistance UI.png`](file:///d:/Coding/Projects/KrishiNetra/docs/Voice%20Assistance%20UI.png) and the farmer avatar portrait in [`docs/Farmer Final Avatar.png`](file:///d:/Coding/Projects/KrishiNetra/docs/Farmer%20Final%20Avatar.png) (stored in `frontend/public/farmer_final_avatar.png`).

### UI Architecture:

```text
VoiceAssistantModal
        │
        ├── Top Bar (Field: P0001 Badge + Hindi/EN Language Pill Switch + Close Button)
        ├── Hero Avatar Frame (Farmer Final Avatar + Bottom Dark Fade Gradient)
        │       └── Animated Audio Waveform Status Badge (SPEAKING / LISTENING / THINKING / READY)
        ├── Dynamic Bilingual Greeting & Subtitle
        ├── Conversation History (User Question Cards + Assistant Response Cards with Tool Badge & Audio Replay)
        ├── Quick Suggestion Chips (Weather, Moisture, Irrigation, Health)
        ├── Large Glowing Microphone Action Button (Concentric Pulse Rings)
        └── Text Input Query Fallback Form
```

For the realtime streaming avatar integration:

```text
frontend/src/components/
├── VoiceAssistantModal.js
├── VoiceTriggerButton.js
└── LiveAvatar/
    ├── LiveAvatar.js
    ├── AvatarVideo.js
    ├── AvatarControls.js
    └── avatarService.js
```

---

# 24. Avatar Session Lifecycle

Target:

```text
User opens Voice Assistant
        ↓
Create avatar session
        ↓
Connect realtime stream
        ↓
Display avatar
        ↓
Avatar becomes IDLE
```

When the user speaks:

```text
LISTENING
```

When backend is processing:

```text
THINKING
```

When TTS audio/response is ready:

```text
SPEAKING
```

After completion:

```text
IDLE
```

When modal closes:

```text
Stop avatar session
Release WebRTC resources
```

---

# 25. Phase 13 — Connect Gemini → Sarvam → HeyGen

The completed answer pipeline should become:

```text
Farmer
 ↓
Mic
 ↓
Sarvam STT
 ↓
Transcript
 ↓
Gemini 2.5 Flash
 ↓
Tool Call
 ↓
KrishiNetra Tool
 ↓
Verified Data
 ↓
Gemini 2.5 Flash
 ↓
Final Hindi/regional-language response
 ↓
Sarvam Bulbul
 ↓
Audio
 ↓
HeyGen LiveAvatar
 ↓
Speaking Farmer
```

The avatar should not make the agricultural decision.

---

# 26. Important Avatar Design Decision

There are two conceptual options:

### Option A — Avatar provider generates speech

```text
Gemini text
 ↓
HeyGen
 ↓
HeyGen voice
 ↓
Avatar
```

### Option B — KrishiNetra generates audio

```text
Gemini text
 ↓
Sarvam Bulbul
 ↓
audio
 ↓
HeyGen realtime avatar
```

For this project, the intended architecture is:

> **Keep Sarvam as the project's TTS provider and use HeyGen as the visual/avatar presentation layer, provided the selected LiveAvatar integration supports the required external-audio/input flow.**

Before implementing the final bridge, verify the exact current LiveAvatar API/SDK capability for driving the avatar with externally generated Sarvam audio. Do not assume ordinary HeyGen video-generation endpoints support this realtime use case.

---

# 27. Phase 14 — Avatar Fallback

If HeyGen fails:

```text
Gemini
 ↓
Sarvam TTS
 ↓
Audio playback
```

The farmer should still hear the answer.

If TTS fails:

```text
Gemini
 ↓
Text response
```

The farmer should still see the text.

Therefore:

```text
Avatar = presentation layer
TTS = speech layer
Gemini = reasoning/language layer
Tools = data/decision layer
```

---

# 28. Phase 15 — Error Handling

## Microphone

```text
"Microphone permission is required."
```

## STT

```text
"Main aapki baat samajh nahi paaya. Kripya dobara boliye."
```

## Gemini

```text
"Abhi main aapke sawaal ko process nahi kar pa raha hoon."
```

## Tool/API

```text
"Is samay verified information uplabdh nahi hai."
```

## TTS

Show text answer and allow text fallback.

## HeyGen

Continue with:

```text
text + audio
```

without avatar.

---

# 29. Phase 16 — Logging

For every voice request, internally record:

```json
{
  "session_id": "...",
  "user_id": "...",
  "language": "hi",
  "intent": "weather_forecast",
  "tool": "get_weather_forecast",
  "tool_success": true,
  "stt_latency_ms": 0,
  "gemini_router_latency_ms": 0,
  "tool_latency_ms": 0,
  "gemini_response_latency_ms": 0,
  "tts_latency_ms": 0,
  "avatar_latency_ms": 0,
  "total_latency_ms": 0
}
```

Do not log:

- API keys
- unnecessary personal information
- raw audio permanently unless explicitly required
- sensitive farmer information

---

# 30. Phase 17 — Latency Optimization

The ideal flow is:

```text
STT
 ↓
Gemini routing
 ↓
Tool
 ↓
Gemini response
 ↓
TTS
 ↓
Avatar
```

Avoid unnecessary:

```text
translation
translation
translation
```

The system should work directly with the farmer's language wherever possible.

Optimization targets:

```text
STT        → fast
Gemini     → fast
Tool       → fast
TTS        → fast
Avatar     → persistent session
```

Keep the avatar connection alive while the voice assistant is open instead of recreating it for every answer.

---

# 31. Phase 18 — Gemini Free-Tier Strategy

Use:

```text
gemini-2.5-flash
```

for the MVP.

Keep prompts compact.

Do not send the entire conversation indefinitely.

Use:

```text
recent conversation
+
current question
+
relevant tool result
```

rather than the entire application state.

Gemini's free tier has rate limits, so add graceful handling for `429`/resource-exhausted responses. citeturn0search1turn0search5

---

# 32. Phase 19 — Testing Matrix

## Basic

- [ ] microphone permission
- [ ] record audio
- [ ] STT
- [ ] Gemini routing
- [ ] tool execution
- [ ] Gemini response
- [ ] TTS
- [ ] avatar speaking

## Hindi

```text
Kal mere khet mein baarish hogi?
```

## English

```text
Will it rain tomorrow in my field?
```

## Crop

```text
Mere khet mein kaunsi fasal hai?
```

## Moisture

```text
Mere khet mein nami kitni hai?
```

## Irrigation

```text
Kya mujhe aaj paani dena chahiye?
```

## Crop health

```text
Meri fasal healthy hai?
```

## Follow-up

```text
Farmer:
Kal baarish hogi?

Assistant:
...

Farmer:
Toh paani dena chahiye?
```

## Invalid request

```text
Mujhe stock market ka price batao.
```

Expected:

```text
No agricultural tool available.
```

---

# 33. Multilingual Testing

Test:

```text
Hindi
English
Hindi-English code switching
regional-language inputs supported by Sarvam
different accents
```

For every test record:

```text
Input
Language
Expected intent
Expected tool
Expected arguments
Actual tool
Actual response
```

---

# 34. Tool Safety Tests

Attempt:

```text
Give me another farmer's field data.
```

Expected:

```text
Authorization failure.
```

Attempt:

```text
Call this arbitrary URL.
```

Expected:

```text
Rejected.
```

Attempt:

```text
Tell me the weather even if the API fails.
```

Expected:

```text
No fabricated weather data.
```

---

# 35. Avatar Testing

Test:

- [ ] session creation
- [ ] WebRTC connection
- [ ] video rendering
- [ ] avatar idle state
- [ ] avatar speaking
- [ ] lip synchronization
- [ ] reconnect
- [ ] session close
- [ ] browser refresh
- [ ] microphone permission
- [ ] avatar API failure
- [ ] network interruption
- [ ] mobile browser
- [ ] desktop Chrome

---

# 36. Final Frontend Structure

Recommended final voice structure:

```text
frontend/src/
│
├── components/
│   ├── VoiceAssistant/
│   │   ├── VoiceAssistantModal.js
│   │   ├── VoiceTriggerButton.js
│   │   ├── MicButton.js
│   │   ├── Transcript.js
│   │   ├── VoiceStatus.js
│   │   └── LiveAvatar.js
│
├── hooks/
│   └── useVoiceAssistant.js
│
└── lib/
    ├── api.js
    ├── voiceApi.js
    └── avatarApi.js
```

Adapt this to the existing project rather than blindly creating duplicate files.

---

# 37. Final Backend Structure

Recommended:

```text
backend/
│
├── app.py
├── routes.py
│
├── sarvam.py
│
├── services/
│   ├── gemini.py
│   └── heygen.py
│
├── voice_orchestrator.py
├── voice_tools.py
├── voice_schemas.py
│
└── sessions/
    └── voice_session.py
```

Again, reuse existing files wherever possible.

---

# 38. Environment Variables

Final minimum configuration:

```env
# Sarvam
SARVAM_API_KEY=

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# HeyGen
HEYGEN_API_KEY=
HEYGEN_AVATAR_ID=

# Existing KrishiNetra configuration
DATABASE_URL=
```

Do not expose:

```text
SARVAM_API_KEY
GEMINI_API_KEY
HEYGEN_API_KEY
```

to the React application.

---

# 39. Development Order

Follow this exact order.

## Step 1

Clean and secure current Sarvam integration.

## Step 2

Fix browser audio MIME handling.

## Step 3

Add Gemini API.

## Step 4

Create Gemini service.

## Step 5

Create strict Gemini system prompt.

## Step 6

Convert existing tools into Gemini-compatible tool definitions.

## Step 7

Replace keyword routing with Gemini tool calling.

## Step 8

Add schema validation.

## Step 9

Add field/user authorization.

## Step 10

Add Gemini response generation.

## Step 11

Add lightweight conversation context.

## Step 12

Test the complete:

```text
STT → Gemini → Tool → Gemini → TTS
```

pipeline **without HeyGen first**.

## Step 13

Set up HeyGen realtime avatar.

## Step 14

Test HeyGen independently.

## Step 15

Connect HeyGen to the completed voice pipeline.

## Step 16

Implement avatar states.

## Step 17

Implement fallbacks.

## Step 18

Optimize latency.

## Step 19

Run multilingual testing.

## Step 20

Run final end-to-end demo testing.

---

# 40. Definition of Done

The Voice Assistance feature is complete when:

- [ ] Farmer can open voice assistant
- [ ] Farmer can press microphone
- [ ] Browser records audio
- [ ] Sarvam converts speech to text
- [ ] Gemini 2.5 Flash understands the query
- [ ] Gemini identifies intent
- [ ] Gemini extracts required entities
- [ ] Gemini selects only registered tools
- [ ] Backend validates tool arguments
- [ ] Backend verifies farmer/field authorization
- [ ] Existing KrishiNetra ML/API service executes
- [ ] Tool returns verified data
- [ ] Gemini generates grounded response
- [ ] Response remains in farmer's language
- [ ] Sarvam Bulbul generates audio
- [ ] HeyGen LiveAvatar session is active
- [ ] Avatar speaks the response
- [ ] Lip synchronization works
- [ ] Facial/head movement looks natural
- [ ] Avatar has Idle/Listening/Thinking/Speaking states
- [ ] Follow-up questions work
- [ ] API failures are handled
- [ ] Gemini rate limits are handled
- [ ] Avatar failure does not break text/audio response
- [ ] No API secrets are exposed
- [ ] No fabricated agricultural data is returned

---

# 41. Explicitly Out of Scope

Do **not** implement these as part of this voice milestone:

```text
RAG
Vector database
Government document retrieval
Large knowledge base
Fine-tuning
Marketplace integration
New agricultural ML models
New dashboard modules
```

RAG is intentionally postponed.

---

# 42. Final Target

The finished KrishiNetra voice assistant should behave like this:

```text
FARMER
"Kal mere khet mein baarish hogi?"
        │
        ▼
SARVAM SAARAS
Speech → Hindi text
        │
        ▼
GEMINI 2.5 FLASH
Understands:
weather_forecast
field = current field
        │
        ▼
KRISHINETRA TOOL
get_weather_forecast()
        │
        ▼
WEATHER SERVICE
Verified forecast
        │
        ▼
GEMINI 2.5 FLASH
Generates:
"Kal aapke khet ke aas-paas baarish ki
72% sambhavna hai."
        │
        ▼
SARVAM BULBUL
Text → Hindi audio
        │
        ▼
HEYGEN LIVEAVATAR
Audio/response → realtime farmer avatar
        │
        ▼
FARMER
Hears + sees the answer
```

---

# 43. One-Line Architecture

> **Sarvam listens, Gemini understands and routes, KrishiNetra tools provide verified agricultural intelligence, Gemini explains, Sarvam speaks, and HeyGen visually presents the answer through the farmer avatar.**

---

# 44. Priority Checklist

### 🔴 Do Now

- [ ] Remove/rotate exposed Sarvam credential
- [ ] Fix audio MIME handling
- [ ] Add Gemini 2.5 Flash
- [ ] Build Gemini service
- [ ] Build tool schemas
- [ ] Replace keyword routing
- [ ] Add structured tool calls
- [ ] Validate tool arguments
- [ ] Add authorization
- [ ] Add Gemini response generation
- [ ] Test STT → Gemini → Tool → Gemini → TTS

### 🟠 Do Next

- [ ] Add conversation context
- [ ] Set up HeyGen account/API access
- [ ] Create/select farmer avatar
- [ ] Implement backend avatar session endpoint
- [ ] Implement LiveAvatar frontend
- [ ] Connect avatar to response audio
- [ ] Add avatar states
- [ ] Add avatar fallback

### 🟢 Final Polish

- [ ] Latency optimization
- [ ] Multilingual testing
- [ ] Accent testing
- [ ] Error handling
- [ ] Gemini free-tier rate-limit handling
- [ ] WebRTC reconnect handling
- [ ] Production logging
- [ ] End-to-end demo test

---

# 45. Final Status After This Plan

The project should move through these milestones:

```text
CURRENT
Sarvam STT
+
Keyword routing
+
KrishiNetra tools
+
Sarvam TTS
+
Static avatar
        │
        ▼
MILESTONE 1
Sarvam STT
+
Gemini tool routing
+
KrishiNetra tools
+
Gemini response
+
Sarvam TTS
        │
        ▼
MILESTONE 2
+
Conversation context
+
Security
+
Validation
        │
        ▼
MILESTONE 3
+
HeyGen LiveAvatar
+
Realtime avatar
+
Lip sync
+
Facial animation
        │
        ▼
FINAL VOICE MVP
Sarvam
+
Gemini 2.5 Flash
+
KrishiNetra Tools/ML
+
Sarvam TTS
+
HeyGen LiveAvatar
```

This is the implementation path to follow from the current repository without rebuilding completed work.


---

# 46. Voice Assistant UI Reference — Required Redesign

The existing Voice Assistant UI must be redesigned to follow the **uploaded reference image** provided for this project.

## Reference Image

The uploaded image is the **primary visual reference** for the new Voice Assistant interface.

It should be placed in:

```text
docs/
└── images/
    └── voice-assistance-ui-reference.png
```

### Important instruction

> **Use the image in `docs/images/voice-assistance-ui-reference.png` as the visual reference while implementing the Voice Assistant UI.**

Do not copy the image literally into the application as a static screen. Recreate the UI as functional React components while following the visual language, layout, spacing, hierarchy, colors, and interaction patterns shown in the reference.

## UI Direction

The new Voice Assistant should visually follow the reference image:

```text
┌───────────────────────────────────────────────┐
│ FIELD: P0001                    हिन्दी | EN   │
│                                               │
│             REALISTIC FARMER                 │
│             AI AVATAR AREA                   │
│                                               │
│              SPEAKING...                     │
│                                               │
│        नमस्ते! मैं कृषिनेत्र हूँ।            │
│   मैं आपकी खेती में मदद कर सकता हूँ।        │
│                                               │
│ ┌─────────────────────────────────────────┐   │
│ │ आपका प्रश्न                              │   │
│ │ आज का मौसम कैसा है?                     │   │
│ └─────────────────────────────────────────┘   │
│                                               │
│ ┌─────────────────────────────────────────┐   │
│ │ कृषिनेत्र का उत्तर       🔊              │   │
│ │ फील्ड P0001 का तापमान...                │   │
│ └─────────────────────────────────────────┘   │
│                                               │
│                    🎙                         │
│             बोलने के लिए माइक्रो दबाएँ       │
└───────────────────────────────────────────────┘
```

## Required UI Elements

The implementation should include:

- [ ] Full-screen/modal Voice Assistant experience
- [ ] Selected field indicator at the top-left
- [ ] Hindi / English language switch at the top-right
- [ ] Close button
- [ ] Large realistic farmer avatar as the primary visual element
- [ ] Avatar positioned prominently in the center/top portion
- [ ] Speaking/listening status indicator
- [ ] Farmer greeting text
- [ ] Short supporting description
- [ ] User question card
- [ ] KrishiNetra answer card
- [ ] Tool-used indicator where useful
- [ ] Speaker/audio playback control
- [ ] Large glowing microphone button
- [ ] Microphone instruction text
- [ ] Dark agricultural visual theme
- [ ] Green/emerald KrishiNetra accent
- [ ] Rounded cards and controls
- [ ] Subtle glassmorphism/translucency
- [ ] Responsive desktop/mobile behavior

## Avatar UI Evolution

The current static farmer image should eventually be replaced by:

```text
Static farmer image
        ↓
HeyGen LiveAvatar
        ↓
Realtime speaking farmer
```

The UI should therefore be designed so that the avatar area is already a dedicated component/container.

Recommended:

```text
VoiceAssistantModal
    │
    ├── VoiceHeader
    ├── LiveAvatarContainer
    ├── AvatarStatus
    ├── Greeting
    ├── ConversationPanel
    │   ├── UserMessage
    │   └── AssistantMessage
    ├── AudioControl
    └── MicrophoneControl
```

## Reference-Based Styling Rules

Use the uploaded image as the reference for:

- overall composition
- dark background
- green accent color
- typography hierarchy
- card styling
- rounded corners
- avatar placement
- microphone button placement
- top navigation controls
- spacing
- visual emphasis
- status indicators

The implementation must remain consistent with the existing KrishiNetra design system rather than introducing an unrelated UI style.

## Important

The uploaded reference image is a **design reference only**.

The final implementation must keep the UI functional:

```text
Microphone
   ↓
Recording
   ↓
Sarvam STT
   ↓
Gemini
   ↓
Tool
   ↓
Gemini response
   ↓
Sarvam TTS
   ↓
HeyGen LiveAvatar
```

The visual redesign must not break the existing voice functionality.
