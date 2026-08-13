from pathlib import Path
import sys
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.feature_extractor import extract_features

# ---------------------------------------
# Load metadata
# ---------------------------------------

metadata = pd.read_csv(
    ROOT / "data" / "PASTIS-R_PixelSet" / "metadata_parcel.csv"
)

# ---------------------------------------
# Number of parcels to process
# ---------------------------------------

LIMIT = 500      # Later change to None for all parcels

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

output_path = ROOT / "outputs" / "features.csv"

df.to_csv(output_path, index=False)

print("\nFinished!")
print(df.shape)
print(f"Saved to {output_path}")