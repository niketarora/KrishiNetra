import React, { useState, useEffect, useRef } from "react";
import { sendVoiceTextQuery, sendVoiceAudioQuery } from "../../lib/voiceApi";
import LiveAvatar from "./LiveAvatar/LiveAvatar";

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function VoiceAssistantModal({ isOpen, onClose, fieldId = "P0001", lang = "hi" }) {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [activeLang, setActiveLang] = useState(lang || "hi");
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Initialize with conversation state matching docs/Voice Assistance UI.png
  useEffect(() => {
    setActiveLang(lang || "hi");
    if (messages.length === 0) {
      const isHi = (lang || "hi") === "hi";
      setMessages([
        {
          id: 1,
          type: "user",
          text: isHi ? "आज का मौसम कैसा है?" : "How is the weather today?",
          time: "11:42 AM",
        },
        {
          id: 2,
          type: "assistant",
          text: isHi
            ? `फील्ड ${fieldId} का तापमान 29.7°C और आर्द्रता 36% है। फिलहाल बारिश की संभावना नहीं है।`
            : `Field ${fieldId} temperature is 29.7°C with 36% humidity. No immediate rain expected.`,
          tool: "GET_CURRENT_WEATHER",
          time: "11:42 AM",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, fieldId]);

  useEffect(() => {
    if (!isOpen) {
      stopAudioPlayback();
      setStatus("idle");
    }
  }, [isOpen]);

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playAudio = (audioBase64, fallbackText, language) => {
    stopAudioPlayback();

    if (audioBase64) {
      try {
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;
        const player = new Audio(audioUrl);
        audioPlayerRef.current = player;

        player.onplay = () => setStatus("speaking");
        player.onended = () => setStatus("idle");
        player.onerror = () => {
          triggerBrowserTTS(fallbackText, language);
        };
        player.play().catch(() => {
          triggerBrowserTTS(fallbackText, language);
        });
        return;
      } catch (err) {
        triggerBrowserTTS(fallbackText, language);
        return;
      }
    }

    triggerBrowserTTS(fallbackText, language);
  };

  const triggerBrowserTTS = (text, language) => {
    if (!("speechSynthesis" in window) || !text) {
      setStatus("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 0.82; // Deep, heavy masculine pitch

    // Select natural male voice if available in client's speech synthesis engine
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetLang = language === "hi" ? "hi" : "en";
      const maleVoice =
        voices.find(
          (v) =>
            v.lang.startsWith(targetLang) &&
            (v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("david") ||
              v.name.toLowerCase().includes("hemant") ||
              v.name.toLowerCase().includes("mohan") ||
              v.name.toLowerCase().includes("ravi") ||
              v.name.toLowerCase().includes("george"))
        ) || voices.find((v) => v.lang.startsWith(targetLang));
      if (maleVoice) utterance.voice = maleVoice;
    }

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  };

  const handleQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const cleanQuery = queryText.trim();

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      type: "user",
      text: cleanQuery,
      time: formatTime(),
    };
    setMessages((prev) => [...prev.slice(-1), userMsg]);
    setStatus("thinking");

    try {
      const result = await sendVoiceTextQuery({
        text: cleanQuery,
        fieldId: fieldId,
        language: activeLang,
      });

      if (result && result.response) {
        const assistantMsg = {
          id: userMsgId + 1,
          type: "assistant",
          text: result.response,
          tool: (result.tool_used || "GET_FIELD_REPORT").toUpperCase(),
          time: formatTime(),
          audio_base64: result.audio_base64,
        };
        setMessages([userMsg, assistantMsg]);
        setStatus("speaking");
        playAudio(result.audio_base64, result.response, activeLang);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      const isHi = activeLang === "hi";
      const fallbackMsg = {
        id: userMsgId + 1,
        type: "assistant",
        text: isHi
          ? "माफ़ कीजिए, सर्वर से संपर्क नहीं हो सका। कृपया अपना नेटवर्क कनेक्शन जांचें और पुनः प्रयास करें।"
          : "Sorry, unable to connect to the assistant server. Please check your network and try again.",
        tool: "SYSTEM_NOTIFICATION",
        time: formatTime(),
      };
      setMessages([userMsg, fallbackMsg]);
      setStatus("idle");
    }
  };

  const startListening = async () => {
    stopAudioPlayback();
    audioChunksRef.current = [];

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStatus("listening");

        let mimeType = "audio/webm";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/wav")) {
          mimeType = "audio/wav";
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("wav") ? "wav" : "webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          stream.getTracks().forEach((track) => track.stop());
          setStatus("thinking");

          const formData = new FormData();
          formData.append("audio", audioBlob, `recording.${ext}`);
          formData.append("field_id", fieldId);
          formData.append("language", activeLang);

          try {
            const result = await sendVoiceAudioQuery(formData);
            if (result && result.success) {
              const userText = result.transcript || (activeLang === "hi" ? "मेरी फ़सल की स्थिति बताएं" : "Check my field status");
              const now = formatTime();

              const userMsg = {
                id: Date.now(),
                type: "user",
                text: userText,
                time: now,
              };
              const assistantMsg = {
                id: Date.now() + 1,
                type: "assistant",
                text: result.response,
                tool: (result.tool_used || "GET_FIELD_REPORT").toUpperCase(),
                time: now,
                audio_base64: result.audio_base64,
              };

              setMessages([userMsg, assistantMsg]);
              setStatus("speaking");
              playAudio(result.audio_base64, result.response, activeLang);
            } else {
              setStatus("idle");
            }
          } catch (err) {
            setStatus("idle");
          }
        };

        mediaRecorder.start();
      } catch (err) {
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
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleQuery(text);
        }
      };

      recognition.onend = () => {
        if (status === "listening") {
          setStatus("idle");
        }
      };

      recognition.onerror = () => {
        const defaultQuery = activeLang === "hi" ? "आज का मौसम कैसा है?" : "How is the weather today?";
        handleQuery(defaultQuery);
      };

      recognition.start();
    } else {
      window.setTimeout(() => {
        const defaultQuery = activeLang === "hi" ? "आज का मौसम कैसा है?" : "How is the weather today?";
        handleQuery(defaultQuery);
      }, 1600);
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
      setShowTextInput(false);
    }
  };

  if (!isOpen) return null;

  const isHi = activeLang === "hi";

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeOverlay">
      {/* Exact UI Card matching docs/Voice Assistance UI.png - 90% Hero Image Coverage */}
      <div
        className="w-full max-w-[460px] sm:max-w-[480px] h-[94vh] max-h-[820px] bg-[#060B11] border border-white/10 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col justify-between relative overflow-hidden text-white select-none"
        style={{ backgroundColor: "#060B11", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {/* ================= HERO AVATAR BACKGROUND (TOP 70% OF THE DIV) ================= */}
        <div className="absolute top-0 left-0 right-0 h-[70%] z-0 overflow-hidden pointer-events-none">
          <LiveAvatar isOpen={isOpen} isSpeaking={status === "speaking"} />
        </div>

        {/* ================= 1. FLOATING TOP HEADER ================= */}
        <div className="relative z-30 px-4 sm:px-5 pt-3.5 sm:pt-4 flex items-center justify-between pointer-events-auto">
          {/* Field Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#062c1d]/90 border border-emerald-500/40 rounded-full backdrop-blur-md">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span className="text-[11px] font-bold text-emerald-300 tracking-wider">
              FIELD: {fieldId}
            </span>
          </div>

          {/* Right Controls: Language Toggle + Close */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#0b1520]/85 border border-white/10 rounded-full p-0.5 backdrop-blur-md">
              <button
                onClick={() => setActiveLang("hi")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeLang === "hi"
                    ? "bg-[#0d7d55] text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setActiveLang("en")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeLang === "en"
                    ? "bg-[#0d7d55] text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ================= 2. ALL TEXT & CONTENT LAYERED OVER LOWER GRADIENT (NO SCROLL) ================= */}
        <div className="relative z-10 flex-1 flex flex-col justify-end overflow-hidden pb-1">
          <div className="flex flex-col">
            {/* Status Badge */}
            <div className="flex justify-center mb-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#081822]/95 border border-emerald-500/40 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                {/* Left Waveform Bars */}
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-1" : "h-1"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-2" : "h-2"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-3" : "h-1"}`} />
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-400 px-1">
                  {status === "speaking" && "SPEAKING..."}
                  {status === "listening" && "LISTENING..."}
                  {status === "thinking" && "PROCESSING..."}
                  {status === "error" && (isHi ? "त्रुटि" : "ERROR")}
                  {status === "idle" && "READY"}
                </span>

                {/* Right Waveform Bars */}
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-3" : "h-1"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-2" : "h-2"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full ${status === "speaking" || status === "listening" ? "animate-wave-1" : "h-1"}`} />
                </div>
              </div>
            </div>

            {/* Greeting Typography */}
            <div className="px-4 text-center z-10 shrink-0">
              <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-tight leading-snug drop-shadow-md">
                {isHi ? "नमस्ते! मैं कृषिनेत्र हूँ।" : "Namaste! I am KrishiNetra."}
              </h2>
              <p className="text-[10.5px] text-slate-300 font-normal leading-tight max-w-sm mx-auto drop-shadow-sm">
                {isHi
                  ? "मैं आपकी खेती में मदद कर सकता हूँ। पूछिए, मैं जवाब देता हूँ।"
                  : "I can assist you with your farming. Ask anything, I'll answer."}
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 mt-1.5 flex items-center justify-center gap-1.5 flex-wrap z-10">
              {(isHi
                ? [
                    { label: "आज का मौसम", query: "आज का मौसम कैसा है?" },
                    { label: "मिट्टी की नमी", query: "मिट्टी में नमी कितनी है?" },
                    { label: "सिंचाई सलाह", query: "क्या मुझे पानी देना चाहिए?" },
                    { label: "फसल स्वास्थ्य", query: "मेरी फसल कैसी है?" },
                  ]
                : [
                    { label: "Weather", query: "How is the weather today?" },
                    { label: "Moisture", query: "What is the soil moisture level?" },
                    { label: "Irrigation", query: "Should I irrigate today?" },
                    { label: "Crop Health", query: "Is my crop healthy?" },
                  ]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(chip.query)}
                  disabled={status === "listening" || status === "thinking"}
                  className="px-2 py-0.5 rounded-full bg-[#0b1520]/80 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-400/40 text-[9.5px] text-slate-300 hover:text-emerald-300 transition-all backdrop-blur-sm shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Conversation Cards Section with Smooth Scroll for Elaborated Knowledge */}
            <div className="px-4 mt-1.5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {messages.slice(-2).map((msg) => {
                if (msg.type === "user") {
                  return (
                    <div
                      key={msg.id}
                      className="bg-[#0c1520]/90 border border-white/[0.08] rounded-xl p-2.5 px-3 flex items-start gap-2 backdrop-blur-md shadow-md"
                    >
                      <div className="w-5 h-5 rounded-lg bg-teal-950/60 border border-teal-400/25 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-teal-400">
                            {isHi ? "आपका प्रश्न" : "Your Question"}
                          </span>
                          <span className="text-[9px] text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-[11.5px] text-white font-normal leading-relaxed mt-0.5 whitespace-pre-line">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className="bg-[#0c1520]/95 border border-white/[0.08] rounded-xl p-2.5 px-3 flex items-start gap-2 backdrop-blur-md shadow-md"
                  >
                    <div className="w-5 h-5 rounded-lg bg-emerald-950/60 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {isHi ? "कृषिनेत्र का उत्तर" : "KrishiNetra Response"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {msg.tool && (
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-wide font-mono">
                              {isHi ? `टूल: ${msg.tool}` : `TOOL: ${msg.tool}`}
                            </span>
                          )}
                          <button
                            onClick={() => playAudio(msg.audio_base64, msg.text, activeLang)}
                            title="Replay Audio"
                            className="text-slate-300 hover:text-white transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                          <span className="text-[9px] text-slate-400">{msg.time}</span>
                        </div>
                      </div>
                      <div className="text-[11.5px] text-slate-200 font-normal leading-relaxed mt-1 max-h-40 overflow-y-auto pr-1 whitespace-pre-line select-text">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= 3. COMPACT BOTTOM GLOWING MIC BUTTON ================= */}
          <div className="px-4 pb-3 pt-1.5 flex flex-col items-center justify-center shrink-0">
            {/* Circular Mic Button */}
            <div className="relative flex items-center justify-center">
              {/* Glowing Halos */}
              <div
                className={`absolute rounded-full transition-all ${
                  status === "listening"
                    ? "w-18 h-18 bg-emerald-500/40 blur-lg animate-pulse"
                    : "w-14 h-14 bg-emerald-500/20 blur-md"
                }`}
              />

              {(status === "listening" || status === "speaking") && (
                <div className="absolute w-14 h-14 rounded-full border-2 border-emerald-400/60 pulse-ring pointer-events-none" />
              )}

              <button
                onClick={toggleMic}
                aria-label="Microphone"
                className={`relative z-10 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-300/40 ${
                  status === "listening"
                    ? "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 border-white/60 shadow-[0_0_30px_rgba(16,185,129,0.7)]"
                    : status === "speaking"
                    ? "bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500"
                    : "bg-gradient-to-tr from-[#057a55] via-[#10b981] to-[#34d399]"
                }`}
                style={{ width: "52px", height: "52px" }}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </button>
            </div>

            {/* Caption Text beneath mic */}
            <p className="text-[10.5px] text-slate-400 font-medium tracking-wide text-center mt-1">
              {status === "listening"
                ? isHi
                  ? "सुन रहा हूँ... पूरा करने के लिए दबाएँ"
                  : "Listening... Tap to finish"
                : status === "speaking"
                ? isHi
                  ? "बोल रहा हूँ... रोकने के लिए दबाएँ"
                  : "Speaking... Tap to stop"
                : isHi
                ? "बोलने के लिए माइक दबाएँ"
                : "Press mic to speak"}
            </p>

            {/* Optional Type Query Button */}
            {!showTextInput ? (
              <button
                onClick={() => setShowTextInput(true)}
                className="text-[9.5px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {isHi ? "या टाइप करें" : "Or type query"}
              </button>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex gap-1.5 w-full mt-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isHi ? "सवाल लिखें..." : "Type query..."}
                  className="flex-1 bg-[#0c1520] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-[#0d7d55] hover:bg-[#059669] text-white px-3 py-1 rounded-xl text-xs font-semibold"
                >
                  {isHi ? "पूछें" : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
