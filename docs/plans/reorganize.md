# KrishiNetra — Safe Repository Reorganization Plan

> **Purpose:** Reorganize the current KrishiNetra project into a clean, feature-oriented structure **without breaking existing functionality, API contracts, imports, frontend behavior, ML inference, voice AI, HeyGen LiveAvatar, marketplace, GIS, or deployment**.

> **Critical rule:** This document is a migration plan, not a "rewrite everything" plan. The existing application must remain runnable at every major checkpoint.

---

## 1. Current Project Baseline

The uploaded project is the baseline for this reorganization.

The current application contains these major areas:

- React frontend
- FastAPI backend
- Agriculture / ML inference
- Crop prediction
- Moisture estimation
- Weather integration
- Smart advisory
- Gemini tool routing
- Sarvam STT/TTS
- HeyGen LiveAvatar
- Voice session state
- GIS map
- Farmer / Officer / Admin dashboards
- Marketplace
- Vercel deployment
- ML training scripts
- Tests
- Documentation
- UI/design assets

### Current important entry points

```text
server.py
    ↓
backend.app:app
    ↓
FastAPI

frontend/src/index.js
    ↓
frontend/src/App.js
    ↓
React application

api/index.py
    ↓
backend.app:app
    ↓
Vercel serverless deployment
```

### Current important API contracts

Do **not** change these URLs during the reorganization unless a separate API-versioning task explicitly requires it:

```text
POST /predict

POST /api/voice/text-query
POST /api/voice/query

POST /api/avatar/session
POST /api/avatar/close
```

The request/response shapes of these endpoints must also remain unchanged during the structural migration.

---

# 2. Target Architecture

The final structure should be:

```text
KrishiNetra/
│
├── api/
│   └── index.py
│
├── backend/
│   ├── app.py
│   │
│   ├── routes/
│   │   ├── agriculture.py
│   │   ├── voice.py
│   │   └── avatar.py
│   │
│   ├── schemas/
│   │   ├── agriculture.py
│   │   └── voice.py
│   │
│   ├── services/
│   │   ├── gemini.py
│   │   ├── heygen.py
│   │   └── sarvam.py
│   │
│   └── voice/
│       ├── orchestrator.py
│       ├── tools.py
│       └── session.py
│
├── agriculture/
│   ├── prediction/
│   │   ├── predict.py
│   │   ├── feature_extractor.py
│   │   ├── loader.py
│   │   └── labels.py
│   │
│   ├── advisory/
│   │   ├── advisor.py
│   │   ├── irrigation.py
│   │   └── moisture.py
│   │
│   └── weather.py
│
├── data/
│   ├── raw/
│   └── generated/
│
├── models/
│   └── crop_classifier.pkl
│
├── scripts/
│   ├── training/
│   │   ├── build_dataset.py
│   │   ├── check_features.py
│   │   └── train_model.py
│   │
│   ├── tests/
│   │   ├── test_advisor.py
│   │   ├── test_features.py
│   │   ├── test_irrigation.py
│   │   ├── test_loader.py
│   │   ├── test_moisture.py
│   │   ├── test_predict.py
│   │   ├── test_weather.py
│   │   ├── test_voice_agent.py
│   │   └── test_voice_pipeline.py
│   │
│   └── utilities/
│       └── clean_avatar.py
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── avatar/
│   │       ├── images/
│   │       └── video/
│   │
│   └── src/
│       ├── components/
│       │   ├── dashboards/
│       │   ├── gis/
│       │   ├── marketplace/
│       │   ├── voice/
│       │   │   └── LiveAvatar/
│       │   ├── layout/
│       │   └── shared/
│       │
│       ├── data/
│       │   └── demoData.js
│       │
│       ├── lib/
│       │   ├── agricultureApi.js
│       │   ├── voiceApi.js
│       │   └── avatarApi.js
│       │
│       ├── App.js
│       ├── index.js
│       └── index.css
│
├── docs/
│   ├── architecture/
│   │   └── context.md
│   ├── voice/
│   │   └── implementation-plan.md
│   ├── marketplace/
│   │   └── implementation-plan.md
│   └── designs/
│       ├── voice/
│       └── marketplace/
│
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── server.py
└── vercel.json
```

---

# 3. NON-NEGOTIABLE Migration Rules

## Rule 1 — Never move and modify at the same time

For each file:

