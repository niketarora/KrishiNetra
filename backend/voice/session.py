"""
Lightweight session memory for KrishiNetra Voice Assistant.
Tracks recent conversation turns, selected field, language, and intent for context-aware multi-turn dialog.
"""

import time
from typing import Any, Dict, List, Optional


class VoiceSession:
    def __init__(self, session_id: str, field_id: str = "P0001", language: str = "hi"):
        self.session_id = session_id
        self.field_id = field_id
        self.language = language
        self.last_question: Optional[str] = None
        self.last_intent: Optional[str] = None
        self.last_tool: Optional[str] = None
        self.last_tool_result: Optional[Dict[str, Any]] = None
        self.history: List[Dict[str, str]] = []
        self.created_at = time.time()
        self.updated_at = time.time()

    def add_turn(
        self,
        user_text: str,
        assistant_text: str,
        intent: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_result: Optional[Dict[str, Any]] = None
    ):
        self.history.append({"role": "user", "text": user_text, "timestamp": str(int(time.time()))})
        self.history.append({"role": "assistant", "text": assistant_text, "timestamp": str(int(time.time()))})
        
        # Keep last 6 messages (3 turns)
        if len(self.history) > 6:
            self.history = self.history[-6:]

        self.last_question = user_text
        if intent:
            self.last_intent = intent
        if tool_name:
            self.last_tool = tool_name
        if tool_result:
            self.last_tool_result = tool_result
        self.updated_at = time.time()

    def get_prompt_context(self) -> Dict[str, Any]:
        """Export compact context dictionary for Gemini LLM prompting."""
        return {
            "session_id": self.session_id,
            "selected_field_id": self.field_id,
            "language": self.language,
            "last_question": self.last_question,
            "last_intent": self.last_intent,
            "last_tool": self.last_tool,
            "history": self.history
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "field_id": self.field_id,
            "language": self.language,
            "last_question": self.last_question,
            "last_intent": self.last_intent,
            "last_tool": self.last_tool,
            "history_count": len(self.history),
            "updated_at": self.updated_at
        }


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, VoiceSession] = {}

    def get_or_create(self, session_id: Optional[str] = None, field_id: str = "P0001", language: str = "hi") -> VoiceSession:
        sid = session_id or "default-session"
        if sid not in self._sessions:
            self._sessions[sid] = VoiceSession(session_id=sid, field_id=field_id, language=language)
        else:
            session = self._sessions[sid]
            if field_id:
                session.field_id = field_id
            if language:
                session.language = language
        return self._sessions[sid]

    def cleanup_old_sessions(self, max_age_seconds: int = 3600):
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if now - s.updated_at > max_age_seconds]
        for sid in expired:
            del self._sessions[sid]


session_manager = SessionManager()
