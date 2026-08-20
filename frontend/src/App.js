import React, { useState } from "react";
import Navbar from "./components/layout/Navbar";
import LeafLoader from "./components/layout/LeafLoader";
import Home from "./components/Home";
import GisMap from "./components/gis/GisMap";
import FarmerDashboard from "./components/dashboards/FarmerDashboard";
import OfficerDashboard from "./components/dashboards/OfficerDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import VoiceAssistantModal from "./components/voice/VoiceAssistantModal";
import VoiceTriggerButton from "./components/voice/VoiceTriggerButton";
import Marketplace from "./components/marketplace/Marketplace";

const LOADER_LABELS = {
  home: "Loading…",
  gis: "Loading map…",
  farmer: "Loading farm…",
  officer: "Loading analytics…",
  admin: "Loading console…",
  marketplace: "Loading marketplace…",
};

export default function App() {
  const [view, setView] = useState("home");
  const [lang, setLang] = useState("hi");
  const [query, setQuery] = useState("P0001");
  const [transition, setTransition] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Animated view change with a brief leaf loader.
  const go = (next) => {
    if (next === view) return;
    setTransition(true);
    setView(next);
    window.setTimeout(() => setTransition(false), 650);
  };

  const onSearch = (q) => setQuery(q);

  return (
    <div className="min-h-screen bg-slatebg">
      {transition && <LeafLoader overlay label={LOADER_LABELS[view] || "Loading…"} />}

      <Navbar
        view={view}
        setView={go}
        lang={lang}
        setLang={setLang}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {view === "home" && <Home setView={go} onSearch={onSearch} />}
      {view === "gis" && <GisMap setView={go} onSearch={onSearch} />}
      {view === "farmer" && <FarmerDashboard lang={lang} query={query} />}
      {view === "officer" && <OfficerDashboard />}
      {view === "admin" && <AdminDashboard />}
      {view === "marketplace" && (
        <Marketplace setView={go} query={query} setQuery={setQuery} lang={lang} />
      )}

      {/* Floating Voice AI Launcher Button */}
      <VoiceTriggerButton onClick={() => setIsVoiceOpen(true)} lang={lang} />

      {/* KrishiNetra Voice Assistant Overlay Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        fieldId={query}
        lang={lang}
      />

      {view !== "gis" && (
        <footer className="bg-charcoal text-center py-6 text-slate-500 text-xs">
          KrishiNetra · Powered by Sentinel-2 &amp; Sentinel-1 satellite imagery · ISRO Smart Farming
        </footer>
      )}
    </div>
  );
}
