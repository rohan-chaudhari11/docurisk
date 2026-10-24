from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.config import settings
from app.services.llm_provider import get_llm_provider

router = APIRouter(prefix="/api/ai", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    provider = get_llm_provider()
    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
        llm_provider=provider.provider_name,
        llm_configured=provider.is_configured()
    )
