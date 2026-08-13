import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import { PARCELS, NOTIFICATIONS, REPORTS } from "../data/mock";
import { fetchParcel } from "../lib/api";
import {
  Search, Pin, Calendar, Sprout, Drop, Sun, Check,
  Activity, Bell, FileText, Download, Water,
} from "./icons";
import { SubNav, Card, Badge } from "./ui";
import LeafLoader from "./LeafLoader";

// Auto-zoom the map to frame the parcel's field based on its lat/lon.
function FitToField({ polygon }) {
  const map = useMap();
  useEffect(() => {
    if (polygon && polygon.length) {
      map.fitBounds(polygon, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, polygon]);
  return null;
}

const CHIP_PARCELS = PARCELS.slice(0, 6);

const TABS = [
  { key: "analysis", label: "Farm Analysis", Icon: Activity },
  { key: "alerts", label: "Alerts & Reports", Icon: Bell },
];

function SectionTitle({ children }) {
  return <h2 className="font-display font-bold text-xl text-ink mt-8 mb-4">{children}</h2>;
}

function MoistureTag({ moisture }) {
  if (moisture < 35) return <Badge color="red">CRITICAL</Badge>;
  if (moisture < 55) return <Badge color="amber">WATCH</Badge>;
  return <Badge color="green">GOOD</Badge>;
}

function MetricCard({ Icon, label, value, unit, sub, accent }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-label text-slate-400 uppercase font-semibold">{label}</span>
        <Icon width={18} height={18} className={accent || "text-slate-300"} />
      </div>
      <div className="font-display font-extrabold text-3xl text-ink">
        {value}
        {unit && <span className="text-lg font-bold text-slate-400 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1.5">{sub}</div>}
    </Card>
  );
}

// ---------- Tab: Farm Analysis ----------
function FarmAnalysis({ parcel, lang }) {
  const adv = parcel.advisory;
  const advColor =
    adv.level === "High" ? "border-red-200 bg-red-50" : adv.level === "Medium" ? "border-amber-200 bg-amber-50" : "border-forest-100 bg-forest-50";
  const advText = adv.level === "High" ? "text-red-600" : adv.level === "Medium" ? "text-amber-600" : "text-forest-700";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 h-[460px]">
          <MapContainer key={parcel.id} center={[parcel.lat, parcel.lon]} zoom={14} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <FitToField polygon={parcel.polygon} />
            <Polygon positions={parcel.polygon} pathOptions={{ color: "#4ade80", weight: 2, fillColor: "#4ade80", fillOpacity: 0.45 }}>
              <Tooltip sticky>{parcel.id} · {parcel.crop} · {parcel.area} ha</Tooltip>
            </Polygon>
          </MapContainer>
        </div>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-label text-slate-400 uppercase font-semibold">Health</span>
            <Badge color={parcel.health === "Healthy" ? "green" : "amber"}>
              <span className={`w-2 h-2 rounded-full ${parcel.health === "Healthy" ? "bg-forest-500" : "bg-amber-500"}`} />
              {parcel.health.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Sprout width={26} height={26} className="text-forest-600" />
            <span className="font-display font-extrabold text-3xl text-ink">{parcel.crop}</span>
          </div>
          <div className="text-slate-500 mt-1">{parcel.stage} · {parcel.area} ha</div>

          <div className={`mt-5 rounded-xl border p-4 ${advColor}`}>
            <div className={`flex items-center gap-2 text-[11px] font-bold tracking-label uppercase ${advText}`}>
              ⚠ Advisory · {adv.level}
            </div>
            <p className={`font-semibold mt-2 leading-snug ${advText}`}>{lang === "hi" ? adv.hi : adv.en}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        <MetricCard Icon={Drop} label="Water Need" value={parcel.waterNeed} unit="mm" sub={parcel.waterNeed > 15 ? "Moderate demand" : "Low demand"} accent="text-ocean" />
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-label text-slate-400 uppercase font-semibold">Soil Moisture</span>
            <Drop width={18} height={18} className="text-ocean" />
          </div>
          <div className="font-display font-extrabold text-3xl text-ink">{parcel.moisture}%</div>
          <div className="mt-2"><MoistureTag moisture={parcel.moisture} /></div>
        </Card>
        <MetricCard Icon={Sun} label="Growth Stage" value={parcel.stage} accent="text-amber-400" />
        <MetricCard Icon={Check} label="Confidence" value={`${parcel.confidence}%`} sub="Model classification" accent="text-forest-500" />
      </div>
    </>
  );
}

// ---------- Tab: Irrigation Advice ----------
function IrrigationAdvice({ parcel, lang }) {
  const adv = parcel.advisory;
  const tone = adv.level === "High" ? "red" : adv.level === "Medium" ? "amber" : "green";
  const toneBg = adv.level === "High" ? "bg-red-50 border-red-200" : adv.level === "Medium" ? "bg-amber-50 border-amber-200" : "bg-forest-50 border-forest-100";

  const schedule = [
    { day: "Today", action: adv.level === "High" ? "Irrigate — 25 mm" : "Monitor", on: adv.level === "High" },
    { day: "Day +2", action: "Re-check soil moisture", on: false },
    { day: "Day +4", action: adv.level === "Low" ? "No action" : "Irrigate if dry", on: false },
    { day: "Day +7", action: "Next satellite pass", on: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className={`lg:col-span-2 p-6 border ${toneBg}`}>
        <div className="flex items-center gap-2"><Water width={20} height={20} className="text-ocean" />
          <span className="text-[11px] tracking-label uppercase font-semibold text-slate-500">Recommendation · {adv.level} priority</span>
        </div>
        <p className="font-display font-bold text-2xl text-ink mt-3 leading-snug">{lang === "hi" ? adv.hi : adv.en}</p>
        <p className="text-slate-500 mt-2">{lang === "hi" ? adv.en : adv.hi}</p>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-400 uppercase tracking-label">Moisture</div><div className="font-display font-bold text-2xl text-ink mt-1">{parcel.moisture}%</div></div>
          <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-400 uppercase tracking-label">Water Need</div><div className="font-display font-bold text-2xl text-ink mt-1">{parcel.waterNeed} mm</div></div>
          <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-400 uppercase tracking-label">Stage</div><div className="font-display font-bold text-lg text-ink mt-1">{parcel.stage}</div></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">7-Day Plan</h3>
        <div className="space-y-3">
          {schedule.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${s.on ? "bg-red-500" : "bg-slate-300"}`} />
              <span className="text-sm font-semibold text-ink w-16">{s.day}</span>
              <span className="text-sm text-slate-500">{s.action}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100">
          <Badge color={tone}>Action: {adv?.actions?.[0] || "Routine Monitoring"}</Badge>
        </div>
      </Card>
    </div>
  );
}


// ---------- Tab: Notifications ----------
const NOTE_STYLE = {
  irrigation: { color: "red", Icon: Drop },
  weather: { color: "blue", Icon: Sun },
  satellite: { color: "slate", Icon: Activity },
  pest: { color: "amber", Icon: Sprout },
  system: { color: "green", Icon: Bell },
};

function Notifications() {
  return (
    <div className="space-y-3 max-w-3xl">
      {NOTIFICATIONS.map((n) => {
        const s = NOTE_STYLE[n.type] || NOTE_STYLE.system;
        return (
          <Card key={n.id} className="p-4 flex items-start gap-4">
            <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
              s.color === "red" ? "bg-red-50 text-red-500" : s.color === "amber" ? "bg-amber-50 text-amber-500" :
              s.color === "blue" ? "bg-sky-50 text-sky-500" : s.color === "green" ? "bg-forest-50 text-forest-600" : "bg-slate-100 text-slate-400"}`}>
              <s.Icon width={18} height={18} />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-ink">{n.title}</span>
                {n.level === "high" && <Badge color="red">HIGH</Badge>}
                {n.level === "warn" && <Badge color="amber">ALERT</Badge>}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{n.time}</span>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Tab: Reports ----------
function Reports({ parcel }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-ink">Reports</h3>
        <button className="flex items-center gap-2 bg-forest-800 hover:bg-forest-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <FileText width={15} height={15} /> Generate for {parcel.id}
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] tracking-label text-slate-400 uppercase border-b border-slate-100">
            <th className="px-6 py-3 font-semibold">Report</th>
            <th className="px-6 py-3 font-semibold">Field</th>
            <th className="px-6 py-3 font-semibold">Type</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {REPORTS.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
              <td className="px-6 py-3 font-mono text-slate-600">{r.id}</td>
              <td className="px-6 py-3 font-semibold text-ink">{r.parcel} · {r.crop}</td>
              <td className="px-6 py-3 text-slate-500">{r.type}</td>
              <td className="px-6 py-3 text-slate-500">{r.date}</td>
              <td className="px-6 py-3"><Badge color={r.status === "Ready" ? "green" : "slate"}>{r.status}</Badge></td>
              <td className="px-6 py-3 text-right">
                <button className="inline-flex items-center gap-1.5 text-forest-700 hover:text-forest-800 text-sm font-semibold">
                  <Download width={15} height={15} /> PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ================= Main =================
export default function FarmerDashboard({ lang, query }) {
  const [input, setInput] = useState(query || "P0001");
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("analysis");

  const load = async (q) => {
    setLoading(true);
    const p = await fetchParcel(q);
    if (p) setParcel(p);
    setLoading(false);
  };

  useEffect(() => {
    load(query || "P0001");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!parcel) {
    return loading ? (
      <LeafLoader label="Loading farm…" />
    ) : (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-slate-400">No field found.</div>
    );
  }

  return (
    <div className="bg-slatebg min-h-screen">
      {loading && <LeafLoader overlay label="Analysing field…" />}
      <div className="max-w-[1400px] mx-auto px-6 py-7 animate-fadeUp">
        {/* Search row */}
        <div className="flex gap-3 flex-wrap items-center mb-5">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200 min-w-[280px]">
            <Search width={17} height={17} className="text-slate-400" />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(input)} placeholder="Field ID, district or farmer" className="outline-none text-ink placeholder-slate-400 flex-1" />
          </div>
          <button onClick={() => load(input)} className="bg-forest-800 hover:bg-forest-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">Search</button>
          <div className="flex gap-2 ml-auto overflow-x-auto">
            {CHIP_PARCELS.map((p) => (
              <button key={p.id} onClick={() => { setInput(p.id); load(p.id); }}
                className={`whitespace-nowrap font-mono text-xs px-3 py-2 rounded-lg border transition-colors ${p.id === parcel.id ? "border-forest-600 text-forest-700 bg-forest-50" : "border-slate-200 text-slate-500 hover:bg-white"}`}>
                {p.id} · {p.crop}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <div className="font-mono text-xs tracking-label text-slate-400 uppercase">{parcel.id} · {parcel.district}, {parcel.state}</div>
            <h1 className="font-display font-extrabold text-3xl text-ink mt-1">{parcel.farmer}</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Pin width={15} height={15} className="text-forest-600" />{parcel.lat.toFixed(4)}°N · {parcel.lon.toFixed(4)}°E</span>
            <span className="flex items-center gap-1.5"><Calendar width={15} height={15} className="text-slate-400" />LAST PASS: {parcel.lastPass}</span>
          </div>
        </div>

        <SubNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === "analysis" && (
          <>
            <FarmAnalysis parcel={parcel} lang={lang} />
            <SectionTitle>Irrigation Advice</SectionTitle>
            <IrrigationAdvice parcel={parcel} lang={lang} />
          </>
        )}
        {tab === "alerts" && (
          <>
            <Notifications />
            <SectionTitle>Reports</SectionTitle>
            <Reports parcel={parcel} />
          </>
        )}
      </div>
    </div>
  );
}
