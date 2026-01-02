"""
Import API endpoints for RSS/PDF/URL ingestion.
"""
from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import Source, SourceType
from app.schemas.import_schemas import (
    PDFUploadResponse,
    RSSFetchResponse,
    RSSSourceCreate,
    RSSSourceResponse,
    URLImportRequest,
    URLImportResponse,
)
from app.schemas.response import APIResponse
from app.services.ingestion_orchestrator import IngestionOrchestrator
from app.services.pdf_service import PDFService
from app.services.rss_service import RSSService
from app.services.storage_service import FileStorage
from app.services.url_service import URLService

router = APIRouter(prefix="/import", tags=["import"])


# Dependency: Get current user ID from header (TODO: Replace with proper auth)
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


@router.post("/rss", response_model=APIResponse[RSSSourceResponse])
async def create_rss_source(
    data: RSSSourceCreate,
    background_tasks: BackgroundTasks,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new RSS source and optionally fetch articles immediately.
    """
    # Validate RSS URL
    rss_service = RSSService()
    if not rss_service.validate_rss_url(str(data.url)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RSS feed URL"
        )
    
    # Create source
    source = Source(
        user_id=user_id,
        type=SourceType.RSS,
        name=data.name,
        url=str(data.url),
        is_active=True,
    )
    
    db.add(source)
    await db.commit()
    await db.refresh(source)
    
    # Schedule immediate fetch if requested
    if data.fetch_immediately:
        background_tasks.add_task(fetch_rss_articles_task, source.id)
    
    return APIResponse(
        success=True,
        data=RSSSourceResponse.model_validate(source)
    )


@router.delete("/rss/{source_id}", response_model=APIResponse[dict])
async def delete_rss_source(
    source_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an RSS source.
    """
    # Find source
    stmt = select(Source).where(
        Source.id == source_id,
        Source.user_id == user_id,
        Source.type == SourceType.RSS
    )
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="RSS source not found"
        )
    
    # Delete source (CASCADE will handle documents)
    await db.delete(source)
    await db.commit()
    
    return APIResponse(
        success=True,
        data={"message": "RSS source deleted successfully"}
    )


