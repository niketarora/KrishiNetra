import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { PARCELS, CROP_MIX } from "../data/mock";
import { Sprout } from "./icons";

// ---- Layer definitions ----
const LAYERS = [
  { key: "health", label: "Health" },
  { key: "moisture", label: "Moisture" },
  { key: "crop", label: "Crop" },
  { key: "irrigation", label: "Irrigation" },
  { key: "weather", label: "Weather" },
];

const PALETTE = ["#22c55e", "#1e63b3", "#f59e0b", "#0f3d27", "#7c3aed", "#dc2626", "#0891b2", "#65a30d", "#db2777", "#0d9488"];

// Stable crop -> color map.
const CROP_COLOR = {};
CROP_MIX.forEach((c, i) => {
  CROP_COLOR[c.name] = PALETTE[i % PALETTE.length];
});

function healthBucket(p) {
  if (p.health === "Healthy") return "#22c55e";
  return p.moisture < 35 ? "#ef4444" : "#f59e0b";
}

function weatherBucket(p) {
  const r = Math.floor(p.lat * 100) % 3;
  return r === 0 ? "#1e63b3" : r === 1 ? "#94a3b8" : "#f59e0b";
}

function colorFor(p, layer) {
  switch (layer) {
    case "health":
      return healthBucket(p);
    case "moisture":
      return p.moisture < 35 ? "#ef4444" : p.moisture < 55 ? "#f59e0b" : "#1e63b3";
    case "crop":
      return CROP_COLOR[p.crop] || "#22c55e";
    case "irrigation":
      return p.advisory.level === "High" ? "#ef4444" : p.advisory.level === "Medium" ? "#f59e0b" : "#22c55e";
    case "weather":
      return weatherBucket(p);
    default:
      return "#22c55e";
  }
}

function legendFor(layer) {
  switch (layer) {
    case "health":
      return {
        title: "Crop Health",
        items: [
          { c: "#22c55e", l: "Healthy" },
          { c: "#f59e0b", l: "Moderate stress" },
          { c: "#ef4444", l: "Severe stress" },
        ],
      };
    case "moisture":
      return {
        title: "Soil Moisture",
        items: [
          { c: "#ef4444", l: "Dry  ·  < 35%" },
          { c: "#f59e0b", l: "Moderate  ·  35–55%" },
          { c: "#1e63b3", l: "Wet  ·  > 55%" },
        ],
      };
    case "crop":
      return {
        title: "Crop Type",
        items: CROP_MIX.map((c) => ({ c: CROP_COLOR[c.name], l: `${c.name} (${c.value})` })),
      };
    case "irrigation":
      return {
        title: "Irrigation",
        items: [
          { c: "#ef4444", l: "Irrigate now" },
          { c: "#f59e0b", l: "Monitor" },
          { c: "#22c55e", l: "Sufficient" },
        ],
      };
    case "weather":
      return {
        title: "Weather",
        items: [
          { c: "#1e63b3", l: "Rain likely" },
          { c: "#94a3b8", l: "Cloudy" },
          { c: "#f59e0b", l: "Clear" },
        ],
      };
    default:
      return { title: "", items: [] };
  }
}

const BASES = {
  sat: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

export default function GisMap({ setView, onSearch }) {
  const [layer, setLayer] = useState("health");
  const [base, setBase] = useState("sat");

  const legend = legendFor(layer);
  const tile = BASES[base];

  const openParcel = (id) => {
    onSearch(id);
    setView("farmer");
  };

  return (
    <div className="relative" style={{ height: "calc(100vh - 68px)" }}>
      <MapContainer
        center={[22, 79]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer key={base} url={tile.url} attribution={tile.attribution} />
        {PARCELS.map((p) => (
          <CircleMarker
            key={p.id + layer}
            center={[p.lat, p.lon]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: colorFor(p, layer),
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-ink">{p.id} · {p.crop}</div>
                <div className="text-slate-500">{p.farmer}</div>
                <div className="text-slate-500">{p.district}, {p.state}</div>
                <div className="mt-1 text-xs">
                  Moisture: <b>{p.moisture}%</b> · {p.health}
                </div>
                <button
                  onClick={() => openParcel(p.id)}
                  className="mt-2 w-full bg-forest-800 hover:bg-forest-700 text-white rounded-md py-1.5 text-xs font-semibold"
                >
                  Open dashboard →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* ---- Layers panel (top-right) ---- */}
      <div className="absolute top-4 right-4 z-[1000] w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 text-slate-400">
          <Sprout width={16} height={16} />
          <span className="text-[11px] tracking-label uppercase font-semibold">Layers</span>
        </div>
        <div className="p-2 space-y-1">
          {LAYERS.map((l) => {
            const active = layer === l.key;
            return (
              <button
                key={l.key}
                onClick={() => setLayer(l.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-forest-800 text-white font-semibold" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-slate-300"}`} />
                {l.label}
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4 pt-2">
          <div className="text-[11px] tracking-label uppercase font-semibold text-slate-400 mb-2">Base</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBase("osm")}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                base === "osm" ? "bg-white border-forest-600 text-forest-700" : "border-slate-200 text-slate-500"
              }`}
            >
              🗺 OSM
            </button>
            <button
              onClick={() => setBase("sat")}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                base === "sat" ? "bg-charcoal text-white" : "border border-slate-200 text-slate-500"
              }`}
            >
              🛰 Sat
            </button>
          </div>
        </div>
      </div>

      {/* ---- Legend (bottom-left) ---- */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 px-5 py-4 max-w-xs">
        <div className="text-[11px] tracking-label uppercase font-semibold text-slate-400 mb-3">
          {legend.title}
        </div>
        <div className="space-y-2">
          {legend.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: it.c }} />
              {it.l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
