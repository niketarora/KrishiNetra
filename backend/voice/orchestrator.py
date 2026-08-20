"""
KrishiNetra Voice AI Orchestrator.
Orchestrates:
1. Speech-to-Text (Sarvam AI Saaras v3)
2. Conversation context retrieval (VoiceSession)
3. LLM Intent & Entity Tool Routing (Gemini 2.5 Flash / Heuristic fallback)
4. Schema Validation & Field Authorization (voice/tools.py)
5. Grounded Tool Execution (KrishiNetra Models / voice/tools.py)
6. Farmer-friendly Grounded Response Synthesis (Gemini 2.5 Flash)
7. Text-to-Speech Generation (Sarvam AI Bulbul v2)
8. Session Memory & Structured Telemetry Recording
"""

import time
import logging
from typing import Any, Dict, Optional, Tuple

from backend.voice.tools import validate_and_authorize_tool_call, execute_tool, ALLOWLISTED_TOOLS
from backend.services.gemini import gemini_service
from backend.voice.session import session_manager
from backend.services.sarvam import sarvam_client
from backend.schemas.voice import VoiceTelemetry

logger = logging.getLogger("krishinetra.orchestrator")


def process_voice_query(
    text: Optional[str] = None,
    audio_bytes: Optional[bytes] = None,
    mime_type: str = "audio/webm",
    field_id: str = "P0001",
    language: str = "hi",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Complete end-to-end voice query processing pipeline.
    Accepts either raw audio_bytes or pre-transcribed text.
    """
    start_total_time = time.time()
    session = session_manager.get_or_create(session_id, field_id, language)
    transcript = (text or "").strip()

    stt_latency_ms = 0
    gemini_router_latency_ms = 0
    tool_latency_ms = 0
    gemini_response_latency_ms = 0
    tts_latency_ms = 0

    # 1. Speech to Text (if raw audio supplied)
    if audio_bytes and not transcript:
        stt_start = time.time()
        try:
            filename = "recording.webm" if "webm" in mime_type else "recording.wav"
            stt_text = sarvam_client.speech_to_text(
                audio_data=audio_bytes,
                language=language,
                filename=filename
            )
            if stt_text:
                transcript = stt_text.strip()
        except Exception as e:
            logger.warning(f"Sarvam STT exception: {e}")
        stt_latency_ms = int((time.time() - stt_start) * 1000)

    # If STT failed or audio was completely empty / unintelligible
    if not transcript:
        if audio_bytes:
            fallback_msg = (
                "मैं आपकी बात समझ नहीं पाया। कृपया दोबारा बोलें।"
                if language == "hi"
                else "I could not hear that clearly. Please try speaking again."
            )
        else:
            fallback_msg = (
                "नमस्ते! मैं कृषिनेत्र हूँ। आप मौसम, मिट्टी की नमी, या सिंचाई के बारे में पूछ सकते हैं।"
                if language == "hi"
                else "Namaste! I am KrishiNetra. You can ask about weather, soil moisture, or irrigation."
            )

        tts_start = time.time()
        audio_base64 = ""
        try:
            audio_base64 = sarvam_client.text_to_speech(
                text=fallback_msg,
                language=language,
                speaker="karun"
            )
        except Exception as err:
            logger.warning(f"TTS exception during fallback: {err}")
        tts_latency_ms = int((time.time() - tts_start) * 1000)

        total_latency = int((time.time() - start_total_time) * 1000)
        return {
            "success": True,
            "transcript": transcript or "(No audio detected)",
            "response": fallback_msg,
            "language": language,
            "tool_used": "none",
            "field_id": field_id,
            "data": {},
            "audio_base64": audio_base64,
            "session_id": session.session_id,
            "telemetry": {
                "stt_latency_ms": stt_latency_ms,
                "gemini_router_latency_ms": 0,
                "tool_latency_ms": 0,
                "gemini_response_latency_ms": 0,
                "tts_latency_ms": tts_latency_ms,
                "total_latency_ms": total_latency
            }
        }

    # 2. Context Retrieval
    context = session.get_prompt_context()

    # 3. Gemini 2.5 Flash Tool Router & Entity Extraction
    router_start = time.time()
    raw_tool_name, raw_tool_args = gemini_service.route_voice_query(
        transcript=transcript,
        context=context,
        field_id=field_id,
        language=language
    )
    gemini_router_latency_ms = int((time.time() - router_start) * 1000)

    # 4. Backend Validation & Field Authorization
    is_valid, tool_name, sanitized_args, auth_err = validate_and_authorize_tool_call(
        tool_name=raw_tool_name,
        args=raw_tool_args,
        session_field_id=field_id
    )
    effective_field_id = sanitized_args.get("field_id", field_id)

    # 5. Verified KrishiNetra Tool Execution
    tool_start = time.time()
    tool_result = execute_tool(
        tool_name=tool_name,
        field_id=effective_field_id,
        extra_args=sanitized_args
    )
    tool_latency_ms = int((time.time() - tool_start) * 1000)

    # 6. Gemini 2.5 Flash Grounded Response Synthesis
    gen_start = time.time()
    response_text = gemini_service.generate_farmer_response(
        question=transcript,
        tool_name=tool_name,
        tool_data=tool_result,
        language=language,
        context=context
    )
    gemini_response_latency_ms = int((time.time() - gen_start) * 1000)

    # 7. Text-to-Speech via Sarvam Bulbul v2
    tts_start = time.time()
    audio_base64 = ""
    try:
        audio_base64 = sarvam_client.text_to_speech(
            text=response_text,
            language=language,
            speaker="karun"
        )
    except Exception as e:
        logger.warning(f"Sarvam TTS exception: {e}")
    tts_latency_ms = int((time.time() - tts_start) * 1000)

    # 8. Session Context Update
    session.add_turn(
        user_text=transcript,
        assistant_text=response_text,
        intent=tool_name,
        tool_name=tool_name,
        tool_result=tool_result.get("data")
    )

    total_latency_ms = int((time.time() - start_total_time) * 1000)

    telemetry = {
        "stt_latency_ms": stt_latency_ms,
        "gemini_router_latency_ms": gemini_router_latency_ms,
        "tool_latency_ms": tool_latency_ms,
        "gemini_response_latency_ms": gemini_response_latency_ms,
        "tts_latency_ms": tts_latency_ms,
        "total_latency_ms": total_latency_ms
    }

    logger.info(
        f"Voice Query completed: intent={tool_name}, field={effective_field_id}, "
        f"total={total_latency_ms}ms (STT={stt_latency_ms}ms, Router={gemini_router_latency_ms}ms, "
        f"Tool={tool_latency_ms}ms, Gen={gemini_response_latency_ms}ms, TTS={tts_latency_ms}ms)"
    )

    return {
        "success": True,
        "transcript": transcript,
        "response": response_text,
        "language": language,
        "tool_used": tool_name,
        "field_id": effective_field_id,
        "data": tool_result.get("data", {}),
        "audio_base64": audio_base64,
        "session_id": session.session_id,
        "telemetry": telemetry
    }


def process_voice_query_text(
    text: str,
    field_id: str = "P0001",
    lang: str = "hi",
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Convenience helper for text-only voice queries."""
    return process_voice_query(
        text=text,
        field_id=field_id,
        language=lang,
        session_id=session_id
    )
