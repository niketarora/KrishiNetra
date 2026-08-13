from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class VoiceQueryTextRequest(BaseModel):
    text: str = Field(..., description="Transcribed query text or direct text input")
    field_id: Optional[str] = Field("P0001", description="Currently selected field/parcel ID")
    language: Optional[str] = Field("hi", description="Selected language (e.g., 'hi' or 'en')")
    session_id: Optional[str] = Field("session-001", description="Client voice session ID")


VoiceQueryRequest = VoiceQueryTextRequest


class ToolExecutionResult(BaseModel):
    success: bool
    tool_name: str
    field_id: str
    data: Dict[str, Any]
    error: Optional[str] = None


class VoiceQueryResponse(BaseModel):
    success: bool
    transcript: str
    response: str
    language: str
    tool_used: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    audio_base64: Optional[str] = None
    error: Optional[str] = None