1. Copy/move the file.
2. Update imports/references.
3. Run tests.
4. Start backend.
5. Start frontend.
6. Verify the affected feature.
7. Only then delete the old file.

Do not combine unrelated refactors with a directory migration.

---

## Rule 2 — Preserve API URLs

Do not change:

```text
/predict
/api/voice/text-query
/api/voice/query
/api/avatar/session
/api/avatar/close
```

The frontend must continue calling the same endpoints.

---

## Rule 3 — Preserve environment variables

Before touching code, record every environment variable used by:

- backend
- frontend
- Gemini
- Sarvam
- HeyGen
- weather service
- deployment

Do not rename environment variables during this migration.

Create/update:

```text
.env.example
```

with placeholder values only.

Never commit real API keys.

---

## Rule 4 — Preserve ML artifact paths until migration is complete

The trained model:

```text
models/crop_classifier.pkl
```

is a runtime dependency.

Do not move it until all Python imports and model-loading paths have been updated and tested.

---

## Rule 5 — Do not change ML behavior

The following behavior must remain identical:

```text
input
→ feature extraction
→ crop classifier
→ moisture
→ weather
→ advisory
```

The first migration should only change file locations/imports.

---

# 4. Phase 0 — Create a Safe Backup

Before changing anything:

```bash
git status
git add .
git commit -m "chore: backup before repository reorganization"
```

If Git is not configured:

```bash
cp -r KrishiNetra KrishiNetra-before-reorganization
```

Also create a ZIP backup outside the project.

Do not proceed until the baseline is recoverable.

---

# 5. Phase 1 — Establish a Baseline

Run the current project exactly as it is.

## Backend

Create/activate the existing Python environment and install:

```bash
pip install -r requirements.txt
```

Run:

```bash
python server.py
```

Confirm the API starts.

Check:

```text
/predict
/api/voice/text-query
/api/voice/query
/api/avatar/session
/api/avatar/close
```

## Frontend

```bash
cd frontend
npm install
npm start
```

Confirm:

- Home loads
- Navbar works
- GIS works
- dashboards load
- marketplace loads
- voice UI opens
- avatar initializes
- frontend can communicate with backend

## Baseline tests

Run the existing tests before moving files.

If any existing test fails before migration, document it as:

```text
PRE-EXISTING FAILURE
```

Do not accidentally attribute it to the reorganization.

---

# 6. Phase 2 — Freeze the Current API Contract

Create a simple contract record in:

```text
docs/architecture/api-contract.md
```

Document:

```text
POST /predict
POST /api/voice/text-query
POST /api/voice/query
POST /api/avatar/session
POST /api/avatar/close
```

For each endpoint record:

- request body
- response body
- required environment variables
- frontend caller
- backend handler

This document becomes the migration reference.

---

# 7. Phase 3 — Clean Generated/Local Files

Only after the baseline is committed, remove files that can be regenerated.

Remove from the source repository:

```text
.venv/
frontend/node_modules/
frontend/build/
__pycache__/
.git/                  # only when creating a source ZIP, not from the working Git repo
```

Do NOT delete:

```text
models/crop_classifier.pkl
```

Do NOT delete source files simply because they are not currently obvious.

---

# 8. Phase 4 — Create the New Directories

Create:

```text
backend/routes/
backend/schemas/
backend/voice/

agriculture/prediction/
agriculture/advisory/

scripts/training/
scripts/tests/
scripts/utilities/

data/raw/
data/generated/

docs/architecture/
docs/voice/
docs/marketplace/
docs/designs/voice/
docs/designs/marketplace/

frontend/src/components/dashboards/
frontend/src/components/gis/
frontend/src/components/marketplace/
frontend/src/components/voice/
frontend/src/components/layout/
frontend/src/components/shared/

frontend/src/data/
frontend/src/lib/

frontend/public/assets/avatar/
frontend/public/assets/images/
frontend/public/assets/video/
```

Do not move code yet.

---

# 9. Phase 5 — Reorganize Agriculture/ML Code

The current agriculture/ML files should become:

```text
agriculture/
├── prediction/
│   ├── predict.py
│   ├── feature_extractor.py
│   ├── loader.py
│   └── labels.py
│
├── advisory/
│   ├── advisor.py
│   ├── irrigation.py
│   └── moisture.py
│
└── weather.py
```

## Mapping

