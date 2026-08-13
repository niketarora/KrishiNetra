import React, { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart as ReBarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LTooltip } from "react-leaflet";
import { DISTRICTS, TREND, PARCELS, STATS, CROP_MIX } from "../data/mock";
import { Pin, Drop, Sprout, Activity, Water, BarChart } from "./icons";
import { Page, PageHeader, SubNav, Card, Badge, Stat } from "./ui";

const TABS = [
  { key: "monitoring", label: "District Monitoring", Icon: Pin },
  { key: "analytics", label: "Planning & Analytics", Icon: Activity },
];

function SectionTitle({ children }) {
  return <h2 className="font-display font-bold text-xl text-ink mt-8 mb-4">{children}</h2>;
}

const PIE_COLORS = ["#1f7a4d", "#1e63b3", "#f59e0b", "#0f3d27", "#7c3aed", "#dc2626", "#0891b2", "#65a30d", "#db2777", "#0d9488"];

// ---------- District Monitoring ----------
function Monitoring() {
  const stressed = PARCELS.filter((p) => p.health === "Stressed").length;
  const avg = Math.round((PARCELS.reduce((s, p) => s + p.moisture, 0) / PARCELS.length) * 10) / 10;
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="Avg Soil Moisture" value={`${avg}%`} sub="All fields" Icon={Drop} />
        <Stat label="Stressed Fields" value={stressed} sub="Need attention" Icon={Sprout} />
        <Stat label="Districts" value={STATS.districts} Icon={BarChart} />
        <Stat label="Fields" value={STATS.parcels} Icon={Activity} />
      </div>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-display font-bold text-lg text-ink">District Summary</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-label text-slate-400 uppercase border-b border-slate-100">
                <th className="px-6 py-3 font-semibold">District</th><th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">Fields</th><th className="px-6 py-3 font-semibold">Avg Moisture</th>
                <th className="px-6 py-3 font-semibold">Stressed</th><th className="px-6 py-3 font-semibold">Water Demand</th>
              </tr>
            </thead>
            <tbody>
              {DISTRICTS.map((d) => (
                <tr key={d.name} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-6 py-3 font-semibold text-ink">{d.name}</td>
                  <td className="px-6 py-3 text-slate-500">{d.state}</td>
                  <td className="px-6 py-3 text-slate-600">{d.parcels}</td>
                  <td className="px-6 py-3"><span className={d.avgMoisture < 45 ? "text-red-600 font-semibold" : "text-forest-700 font-semibold"}>{d.avgMoisture}%</span></td>
                  <td className="px-6 py-3">{d.stressed > 0 ? <span className="text-amber-600 font-semibold">{d.stressed}</span> : <span className="text-slate-400">0</span>}</td>
                  <td className="px-6 py-3 text-slate-600">{d.waterDemand} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ---------- Heatmaps ----------
function Heatmaps() {
  return (
    <Card className="p-2">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display font-bold text-lg text-ink">Soil Moisture Heatmap</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Dry</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /> Moderate</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500" /> Wet</span>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden h-[460px]">
        <MapContainer center={[23, 79]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {PARCELS.map((p) => {
            const c = p.moisture < 35 ? "#ef4444" : p.moisture < 55 ? "#f59e0b" : "#0ea5e9";
            return (
              <CircleMarker key={p.id} center={[p.lat, p.lon]} radius={6 + (100 - p.moisture) / 4}
                pathOptions={{ color: c, weight: 0, fillColor: c, fillOpacity: 0.45 }}>
                <LTooltip>{p.district} · {p.moisture}% moisture</LTooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}

// ---------- Water Planning ----------
function WaterPlanning() {
  const total = Math.round(DISTRICTS.reduce((s, d) => s + d.waterDemand, 0) * 10) / 10;
  const ranked = [...DISTRICTS].sort((a, b) => b.waterDemand - a.waterDemand);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <Stat label="Total Water Demand" value={`${total}`} sub="mm aggregate" Icon={Water} accent="text-ocean" />
        <Stat label="Priority Districts" value={ranked.filter((d) => d.avgMoisture < 45).length} sub="Below threshold" Icon={Drop} accent="text-red-400" />
        <Stat label="Districts Planned" value={DISTRICTS.length} Icon={BarChart} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Water Demand by District</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ReBarChart data={ranked} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={70} />
              <Tooltip />
              <Bar dataKey="waterDemand" radius={[0, 6, 6, 0]}>
                {ranked.map((d, i) => <Cell key={i} fill={d.avgMoisture < 45 ? "#ef4444" : "#1e63b3"} />)}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Allocation Recommendations</h3>
          <div className="space-y-3">
            {ranked.map((d) => {
              const urgent = d.avgMoisture < 45;
              return (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-semibold text-ink">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.state} · {d.parcels} fields</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-ink">{d.waterDemand} mm</div>
                    <Badge color={urgent ? "red" : "green"}>{urgent ? "Prioritise" : "Adequate"}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

// ---------- Analytics ----------
function Analytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-1">NDVI & Moisture Trend</h3>
        <p className="text-xs text-slate-400 mb-4">Last 14 days · regional average</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="moisture" stroke="#1e63b3" strokeWidth={2} dot={false} name="Moisture %" />
            <Line type="monotone" dataKey="ndvi" stroke="#1f7a4d" strokeWidth={2} dot={false} name="NDVI" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">Crop Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={CROP_MIX} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
              {CROP_MIX.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export default function OfficerDashboard() {
  const [tab, setTab] = useState("monitoring");
  return (
    <Page>
      <PageHeader
        eyebrow="Officer · Regional Analytics"
        title="Agriculture Officer"
        right={<span className="flex items-center gap-2 text-xs tracking-label text-slate-400 uppercase font-semibold"><Activity width={15} height={15} /> {STATS.districts} districts · {STATS.parcels} fields</span>}
      />
      <SubNav tabs={TABS} active={tab} onChange={setTab} />
      {tab === "monitoring" && (
        <>
          <Monitoring />
          <div className="mt-6"><Heatmaps /></div>
        </>
      )}
      {tab === "analytics" && (
        <>
          <WaterPlanning />
          <SectionTitle>Trends</SectionTitle>
          <Analytics />
        </>
      )}
    </Page>
  );
}
