from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.predict import predict_crop

parcel = 10011413

result = predict_crop(parcel)

print("\n========================================")
print("       CROP PREDICTION RESULT")
print("========================================\n")

print(f"Parcel ID   : {result['parcel_id']}")
print(f"Crop Label  : {result['label']}")
print(f"Crop Name   : {result['crop_name']}")
print(f"Confidence  : {result['confidence']:.2f}%")

print("\n========================================")