import React, { useState, useEffect, useRef } from "react";
import { sendVoiceTextQuery, sendVoiceAudioQuery } from "../lib/api";

const AVATAR_IMG = process.env.PUBLIC_URL + "/farmer_avatar_clean.png";

export default function VoiceAssistantModal({ isOpen, onClose, fieldId = "P0001", lang = "hi" }) {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [toolUsed, setToolUsed] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [activeLang, setActiveLang] = useState(lang);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  useEffect(() => {
    if (!isOpen) {
      stopAudioPlayback();
      setStatus("idle");
    }
  }, [isOpen]);

  const speakResponse = (text, language, audioBase64) => {
    stopAudioPlayback();

    // If Bhashini TTS returned audio content, play it back directly
    if (audioBase64) {
      try {
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;
        const player = new Audio(audioUrl);
        audioPlayerRef.current = player;
        
        player.onplay = () => setStatus("speaking");
        player.onended = () => setStatus("idle");
        player.onerror = () => {
          loggerFallbackSpeech(text, language);
        };
        player.play();
        return;
      } catch (err) {
        loggerFallbackSpeech(text, language);
        return;
      }
    }

    loggerFallbackSpeech(text, language);
  };

  const loggerFallbackSpeech = (text, language) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  };

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleQuery = async (queryText) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setStatus("thinking");
    setResponse("");

    const result = await sendVoiceTextQuery({
      text: queryText,
      fieldId: fieldId,
      language: activeLang,
    });

    if (result && result.response) {
      setResponse(result.response);
      setToolUsed(result.tool_used);
      setStatus("speaking");
      speakResponse(result.response, activeLang, result.audio_base64);
    } else {
      setStatus("idle");
    }
  };

  const startListening = async () => {
    stopAudioPlayback();
    setTranscript("");
    setResponse("");
    audioChunksRef.current = [];

    // Capture microphone input using MediaRecorder API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStatus("listening");

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          
          // Stop all audio stream tracks
          stream.getTracks().forEach((track) => track.stop());

          setStatus("thinking");

          // Upload audio to Bhashini pipeline
          const formData = new FormData();
          formData.append("audio", audioBlob, "query.wav");
          formData.append("field_id", fieldId);
          formData.append("language", activeLang);

          try {
            const result = await sendVoiceAudioQuery(formData);
            if (result && result.success) {
              setTranscript(result.transcript);
              setResponse(result.response);
              setToolUsed(result.tool_used);
              setStatus("speaking");
              speakResponse(result.response, activeLang, result.audio_base64);
            } else {
              setStatus("idle");
            }
          } catch (err) {
            setStatus("idle");
          }
        };

        mediaRecorder.start();
      } catch (err) {
        // Fallback to local SpeechRecognition if mic capture failed
        triggerWebSpeechFallback();
      }
    } else {
      triggerWebSpeechFallback();
    }
  };

  const triggerWebSpeechFallback = () => {
    setStatus("listening");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = activeLang === "hi" ? "hi-IN" : "en-US";
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setTranscript(text);
      };

      recognition.onend = () => {
        if (transcript) {
          handleQuery(transcript);
        } else {
          const defaultQuery = activeLang === "hi" ? "Mere khet mein paani kab dena hai?" : "When should I irrigate my field?";
          handleQuery(defaultQuery);
        }
      };

      recognition.onerror = () => {
        const defaultQuery = activeLang === "hi" ? "Mitti mein nami kaisi hai?" : "What is the soil moisture?";
        handleQuery(defaultQuery);
      };

      recognition.start();
    } else {
      // Offline/Device Simulation
      window.setTimeout(() => {
        const defaultQuery = activeLang === "hi" ? "Mere khet mein paani kab dena hai?" : "When should I irrigate my field?";
        handleQuery(defaultQuery);
      }, 2500);
    }
  };

  const toggleMic = () => {
    if (status === "listening") {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else {
        setStatus("idle");
      }
    } else if (status === "speaking") {
      stopAudioPlayback();
      setStatus("idle");
    } else {
      startListening();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleQuery(textInput);
      setTextInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeOverlay">
      <div
        className="w-[92vw] max-w-[480px] sm:max-w-[520px] max-h-[90vh] overflow-y-auto bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center p-4 sm:p-6 md:p-7 relative scrollbar-none"
        style={{ backgroundColor: "rgb(12, 19, 36)", borderColor: "rgba(52, 211, 153, 0.35)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Assistant"
          className="absolute top-3.5 right-3.5 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 text-gray-300 z-20"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Field & Language Bar */}
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full text-[11px] sm:text-xs font-bold tracking-wider">
            FIELD: {fieldId}
          </span>
          <div className="flex items-center bg-slate-800/80 rounded-full p-0.5 border border-white/10">
            <button
              onClick={() => setActiveLang("hi")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${
                activeLang === "hi" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setActiveLang("en")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${
                activeLang === "en" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Avatar Container with Highlighting Radial Backdrop */}
        <div className="relative mb-4 sm:mb-5">
          {/* Radial Spotlight Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-52 sm:h-52 bg-gradient-to-tr from-emerald-400/25 via-teal-300/20 to-emerald-500/30 rounded-full blur-2xl pointer-events-none"></div>

          {/* Golden/Emerald Dual Border Frame */}
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden relative z-10 p-1 bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-700 shadow-[0_0_35px_rgba(52,211,153,0.35)] flex items-center justify-center transition-transform ${
              status === "speaking" ? "avatar-active scale-105" : ""
            }`}
          >
            {/* Inner Farmer Image Circle Frame with #B09D7F Background */}
            <div
              className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative border border-emerald-400/40 shadow-inner"
              style={{ backgroundColor: "#B09D7F" }}
            >
              <img
                alt="KrishiNetra Voice Assistant Avatar"
                className="w-full h-full object-cover relative z-10"
                src={AVATAR_IMG}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Titles */}
        <div className="text-center mb-4 sm:mb-5 max-w-sm">
          <h2 className="font-bold mb-1 text-xl sm:text-2xl text-white">
            {activeLang === "hi" ? "नमस्ते! मैं कृषिनेत्र हूँ।" : "Namaste! I am KrishiNetra."}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {status === "idle" && (activeLang === "hi" ? "आज मैं आपके खेत की क्या मदद कर सकता हूँ?" : "How can I assist you with your field today?")}
            {status === "listening" && (activeLang === "hi" ? "कृपया अपना सवाल पूछें..." : "Please speak your query...")}
            {status === "thinking" && (activeLang === "hi" ? "उपग्रह डेटा विश्लेषण हो रहा है..." : "Analyzing satellite data...")}
            {status === "speaking" && (activeLang === "hi" ? "कृषिनेत्र सलाह:" : "KrishiNetra Advisory:")}
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2.5 bg-slate-800/80 px-4 py-1.5 rounded-full border border-emerald-500/30 mb-4 sm:mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
            {status === "idle" && "READY"}
            {status === "listening" && (activeLang === "hi" ? "सुन रहा हूँ..." : "LISTENING...")}
            {status === "thinking" && (activeLang === "hi" ? "सोच रहा हूँ..." : "THINKING...")}
            {status === "speaking" && (activeLang === "hi" ? "बोल रहा हूँ..." : "SPEAKING...")}
          </span>
        </div>

        {/* Transcript / Response Display */}
        {(transcript || response) && (
          <div className="w-full bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-5 border border-white/10 text-left">
            {transcript && (
              <div className="mb-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Farmer Question:</span>
                <p className="text-xs sm:text-sm text-emerald-300 italic">"{transcript}"</p>
              </div>
            )}
            {response && (
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center justify-between">
                  <span>KrishiNetra Response:</span>
                  {toolUsed && <span className="text-[9px] text-gray-400 font-mono">Tool: {toolUsed}</span>}
                </span>
                <p className="text-xs sm:text-sm font-medium text-white leading-relaxed mt-1">{response}</p>
              </div>
            )}
          </div>
        )}

        {/* Pulsating Microphone Button */}
        <button
          onClick={toggleMic}
          className={`rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 focus:outline-none ${
            status === "listening"
              ? "pulse-ring bg-emerald-500 text-white shadow-[0_0_35px_rgba(52,211,153,0.6)]"
              : status === "speaking"
              ? "bg-amber-600 text-white shadow-[0_0_25px_rgba(217,119,6,0.5)]"
              : "bg-emerald-700 hover:bg-emerald-600 text-white shadow-[0_0_30px_rgba(5,150,105,0.4)]"
          }`}
          style={{ width: "72px", height: "72px" }}
        >
          <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </button>

        <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">
          {status === "listening"
            ? "Tap mic to finish"
            : status === "speaking"
            ? "Tap mic to stop speaking"
            : "Tap mic to speak"}
        </p>

        {/* Text Input Fallback */}
        <form onSubmit={handleFormSubmit} className="w-full mt-4 sm:mt-5 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={activeLang === "hi" ? "या सवाल टाइप करें (जैसे: पाणी कब देना है?)" : "Or type query (e.g. When to irrigate?)"}
            className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
