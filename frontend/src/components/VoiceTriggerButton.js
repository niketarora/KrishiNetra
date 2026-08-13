import React from "react";

export default function VoiceTriggerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open Voice AI Assistant"
      title="Open KrishiNetra Voice AI Assistant"
      className="fixed bottom-6 right-6 z-[99999] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#047857] hover:bg-[#065f46] text-white shadow-[0_6px_24px_rgba(4,120,87,0.5)] border-2 border-emerald-400/40 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer group"
    >
      <svg className="w-7 h-7 text-white transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
      </svg>
    </button>
  );
}
