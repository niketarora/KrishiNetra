from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.advisory.moisture import estimate_moisture

parcel = 10011413

moisture = estimate_moisture(parcel)

print("\n=================================")
print("      SOIL MOISTURE TEST")
print("=================================\n")

print("Parcel ID :", parcel)
print("Moisture  :", moisture, "%")

print("\n=================================")
assert 0 <= moisture <= 100
print("TEST MOISTURE PASSED!")
