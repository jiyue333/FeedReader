"""
Chat and search schemas for AI interaction.
"""
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class Citation(BaseModel):
    """Citation reference from search results."""

    id: str = Field(..., description="Unique citation ID")
    title: str = Field(..., description="Document/page title")
    source_type: Literal["local", "web"] = Field(..., description="Source type")
    document_id: Optional[UUID] = Field(None, description="Document ID for local sources")
    chunk_id: Optional[UUID] = Field(None, description="Chunk ID for local sources")
    url: Optional[str] = Field(None, description="URL for web sources")
    snippet: str = Field(..., description="Relevant text excerpt")
    score: Optional[float] = Field(None, description="Relevance score")


class SearchRequest(BaseModel):
    """Search request for hybrid retrieval."""

    query: str = Field(..., description="Search query", min_length=1, max_length=1000)
    scope: Literal["global", "current_view", "web"] = Field(
        default="global", description="Search scope"
    )
    top_k: int = Field(default=5, description="Number of results to return", ge=1, le=20)
    include_web: bool = Field(default=False, description="Include web search results")


class SearchResponse(BaseModel):
    """Search response with citations."""

    query: str = Field(..., description="Original query")
    citations: list[Citation] = Field(default_factory=list, description="Search results")
    total: int = Field(..., description="Total number of results")


class ChatRequest(BaseModel):
    """Chat request for AI interaction."""

    message: str = Field(..., description="User message", min_length=1, max_length=5000)
    scope: Literal["global", "current_view", "web"] = Field(
        default="global", description="Search scope for context"
    )
    include_web: bool = Field(default=False, description="Include web search in context")
    conversation_id: Optional[str] = Field(
        None, description="Conversation ID for context"
    )


class StreamEvent(BaseModel):
    """Server-sent event for streaming chat."""

    type: Literal["text", "citation", "done", "error"] = Field(
        ..., description="Event type"
    )
    content: Optional[str] = Field(None, description="Text content for 'text' events")
    citation: Optional[Citation] = Field(
        None, description="Citation for 'citation' events"
    )
    error: Optional[str] = Field(None, description="Error message for 'error' events")
