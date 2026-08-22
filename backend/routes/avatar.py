import logging
from fastapi import APIRouter

from backend.schemas.voice import AvatarCloseRequest
from backend.services.heygen import heygen_service

logger = logging.getLogger("krishinetra.routes.avatar")

router = APIRouter(tags=["HeyGen LiveAvatar"])


@router.post("/api/avatar/session")
def create_avatar_session():
    """Create short-lived streaming token for HeyGen LiveAvatar realtime session."""
    return heygen_service.create_streaming_token()


@router.post("/api/avatar/close")
def close_avatar_session(request: AvatarCloseRequest):
    """Close and cleanup an active HeyGen LiveAvatar session."""
    return heygen_service.close_streaming_session(request.session_id)
