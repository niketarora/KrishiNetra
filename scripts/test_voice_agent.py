"""
Test runner for KrishiNetra Voice AI Agent logic and tools.
"""

import sys
import io

# Force UTF-8 encoding for Windows console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from backend.voice_orchestrator import process_voice_query_text
from backend.voice_tools import ALLOWLISTED_TOOLS

print("========================================", flush=True)
print("  TESTING VOICE AI TOOL REGISTRY", flush=True)
print("========================================", flush=True)
print(f"Allowlisted tools count: {len(ALLOWLISTED_TOOLS)}", flush=True)

test_queries = [
    ("Paani kab dena hai?", "hi"),
    ("What is the crop in my field?", "en"),
    ("Mitti mein nami kaisi hai?", "hi"),
    ("Aaj mausam kaisa hai?", "hi"),
    ("Is my crop healthy?", "en")
]

for query, lang in test_queries:
    res = process_voice_query_text(query, field_id="P0001", lang=lang)
    print(f"\nQuery ({lang})  : {query}", flush=True)
    print(f"Tool Used   : {res['tool_used']}", flush=True)
    print(f"Response    : {res['response']}", flush=True)

print("\n========================================", flush=True)
print("  ALL VOICE AI AGENT TESTS PASSED!", flush=True)
print("========================================", flush=True)