```text
models/predict.py
→ agriculture/prediction/predict.py

models/feature_extractor.py
→ agriculture/prediction/feature_extractor.py

models/loader.py
→ agriculture/prediction/loader.py

models/label_names.py
→ agriculture/prediction/labels.py

models/advisor.py
→ agriculture/advisory/advisor.py

models/moisture.py
→ agriculture/advisory/moisture.py

models/weather.py
→ agriculture/weather.py
```

### Important

After each move, update imports immediately.

For example:

```python
from models.predict import ...
```

must become:

```python
from agriculture.prediction.predict import ...
```

Do a project-wide search for:

```text
models.
```

before deleting the old package.

---

# 10. Irrigation Duplicate Check

The existing project contains irrigation logic that must be checked before deletion.

Compare:

```text
models/irrigation.py
```

with the irrigation logic used by:

```text
models/advisor.py
```

If the standalone implementation is not used by production code, move the useful testable logic into:

```text
agriculture/advisory/irrigation.py
```

Then update:

```text
scripts/tests/test_irrigation.py
```

to import the new location.

Only delete the old implementation after the test passes.

Never delete irrigation functionality just because it looks duplicated.

---

# 11. Phase 6 — Move Training Code

Training is not runtime application code.

Move:

```text
models/train.py
→ scripts/training/train_model.py
```

If:

```text
scripts/train_model.py
```

is only a wrapper around `models/train.py`, merge the useful functionality into the new training file.

Final:

```text
scripts/training/
├── build_dataset.py
├── check_features.py
└── train_model.py
```

Update all imports.

Training must continue to generate:

```text
models/crop_classifier.pkl
```

unless you intentionally change the artifact location.

---

# 12. Phase 7 — Separate Dataset and Generated Data

Do not commit the full external PASTIS-R dataset.

Use:

```text
data/raw/
```

for source datasets.

Use:

```text
data/generated/
```

for generated files such as:

```text
features.csv
```

The dataset-building flow becomes:

```text
data/raw/
    ↓
scripts/training/build_dataset.py
    ↓
data/generated/features.csv
    ↓
scripts/training/train_model.py
    ↓
models/crop_classifier.pkl
```

Update `.gitignore`:

```gitignore
data/raw/*
data/generated/*
```

Keep an explanatory placeholder such as:

```text
data/raw/.gitkeep
data/generated/.gitkeep
```

if needed.

---

# 13. Phase 8 — Move Backend Services

Move:

```text
backend/sarvam.py
→ backend/services/sarvam.py
```

Keep:

```text
backend/services/gemini.py
backend/services/heygen.py
backend/services/sarvam.py
```

Update imports everywhere.

Search for:

```text
from backend.sarvam
import backend.sarvam
```

and replace with:

```text
from backend.services.sarvam
```

Do not change Sarvam behavior during this phase.

---

# 14. Phase 9 — Reorganize Voice Backend

Move:

```text
backend/voice_orchestrator.py
→ backend/voice/orchestrator.py

backend/voice_tools.py
→ backend/voice/tools.py

backend/voice_schemas.py
→ backend/voice/schemas.py

backend/sessions/voice_session.py
→ backend/voice/session.py
```

Final:

```text
backend/voice/
├── orchestrator.py
├── tools.py
├── schemas.py
└── session.py
```

Update all imports.

Search globally for:

```text
voice_orchestrator
voice_tools
voice_schemas
voice_session
```

Do not delete old files until zero imports remain.

---

# 15. Phase 10 — Split Backend Routes

Do this only after the service and voice migration works.

Create:

```text
backend/routes/agriculture.py
backend/routes/voice.py
backend/routes/avatar.py
```

Move the existing endpoint logic without changing behavior.

## Agriculture

```text
POST /predict
```

goes into:

```text
backend/routes/agriculture.py
```

## Voice

```text
POST /api/voice/text-query
POST /api/voice/query
```

go into:

```text
backend/routes/voice.py
```

## Avatar

```text
POST /api/avatar/session
POST /api/avatar/close
```

go into:

```text
backend/routes/avatar.py
```

Then update:

```text
backend/app.py
```

to include the three routers.

The resulting URL behavior must remain identical.

---

# 16. Phase 11 — Backend Schemas

If `backend/schemas.py` contains agriculture request/response models, move them to:

```text
backend/schemas/agriculture.py
```

