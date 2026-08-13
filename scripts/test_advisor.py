from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.advisor import generate_report

# Temporary Jaipur coordinates
LAT = 26.9124
LON = 75.7873

parcel = 10011413

report = generate_report(parcel, LAT, LON)

print("\n===============================================")
print("      SMART FARM ADVISOR REPORT")
print("===============================================\n")

print(f"Parcel ID    : {parcel}")
print(f"Crop         : {report['crop']}")
print(f"Confidence   : {report['confidence']:.2f}%")
print(f"Moisture     : {report['moisture']}%")
print(f"Temperature  : {report['temperature']} °C")
print(f"Humidity     : {report['humidity']} %")
print(f"Rainfall     : {report['rain']} mm")

print("\nRecommendation")
print("-----------------------------")
print(report["advice"])

print("\n===============================================")