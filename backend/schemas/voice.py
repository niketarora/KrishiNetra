from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# Tool Argument Schemas for Backend Validation
# ==========================================

class GetWeatherRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


class GetWeatherForecastRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")
    forecast_days: Optional[int] = Field(default=1, ge=1, le=7, description="Number of days to forecast (1 to 7)")


class GetCropPredictionRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


class GetMoistureRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


class GetIrrigationRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


class GetCropHealthRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


class GetFieldDetailsRequest(BaseModel):
    field_id: str = Field(default="P0001", description="Target field parcel identifier")


# ==========================================
# Client API Request & Response Schemas
# ==========================================

class VoiceQueryTextRequest(BaseModel):
    text: str = Field(..., description="Transcribed query text or direct text input")
    field_id: Optional[str] = Field("P0001", description="Currently selected field/parcel ID")
    language: Optional[str] = Field("hi", description="Selected language (e.g., 'hi' or 'en')")
    session_id: Optional[str] = Field("session-001", description="Client voice session ID")


VoiceQueryRequest = VoiceQueryTextRequest


class AvatarCloseRequest(BaseModel):
    session_id: str


class VoiceTelemetry(BaseModel):
    stt_latency_ms: int = 0
    gemini_router_latency_ms: int = 0
    tool_latency_ms: int = 0
    gemini_response_latency_ms: int = 0
    tts_latency_ms: int = 0
    total_latency_ms: int = 0


class ToolExecutionResult(BaseModel):
    success: bool
    tool_name: str
    field_id: str
    data: Dict[str, Any]
    error: Optional[str] = None
    fallback: bool = False


class VoiceQueryResponse(BaseModel):
    success: bool
    transcript: str
    response: str
    language: str
    tool_used: Optional[str] = None
    field_id: Optional[str] = "P0001"
    data: Optional[Dict[str, Any]] = None
    audio_base64: Optional[str] = None
    session_id: Optional[str] = None
    telemetry: Optional[VoiceTelemetry] = None
    error: Optional[str] = None
