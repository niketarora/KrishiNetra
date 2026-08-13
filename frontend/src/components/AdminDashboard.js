import React, { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { USERS, AI_MODELS, SERVICES, TREND, CROP_MIX, STATS, NOTIFICATIONS } from "../data/mock";
import { Users, Cpu, Satellite, Server, Bell, Check } from "./icons";
import { Page, PageHeader, SubNav, Card, Badge, Stat } from "./ui";

const TABS = [
  { key: "system", label: "System", Icon: Server },
  { key: "users", label: "Users & Alerts", Icon: Users },
];

function SectionTitle({ children }) {
  return <h2 className="font-display font-bold text-xl text-ink mt-8 mb-4">{children}</h2>;
}

const PIE_COLORS = ["#1f7a4d", "#1e63b3", "#f59e0b", "#0f3d27", "#7c3aed", "#dc2626", "#0891b2", "#65a30d", "#db2777", "#0d9488"];

function Ring({ value, label }) {
  const r = 52, c = 2 * Math.PI * r, offset = c - (value / 100) * c;
  return (
    <div className="relative w-[140px] h-[140px]">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} stroke="#eef2f0" strokeWidth="12" fill="none" />
        <circle cx="70" cy="70" r={r} stroke="#1f7a4d" strokeWidth="12" fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-display font-extrabold text-2xl text-ink">{value}%</div><div className="text-[10px] tracking-label text-slate-400 uppercase">{label}</div></div>
      </div>
    </div>
  );
}