If voice-specific models are present, move them to:

```text
backend/schemas/voice.py
```

Do not rename fields in request/response models during this migration.

A structural migration must not silently become an API-breaking schema migration.

---

# 17. Phase 12 — Frontend Component Reorganization

Move only; do not redesign.

### Dashboards

```text
FarmerDashboard.js
OfficerDashboard.js
AdminDashboard.js
```

→

```text
frontend/src/components/dashboards/
```

### GIS

```text
GisMap.js
```

→

```text
frontend/src/components/gis/
```

### Marketplace

```text
Marketplace.js
```

→

```text
frontend/src/components/marketplace/
```

### Voice

```text
VoiceAssistantModal.js
VoiceTriggerButton.js
LiveAvatar/
```

→

```text
frontend/src/components/voice/
```

### Layout

```text
Navbar.js
LeafLoader.js
```

→

```text
frontend/src/components/layout/
```

### Shared

```text
icons.js
ui.js
```

→

```text
frontend/src/components/shared/
```

---

# 18. Phase 13 — Frontend API Layer

The current API helper contains multiple domains.

Split:

```text
frontend/src/lib/api.js
```

into:

```text
frontend/src/lib/agricultureApi.js
frontend/src/lib/voiceApi.js
frontend/src/lib/avatarApi.js
```

### agricultureApi.js

Contains:

```text
/predict
```

### voiceApi.js

Contains:

```text
/api/voice/*
```

### avatarApi.js

Contains:

```text
/api/avatar/*
```

Do not change endpoint URLs.

Update component imports.

Search globally for:

```text
from "./lib/api"
from "../lib/api"
from "../../lib/api"
```

and replace with the correct new API module.

Only delete the old `api.js` when no imports remain.

---

# 19. Phase 14 — Frontend Demo Data

Rename:

```text
frontend/src/data/mock.js
```

to:

```text
frontend/src/data/demoData.js
```

Update imports.

Do not change the actual data in this phase.

This is only a clarity improvement.

---

# 20. Phase 15 — Asset Cleanup

First search the codebase for every asset reference.

Search:

```text
farmer_avatar
farmer_avatar_clean
farmer_final_avatar
farmer_video
Video of AI generated Farmer
hero.jpeg
hero.webp
hero_image
voice_ui_reference
```

For every asset:

1. Determine whether it is referenced.
2. Determine whether multiple copies are identical.
3. Keep the best required copy.
4. Move it into:

```text
frontend/public/assets/
```

Use:

```text
assets/avatar/
assets/images/
assets/video/
```

Do not delete an asset solely because it looks duplicated.

Check references first.

---

# 21. Phase 16 — Documentation Cleanup

Create one authoritative document for each active feature.

```text
docs/
├── architecture/
│   └── context.md
│
├── voice/
│   └── implementation-plan.md
│
├── marketplace/
│   └── implementation-plan.md
│
└── designs/
    ├── voice/
    └── marketplace/
```

## Voice documentation

Merge the latest voice implementation requirements into:

```text
docs/voice/implementation-plan.md
```

Do not keep multiple versions such as:

```text
Updated
Updated_Final
Updated_Final_2
```

in the active documentation directory.

Archive obsolete plans outside the main source tree if historical records are required.

---

# 22. Remove Obsolete Bhashini Documentation

The current project uses the newer Sarvam-based voice implementation.

Any active documentation that describes Bhashini as the current provider must be updated.

Do not remove historical information if it is useful for project history; instead label it clearly:

```text
ARCHIVED
```

The active architecture should say:

```text
Sarvam
    ↓
STT / TTS

Gemini
    ↓
Tool routing / response generation

HeyGen
    ↓
Live avatar
```

---

# 23. Phase 17 — Documentation Assets

Move design references from:

```text
docs/Ui Designs/
docs/png/
```

into:

```text
docs/designs/voice/
docs/designs/marketplace/
```

Do not keep a Markdown file inside:

```text
docs/png/
```

Use descriptive filenames.

Example:

```text
docs/designs/voice/
├── README.md
└── voice-assistant-reference.png
```

---

# 24. Phase 18 — Update README

The README must be updated after the final structure is stable.

It should explain:

```text
1. What KrishiNetra does
2. Architecture
3. Repository structure
4. Local setup
5. Environment variables
6. Running backend
7. Running frontend
8. Running tests
9. ML training
10. Voice AI architecture
11. Deployment
```

