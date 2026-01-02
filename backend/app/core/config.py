"""
Application configuration using Pydantic Settings.
Environment variables will be loaded from .env file.
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        # Support both backend/.env and root/.env
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = Field(default="AnkiFlow", description="Application name")
    app_version: str = Field(default="0.1.0", description="Application version")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", description="Deployment environment"
    )
    debug: bool = Field(default=False, description="Enable debug mode")

    # API
    api_prefix: str = Field(default="/api", description="API route prefix")
    cors_origins: list[str] = Field(
        default=["http://localhost:3000"], description="Allowed CORS origins"
    )

    # Database
    postgres_host: str = Field(..., description="PostgreSQL host")
    postgres_port: int = Field(default=5432, description="PostgreSQL port")
    postgres_user: str = Field(..., description="PostgreSQL user")
    postgres_password: str = Field(..., description="PostgreSQL password")
    postgres_db: str = Field(..., description="PostgreSQL database name")

    @computed_field
    @property
    def database_url(self) -> str:
        """Construct async database URL."""
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    @computed_field
    @property
    def sync_database_url(self) -> str:
        """Construct sync database URL for Alembic."""
        return str(
            PostgresDsn.build(
                scheme="postgresql",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    # Embedding model
    embedding_dim: int = Field(
        default=1536, description="Embedding vector dimension (OpenAI ada-002: 1536)"
    )
    embedding_model: str = Field(
        default="text-embedding-3-small", description="Embedding model name"
    )

    # OpenAI
    openai_api_key: str = Field(default="", description="OpenAI API key")

    # File Upload
    upload_dir: str = Field(
        default="backend/data/uploads", description="Directory for uploaded files"
    )
    max_upload_mb: int = Field(default=50, description="Maximum file upload size in MB")

    # Document Chunking
    chunk_size: int = Field(
        default=512, description="Chunk size in tokens for embedding"
    )
    chunk_overlap: int = Field(
        default=50, description="Overlap between chunks in tokens"
    )

    # Search API
    serper_api_key: str = Field(default="", description="Serper API key for web search")

    # RSSHub
    rsshub_enabled: bool = Field(
        default=True, description="Enable RSSHub for URL to RSS conversion"
    )
    rsshub_base_url: str = Field(
        default="https://rsshub.app", description="RSSHub instance base URL"
    )
    rsshub_timeout: float = Field(
        default=10.0, description="RSSHub request timeout in seconds"
    )

    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: Literal["json", "console"] = Field(
        default="console", description="Log output format"
    )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
