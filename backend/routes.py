import base64
from fastapi import APIRouter, File, Form, UploadFile
from typing import Optional

from backend.schemas import FieldRequest, PredictionResponse
from backend.voice_schemas import VoiceQueryRequest, VoiceQueryResponse
from backend.voice_orchestrator import process_voice_query_text
from backend.bhashini import bhashini_client
from models.advisor import smart_advisor

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict(request: FieldRequest):
    report = smart_advisor(request.field_id)
    return report


@router.post("/api/voice/text-query", response_model=VoiceQueryResponse)
def voice_text_query(request: VoiceQueryRequest):
    """Voice AI Agent text query endpoint (handles transcribed text or typed input)."""
    lang = request.language or "hi"
    res = process_voice_query_text(
        text=request.text,
        field_id=request.field_id or "P0001",
        lang=lang
    )
    # Generate TTS audio if Bhashini credentials are configured
    if bhashini_client.is_configured() and res.get("response"):
        res["audio_base64"] = bhashini_client.text_to_speech(res["response"], language=lang)
    return res


@router.post("/api/voice/query", response_model=VoiceQueryResponse)
async def voice_audio_query(
    audio: Optional[UploadFile] = File(None),
    transcript: Optional[str] = Form(None),
    field_id: Optional[str] = Form("P0001"),
    language: Optional[str] = Form("hi")
):
    """Voice AI Agent audio query endpoint (handles multipart audio file or transcript)."""
    lang = language or "hi"
    query_text = transcript if transcript else ""
    
    # If binary audio file is uploaded, convert to text via Bhashini ASR
    if audio:
        audio_bytes = await audio.read()
        if len(audio_bytes) > 0 and not query_text:
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
            query_text = bhashini_client.speech_to_text(audio_base64, language=lang)

    if not query_text:
        query_text = "Mere khet mein paani kab dena hai?"

    res = process_voice_query_text(
        text=query_text,
        field_id=field_id or "P0001",
        lang=lang
    )

    # Generate TTS audio if Bhashini credentials are configured
    if bhashini_client.is_configured() and res.get("response"):
        res["audio_base64"] = bhashini_client.text_to_speech(res["response"], language=lang)
        
    return res


