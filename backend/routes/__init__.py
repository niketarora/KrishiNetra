from fastapi import APIRouter
from backend.routes.agriculture import router as agriculture_router
from backend.routes.voice import router as voice_router
from backend.routes.avatar import router as avatar_router

router = APIRouter()
router.include_router(agriculture_router)
router.include_router(voice_router)
router.include_router(avatar_router)

__all__ = ["router", "agriculture_router", "voice_router", "avatar_router"]
