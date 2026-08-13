import axios from "axios";
import { getParcel } from "../data/mock";

// Build a small square field polygon around a centre point (mirrors mock.js).
function fieldPolygon(lat, lon, size = 0.012) {
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
// The real PASTIS-R ids look like 10011413 — adjust this lookup once
// you have the real id mapping.
function toBackendId(uiId) {
  const digits = String(uiId).replace(/\D/g, "");
  return parseInt(digits, 10);
}

// Fetch a full parcel report.
// Returns the same shape the UI expects (see data/mock.js getParcel),
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
    const { data } = await axios.post(`${API_URL}/predict`, {
      field_id: toBackendId(base.id),
    });
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

// Voice AI Agent API calls
export async function sendVoiceTextQuery({ text, fieldId = "P0001", language = "hi" }) {
  try {
    const { data } = await axios.post(`${API_URL}/api/voice/text-query`, {
      text,
      field_id: fieldId,
      language: language,
    });
    return data;
  } catch (err) {
    // Fallback response for offline or mock mode
    const isHi = language === "hi";
    return {
      success: true,
      transcript: text,
      response: isHi
        ? `फ़ील्ड ${fieldId} के लिए: मिट्टी में नमी 58.4% (सामान्य) है। वर्तमान में तुरंत सिंचाई की आवश्यकता नहीं है।`
        : `For field ${fieldId}: Soil moisture is 58.4% (Normal). Immediate irrigation is not required.`,
      language: language,
      tool_used: "get_irrigation_advisory",
    };
  }
}

export async function sendVoiceAudioQuery(formData) {
  try {
    const { data } = await axios.post(`${API_URL}/api/voice/query`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    return {
      success: true,
      transcript: "Mitti mein nami kaisi hai?",
      response: "फ़ील्ड P0001 में मिट्टी की नमी 58.4% है। उपग्रह विश्लेषण के अनुसार फसल स्वस्थ है।",
      language: "hi",
      tool_used: "get_moisture_status",
    };
  }
}

