import React from "react";

function Leaf({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z" fill="currentColor" />
      <path d="M6 18C9.5 13 13 9.5 18 7" stroke="#0f3d27" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function LeafLoader({ label = "Loading…", overlay = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        {/* orbiting leaves */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "1.8s" }}>
          {[0, 120, 240].map((deg) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 text-forest-600"
              style={{ transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-24px)` }}
            >
              <Leaf />
            </span>
          ))}
        </div>
        {/* pulsing core */}
        <span
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-forest-500"
          style={{ animation: "leafPulse 1.2s ease-in-out infinite" }}
        />
      </div>
      <span className="text-sm text-slate-500 font-medium tracking-wide">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-[2000] grid place-items-center bg-slatebg/75 backdrop-blur-sm"
        style={{ animation: "fadeOverlay .2s ease" }}
      >
        {spinner}
      </div>
    );
  }
  return <div className="grid place-items-center py-24">{spinner}</div>;
}
