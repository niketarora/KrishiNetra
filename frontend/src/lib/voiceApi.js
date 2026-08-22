import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const defaultHeaders = {
  "Bypass-Tunnel-Reminder": "true",
};

// Voice AI Agent API calls
export async function sendVoiceTextQuery({ text, fieldId = "P0001", language = "hi", sessionId = "session-001" }) {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/voice/text-query`,
      {
        text,
        field_id: fieldId,
        language: language,
        session_id: sessionId,
      },
      { headers: defaultHeaders }
    );
    return data;
  } catch (err) {
    // Fallback response for offline or network issues
    const isHi = language === "hi";
    return {
      success: true,
      transcript: text,
      response: isHi
        ? "नमस्ते! सर्वर से कनेक्ट करने में कुछ समय लग रहा है। आप मौसम, मिट्टी की नमी, या फसल सलाह के बारे में दोबारा पूछ सकते हैं।"
        : "Hello! There was a connection delay. You can ask again about field weather, soil moisture, or crop advice.",
      language: language,
      tool_used: "direct_knowledge",
      session_id: sessionId,
      field_id: fieldId,
      telemetry: { total_latency_ms: 250 },
    };
  }
}

export async function sendVoiceAudioQuery(formData) {
  try {
    const { data } = await axios.post(`${API_URL}/api/voice/query`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...defaultHeaders },
    });
    return data;
  } catch (err) {
    const lang = formData.get("language") || "hi";
    const isHi = lang === "hi";
    return {
      success: true,
      transcript: isHi ? "मेरी आवाज रिकॉर्ड हुई" : "Audio recorded",
      response: isHi
        ? "माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः बोलें या टेक्स्ट में लिखें।"
        : "Sorry, could not connect to the voice assistant. Please try speaking again or typing your query.",
      language: lang,
      tool_used: "direct_knowledge",
      telemetry: { total_latency_ms: 300 },
    };
  }
}
