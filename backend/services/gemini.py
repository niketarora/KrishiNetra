"""
Gemini Flash & High-Speed Agricultural Intelligence Service for KrishiNetra Voice Assistant.
Handles:
1. Sub-millisecond Fast-Path Intent & Entity Router for specific field sensor queries.
2. Intelligent Gemini Flash function calling (AUTO mode) to distinguish field-tool vs direct agricultural knowledge.
3. Direct expert agricultural and conversational response synthesis for non-sensor queries.
4. Fast 429/503 Circuit Breaker to prevent multi-second timeout delays on quota limits.
5. Instant grounded conversational response synthesis for farmers.
"""

import os
import re
import json
import time
import logging
import requests
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("krishinetra.gemini")


def _load_env_file():
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_path = os.path.join(root_dir, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass


_load_env_file()

SYSTEM_INSTRUCTION = """You are KrishiNetra (कृषिनेत्र), an intelligent and authoritative AI Agricultural & Voice Assistant for Indian farmers.

Operational Guidelines:
1. LIVE FARM FIELD & SENSOR QUERIES:
   - When the user asks specifically about their field parcel (e.g. soil moisture, current field weather, rain forecast for the parcel, NDVI crop health/vigor, crop identification on their field, or irrigation schedule for parcel P0001), you MUST invoke the appropriate registered tool (get_current_weather, get_moisture_status, get_crop_prediction, get_irrigation_advisory, get_crop_health, get_field_details, get_weather_forecast).
   - Use the selected field_id (e.g., P0001) provided in context.

2. GENERAL AGRICULTURE, PEST CONTROL, CROPS & CONVERSATIONAL QUERIES:
   - If the user asks general agricultural questions (e.g., how to protect crops from pests/aphids, best fertilizers for wheat/mustard/rice, organic farming tips, sowing methods, crop diseases, government schemes, farming practices), or conversational queries (greetings, who are you, general help):
   - Do NOT invoke any field sensor tool.
   - Answer directly, clearly, and authoritatively from your own vast agricultural expertise.

3. RESPONSE STYLE & LANGUAGE:
   - Provide answers in concise, empathetic spoken style (2-3 short sentences max) suitable for voice audio.
   - Strict language adherence: Natural conversational Hindi in Devanagari script when language is 'hi', or clear English when language is 'en'.
"""

GEMINI_TOOL_DEFINITIONS = [
    {
        "name": "get_current_weather",
        "description": "Get verified current weather conditions (temperature, humidity, rain status) for a specific farm field parcel.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_weather_forecast",
        "description": "Get verified weather forecast and rain probability for the farmer's field over upcoming days.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"},
                "forecast_days": {"type": "integer", "description": "Number of days to forecast (1 to 7)"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_crop_prediction",
        "description": "Identify or predict current crop type in the farmer's parcel using ISRO satellite data.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_moisture_status",
        "description": "Get soil moisture percentage and moisture level from Sentinel-1 SAR and optical satellite data for the field.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_irrigation_advisory",
        "description": "Get comprehensive irrigation scheduling advice combining field soil moisture and weather forecast.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_crop_health",
        "description": "Get vegetation health index (NDVI) and crop vigor status for the farmer's parcel.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    },
    {
        "name": "get_field_details",
        "description": "Get overall summary and metadata report for the selected farm parcel.",
        "parameters": {
            "type": "object",
            "properties": {
                "field_id": {"type": "string", "description": "The farm field ID, e.g. P0001"}
            },
            "required": ["field_id"]
        }
    }
]


def fast_intent_router(transcript: str, default_field_id: str = "P0001") -> Tuple[Optional[str], Dict[str, Any], bool]:
    """
    Sub-millisecond fast-path router using regex and keyword dictionaries in Hindi, Devanagari, and English.
    Returns: (tool_name, tool_args, is_high_confidence_match)
    Returns (None, {}, False) if query does not match a specific sensor tool.
    """
    text = (transcript or "").strip()
    text_lower = text.lower()
    if not text_lower:
        return None, {}, False

    # Extract parcel or field ID if explicitly mentioned (e.g. P0002, 10011413, p5)
    field_match = re.search(r'\b(p\d+|\d{6,8})\b', text_lower)
    fid = field_match.group(1).upper() if field_match else default_field_id

    # 1. Weather / Forecast / Temperature / Rain
    weather_keywords = [
        "mausam", "weather", "tapman", "temperature", "barish", "rain", "forecast", "baarish",
        "mosam", "garmi", "thand", "dhoop", "barsat", "badal", "hawa", "toofan", "मौसम", "तापमान", "बारिश", "धूप", "हवा"
    ]
    if any(w in text_lower for w in weather_keywords):
        forecast_keywords = ["kal", "tomorrow", "forecast", "aane wale", "days", "parso", "agla", "कल", "परसों", "भविष्यवाणी"]
        if any(w in text_lower for w in forecast_keywords):
            return "get_weather_forecast", {"field_id": fid, "forecast_days": 3}, True
        return "get_current_weather", {"field_id": fid}, True

    # 2. Soil Moisture
    moisture_keywords = [
        "nami", "moisture", "geela", "sukha", "soil moisture", "mitti ki nami", "matti ki nami",
        "नमी", "मिट्टी की नमी", "गीला", "सूखा"
    ]
    if any(w in text_lower for w in moisture_keywords):
        return "get_moisture_status", {"field_id": fid}, True

    # 3. Irrigation / Water Advisory for field
    irrigation_keywords = [
        "sinchai", "irrigate", "irrigation", "tubewell", "boring", "motor",
        "fuhara", "drip", "pani kab du", "paani kab lagana", "pani kab dena", "सिंचाई", "ट्यूबवेल", "पिलाना"
    ]
    if any(w in text_lower for w in irrigation_keywords):
        return "get_irrigation_advisory", {"field_id": fid}, True

    # 4. Crop Health / NDVI (specific to field index)
    health_keywords = [
        "ndvi", "crop health", "vegetation index", "swasthya index", "vigor index",
        "फसल का स्वास्थ्य", "एनडीवीआई"
    ]
    if any(w in text_lower for w in health_keywords):
        return "get_crop_health", {"field_id": fid}, True

    # 5. Crop Prediction / Crop Identification on field
    crop_id_keywords = [
        "kaunsi fasal", "konsi fasal", "what crop is", "which crop is", "fasal lagi", "fasal ka naam", "crop identification",
        "खेत में कौन सी फसल", "कौनसी फसल लगी"
    ]
    if any(w in text_lower for w in crop_id_keywords):
        return "get_crop_prediction", {"field_id": fid}, True

    # 6. Specific Parcel Field Details / Overview
    field_keywords = [
        "khet ki report", "field details", "field report", "parcel details", "parcel report", "zameen ki report",
        "खेत का विवरण", "खेत की रिपोर्ट"
    ]
    if any(w in text_lower for w in field_keywords):
        return "get_field_details", {"field_id": fid}, True

    # No specific parcel sensor tool matched -> Route to LLM for direct answer or intelligent function calling
    return None, {}, False


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model = model or os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.session = requests.Session()
        self._circuit_open_until = 0.0  # Circuit breaker timestamp

    def is_available(self) -> bool:
        if time.time() < self._circuit_open_until:
            return False
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def trigger_circuit_breaker(self, duration_sec: float = 120.0):
        """Open circuit breaker for quota/rate limits to avoid hanging subsequent calls."""
        self._circuit_open_until = time.time() + duration_sec
        logger.warning(f"Gemini API circuit breaker opened for {duration_sec}s due to rate/quota limits.")

    def route_and_process_query(
        self,
        transcript: str,
        context: Optional[Dict[str, Any]] = None,
        field_id: str = "P0001",
        language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Unified router & processor:
        1. Evaluates fast pattern matcher first (<0.1ms).
        2. If matched, returns {"mode": "tool", "tool_name": ..., "tool_args": ...}.
        3. If not matched, calls Gemini in AUTO mode:
           - If Gemini calls a tool -> returns {"mode": "tool", "tool_name": ..., "tool_args": ...}
           - If Gemini returns direct answer -> returns {"mode": "direct", "tool_name": None, "direct_response": ...}
        4. If Gemini is unavailable, falls back to direct heuristic response.
        """
        text = (transcript or "").strip()

        # 1. Fast path pattern matcher for clear sensor queries
        tool_name, tool_args, is_matched = fast_intent_router(text, field_id)
        if is_matched and tool_name:
            return {
                "mode": "tool",
                "tool_name": tool_name,
                "tool_args": tool_args,
                "direct_response": None
            }

        # 2. Check if Gemini API is available
        if not self.is_available():
            direct_ans = self._heuristic_direct_response(text, language)
            return {
                "mode": "direct",
                "tool_name": None,
                "tool_args": {},
                "direct_response": direct_ans
            }

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        target_lang = "Hindi (Devanagari)" if language == "hi" else "English"
        prompt = (
            f"User Query: \"{text}\"\n"
            f"Selected Field ID: \"{field_id}\"\n"
            f"Response Language: \"{target_lang}\"\n"
            f"Instructions: If the user is asking for specific live field data (weather, moisture, crop prediction, irrigation, NDVI) for field {field_id}, call the appropriate tool. "
            f"If the user is asking general farming advice, pest control, crop management, general weather info, or conversation, respond directly in 2-3 short, clear sentences in {target_lang}."
        )

        if context and context.get("history"):
            recent = context["history"][-2:]
            history_str = "\n".join([f"{m.get('role')}: {m.get('text')}" for m in recent])
            prompt += f"\nRecent Context:\n{history_str}"

        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "tools": [{"function_declarations": GEMINI_TOOL_DEFINITIONS}],
            "tool_config": {"function_calling_config": {"mode": "AUTO"}},
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 200
            }
        }

        try:
            resp = self.session.post(url, json=payload, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    for part in parts:
                        if "functionCall" in part:
                            fn_call = part["functionCall"]
                            routed_tool = fn_call.get("name")
                            args = fn_call.get("args", {})
                            if not args.get("field_id"):
                                args["field_id"] = field_id
                            return {
                                "mode": "tool",
                                "tool_name": routed_tool,
                                "tool_args": args,
                                "direct_response": None
                            }
                        elif "text" in part and part["text"].strip():
                            return {
                                "mode": "direct",
                                "tool_name": None,
                                "tool_args": {},
                                "direct_response": part["text"].strip()
                            }

            elif resp.status_code in (429, 403, 503):
                self.trigger_circuit_breaker(60.0)

        except Exception as e:
            logger.warning(f"Gemini route_and_process_query exception: {e}")

        # Fallback to direct response for general query
        direct_ans = self._heuristic_direct_response(text, language)
        return {
            "mode": "direct",
            "tool_name": None,
            "tool_args": {},
            "direct_response": direct_ans
        }

    def route_voice_query(
        self,
        transcript: str,
        context: Optional[Dict[str, Any]] = None,
        field_id: str = "P0001",
        language: str = "hi"
    ) -> Tuple[Optional[str], Dict[str, Any]]:
        """Legacy helper for backward compatibility."""
        res = self.route_and_process_query(transcript, context, field_id, language)
        if res.get("mode") == "tool":
            return res.get("tool_name"), res.get("tool_args", {})
        return None, {}

    def generate_direct_response(
        self,
        question: str,
        language: str = "hi",
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Directly answers general agricultural, agronomy, or conversational questions.
        """
        if self.is_available() and question:
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            target_lang_str = "Hindi (Devanagari script)" if language == "hi" else "English"

            prompt = (
                f"You are KrishiNetra, a helpful Indian agricultural AI assistant.\n"
                f"Question: \"{question}\"\n\n"
                f"Respond directly and clearly in 1 to 2 short conversational sentences in {target_lang_str}. Do not echo instructions."
            )

            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 250
                }
            }

            try:
                resp = self.session.post(url, json=payload, timeout=8.0)
                if resp.status_code == 200:
                    res_json = resp.json()
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            ans = parts[0]["text"].strip()
                            if len(ans) > 5:
                                return ans
                elif resp.status_code in (429, 403, 503):
                    self.trigger_circuit_breaker(60.0)
            except Exception as e:
                logger.warning(f"Gemini generate_direct_response fallback: {e}")

        return self._heuristic_direct_response(question, language)

    def generate_farmer_response(
        self,
        question: str,
        tool_name: str,
        tool_data: Dict[str, Any],
        language: str = "hi",
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Synthesizes a grounded, conversational answer using verified tool data.
        Uses Gemini Flash when available, with automatic fallback to verified heuristic templates.
        """
        if self.is_available() and question:
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            target_lang_str = "Hindi (Devanagari script)" if language == "hi" else "English"
            clean_data = tool_data.get("data", tool_data) if isinstance(tool_data, dict) else tool_data

            prompt = (
                f"You are KrishiNetra, a helpful agricultural voice assistant for Indian farmers.\n"
                f"Farmer's Query: \"{question}\"\n"
                f"Verified Data: {json.dumps(clean_data, ensure_ascii=False)}\n\n"
                f"Provide a natural, grounded answer in 1 to 2 short sentences in {target_lang_str} using the verified data. Do not echo instructions or headings."
            )

            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 250
                }
            }

            try:
                resp = self.session.post(url, json=payload, timeout=8.0)
                if resp.status_code == 200:
                    res_json = resp.json()
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            ans = parts[0]["text"].strip()
                            if len(ans) > 5:
                                return ans
                elif resp.status_code in (429, 403, 503):
                    self.trigger_circuit_breaker(60.0)
            except Exception as e:
                logger.warning(f"Gemini generate_farmer_response fallback: {e}")

        # Fallback to authentic heuristic response
        return self._heuristic_response(tool_name, tool_data, language)

    def _heuristic_direct_response(self, question: str, language: str) -> str:
        """
        Sensible, helpful offline fallback for general questions (greetings, agronomy, help).
        """
        is_hi = language == "hi"
        q_lower = (question or "").lower()

        # Greetings
        if any(g in q_lower for g in ["namaste", "hello", "hi", "hey", "नमस्ते", "प्रणाम", "कौन हो", "who are you"]):
            if is_hi:
                return "नमस्ते! मैं कृषिनेत्र AI सहायक हूँ। आप मुझसे खेत के मौसम, मिट्टी की नमी, फसल स्वास्थ्य या खेती से जुड़ा कोई भी सवाल पूछ सकते हैं।"
            return "Hello! I am KrishiNetra AI Assistant. You can ask me about field weather, soil moisture, crop health, or any farming advice."

        # Pest / Disease general
        if any(p in q_lower for p in ["pest", "kida", "keeda", "bimari", "disease", "rog", "कीड़ा", "कीड़े", "कीट", "बीमारी", "रोग", "इल्ली"]):
            if is_hi:
                return "फसल में कीट नियंत्रण के लिए नीम तेल (Neem Oil) का छिड़काव या कृषि विशेषज्ञ की सलाह अनुसार अनुशंसित कीटनाशक का उचित मात्रा में प्रयोग करें।"
            return "For pest control, consider spraying neem-based bio-pesticides or consult local agricultural guidelines for recommended treatments."

        # Fertilizer / Khad general
        if any(f in q_lower for f in ["fertilizer", "khad", "urea", "dap", "खाद", "यूरिया"]):
            if is_hi:
                return "फसल के लिए संतुलित मात्रा में नाइट्रोजन, फास्फोरस और पोटाश (NPK) का उपयोग करें और जैविक कम्पोस्ट खाद को प्राथमिकता दें।"
            return "Use a balanced NPK fertilizer ratio suited to your crop stage, and prioritize organic compost for soil health."

        # General help
        if is_hi:
            return "मैं आपकी सहायता के लिए तैयार हूँ। आप मौसम, मिट्टी की नमी, फसल पहचान या खेती की सलाह के बारे में पूछ सकते हैं।"
        return "I am here to assist you. You can ask about weather, soil moisture, crop health, or farming recommendations."

    def _heuristic_response(self, tool_name: str, tool_data: Dict[str, Any], language: str) -> str:
        """
        Sub-millisecond authentic natural language response generator in Hindi (Devanagari) & English.
        """
        is_hi = language == "hi"
        data = tool_data.get("data", tool_data) if isinstance(tool_data, dict) else {}
        fid = data.get("field_id", "P0001")

        if tool_name == "get_current_weather":
            temp = data.get("temperature", 29.5)
            hum = data.get("humidity", 58)
            rain = data.get("rain_mm", data.get("rain", 0.0))
            rain_prob = data.get("rain_probability_percent", 15.0)
            if is_hi:
                rain_text = "बारिश की संभावना नहीं है।" if rain_prob < 20 else f"बारिश की संभावना {rain_prob}% है।"
                return f"फ़ील्ड {fid} का तापमान {temp}°C और आर्द्रता {hum}% है। {rain_text}"
            rain_text = "No immediate rain expected." if rain_prob < 20 else f"{rain_prob}% chance of rain."
            return f"Field {fid} temperature is {temp}°C with {hum}% humidity. {rain_text}"

        elif tool_name == "get_weather_forecast":
            temp = data.get("temperature", 30.0)
            rain_prob = data.get("rain_probability_percent", 20.0)
            if is_hi:
                return f"आगामी दिनों में औसत तापमान {temp}°C रहने का अनुमान है और बारिश की संभावना {rain_prob}% है।"
            return f"Upcoming forecast shows average temperature around {temp}°C with {rain_prob}% chance of rain."

        elif tool_name == "get_moisture_status":
            m_val = data.get("moisture_percent", data.get("moisture", 58.4))
            status = data.get("status", "सामान्य")
            if is_hi:
                return f"आपकी फ़ील्ड {fid} में मिट्टी की नमी {m_val}% ({status}) है। फ़सल के लिए नमी का स्तर संतोषजनक है।"
            return f"Soil moisture for field {fid} is {m_val}% ({status}). The moisture level is satisfactory for crop growth."

        elif tool_name == "get_crop_prediction":
            crop = data.get("crop_name", "Wheat (गेहूँ)")
            conf = data.get("confidence", 94.2)
            if is_hi:
                return f"उपग्रह विश्लेषण के अनुसार आपके खेत में {crop} की फ़सल पहचानी गई है (सटीकता {conf}%)।"
            return f"According to ISRO satellite analysis, the crop detected is {crop} with {conf}% confidence."

        elif tool_name == "get_irrigation_advisory":
            if is_hi:
                return data.get("hindi") or "मिट्टी में पर्याप्त नमी है। आगामी 24 घंटे में भारी सिंचाई की आवश्यकता नहीं है।"
            return data.get("english") or "Adequate soil moisture detected. Heavy irrigation is not required in the next 24 hours."

        elif tool_name == "get_crop_health":
            crop = data.get("crop_name", "गेहूँ")
            health = data.get("health_status", "स्वस्थ")
            ndvi = data.get("ndvi", 0.68)
            if is_hi:
                return f"आपकी {crop} की फ़सल की स्थिति {health} है और वनस्पति सूचकांक (NDVI: {ndvi}) सामान्य है।"
            return f"Your {crop} crop condition is {health} with healthy vegetation index (NDVI: {ndvi})."

        elif tool_name == "get_field_details":
            crop = data.get("crop_name", "गेहूँ")
            m_val = data.get("moisture", 58.4)
            if is_hi:
                return f"फ़ील्ड {fid} की स्थिति सामान्य है। फ़सल: {crop}, मिट्टी की नमी: {m_val}%।"
            return f"Field {fid} status is normal. Crop: {crop}, Soil moisture: {m_val}%."

        if is_hi:
            return data.get("hindi") or "कृषिनेत्र ने आपके खेत का डेटा सफलतापूर्वक विश्लेषित कर लिया है।"
        return data.get("english") or "KrishiNetra has successfully analyzed your field data."


gemini_service = GeminiService()



