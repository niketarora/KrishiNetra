import React from "react";

export default function VoiceTriggerButton({ onClick, lang = "hi" }) {
  const isHi = lang === "hi";

  return (
    <button
      onClick={onClick}
      aria-label="Open KrishiNetra Voice AI Assistant"
      title={isHi ? "कृषिनेत्र आवाज़ सहायक खोलें" : "Open KrishiNetra Voice Assistant"}
      className="fixed bottom-6 right-6 z-[99999] group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] text-white shadow-[0_8px_30px_rgba(4,120,87,0.6)] border border-emerald-300/40 hover:border-emerald-300 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
    >
      {/* Outer Pulse Indicator */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
      </span>

      {/* Mic Icon */}
      <svg className="w-5 h-5 text-white transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
      </svg>

      {/* Button Text */}
      <span className="text-xs font-bold tracking-wide text-white drop-shadow-sm">
        {isHi ? "आवाज़ सहायक" : "Voice AI"}
      </span>
    </button>
  );
}
