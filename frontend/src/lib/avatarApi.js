import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export async function createAvatarSession() {
  try {
    const { data } = await axios.post(`${API_URL}/api/avatar/session`);
    return data;
  } catch (err) {
    return { enabled: false, reason: "Backend avatar endpoint offline" };
  }
}

export async function closeAvatarSession(sessionId) {
  try {
    const { data } = await axios.post(`${API_URL}/api/avatar/close`, { session_id: sessionId });
    return data;
  } catch (err) {
    return { success: false };
  }
}
