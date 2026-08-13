from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.irrigation import irrigation_advice

parcel = 10011413

result = irrigation_advice(parcel)

print("\n======================================")
print("      SMART IRRIGATION REPORT")
print("======================================\n")

print("Parcel ID :", parcel)
print("Crop      :", result["crop"])
print("Moisture  :", result["moisture"], "%")
print("Risk      :", result["risk"])
print("Advice    :", result["advice"])

print("\n======================================")