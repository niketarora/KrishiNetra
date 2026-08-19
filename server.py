import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from backend.app import app

if __name__ == "__main__":
    print("Starting KrishiNetra FastAPI Backend on http://127.0.0.1:8000 ...", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
