// Mock dataset matching KrishiNetra UI component dependencies

export const STATS = {
  parcels: 16,
  districts: 8,
  passesPerDay: 14,
  modelAccuracy: 94.2,
};

export const LANGUAGES = [
  { code: "en", label: "English", ready: true },
  { code: "hi", label: "हिन्दी", ready: true },
  { code: "mr", label: "मराठी", ready: false },
  { code: "pb", label: "ਪੰਜਾਬੀ", ready: false },
  { code: "te", label: "తెలుగు", ready: false },
  { code: "bn", label: "বাংলা", ready: false },
];

export const PARCELS = [
  {
    id: "P0001",
    field_id: "10011413",
    farmer: "Ramesh Patel",
    village: "Kheda",
    district: "Anand",
    state: "Gujarat",
    crop: "Wheat (गेहूँ)",
    confidence: 94.2,
    moisture: 58.4,
    health: "Healthy",
    stage: "Flowering",
    waterNeed: 8,
    area: 2.4,
    lat: 22.556,
    lon: 72.951,
    temperature: 29.0,
    humidity: 62,
    rain: 0.0,
    lastPass: "Today, 08:30 AM",
    advisory: {
      level: "Low",
      en: "Soil moisture is good. Monitor field conditions before irrigating.",
      hi: "मिट्टी की नमी अच्छी है। सिंचाई करने से पहले खेत की स्थिति देखें।",
      actions: ["Routine Monitoring", "Check Soil Moisture in 3 Days"],
    },
    polygon: [
      [22.562, 72.945],
      [22.562, 72.957],
      [22.55, 72.957],
      [22.55, 72.945],
    ],
  },
  {
    id: "P0005",
    field_id: "10011414",
    farmer: "Suresh Kumar",
    village: "Navsari",
    district: "Surat",
    state: "Gujarat",
    crop: "Rice (धान)",
    confidence: 91.8,
    moisture: 42.1,
    health: "Stressed",
    stage: "Vegetative",
    waterNeed: 22,
    area: 1.8,
    lat: 21.17,
    lon: 72.83,
    temperature: 31.5,
    humidity: 70,
    rain: 0.0,
    lastPass: "Yesterday, 02:15 PM",
    advisory: {
      level: "Medium",
      en: "Moderate moisture. Irrigate field within 48 hours.",
      hi: "नमी का स्तर मध्यम है। 48 घंटों के भीतर सिंचाई करें।",
      actions: ["Irrigate 22mm", "Monitor Soil Moisture"],
    },
    polygon: [
      [21.176, 72.824],
      [21.176, 72.836],
      [21.164, 72.836],
      [21.164, 72.824],
    ],
  },
  {
    id: "P0010",
    field_id: "10011415",
    farmer: "Anita Sharma",
    village: "Bhiwani",
    district: "Hisar",
    state: "Haryana",
    crop: "Mustard (सरसों)",
    confidence: 96.0,
    moisture: 64.0,
    health: "Healthy",
    stage: "Maturation",
    waterNeed: 5,
    area: 3.1,
    lat: 28.79,
    lon: 76.13,
    temperature: 27.2,
    humidity: 55,
    rain: 0.0,
    lastPass: "Today, 06:00 AM",
    advisory: {
      level: "Low",
      en: "Optimal moisture and crop health.",
      hi: "नमी और फसल का स्वास्थ्य उत्तम है।",
      actions: ["Routine Inspection"],
    },
    polygon: [
      [28.796, 76.124],
      [28.796, 76.136],
      [28.784, 76.136],
      [28.784, 76.124],
    ],
  },
  {
    id: "P0014",
    field_id: "10011416",
    farmer: "Vikram Singh",
    village: "Ludhiana",
    district: "Ludhiana",
    state: "Punjab",
    crop: "Maize (मक्का)",
    confidence: 89.5,
    moisture: 72.0,
    health: "Healthy",
    stage: "Harvesting",
    waterNeed: 0,
    area: 4.0,
    lat: 30.9,
    lon: 75.85,
    temperature: 26.8,
    humidity: 60,
    rain: 5.2,
    lastPass: "Today, 11:45 AM",
    advisory: {
      level: "Low",
      en: "Rainfall detected. Delay irrigation.",
      hi: "बारिश हुई है। सिंचाई स्थगित करें।",
      actions: ["Postpone Irrigation"],
    },
    polygon: [
      [30.906, 75.844],
      [30.906, 75.856],
      [30.894, 75.856],
      [30.894, 75.844],
    ],
  },
];

