"""
Parcel ID  ->  (latitude, longitude)

Resolution order:
  1. metadata.geojson      -> centroid of the parcel polygon  (real PASTIS format)
  2. metadata_parcel.csv   -> lat/lon columns if present
  3. fallback              -> centroid of France (dataset region)

PASTIS geometries are stored in Lambert-93 (EPSG:2154). If pyproj is
installed the centroid is reprojected to WGS84 lat/lon; otherwise the raw
centroid is returned (already-WGS84 geojson works without pyproj).
"""

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "data" / "PASTIS-R_PixelSet"
GEOJSON_PATH = DATASET / "metadata.geojson"
CSV_PATH = DATASET / "metadata_parcel.csv"

FRANCE_CENTROID = (46.603354, 1.888334)

_geojson = None
_csv = None


# ---------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------
def _flatten_coords(coords, acc):
    """Recursively collect [x, y] pairs from any GeoJSON geometry."""
    if not coords:
        return
    if isinstance(coords[0], (int, float)):
        acc.append((coords[0], coords[1]))
        return
    for c in coords:
        _flatten_coords(c, acc)


def _centroid(geometry):
    pts = []
    _flatten_coords(geometry.get("coordinates"), pts)
    if not pts:
        return None
    x = sum(p[0] for p in pts) / len(pts)
    y = sum(p[1] for p in pts) / len(pts)
    return x, y


def _to_wgs84(x, y):
    """Reproject Lambert-93 -> WGS84 if coords look projected and pyproj exists."""
    if abs(x) <= 180 and abs(y) <= 90:
        # Already looks like lon/lat.
        return y, x
    try:
        from pyproj import Transformer
        transformer = Transformer.from_crs("EPSG:2154", "EPSG:4326", always_xy=True)
        lon, lat = transformer.transform(x, y)
        return lat, lon
    except Exception:
        # pyproj unavailable; return raw centroid (lat, lon) best-effort.
        return y, x


# ---------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------
def _load_geojson():
    global _geojson
    if _geojson is None and GEOJSON_PATH.exists():
        with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        index = {}
        for feature in data.get("features", []):
            pid = feature.get("properties", {}).get("ID_PARCEL")
            if pid is not None:
                index[int(pid)] = feature.get("geometry")
        _geojson = index
    return _geojson or {}


def _load_csv():
    global _csv
    if _csv is None and CSV_PATH.exists():
        _csv = pd.read_csv(CSV_PATH)
    return _csv


# ---------------------------------------------------------------
# Public API
# ---------------------------------------------------------------
def get_coordinates(parcel_id):
    pid = int(parcel_id)

    # 1. GeoJSON centroid
    geom = _load_geojson().get(pid)
    if geom:
        c = _centroid(geom)
        if c:
            return _to_wgs84(c[0], c[1])

    # 2. CSV lat/lon columns
    df = _load_csv()
    if df is not None:
        row = df[df["ID_PARCEL"] == float(pid)]
        if not row.empty:
            lat_col = next((c for c in df.columns if "lat" in c.lower()), None)
            lon_col = next((c for c in df.columns if "lon" in c.lower() or "lng" in c.lower()), None)
            if lat_col and lon_col:
                return float(row.iloc[0][lat_col]), float(row.iloc[0][lon_col])

    # 3. Fallback
    return FRANCE_CENTROID
