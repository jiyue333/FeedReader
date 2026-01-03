"""
API router aggregation.
"""
from fastapi import APIRouter

from app.api.chat_router import router as chat_router
from app.api.documents_router import router as documents_router
from app.api.health import router as health_router
from app.api.import_router import router as import_router
from app.api.search_router import router as search_router
from app.api.staging_router import router as staging_router

api_router = APIRouter()

# Include all routers
api_router.include_router(health_router)
api_router.include_router(import_router)
api_router.include_router(documents_router)
api_router.include_router(chat_router)
api_router.include_router(search_router)
api_router.include_router(staging_router)
