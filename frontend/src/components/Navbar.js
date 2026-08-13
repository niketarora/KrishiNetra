import React from "react";
import { Satellite, BarChart, Shield, Sprout, Translate } from "./icons";

const NAV = [
  { key: "home", label: "Home" },
  { key: "gis", label: "GIS Map" },
];

const PERSONAS = [
  { key: "farmer", label: "FARMER", Icon: Sprout },
  { key: "officer", label: "OFFICER", Icon: BarChart },
  { key: "admin", label: "ADMINISTRATOR", Icon: Shield },
];

export default function Navbar({ view, setView, lang, setLang, onOpenVoice }) {
  const activePersona = ["farmer", "officer", "admin"].includes(view) ? view : null;

  return (
    <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 h-[68px] flex items-center gap-6">
        {/* Brand */}
        <button onClick={() => setView("home")} className="flex items-center gap-3 group">
          <span className="w-9 h-9 rounded-lg bg-forest-800 text-white grid place-items-center group-hover:bg-forest-700 transition-colors">
            <Satellite width={18} height={18} />
          </span>
          <span className="text-left leading-tight">
            <span className="block font-display font-bold text-[17px] text-ink">KrishiNetra</span>
            <span className="block text-[10px] tracking-label text-slate-400 font-mono">ISRO · GIS</span>
          </span>
        </button>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === n.key
                  ? "bg-forest-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Persona toggle */}
        <div className="hidden lg:flex items-center rounded-lg border border-slate-200 overflow-hidden">
          {PERSONAS.map((p) => {
            const active = activePersona === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setView(p.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                  active
                    ? "bg-forest-800 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <p.Icon width={14} height={14} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Language & Voice AI */}
        <div className="flex items-center gap-2">
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
              <span>{lang === "hi" ? "वॉइस AI" : "Voice AI"}</span>
            </button>
          )}

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
            <Translate width={15} height={15} className="text-slate-400" />
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 rounded ${lang === "en" ? "text-forest-700 font-bold" : "text-slate-400"}`}
            >
              EN
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setLang("hi")}
              className={`px-1.5 rounded ${lang === "hi" ? "text-forest-700 font-bold" : "text-slate-400"}`}
            >
              हि
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

