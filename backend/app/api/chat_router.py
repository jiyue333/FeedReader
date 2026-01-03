"""
Chat API endpoints with streaming support.
"""
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.chat_schemas import ChatRequest
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """
    Stream AI chat response with RAG context.

    Args:
        request: Chat request with message and parameters
        db: Database session

    Returns:
        Server-sent events stream
    """
    logger.info(
        f"Chat request: message='{request.message[:50]}...', scope={request.scope}"
    )

    chat_service = ChatService(db)

    # Create streaming generator
    stream = chat_service.stream_chat(
        message=request.message,
        scope=request.scope,
        include_web=request.include_web,
        user_id=None,  # TODO: Get from auth context
    )

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
