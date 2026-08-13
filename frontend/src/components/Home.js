import React, { useState } from "react";
import { Satellite, Search, Arrow, Sprout, BarChart, Shield, Activity } from "./icons";
import { STATS, LANGUAGES } from "../data/mock";

// Farmer ploughing photo at frontend/public/hero.jpeg
const HERO_IMG = process.env.PUBLIC_URL + "/hero.jpeg";

const QUICK = ["P0001", "P0005", "P0010", "P0014"];

const PERSONA_CARDS = [
  {
    key: "farmer",
    Icon: Sprout,
    color: "bg-forest-800",
    title: "For the Farmer",
    body: "Plain-language advice. When to irrigate, what your crop needs, in your language.",
    features: ["Farm Analysis", "Irrigation Advice", "Notifications", "Reports"],
  },
  {
    key: "officer",
    Icon: BarChart,
    color: "bg-charcoal",
    title: "For the Officer",
    body: "Field-level GIS layers, district summaries and weekly trend lines.",
    features: ["District Monitoring", "Heatmaps", "Water Planning", "Analytics"],
  },
  {
    key: "admin",
    Icon: Shield,
    color: "bg-ocean",
    title: "For ISRO & Admin",
    body: "Coverage, model accuracy, water demand and satellite cadence.",
    features: ["Users", "AI Models", "Satellite Data", "System Health"],
  },
];

function Stat({ value, label }) {
  return (
    <div className="px-6 py-5 border-r border-white/10 last:border-r-0">
      <div className="font-display font-bold text-3xl text-white">{value}</div>
      <div className="text-[11px] tracking-label text-slate-400 mt-1 uppercase">{label}</div>
    </div>
  );
}

export default function Home({ setView, onSearch }) {
  const [q, setQ] = useState("");

  const go = (val) => {
    if (val) onSearch(val);
    setView("farmer");
  };

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/30" />

        <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-0">
          <div className="max-w-2xl animate-fadeUp">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-forest-600/50 bg-forest-900/40 text-forest-50 text-[11px] tracking-label font-semibold uppercase">
              <Satellite width={14} height={14} /> Powered by ISRO Earth Observation
            </span>

            <h1 className="font-display font-extrabold text-white text-6xl leading-[1.02] mt-7">
              Decode every field. From orbit.
            </h1>

            <p className="text-slate-300 text-lg mt-6 max-w-xl leading-relaxed">
              Real-time crop health, soil moisture and irrigation advisory powered by
              satellite observation and ground-truth analytics.
            </p>

            {/* Search */}
            <div className="flex gap-3 mt-8 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-white rounded-xl px-4 py-3 shadow-lg">
                <Search width={18} height={18} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go(q)}
                  placeholder="Enter Field ID, district or farmer name"
                  className="flex-1 outline-none text-ink placeholder-slate-400 text-[15px]"
                />
              </div>
              <button
                onClick={() => go(q)}
                className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors"
              >
                Open Dashboard <Arrow width={18} height={18} />
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 mt-4">
              {QUICK.map((id) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="font-mono text-xs text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md px-3 py-1.5 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>

            {/* Languages */}
            <div className="flex items-center gap-2 mt-7 flex-wrap">
              <span className="text-[11px] tracking-label text-forest-50/70 uppercase font-semibold mr-1">
                Available for farmers ·
              </span>
              {LANGUAGES.map((l) => (
                <span
                  key={l.code}
                  className={`text-xs rounded-md px-2.5 py-1 border ${
                    l.ready
                      ? l.code === "en"
                        ? "bg-forest-600 text-white border-forest-600"
                        : "bg-forest-900/40 text-forest-50 border-forest-600/40"
                      : "text-slate-400 border-white/10"
                  }`}
                >
                  {l.label}
                  {!l.ready && <span className="ml-1 text-[9px] opacity-60">SOON</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 max-w-3xl bg-charcoal/90 backdrop-blur rounded-t-xl border border-white/10 border-b-0">
            <Stat value={STATS.parcels} label="Fields Monitored" />
            <Stat value={STATS.districts} label="Districts Covered" />
            <Stat value={STATS.passesPerDay} label="Satellite Passes / Day" />
            <Stat value={`${STATS.modelAccuracy}%`} label="Model Accuracy" />
          </div>
        </div>
      </section>

      {/* ===== Control room ===== */}
      <section className="bg-slatebg">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <h2 className="font-display font-extrabold text-4xl text-ink">
              A control room for every farm
            </h2>
            <span className="flex items-center gap-2 text-xs tracking-label text-slate-400 uppercase font-semibold">
              <Activity width={15} height={15} /> Three personas · One platform
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONA_CARDS.map((c) => (
              <button
                key={c.key}
                onClick={() => setView(c.key)}
                className="text-left bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span className={`w-12 h-12 rounded-xl ${c.color} text-white grid place-items-center`}>
                  <c.Icon width={22} height={22} />
                </span>
                <h3 className="font-display font-bold text-xl text-ink mt-5">{c.title}</h3>
                <p className="text-slate-500 mt-2 leading-relaxed">{c.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> {f}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-forest-700 font-semibold mt-5 text-sm">
                  Open Dashboard <Arrow width={16} height={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
