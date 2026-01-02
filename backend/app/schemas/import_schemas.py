"""
Pydantic schemas for import endpoints (RSS/PDF/URL).
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


# RSS Schemas

class RSSSourceCreate(BaseModel):
    """Request schema for creating RSS source."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Feed name")
    url: HttpUrl = Field(..., description="RSS feed URL")
    fetch_immediately: bool = Field(
        default=True,
        description="Whether to fetch articles immediately after creation"
    )


class RSSSourceResponse(BaseModel):
    """Response schema for RSS source."""
    
    id: UUID
    user_id: UUID
    name: str
    url: str
    is_active: bool
    last_fetched_at: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class RSSFetchResponse(BaseModel):
    """Response schema for RSS fetch operation."""
    
    source_id: UUID
    success: bool
    articles_fetched: int
    articles_created: int
    articles_skipped: int
    error: Optional[str]


# PDF Schemas

class PDFUploadResponse(BaseModel):
    """Response schema for PDF upload."""
    
    document_id: UUID
    title: str
    status: str
    file_path: str
    text_length: int
    chunks_created: int


# URL Schemas

class URLImportRequest(BaseModel):
    """Request schema for URL import."""
    
    url: HttpUrl = Field(..., description="URL to import")
    custom_title: Optional[str] = Field(
        None,
        max_length=512,
        description="Custom title (if not provided, extracted from page)"
    )


class URLImportResponse(BaseModel):
    """Response schema for URL import."""
    
    document_id: UUID
    title: str
    url: str
    status: str
    text_length: int
    chunks_created: int


# Document Status

class DocumentStatusResponse(BaseModel):
    """Response schema for document processing status."""
    
    document_id: UUID
    status: str  # pending, processing, ready, failed
    chunks_count: int
    embeddings_count: int
    error: Optional[str]
