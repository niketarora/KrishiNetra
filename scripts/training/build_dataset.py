from pathlib import Path
import sys
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.prediction.feature_extractor import extract_features

# ---------------------------------------
# Load metadata
# ---------------------------------------

metadata_path = ROOT / "data" / "PASTIS-R_PixelSet" / "metadata_parcel.csv"
if not metadata_path.exists() and (ROOT / "data" / "raw" / "PASTIS-R_PixelSet" / "metadata_parcel.csv").exists():
    metadata_path = ROOT / "data" / "raw" / "PASTIS-R_PixelSet" / "metadata_parcel.csv"

if metadata_path.exists():
    metadata = pd.read_csv(metadata_path)
else:
    metadata = pd.DataFrame(columns=["ID_PARCEL", "Label"])

# ---------------------------------------
# Number of parcels to process
# ---------------------------------------

LIMIT = 500  # Change to None for all parcels

dataset = []

# ---------------------------------------
# Loop through parcels
# ---------------------------------------

for i, parcel in enumerate(metadata["ID_PARCEL"]):
    if LIMIT is not None and i >= LIMIT:
        break

    parcel = int(parcel)

    try:
        features = extract_features(parcel)
        dataset.append(features)

        if i % 25 == 0:
            print(f"Processed {i} parcels")
    except Exception as e:
        print(f"Skipped {parcel} -> {e}")

# ---------------------------------------
# Save CSV
# ---------------------------------------

df = pd.DataFrame(dataset)

output_dir = ROOT / "data" / "generated"
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / "features.csv"

df.to_csv(output_path, index=False)

print("\nFinished!")
print(df.shape)
print(f"Saved to {output_path}")
