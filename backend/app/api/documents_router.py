"""
Documents API endpoints for listing and retrieving documents.
"""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import Document, DocumentChunk, Source
from app.schemas.document_schemas import (
    DocumentDetailResponse,
    DocumentListItem,
    DocumentListResponse,
    DocumentUpdateRequest,
)
from app.schemas.response import APIResponse

router = APIRouter(prefix="/documents", tags=["documents"])


# Dependency: Get current user ID from header
async def get_current_user_id(
    x_user_id: Annotated[str, Header()] = "00000000-0000-0000-0000-000000000001"
) -> UUID:
    """Get current user ID from header (dev-only fallback)."""
    try:
        return UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-User-Id header format"
        )


@router.get("", response_model=APIResponse[DocumentListResponse])
async def list_documents(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    is_starred: Optional[bool] = Query(None, description="Filter by starred status"),
    source_type: Optional[str] = Query(None, description="Filter by source type (rss/pdf/url)"),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    List documents with pagination and filters.
    """
    # Build query
    stmt = (
        select(Document, Source.name.label("source_name"), Source.type.label("source_type"))
        .join(Source, Document.source_id == Source.id)
        .where(Source.user_id == user_id)
        .order_by(Document.created_at.desc())
    )
    
    # Apply filters
    if status_filter:
        stmt = stmt.where(Document.status == status_filter)
    if is_read is not None:
        stmt = stmt.where(Document.is_read == is_read)
    if is_starred is not None:
        stmt = stmt.where(Document.is_starred == is_starred)
    if source_type:
        stmt = stmt.where(Source.type == source_type)
    
    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Paginate
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)
    
    # Execute
    result = await db.execute(stmt)
    rows = result.all()
    
    # Build response
    items = []
    for doc, source_name, source_type in rows:
        item = DocumentListItem(
            id=doc.id,
            title=doc.title,
            url=doc.url,
            author=doc.author,
            summary=doc.summary,
            status=doc.status.value,
            is_read=doc.is_read,
            is_starred=doc.is_starred,
            published_at=doc.published_at,
            created_at=doc.created_at,
            source_name=source_name,
            source_type=source_type.value,
        )
        items.append(item)
    
    has_more = (offset + page_size) < total
    
    return APIResponse(
        success=True,
        data=DocumentListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=has_more,
        )
    )


@router.get("/{document_id}", response_model=APIResponse[DocumentDetailResponse])
async def get_document(
    document_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed document information.
    """
    # Fetch document with source
    stmt = (
        select(Document, Source.name.label("source_name"), Source.type.label("source_type"))
        .join(Source, Document.source_id == Source.id)
        .where(Document.id == document_id, Source.user_id == user_id)
    )
    
    result = await db.execute(stmt)
    row = result.one_or_none()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    doc, source_name, source_type = row
    
    # Count chunks
    chunks_stmt = select(func.count()).select_from(DocumentChunk).where(DocumentChunk.document_id == document_id)
    chunks_result = await db.execute(chunks_stmt)
    chunks_count = chunks_result.scalar() or 0
    
    # Build response
    detail = DocumentDetailResponse(
        id=doc.id,
        title=doc.title,
        url=doc.url,
        author=doc.author,
        summary=doc.summary,
        content=doc.content,
        status=doc.status.value,
        is_read=doc.is_read,
        is_starred=doc.is_starred,
        read_position=doc.read_position,
        published_at=doc.published_at,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        source_id=doc.source_id,
        source_name=source_name,
        source_type=source_type.value,
        chunks_count=chunks_count,
    )
    
    return APIResponse(success=True, data=detail)


@router.patch("/{document_id}", response_model=APIResponse[dict])
async def update_document(
    document_id: UUID,
    data: DocumentUpdateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Update document metadata (read status, starred, position).
    """
    # Fetch document
    stmt = (
        select(Document)
        .join(Source, Document.source_id == Source.id)
        .where(Document.id == document_id, Source.user_id == user_id)
    )
    
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Update fields
    if data.is_read is not None:
        doc.is_read = data.is_read
    if data.is_starred is not None:
        doc.is_starred = data.is_starred
    if data.read_position is not None:
        doc.read_position = data.read_position
    
    await db.commit()
    
    return APIResponse(
        success=True,
        data={"message": "Document updated successfully"}
    )
