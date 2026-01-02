"""
Health check API endpoint.
"""
from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.response import APIResponse, HealthStatus

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=APIResponse[HealthStatus],
    summary="Health check",
    description="Check service health status",
)
async def health_check() -> APIResponse[HealthStatus]:
    """
    Return the health status of the service.
    
    Returns:
        APIResponse with health status information
    """
    settings = get_settings()
    status = HealthStatus(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
    )
    return APIResponse.ok(status)
