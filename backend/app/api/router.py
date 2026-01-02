"""
API router aggregation.
"""
from fastapi import APIRouter

from app.api.documents_router import router as documents_router
from app.api.health import router as health_router
from app.api.import_router import router as import_router

api_router = APIRouter()

# Include all routers
api_router.include_router(health_router)
api_router.include_router(import_router)
api_router.include_router(documents_router)
