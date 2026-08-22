import logging
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile

from backend.schemas.voice import VoiceQueryRequest, VoiceQueryResponse
from backend.voice.orchestrator import process_voice_query, process_voice_query_text

logger = logging.getLogger("krishinetra.routes.voice")

router = APIRouter(tags=["Voice AI"])


@router.post("/api/voice/text-query", response_model=VoiceQueryResponse)
def voice_text_query(request: VoiceQueryRequest):
    """Voice AI Agent text query endpoint (handles transcribed text or typed input)."""
    lang = request.language or "hi"
    res = process_voice_query_text(
        text=request.text,
        field_id=request.field_id or "P0001",
        lang=lang,
        session_id=request.session_id
    )
    return res


@router.post("/api/voice/query", response_model=VoiceQueryResponse)
async def voice_audio_query(
    audio: Optional[UploadFile] = File(None),
    transcript: Optional[str] = Form(None),
    field_id: Optional[str] = Form("P0001"),
    language: Optional[str] = Form("hi"),
    session_id: Optional[str] = Form("session-001")
):
    """Voice AI Agent audio query endpoint (handles multipart audio file or transcript)."""
    lang = language or "hi"
    audio_bytes = None
    mime_type = "audio/webm"

    if audio:
        audio_bytes = await audio.read()
        mime_type = audio.content_type or "audio/webm"

    res = process_voice_query(
        text=transcript,
        audio_bytes=audio_bytes,
        mime_type=mime_type,
        field_id=field_id or "P0001",
        language=lang,
        session_id=session_id
    )
    return res
