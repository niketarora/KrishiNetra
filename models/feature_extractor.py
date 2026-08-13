import numpy as np

from models.loader import *


def extract_statistics(data, prefix):

    features = {}

    bands = data.shape[1]

    for b in range(bands):

        # IMPORTANT
        # Convert to float BEFORE computing statistics

        band = data[:, b, :].astype(np.float64)

        features[f"{prefix}_band{b}_mean"] = float(np.mean(band))
        features[f"{prefix}_band{b}_std"] = float(np.std(band))
        features[f"{prefix}_band{b}_min"] = float(np.min(band))
        features[f"{prefix}_band{b}_max"] = float(np.max(band))

    return features


def extract_features(parcel_id):

    s2 = load_s2(parcel_id)
    s1a = load_s1a(parcel_id)
    s1d = load_s1d(parcel_id)

    meta = load_metadata(parcel_id)

    features = {}

    features.update(extract_statistics(s2, "S2"))
    features.update(extract_statistics(s1a, "S1A"))
    features.update(extract_statistics(s1d, "S1D"))

    features["label"] = int(meta["Label"])

    return features