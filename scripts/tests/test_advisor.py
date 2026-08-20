from pathlib import Path
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.advisory.advisor import generate_report

# Temporary Jaipur coordinates
LAT = 26.9124
LON = 75.7873

parcel = 10011413

report = generate_report(parcel, LAT, LON)

print("\n===============================================")
print("      SMART FARM ADVISOR REPORT")
print("===============================================\n")

print(f"Parcel ID    : {parcel}")
print(f"Crop         : {report['crop_name']}")
print(f"Confidence   : {report['confidence']:.2f}%")
print(f"Moisture     : {report['moisture']}%")
print(f"Temperature  : {report['temperature']} °C")
print(f"Humidity     : {report['humidity']} %")
print(f"Rainfall     : {report['rain']} mm")

print("\nRecommendation")
print("-----------------------------")
print(f"English : {report['english']}")
print(f"Hindi   : {report['hindi']}")

print("\n===============================================")
assert report is not None
assert "crop_name" in report
assert "moisture" in report
assert "english" in report
print("TEST ADVISOR PASSED!")
