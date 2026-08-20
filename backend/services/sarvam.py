import os
import json
import base64
import requests
import logging
from typing import Optional, Union

logger = logging.getLogger("sarvam")


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

# Language code mapping for Sarvam AI (BCP-47 format)
LANGUAGE_MAP = {
    "hi": "hi-IN",
    "en": "en-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "od": "od-IN",
    "pa": "pa-IN",
    "ta": "ta-IN",
    "te": "te-IN",
}


class SarvamClient:
    """
    Sarvam AI integration client for high-performance Indic Speech-to-Text (Saaras)
    and Text-to-Speech (Bulbul) processing.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SARVAM_API_KEY", "")
        self.base_url = "https://api.sarvam.ai"
        self.session = requests.Session()

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def _get_headers(self, content_type: Optional[str] = "application/json") -> dict:
        headers = {
            "api-subscription-key": self.api_key.strip(),
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def speech_to_text(
        self,
        audio_data: Union[bytes, str],
        language: str = "hi",
        model: str = "saaras:v3",
        filename: str = "audio.wav"
    ) -> str:
        """
        Converts audio (raw bytes or base64 string) into text using Sarvam AI Saaras STT.
        Returns transcribed text or empty string on failure.
        """
        if not self.is_configured():
            logger.info("Sarvam STT: API Key not configured.")
            return ""

        try:
            # Decode base64 if string is passed
            if isinstance(audio_data, str):
                if "," in audio_data:
                    audio_data = audio_data.split(",", 1)[1]
                audio_bytes = base64.b64decode(audio_data)
            else:
                audio_bytes = audio_data

            if not audio_bytes or len(audio_bytes) < 100:
                logger.warning("Sarvam STT: Audio bytes too small or empty.")
                return ""

            lang_code = LANGUAGE_MAP.get(language, language if "-" in language else "hi-IN")
            url = f"{self.base_url}/speech-to-text"

            content_type = "audio/wav"
            if filename.endswith(".mp3"):
                content_type = "audio/mpeg"
            elif filename.endswith(".webm"):
                content_type = "audio/webm"
            elif filename.endswith(".ogg"):
                content_type = "audio/ogg"

            files = {
                "file": (filename, audio_bytes, content_type)
            }
            data = {
                "model": model,
                "language_code": lang_code
            }
            headers = {
                "api-subscription-key": self.api_key.strip()
            }

            resp = self.session.post(url, files=files, data=data, headers=headers, timeout=25)
            if resp.status_code == 200:
                resp_json = resp.json()
                transcript = resp_json.get("transcript", "")
                if transcript:
                    return transcript.strip()
            else:
                logger.error(f"Sarvam STT HTTP {resp.status_code}: {resp.text}")

            return ""

        except Exception as e:
            logger.error(f"Sarvam STT Error: {str(e)}")
            return ""

    def text_to_speech(
        self,
        text: str,
        language: str = "hi",
        speaker: str = "karun",
        model: str = "bulbul:v2",
        pitch: float = -0.25,
        pace: float = 0.92,
        loudness: float = 1.6
    ) -> str:
        """
        Converts response text into base64 encoded WAV audio using Sarvam AI Bulbul TTS.
        Uses a deep, mature male voice (karun / abhilash) suited for the AI farmer avatar.
        """
        if not self.is_configured() or not text:
            return ""

        try:
            lang_code = LANGUAGE_MAP.get(language, language if "-" in language else "hi-IN")
            url = f"{self.base_url}/text-to-speech"
            headers = self._get_headers(content_type="application/json")

            payload = {
                "inputs": [text[:2500]],
                "target_language_code": lang_code,
                "speaker": speaker,
                "model": model,
                "pitch": pitch,
                "pace": pace,
                "loudness": loudness,
                "speech_sample_rate": 8000,
                "enable_preprocessing": True
            }

            resp = self.session.post(url, json=payload, headers=headers, timeout=25)
            if resp.status_code == 200:
                resp_json = resp.json()
                audios = resp_json.get("audios", [])
                if audios and len(audios) > 0:
                    return audios[0]
            else:
                logger.error(f"Sarvam TTS HTTP {resp.status_code}: {resp.text}")

            return ""

        except Exception as e:
            logger.error(f"Sarvam TTS Error: {str(e)}.")
            return ""


# Global singleton client instance
sarvam_client = SarvamClient()
