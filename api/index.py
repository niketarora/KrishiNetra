import os
import sys

# Add repository root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app

# Export app for Vercel Serverless Function
