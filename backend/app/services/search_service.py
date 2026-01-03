"""
Search service for hybrid retrieval (local + web).
"""
import asyncio
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.models import Document, DocumentChunk, Embedding
from app.schemas.chat_schemas import Citation
from app.services.embedding_service import EmbeddingService

settings = get_settings()
logger = logging.getLogger(__name__)


class SearchService:
    """Service for hybrid search (local vector + optional web)."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedding_service = EmbeddingService()

    async def search_local(
        self, query: str, top_k: int = 5, user_id: Optional[UUID] = None
    ) -> list[Citation]:
        """
        Search local documents using vector similarity.

        Args:
            query: Search query
            top_k: Number of results to return
            user_id: Optional user ID for filtering (future use)

        Returns:
            List of citations from local documents
        """
        try:
            # Generate query embedding
            query_vector = await self.embedding_service.generate_embedding(query)

            # Query pgvector for similar chunks
            # Using cosine distance: <=> operator
            stmt = (
                select(
                    DocumentChunk,
                    Embedding,
                    Document,
                    Embedding.vector.cosine_distance(query_vector).label("distance"),
                )
                .join(Embedding, DocumentChunk.id == Embedding.chunk_id)
                .join(Document, DocumentChunk.document_id == Document.id)
                .where(Document.status == "ready")
            )

            # Apply user filtering if user_id provided
            if user_id is not None:
                from app.models.models import Source
                stmt = stmt.join(Source, Document.source_id == Source.id).where(
                    Source.user_id == user_id
                )

            stmt = stmt.order_by("distance").limit(top_k)

            result = await self.db.execute(stmt)
            rows = result.all()

            citations = []
            for chunk, embedding, document, distance in rows:
                # Convert distance to similarity score (0-1, higher is better)
                score = 1.0 - distance if distance is not None else 0.0

                citation = Citation(
                    id=f"local-{chunk.id}",
                    title=document.title,
                    source_type="local",
                    document_id=document.id,
                    chunk_id=chunk.id,
                    url=document.url,
                    snippet=chunk.content[:300] + "..."
                    if len(chunk.content) > 300
                    else chunk.content,
                    score=round(score, 4),
                )
                citations.append(citation)

            logger.info(f"Local search found {len(citations)} results for query: {query[:50]}")
            return citations

        except Exception as e:
            logger.error(f"Local search failed: {e}", exc_info=True)
            return []

    async def search_web(self, query: str, top_k: int = 3) -> list[Citation]:
        """
        Search web using Serper API (if configured).

        Args:
            query: Search query
            top_k: Number of results to return

        Returns:
            List of citations from web search
        """
        if not settings.serper_api_key:
            logger.warning("Serper API key not configured, skipping web search")
            return []

        try:
            import httpx

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://google.serper.dev/search",
                    headers={
                        "X-API-KEY": settings.serper_api_key,
                        "Content-Type": "application/json",
                    },
                    json={"q": query, "num": top_k},
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

            citations = []
            for idx, result in enumerate(data.get("organic", [])[:top_k]):
                citation = Citation(
                    id=f"web-{idx}",
                    title=result.get("title", "Untitled"),
                    source_type="web",
                    url=result.get("link"),
                    snippet=result.get("snippet", ""),
                    score=None,  # Serper doesn't provide scores
                )
                citations.append(citation)

            logger.info(f"Web search found {len(citations)} results for query: {query[:50]}")
            return citations

        except Exception as e:
            logger.error(f"Web search failed: {e}", exc_info=True)
            return []

    async def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        include_web: bool = False,
        user_id: Optional[UUID] = None,
    ) -> list[Citation]:
        """
        Perform hybrid search (local + optional web).

        Args:
            query: Search query
            top_k: Total number of results to return
            include_web: Whether to include web search
            user_id: Optional user ID for filtering

        Returns:
            Combined list of citations
        """
        tasks = [self.search_local(query, top_k, user_id)]

        if include_web:
            # Allocate half of top_k to web results
            web_k = max(1, top_k // 2)
            tasks.append(self.search_web(query, web_k))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Combine results
        all_citations = []
        for result in results:
            if isinstance(result, list):
                all_citations.extend(result)
            else:
                logger.error(f"Search task failed: {result}")

        # Sort by score (local results) and limit to top_k
        all_citations.sort(key=lambda c: c.score or 0.0, reverse=True)
        return all_citations[:top_k]