The repository name and product name must consistently be:

```text
KrishiNetra
```

Avoid obsolete project names in the active README.

---

# 25. Phase 19 — Update .gitignore

The `.gitignore` should include at minimum:

```gitignore
# Python
.venv/
__pycache__/
*.py[cod]
.pytest_cache/

# Node
frontend/node_modules/
frontend/build/

# Environment
.env
.env.*
!.env.example

# Generated ML data
data/raw/*
data/generated/*

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

Do not ignore:

```text
models/crop_classifier.pkl
```

if production inference requires the model to be present in the deployment artifact.

If the model is too large for Git, use an external model-artifact strategy instead; do not silently ignore it.

---

# 26. Phase 20 — Import Verification

After all moves, perform global searches.

Search for old paths:

```text
models.
backend.routes
backend.sarvam
voice_orchestrator
voice_tools
voice_schemas
voice_session
components/FarmerDashboard
components/GisMap
components/Marketplace
components/VoiceAssistantModal
lib/api
```

Every remaining reference must be intentional.

Do not rely only on the application starting; unused imports can remain hidden.

---

# 27. Phase 21 — Python Import Verification

Run:

```bash
python -m compileall backend agriculture api scripts
```

There should be no syntax/import compilation errors.

Then:

```bash
python server.py
```

Confirm FastAPI starts.

---

# 28. Phase 22 — Backend Functional Verification

Test in this order:

## Agriculture

```text
POST /predict
```

Verify:

```text
crop
confidence
coordinates
moisture
weather
advisory
```

## Voice text

```text
POST /api/voice/text-query
```

Verify:

```text
session
tool routing
tool execution
Gemini response
language handling
```

## Voice audio

```text
POST /api/voice/query
```

Verify:

```text
audio input
Sarvam STT
voice orchestration
Gemini
Sarvam TTS
audio response
```

## Avatar

```text
POST /api/avatar/session
POST /api/avatar/close
```

Verify:

```text
HeyGen session creation
avatar connection
session cleanup
```

---

# 29. Phase 23 — Frontend Functional Verification

Open the application and manually test:

```text
[ ] Home page
[ ] Navbar
[ ] GIS map
[ ] Farmer dashboard
[ ] Officer dashboard
[ ] Admin dashboard
[ ] Marketplace
[ ] Voice trigger button
[ ] Voice assistant modal
[ ] Farmer avatar
[ ] Voice input
[ ] Voice response
[ ] Avatar response
```

Then test page refreshes.

Then test browser console.

There should be no new:

```text
404
CORS
module not found
failed to fetch
undefined import
asset not found
```

errors.

---

# 30. Phase 24 — ML Verification

Run all ML tests.

At minimum verify:

```text
feature extraction
model loading
crop prediction
moisture calculation
weather
advisory
```

The prediction output should remain equivalent to the baseline.

Do not retrain the model during the structural migration.

Use the existing:

```text
models/crop_classifier.pkl
```

until the repository reorganization is complete.

---

# 31. Phase 25 — Voice Regression Test

The voice pipeline is high-risk and must receive a dedicated regression test.

Test:

```text
User
 ↓
text/audio
 ↓
voice route
 ↓
session
 ↓
Gemini
 ↓
tool selection
 ↓
tool authorization
 ↓
agriculture model
 ↓
tool result
 ↓
Gemini
 ↓
Sarvam
 ↓
frontend
 ↓
HeyGen avatar
```

Verify that moving files did not change:

- tool names
- tool arguments
- session IDs
- response fields
- language behavior
- audio format
- avatar session token handling

---

# 32. Phase 26 — Vercel Verification

Do not modify deployment behavior until local development works.

Verify:

```text
api/index.py
vercel.json
```

still point to:

```text
backend.app:app
```

Build/deploy.

Test production:

```text
/predict
/api/voice/text-query
/api/voice/query
/api/avatar/session
/api/avatar/close
```

Also test the React application itself.

---

# 33. Phase 27 — Remove Old Files

Only after all previous phases pass:

Delete old locations.

Examples:

```text
models/predict.py
models/advisor.py
models/weather.py
models/moisture.py
models/train.py
models/label_names.py

backend/sarvam.py
backend/voice_orchestrator.py
backend/voice_tools.py
backend/voice_schemas.py
backend/sessions/

