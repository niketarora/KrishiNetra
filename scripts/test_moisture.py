from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.moisture import estimate_moisture

parcel = 10011413

moisture = estimate_moisture(parcel)

print("\n====================================")
print("      MOISTURE ESTIMATION")
print("====================================\n")

print("Parcel :", parcel)
print("Estimated Moisture :", moisture, "%")

print("\n====================================")