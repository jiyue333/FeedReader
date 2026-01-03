"""
Search API endpoints.
"""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.chat_schemas import SearchRequest, SearchResponse
from app.schemas.response import APIResponse
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=APIResponse[SearchResponse])
async def search(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
) -> APIResponse[SearchResponse]:
    """
    Perform hybrid search (local + optional web).

    Args:
        request: Search request with query and parameters
        db: Database session

    Returns:
        Search results with citations
    """
    logger.info(f"Search request: query='{request.query}', scope={request.scope}")

    search_service = SearchService(db)

    # Determine if web search should be included
    include_web = request.include_web or request.scope == "web"

    # Perform hybrid search
    citations = await search_service.hybrid_search(
        query=request.query,
        top_k=request.top_k,
        include_web=include_web,
        user_id=None,  # TODO: Get from auth context
    )

    response_data = SearchResponse(
        query=request.query,
        citations=citations,
        total=len(citations),
    )

    return APIResponse(
        success=True,
        message=f"Found {len(citations)} results",
        data=response_data,
    )