frontend/src/lib/api.js

scratch/
frontend/build/
```

Do NOT delete an old file if:

```text
grep/search
```

still shows a reference to it.

---

# 34. Phase 28 — Git Commit Strategy

Do not make one giant commit.

Use small commits.

Recommended:

```text
chore: remove generated files
chore: add reorganized directories
refactor: move agriculture modules
refactor: reorganize backend services
refactor: reorganize voice modules
refactor: split backend routes
refactor: reorganize frontend components
refactor: split frontend api clients
docs: reorganize project documentation
chore: clean duplicate assets
docs: update README and architecture
```

This makes it easy to identify which change introduced a problem.

---

# 35. Phase 29 — Final Repository Audit

Before declaring the migration complete, verify:

```text
[ ] No .venv
[ ] No node_modules
[ ] No build/
[ ] No __pycache__
[ ] No scratch/
[ ] No obsolete source files
[ ] No duplicate production assets
[ ] No stale imports
[ ] No stale API references
[ ] No Bhashini references in active voice documentation
[ ] No secrets committed
[ ] README matches actual structure
[ ] .gitignore is correct
[ ] ML model loads
[ ] /predict works
[ ] voice text works
[ ] voice audio works
[ ] avatar session works
[ ] marketplace works
[ ] GIS works
[ ] all dashboards work
[ ] Vercel deployment works
```

---

# 36. Safe Migration Order — Quick Reference

Use this exact order:

```text
1. Backup
   ↓
2. Baseline test
   ↓
3. Freeze API contracts
   ↓
4. Remove generated/local files
   ↓
5. Create target directories
   ↓
6. Move agriculture modules
   ↓
7. Fix agriculture imports
   ↓
8. Test agriculture
   ↓
9. Move training scripts
   ↓
10. Move backend services
    ↓
11. Move voice modules
    ↓
12. Test voice
    ↓
13. Split backend routes
    ↓
14. Test all backend endpoints
    ↓
15. Move frontend components
    ↓
16. Split frontend API clients
    ↓
17. Move assets
    ↓
18. Test frontend
    ↓
19. Clean documentation
    ↓
20. Update README
    ↓
21. Run full test suite
    ↓
22. Test Vercel
    ↓
23. Delete old files
    ↓
24. Final audit
    ↓
25. Commit final structure
```

---

# 37. Definition of "Done"

The reorganization is complete only when:

```text
The code behaves exactly as before,
but the repository is easier to understand.
```

The following must NOT change as a side effect:

```text
UI behavior
API URLs
API response structure
ML prediction behavior
voice tool names
voice tool arguments
Gemini behavior
Sarvam integration
HeyGen integration
GIS behavior
Marketplace behavior
dashboard behavior
deployment behavior
```

The only intended changes are:

```text
file locations
import paths
naming clarity
documentation organization
generated-file cleanup
asset organization
test organization
```

---

# 38. Important Principle for Future Development

After this migration, new functionality should follow this rule:

### Frontend

Put code according to **feature**:

```text
components/voice/
components/marketplace/
components/gis/
components/dashboards/
```

### Backend

Put code according to **responsibility**:

```text
routes/
services/
voice/
schemas/
```

### Agriculture

Put code according to **domain**:

```text
prediction/
advisory/
weather.py
```

### Scripts

Put code according to **purpose**:

```text
training/
tests/
utilities/
```

### Documentation

Put documents according to **feature/topic**:

```text
architecture/
voice/
marketplace/
designs/
```

This prevents the repository from becoming messy again.

---

# 39. Final Target Mental Model

A new developer should be able to understand KrishiNetra like this:

```text
KrishiNetra
│
├── frontend
│   └── What the user sees
│
├── backend
│   └── APIs and AI integrations
│
├── agriculture
│   └── Actual farming intelligence
│
├── models
│   └── Trained ML artifacts
│
├── scripts
│   └── Training, testing and maintenance
│
├── data
│   └── Datasets/generated data
│
├── docs
│   └── Human documentation and designs
│
└── api
    └── Deployment entry point
