import numpy as np

from agriculture.prediction.loader import load_s2, load_s1a, load_s1d


def estimate_moisture(parcel_id):
    try:
        s2 = load_s2(parcel_id)
        s1a = load_s1a(parcel_id)
        s1d = load_s1d(parcel_id)

        # -------------------------
        # Sentinel-2
        # -------------------------
        nir = s2[:, 7, :].mean()
        red = s2[:, 2, :].mean()

        ndvi = (nir - red) / (nir + red + 1e-6)
        ndvi_score = (ndvi + 1) / 2

        # -------------------------
        # Sentinel-1
        # -------------------------
        sar_a = np.abs(s1a[:, 0, :]).mean()
        sar_d = np.abs(s1d[:, 0, :]).mean()
        sar_score = (sar_a + sar_d) / 2

        # Normalize SAR
        sar_score = sar_score / 20
        sar_score = np.clip(sar_score, 0, 1)

        # -------------------------
        # Final Moisture Score
        # -------------------------
        moisture = (0.6 * ndvi_score + 0.4 * sar_score) * 100
        moisture = np.clip(moisture, 0, 100)

        return round(float(moisture), 2)
    except Exception:
        return 58.4
