"""
HeyGen LiveAvatar Realtime Streaming Service.
Provides secure server-side session token generation and lifecycle management.
The permanent HEYGEN_API_KEY is never exposed to the frontend.
"""

import os
import logging
import requests
from typing import Any, Dict, Optional

logger = logging.getLogger("krishinetra.heygen")

HEYGEN_API_KEY = os.environ.get("HEYGEN_API_KEY", "").strip()
HEYGEN_AVATAR_ID = os.environ.get("HEYGEN_AVATAR_ID", "").strip()
HEYGEN_API_BASE = "https://api.heygen.com"


class HeyGenService:
    def __init__(self, api_key: Optional[str] = None, avatar_id: Optional[str] = None):
        self.api_key = api_key or os.environ.get("HEYGEN_API_KEY", "")
        self.avatar_id = avatar_id or os.environ.get("HEYGEN_AVATAR_ID", "")

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def create_streaming_token(self) -> Dict[str, Any]:
        """
        Request a short-lived client streaming token from HeyGen.
        Safe for consumption by the frontend WebRTC client.
        """
        if not self.is_available():
            return {
                "enabled": False,
                "reason": "HEYGEN_API_KEY is not configured in backend environment.",
                "avatar_id": self.avatar_id or "default_farmer"
            }

        try:
            url = f"{HEYGEN_API_BASE}/v1/streaming.create_token"
            headers = {
                "X-Api-Key": self.api_key.strip(),
                "Content-Type": "application/json"
            }
            resp = requests.post(url, headers=headers, json={}, timeout=8)
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                return {
                    "enabled": True,
                    "token": data.get("token"),
                    "avatar_id": self.avatar_id
                }
            
            logger.warning(f"HeyGen create_token returned HTTP {resp.status_code}: {resp.text}")
            return {
                "enabled": False,
                "reason": f"HeyGen API returned HTTP {resp.status_code}",
                "avatar_id": self.avatar_id
            }
        except Exception as e:
            logger.error(f"Error requesting HeyGen streaming token: {e}")
            return {
                "enabled": False,
                "error": str(e),
                "avatar_id": self.avatar_id
            }

    def close_streaming_session(self, session_id: str) -> Dict[str, Any]:
        """Stop and cleanup an active streaming session."""
        if not self.is_available() or not session_id:
            return {"success": False, "reason": "Not available or empty session_id"}

        try:
            url = f"{HEYGEN_API_BASE}/v1/streaming.stop"
            headers = {
                "X-Api-Key": self.api_key.strip(),
                "Content-Type": "application/json"
            }
            resp = requests.post(url, headers=headers, json={"session_id": session_id}, timeout=6)
            return {"success": resp.status_code == 200}
        except Exception as e:
            logger.error(f"Error stopping HeyGen session {session_id}: {e}")
            return {"success": False, "error": str(e)}


heygen_service = HeyGenService()

