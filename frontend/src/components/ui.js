import React from "react";

export function PageHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        {eyebrow && (
          <div className="font-mono text-xs tracking-label text-slate-400 uppercase">{eyebrow}</div>
        )}
        <h1 className="font-display font-extrabold text-3xl text-ink mt-1">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function SubNav({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 overflow-x-auto">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              on ? "bg-forest-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t.Icon && <t.Icon width={16} height={16} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
  );
}

const BADGE = {
  green: "bg-forest-50 text-forest-700 border-forest-100",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  slate: "bg-slate-100 text-slate-500 border-slate-200",
};

export function Badge({ color = "slate", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${BADGE[color]}`}>
      {children}
    </span>
  );
}

export function Dot({ color = "#22c55e" }) {
  return <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />;
}

export function Stat({ label, value, sub, Icon, accent = "text-slate-300" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] tracking-label text-slate-400 uppercase font-semibold">{label}</span>
        {Icon && <Icon width={18} height={18} className={accent} />}
      </div>
      <div className="font-display font-extrabold text-3xl text-ink">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </Card>
  );
}

export function Page({ children }) {
  return (
    <div className="bg-slatebg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8 animate-fadeUp">{children}</div>
    </div>
  );
}