// ---------- Users ----------
function UsersTab() {
  const counts = USERS.reduce((m, u) => {
    m[u.role] = (m[u.role] || 0) + 1;
    return m;
  }, {});
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="Total Users" value={USERS.length} Icon={Users} />
        <Stat label="Farmers" value={counts.Farmer || 0} accent="text-forest-500" Icon={Users} />
        <Stat label="Officers" value={counts.Officer || 0} accent="text-ocean" Icon={Users} />
        <Stat label="Admins" value={counts.Admin || 0} accent="text-amber-400" Icon={Users} />
      </div>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-ink">User Management</h3>
          <button className="bg-forest-800 hover:bg-forest-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">+ Add User</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-label text-slate-400 uppercase border-b border-slate-100">
              <th className="px-6 py-3 font-semibold">ID</th><th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Role</th><th className="px-6 py-3 font-semibold">Region</th>
              <th className="px-6 py-3 font-semibold">Status</th><th className="px-6 py-3 font-semibold">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-6 py-3 font-mono text-slate-500">{u.id}</td>
                <td className="px-6 py-3 font-semibold text-ink">{u.name}</td>
                <td className="px-6 py-3"><Badge color={u.role === "Admin" ? "amber" : u.role === "Officer" ? "blue" : "green"}>{u.role}</Badge></td>
                <td className="px-6 py-3 text-slate-500">{u.region}</td>
                <td className="px-6 py-3"><Badge color={u.status === "Active" ? "green" : "slate"}>{u.status}</Badge></td>
                <td className="px-6 py-3 text-slate-400">{u.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ---------- AI Models ----------
function ModelsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="p-6 flex flex-col items-center justify-center">
        <h3 className="font-display font-bold text-lg text-ink mb-4 self-start">Primary Model</h3>
        <Ring value={STATS.modelAccuracy} label="Accuracy" />
        <p className="text-xs text-slate-400 mt-4 text-center">Crop Classifier · Random Forest · 19 classes</p>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {AI_MODELS.map((m) => (
          <Card key={m.name} className="p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 grid place-items-center shrink-0"><Cpu width={22} height={22} /></span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-ink">{m.name}</span>
                <span className="font-mono text-xs text-slate-400">{m.version}</span>
                <Badge color={m.status === "Production" ? "green" : "amber"}>{m.status}</Badge>
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{m.kind} · updated {m.updated}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-2xl text-ink">{m.accuracy}%</div>
              <div className="text-[10px] tracking-label text-slate-400 uppercase">Accuracy</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Satellite Data ----------
function SatelliteTab() {
  const sources = [
    { src: "Sentinel-2", desc: "Optical · 13 bands", status: "Online" },
    { src: "Sentinel-1A", desc: "SAR · Ascending", status: "Online" },
    { src: "Sentinel-1D", desc: "SAR · Descending", status: "Online" },
    { src: "Open-Meteo", desc: "Weather feed", status: "Online" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="Passes / Day" value={STATS.passesPerDay} sub="S1 + S2" Icon={Satellite} accent="text-ocean" />
        <Stat label="Fields Covered" value={STATS.parcels} sub={`${STATS.districts} districts`} Icon={Satellite} accent="text-forest-500" />
        <Stat label="Bands Ingested" value="13 + 2" sub="Optical + SAR" Icon={Satellite} accent="text-amber-400" />
        <Stat label="Last Sync" value="6/29" sub="2026" Icon={Check} accent="text-forest-500" />
      </div>
      <div className="bg-charcoal rounded-2xl p-6 text-white mb-6">
        <h3 className="font-display font-bold text-lg mb-5">Satellite Data Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sources.map((s) => (
            <div key={s.src} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{s.src}</span>
                <span className="flex items-center gap-1.5 text-xs text-forest-50"><span className="w-2 h-2 rounded-full bg-forest-500" /> {s.status}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">Crop Coverage</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={CROP_MIX} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
              {CROP_MIX.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}

// ---------- Notifications ----------
function NotificationsTab() {
  return (
    <div className="space-y-3 max-w-3xl">
      {NOTIFICATIONS.map((n) => (
        <Card key={n.id} className="p-4 flex items-start gap-4">
          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 grid place-items-center shrink-0"><Bell width={18} height={18} /></span>
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
      ))}
    </div>
  );
}

// ---------- System Health ----------
function HealthTab() {
  const online = SERVICES.filter((s) => s.status === "Online").length;
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="Services Online" value={`${online}/${SERVICES.length}`} accent="text-forest-500" Icon={Server} />
        <Stat label="Avg Uptime" value="99.1%" sub="30 days" accent="text-ocean" Icon={Check} />
        <Stat label="Model Accuracy" value={`${STATS.modelAccuracy}%`} Icon={Cpu} accent="text-amber-400" />
        <Stat label="Active Alerts" value="1" sub="Degraded service" accent="text-red-400" Icon={Bell} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-display font-bold text-lg text-ink">Services</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] tracking-label text-slate-400 uppercase border-b border-slate-100">
              <th className="px-6 py-3 font-semibold">Service</th><th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Uptime</th><th className="px-6 py-3 font-semibold">Latency</th>
            </tr></thead>
            <tbody>
              {SERVICES.map((s) => (
                <tr key={s.name} className="border-b border-slate-50">
                  <td className="px-6 py-3 font-semibold text-ink">{s.name}</td>
                  <td className="px-6 py-3"><Badge color={s.status === "Online" ? "green" : "amber"}><span className={`w-2 h-2 rounded-full ${s.status === "Online" ? "bg-forest-500" : "bg-amber-500"}`} />{s.status}</Badge></td>
                  <td className="px-6 py-3 text-slate-600">{s.uptime}</td>
                  <td className="px-6 py-3 text-slate-500">{s.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-lg text-ink mb-1">Regional Moisture</h3>
          <p className="text-xs text-slate-400 mb-4">System-wide · last 14 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={TREND}>
              <defs><linearGradient id="ah" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e63b3" stopOpacity={0.4} /><stop offset="100%" stopColor="#1e63b3" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} /><YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip /><Area type="monotone" dataKey="moisture" stroke="#1e63b3" strokeWidth={2} fill="url(#ah)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("system");
  return (
    <Page>
      <PageHeader
        eyebrow="Administrator · ISRO Operations"
        title="Admin Console"
        right={<span className="flex items-center gap-2 text-xs tracking-label text-slate-400 uppercase font-semibold"><Server width={15} height={15} /> Platform · nominal</span>}
      />
      <SubNav tabs={TABS} active={tab} onChange={setTab} />
      {tab === "system" && (
        <>
          <HealthTab />
          <SectionTitle>AI Models</SectionTitle>
          <ModelsTab />
          <SectionTitle>Satellite Data</SectionTitle>
          <SatelliteTab />
        </>
      )}
      {tab === "users" && (
        <>
          <UsersTab />
          <SectionTitle>Notifications</SectionTitle>
          <NotificationsTab />
        </>
      )}
    </Page>
  );
}
