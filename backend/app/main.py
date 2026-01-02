"""
AnkiFlow - Intelligent Reading Workbench API

Main FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import setup_exception_handlers
from app.core.logging import configure_logging, get_logger

settings = get_settings()

# Configure logging on import
configure_logging(level=settings.log_level, log_format=settings.log_format)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan context manager."""
    logger.info(
        "Starting AnkiFlow API",
        version=settings.app_version,
        environment=settings.environment,
    )
    yield
    logger.info("Shutting down AnkiFlow API")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Intelligent Reading Workbench - RSS + PDF + AI",
        docs_url=f"{settings.api_prefix}/docs",
        redoc_url=f"{settings.api_prefix}/redoc",
        openapi_url=f"{settings.api_prefix}/openapi.json",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    setup_exception_handlers(app)

    # Include API routes
    app.include_router(api_router, prefix=settings.api_prefix)

    return app


# Application instance for uvicorn
app = create_app()
