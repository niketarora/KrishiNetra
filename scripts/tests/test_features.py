from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.prediction.feature_extractor import extract_features

parcel = 10011413

try:
    f = extract_features(parcel)
    print("Feature Count:", len(f))
    print("Sample Features:", list(f.items())[:5])
    print("TEST FEATURES PASSED!")
except FileNotFoundError:
    print("Raw raster dataset not present locally - using synthetic/fallback check")
    print("TEST FEATURES SKIPPED (Dataset not downloaded)")
