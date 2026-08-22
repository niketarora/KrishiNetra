from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.prediction.loader import load_metadata

parcel = 10011413
meta = load_metadata(parcel)
print("Metadata row for", parcel, ":", meta)
print("TEST LOADER PASSED!")
