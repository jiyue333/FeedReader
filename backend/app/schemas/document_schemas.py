"""
Pydantic schemas for document endpoints.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentListItem(BaseModel):
    """Schema for document in list view."""
    
    id: UUID
    title: str
    url: Optional[str]
    author: Optional[str]
    summary: Optional[str]
    status: str
    is_read: bool
    is_starred: bool
    published_at: Optional[datetime]
    created_at: datetime
    source_name: Optional[str]
    source_type: Optional[str]
    
    model_config = {"from_attributes": True}


class DocumentDetailResponse(BaseModel):
    """Schema for detailed document view."""
    
    id: UUID
    title: str
    url: Optional[str]
    author: Optional[str]
    summary: Optional[str]
    content: Optional[str]
    status: str
    is_read: bool
    is_starred: bool
    read_position: Optional[float]
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Related data
    source_id: UUID
    source_name: Optional[str]
    source_type: Optional[str]
    tags: list[str] = []
    chunks_count: int = 0
    
    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    """Schema for paginated document list."""
    
    items: list[DocumentListItem]
    total: int
    page: int
    page_size: int
    has_more: bool


class DocumentUpdateRequest(BaseModel):
    """Schema for updating document metadata."""
    
    is_read: Optional[bool] = None
    is_starred: Optional[bool] = None
    read_position: Optional[float] = Field(None, ge=0.0, le=1.0)
