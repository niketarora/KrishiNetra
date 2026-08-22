from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.prediction.predict import predict_crop

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
assert result is not None
assert "crop_name" in result
assert "confidence" in result
print("TEST PREDICT PASSED!")
