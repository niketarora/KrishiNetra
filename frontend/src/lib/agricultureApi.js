import axios from "axios";
import { getParcel } from "../data/demoData";

// Build a small square field polygon around a centre point (mirrors demoData.js).
export function fieldPolygon(lat, lon, size = 0.012) {
  const h = size / 2;
  return [
    [lat + h, lon - h],
    [lat + h, lon + h],
    [lat - h, lon + h],
    [lat - h, lon - h],
  ];
}

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Toggle to true once the FastAPI backend + trained model are ready.
// When false, the UI runs entirely on mock data.
export const USE_REAL_BACKEND = true;

// Map a UI field id (e.g. "P0001") to a backend integer field id.
function toBackendId(uiId) {
  const digits = String(uiId).replace(/\D/g, "");
  return parseInt(digits, 10);
}

// Fetch a full parcel report.
// Returns the same shape the UI expects (see data/demoData.js getParcel),
// merging real backend fields over the mock baseline so the rich UI
// stays populated even though /predict only returns a subset.
export async function fetchParcel(query) {
  const base = getParcel(query);
  if (!base) return null;

  if (!USE_REAL_BACKEND) {
    // Brief delay so the leaf loader is visible on mock data.
    await new Promise((r) => setTimeout(r, 450));
    return base;
  }

  try {
    const { data } = await axios.post(
      `${API_URL}/predict`,
      {
        field_id: toBackendId(base.id),
      },
      {
        headers: { "Bypass-Tunnel-Reminder": "true" },
      }
    );
    // Use the real farm coordinates so the map zooms to the actual parcel.
    const lat = data.latitude ?? base.lat;
    const lon = data.longitude ?? base.lon;
    return {
      ...base,
      crop: data.crop_name ?? base.crop,
      confidence: data.confidence ?? base.confidence,
      moisture: data.moisture ?? base.moisture,
      lat,
      lon,
      polygon: data.latitude != null ? fieldPolygon(lat, lon) : base.polygon,
      temperature: data.temperature,
      humidity: data.humidity,
      rain: data.rain,
      advisory: {
        ...base.advisory,
        en: data.english ?? base.advisory.en,
        hi: data.hindi ?? base.advisory.hi,
      },
    };
  } catch (err) {
    // Fall back to mock so the UI never breaks during a demo.
    return base;
  }
}
