"""
Staging area schemas.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class StagingItemCreate(BaseModel):
    """Request to add item to staging area."""

    document_id: UUID = Field(..., description="Document ID to add to staging")
    notes: Optional[str] = Field(None, description="Optional notes")


class StagingItemUpdate(BaseModel):
    """Request to update staging item."""

    is_selected: Optional[bool] = Field(None, description="Selection status")
    notes: Optional[str] = Field(None, description="Notes")


class StagingItemResponse(BaseModel):
    """Staging item response."""

    id: UUID = Field(..., description="Staging item ID")
    user_id: UUID = Field(..., description="User ID")
    document_id: UUID = Field(..., description="Document ID")
    is_selected: bool = Field(..., description="Selection status")
    notes: Optional[str] = Field(None, description="Notes")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Update timestamp")

    # Nested document info
    document_title: str = Field(..., description="Document title")
    document_url: Optional[str] = Field(None, description="Document URL")
    document_author: Optional[str] = Field(None, description="Document author")

    class Config:
        from_attributes = True


class StagingListResponse(BaseModel):
    """List of staging items."""

    items: list[StagingItemResponse] = Field(default_factory=list)
    total: int = Field(..., description="Total count")
    selected_count: int = Field(..., description="Number of selected items")
