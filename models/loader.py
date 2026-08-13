from pathlib import Path
import numpy as np
import pandas as pd

# Project Root
ROOT = Path(__file__).resolve().parent.parent

# Dataset Folder
DATASET = ROOT / "data" / "PASTIS-R_PixelSet"

# Paths
S2_PATH = DATASET / "DATA_S2"
S1A_PATH = DATASET / "DATA_S1A"
S1D_PATH = DATASET / "DATA_S1D"

# Metadata
CSV_FILE = DATASET / "metadata_parcel.csv"
if CSV_FILE.exists():
    METADATA = pd.read_csv(CSV_FILE)
else:
    METADATA = pd.DataFrame(columns=["ID_PARCEL", "label"])



# -----------------------------
# Load Sentinel-2
# -----------------------------
def load_s2(parcel_id):
    file = S2_PATH / f"S2_{parcel_id}.npy"

    if not file.exists():
        raise FileNotFoundError(file)

    return np.load(file)


# -----------------------------
# Load Sentinel-1 Ascending
# -----------------------------
def load_s1a(parcel_id):
    file = S1A_PATH / f"S1A_{parcel_id}.npy"

    if not file.exists():
        raise FileNotFoundError(file)

    return np.load(file)


# -----------------------------
# Load Sentinel-1 Descending
# -----------------------------
def load_s1d(parcel_id):
    file = S1D_PATH / f"S1D_{parcel_id}.npy"

    if not file.exists():
        raise FileNotFoundError(file)

    return np.load(file)


# -----------------------------
# Load Metadata
# -----------------------------
def load_metadata(parcel_id):
    row = METADATA[METADATA["ID_PARCEL"] == float(parcel_id)]

    if row.empty:
        return None

    return row.iloc[0]