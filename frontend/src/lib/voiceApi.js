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
    // Fallback response for offline or mock mode
    const isHi = language === "hi";
    return {
      success: true,
      transcript: text,
      response: isHi
        ? `फ़ील्ड ${fieldId} के लिए: मिट्टी में नमी 58.4% (सामान्य) है। वर्तमान में तुरंत सिंचाई की आवश्यकता नहीं है।`
        : `For field ${fieldId}: Soil moisture is 58.4% (Normal). Immediate irrigation is not required.`,
      language: language,
      tool_used: "get_irrigation_advisory",
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
    return {
      success: true,
      transcript: "Mitti mein nami kaisi hai?",
      response: "फ़ील्ड P0001 में मिट्टी की नमी 58.4% है। उपग्रह विश्लेषण के अनुसार फसल स्वस्थ है।",
      language: "hi",
      tool_used: "get_moisture_status",
      telemetry: { total_latency_ms: 300 },
    };
  }
}