```

That is the organizing principle the team should follow from this point onward.


# Appendix A — Uploaded Archive Inventory Snapshot

Top-level entries found in the uploaded archive (excluding repeated nested paths):

- `KrishiNetra`

Relevant source/config/document files detected (generated/local folders excluded):

- `KrishiNetra/.env.example`
- `KrishiNetra/api/index.py`
- `KrishiNetra/backend/app.py`
- `KrishiNetra/backend/routes.py`
- `KrishiNetra/backend/sarvam.py`
- `KrishiNetra/backend/schemas.py`
- `KrishiNetra/backend/services/gemini.py`
- `KrishiNetra/backend/services/heygen.py`
- `KrishiNetra/backend/sessions/voice_session.py`
- `KrishiNetra/backend/voice_orchestrator.py`
- `KrishiNetra/backend/voice_schemas.py`
- `KrishiNetra/backend/voice_tools.py`
- `KrishiNetra/docs/Markdown Files/context.md`
- `KrishiNetra/docs/Markdown Files/KrishiNetra_Voice_AI_Agent_Full_Implementation_Plan.md`
- `KrishiNetra/docs/Markdown Files/Market Place.md`
- `KrishiNetra/docs/png/KrishiNetra_Voice_Assistance_Updated_Implementation_Plan_Final.md`
- `KrishiNetra/docs/Ui Designs/Ai Voice Assistance/DESIGN.md`
- `KrishiNetra/docs/Ui Designs/Market Place/agro_satellite_insight_1/DESIGN.md`
- `KrishiNetra/docs/Ui Designs/Market Place/agro_satellite_insight_2/DESIGN.md`
- `KrishiNetra/frontend/package-lock.json`
- `KrishiNetra/frontend/package.json`
- `KrishiNetra/frontend/postcss.config.js`
- `KrishiNetra/frontend/src/App.js`
- `KrishiNetra/frontend/src/components/AdminDashboard.js`
- `KrishiNetra/frontend/src/components/FarmerDashboard.js`
- `KrishiNetra/frontend/src/components/GisMap.js`
- `KrishiNetra/frontend/src/components/Home.js`
- `KrishiNetra/frontend/src/components/icons.js`
- `KrishiNetra/frontend/src/components/LeafLoader.js`
- `KrishiNetra/frontend/src/components/LiveAvatar/LiveAvatar.js`
- `KrishiNetra/frontend/src/components/Marketplace.js`
- `KrishiNetra/frontend/src/components/Navbar.js`
- `KrishiNetra/frontend/src/components/OfficerDashboard.js`
- `KrishiNetra/frontend/src/components/ui.js`
- `KrishiNetra/frontend/src/components/VoiceAssistantModal.js`
- `KrishiNetra/frontend/src/components/VoiceTriggerButton.js`
- `KrishiNetra/frontend/src/data/mock.js`
- `KrishiNetra/frontend/src/index.css`
- `KrishiNetra/frontend/src/index.js`
- `KrishiNetra/frontend/src/lib/api.js`
- `KrishiNetra/frontend/tailwind.config.js`
- `KrishiNetra/models/advisor.py`
- `KrishiNetra/models/feature_extractor.py`
- `KrishiNetra/models/irrigation.py`
- `KrishiNetra/models/label_names.py`
- `KrishiNetra/models/loader.py`
- `KrishiNetra/models/moisture.py`
- `KrishiNetra/models/predict.py`
- `KrishiNetra/models/train.py`
- `KrishiNetra/models/weather.py`
- `KrishiNetra/models/__init__.py`
- `KrishiNetra/README.md`
- `KrishiNetra/requirements.txt`
- `KrishiNetra/scratch/test_gemini_call.py`
- `KrishiNetra/scripts/check_features.py`
- `KrishiNetra/scripts/clean_avatar.py`
- `KrishiNetra/scripts/dataset_builder.py`
- `KrishiNetra/scripts/test_advisor.py`
- `KrishiNetra/scripts/test_features.py`
- `KrishiNetra/scripts/test_irrigation.py`
- `KrishiNetra/scripts/test_loader.py`
- `KrishiNetra/scripts/test_metadata.py`
- `KrishiNetra/scripts/test_moisture.py`
- `KrishiNetra/scripts/test_predict.py`
- `KrishiNetra/scripts/test_voice_agent.py`
- `KrishiNetra/scripts/test_voice_pipeline_comprehensive.py`
- `KrishiNetra/scripts/test_weather.py`
- `KrishiNetra/scripts/train_model.py`
- `KrishiNetra/server.py`
- `KrishiNetra/utils/coordinate_converter.py`
- `KrishiNetra/vercel.json`