export function getParcel(query) {
  if (!query) return PARCELS[0];
  const q = String(query).toLowerCase().trim();
  const match = PARCELS.find(
    (p) =>
      p.id.toLowerCase() === q ||
      p.field_id.toLowerCase() === q ||
      p.farmer.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q)
  );
  return match || PARCELS[0];
}

export const CROP_MIX = [
  { name: "Wheat (गेहूँ)", pct: 45, percentage: 45 },
  { name: "Rice (धान)", pct: 25, percentage: 25 },
  { name: "Mustard (सरसों)", pct: 15, percentage: 15 },
  { name: "Maize (मक्का)", pct: 15, percentage: 15 },
];

export const USERS = [
  { id: 1, name: "Ramesh Patel", role: "Farmer", location: "Gujarat", fields: 2, status: "Active" },
  { id: 2, name: "Dr. A. K. Verma", role: "Officer", location: "Anand District", fields: 120, status: "Active" },
  { id: 3, name: "Admin ISRO", role: "Admin", location: "SAC Ahmedabad", fields: "All", status: "Active" },
];

export const AI_MODELS = [
  { name: "PASTIS-R Crop Classifier", type: "Random Forest", accuracy: "94.2%", status: "Deployed" },
  { name: "SAR Soil Moisture Estimator", type: "NDVI + S1 Backscatter", accuracy: "88.6%", status: "Deployed" },
  { name: "KrishiNetra Voice Intent Router", type: "LLM Orchestrator", accuracy: "96.5%", status: "Deployed" },
];

export const SERVICES = [
  { name: "Open-Meteo Weather Stream", latency: "120ms", status: "Operational" },
  { name: "Sentinel-1 & 2 Ingestion", latency: "Pass Daily", status: "Operational" },
  { name: "Bhashini Speech Pipeline", latency: "350ms", status: "Operational" },
];

export const TREND = [
  { day: "Mon", moisture: 52, temp: 28 },
  { day: "Tue", moisture: 50, temp: 29 },
  { day: "Wed", moisture: 48, temp: 30 },
  { day: "Thu", moisture: 60, temp: 27 },
  { day: "Fri", moisture: 58, temp: 28 },
  { day: "Sat", moisture: 56, temp: 29 },
  { day: "Sun", moisture: 54, temp: 29 },
];

export const NOTIFICATIONS = [
  { id: 1, type: "irrigation", title: "Irrigation Reminder", body: "Field P0005 requires irrigation in 48 hours.", level: "warn", time: "10m ago" },
  { id: 2, type: "weather", title: "Rain Forecast", body: "Rain expected in Ludhiana region on Friday.", level: "info", time: "2h ago" },
];

export const REPORTS = [
  { id: "REP-101", parcel: "P0001", crop: "Wheat", type: "Monthly Health", date: "10 Aug 2026", status: "Ready" },
  { id: "REP-102", parcel: "P0005", crop: "Rice", type: "Moisture Summary", date: "01 Aug 2026", status: "Ready" },
];

export const DISTRICTS = [
  { name: "Anand", state: "Gujarat", totalFields: 140, avgMoisture: 58.4, status: "Normal" },
  { name: "Surat", state: "Gujarat", totalFields: 95, avgMoisture: 42.1, status: "Dry Alert" },
  { name: "Hisar", state: "Haryana", totalFields: 210, avgMoisture: 64.0, status: "Optimal" },
  { name: "Ludhiana", state: "Punjab", totalFields: 320, avgMoisture: 72.0, status: "Optimal" },
];