@router.post("/rss/{source_id}/fetch", response_model=APIResponse[RSSFetchResponse])
async def fetch_rss_articles(
    source_id: UUID,
    background_tasks: BackgroundTasks,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually trigger RSS article fetch for a source.
    """
    # Find source
    stmt = select(Source).where(
        Source.id == source_id,
        Source.user_id == user_id,
        Source.type == SourceType.RSS
    )
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="RSS source not found"
        )
    
    # Execute fetch in background
    background_tasks.add_task(fetch_rss_articles_task, source_id)
    
    return APIResponse(
        success=True,
        data=RSSFetchResponse(
            source_id=source_id,
            success=True,
            articles_fetched=0,
            articles_created=0,
            articles_skipped=0,
            error=None
        )
    )


async def fetch_rss_articles_task(source_id: UUID):
    """Background task to fetch RSS articles."""
    from app.db.session import async_session_maker
    
    async with async_session_maker() as db:
        try:
            # Fetch source
            stmt = select(Source).where(Source.id == source_id)
            result = await db.execute(stmt)
            source = result.scalar_one_or_none()
            
            if not source or not source.url:
                return
            
            # Fetch RSS feed
            rss_service = RSSService()
            success, entries, error = await rss_service.fetch_feed(source.url)
            
            if not success:
                return
            
            # Ingest articles
            orchestrator = IngestionOrchestrator(db)
            articles_created = 0
            articles_skipped = 0
            
            for entry in entries:
                # Use content or summary
                content = entry.content or entry.summary or ""
                
                if not content:
                    continue
                
                # Create document
                document, is_new, error = await orchestrator.create_document(
                    source_id=source_id,
                    title=entry.title,
                    content=content,
                    url=entry.url,
                    author=entry.author,
                    summary=entry.summary,
                    published_at=entry.published_at,
                )
                
                if document and is_new:
                    articles_created += 1
                    # Process in background
                    await orchestrator.process_document(document.id)
                elif document:
                    articles_skipped += 1
            
            # Update last_fetched_at
            source.last_fetched_at = datetime.utcnow()
            await db.commit()
        
        except Exception as e:
            # Log error properly
            logger.error("rss_fetch_task_error", source_id=str(source_id), error=str(e))


@router.post("/pdf", response_model=APIResponse[PDFUploadResponse])
async def upload_pdf(
    file: UploadFile = File(...),
    custom_title: str | None = Form(None),
    background_tasks: BackgroundTasks = None,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a PDF file and extract text.
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Save file
    storage = FileStorage()
    try:
        file_path, file_id = storage.save_uploaded_file(
            user_id=user_id,
            file_content=file_content,
            original_filename=file.filename
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=str(e)
        )
    
    # Create PDF source
    source = Source(
        user_id=user_id,
        type=SourceType.PDF,
        name=custom_title or file.filename,
        file_path=file_path,
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    
    # Extract PDF text
    pdf_service = PDFService()
    abs_file_path = storage.get_file_path(file_path)
    success, text, error = pdf_service.extract_text(abs_file_path)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error or "Failed to extract PDF text"
        )
    
    # Get metadata for title
    metadata = pdf_service.get_metadata(abs_file_path)
    title = custom_title or metadata.get("title") or file.filename
    
    # Create document
    orchestrator = IngestionOrchestrator(db)
    document, is_new, doc_error = await orchestrator.create_document(
        source_id=source.id,
        title=title,
        content=text,
        author=metadata.get("author"),
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=doc_error or "Failed to create document"
        )
    
    # Process in background
    background_tasks.add_task(process_document_task, document.id)
    
    return APIResponse(
        success=True,
        data=PDFUploadResponse(
            document_id=document.id,
            title=title,
            status=document.status.value,
            file_path=file_path,
            text_length=len(text),
            chunks_created=0,  # Will be updated by background task
        )
    )


@router.post("/url", response_model=APIResponse[URLImportResponse])
async def import_url(
    data: URLImportRequest,
    background_tasks: BackgroundTasks,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Import content from a URL.
    Tries RSSHub first for supported sites, falls back to web scraping.
    """
    # Try RSSHub first for supported sites
    from app.services.rsshub_service import RSSHubService
    
    rsshub_service = RSSHubService()
    success, title, content, error = await rsshub_service.fetch_entry_for_url(str(data.url))
    
    # Fallback to web scraping if RSSHub doesn't support this URL
    if not success:
        logger.info(
            "url_import_fallback_to_scraping",
            url=str(data.url),
            rsshub_error=error
        )
        url_service = URLService()
        success, title, content, error = await url_service.fetch_and_extract(str(data.url))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error or "Failed to extract URL content"
        )
    
    # Create URL source
    source = Source(
        user_id=user_id,
        type=SourceType.URL,
        name=data.custom_title or title or str(data.url),
        url=str(data.url),
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    
    # Create document
    orchestrator = IngestionOrchestrator(db)
    document, is_new, doc_error = await orchestrator.create_document(
        source_id=source.id,
        title=data.custom_title or title or str(data.url),
        content=content,
        url=str(data.url),
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=doc_error or "Failed to create document"
        )
    
    # Process in background
    background_tasks.add_task(process_document_task, document.id)
    
    return APIResponse(
        success=True,
        data=URLImportResponse(
            document_id=document.id,
            title=document.title,
            url=str(data.url),
            status=document.status.value,
            text_length=len(content),
            chunks_created=0,  # Will be updated by background task
        )
    )


async def process_document_task(document_id: UUID):
    """Background task to process document (chunk + embed)."""
    from app.db.session import async_session_maker
    import structlog
    
    logger = structlog.get_logger()
    
    async with async_session_maker() as db:
        try:
            orchestrator = IngestionOrchestrator(db)
            await orchestrator.process_document(document_id)
        except Exception as e:
            logger.error("document_processing_error", document_id=str(document_id), error=str(e))


# Need to import datetime and logger
from datetime import datetime
import structlog

logger = structlog.get_logger()
