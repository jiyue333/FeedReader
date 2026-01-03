"""
Chat service for AI-powered conversations with RAG.
"""
import json
import logging
from typing import AsyncGenerator, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.schemas.chat_schemas import Citation, StreamEvent
from app.services.search_service import SearchService

settings = get_settings()
logger = logging.getLogger(__name__)


class ChatService:
    """Service for AI chat with RAG context."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.search_service = SearchService(db)

    async def stream_chat(
        self,
        message: str,
        scope: str = "global",
        include_web: bool = False,
        user_id: Optional[UUID] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response with citations.

        Args:
            message: User message
            scope: Search scope (global/current_view/web)
            include_web: Include web search results
            user_id: User ID for context filtering

        Yields:
            Server-sent events as JSON strings
        """
        try:
            # Step 1: Retrieve context via hybrid search
            logger.info(f"Retrieving context for message: {message[:50]}")
            citations = await self.search_service.hybrid_search(
                query=message,
                top_k=5,
                include_web=include_web or scope == "web",
                user_id=user_id,
            )

            # Step 2: Build RAG prompt
            context_text = self._build_context(citations)
            system_prompt = self._build_system_prompt()
            user_prompt = self._build_user_prompt(message, context_text)

            # Step 3: Stream LLM response
            if not settings.openai_api_key:
                error_event = StreamEvent(
                    type="error", error="OpenAI API key not configured"
                )
                yield f"data: {error_event.model_dump_json()}\n\n"
                return

            # Import OpenAI client
            from openai import AsyncOpenAI
            import asyncio

            client = AsyncOpenAI(api_key=settings.openai_api_key, base_url="http://127.0.0.1:8045/v1")

            try:
                # Stream chat completion
                stream = await client.chat.completions.create(
                    model="gemini-3-flash",  
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    stream=True,
                    temperature=0.7,
                    max_tokens=1000,
                )

                # Yield text chunks
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        text_event = StreamEvent(
                            type="text", content=chunk.choices[0].delta.content
                        )
                        yield f"data: {text_event.model_dump_json()}\n\n"

                # Yield citations
                for citation in citations:
                    citation_event = StreamEvent(type="citation", citation=citation)
                    yield f"data: {citation_event.model_dump_json()}\n\n"

                # Yield done event
                done_event = StreamEvent(type="done")
                yield f"data: {done_event.model_dump_json()}\n\n"

            except asyncio.CancelledError:
                logger.info("Chat stream cancelled by client")
                # Re-raise to properly close the connection
                raise
            except Exception as e:
                logger.error(f"Chat streaming error: {e}", exc_info=True)
                error_event = StreamEvent(type="error", error=str(e))
                yield f"data: {error_event.model_dump_json()}\n\n"
            finally:
                # Ensure client is closed
                await client.close()

        except asyncio.CancelledError:
            logger.info("Chat request cancelled")
            raise

    def _build_context(self, citations: list[Citation]) -> str:
        """Build context string from citations."""
        if not citations:
            return "No relevant context found."

        context_parts = []
        for idx, citation in enumerate(citations, 1):
            source_tag = f"[{citation.source_type.upper()}]"
            context_parts.append(
                f"{idx}. {source_tag} {citation.title}\n{citation.snippet}\n"
            )

        return "\n".join(context_parts)

    def _build_system_prompt(self) -> str:
        """Build system prompt for RAG."""
        return """You are an intelligent research assistant for AnkiFlow, a reading and knowledge management platform.

Your role is to help users understand and synthesize information from their documents and web sources.

Guidelines:
- Provide clear, concise, and accurate answers based on the provided context
- When referencing information, indicate the source type: [LOCAL] for user's documents or [WEB] for web sources
- If the context doesn't contain relevant information, say so honestly
- Maintain a professional yet friendly tone
- Focus on helping users extract insights and make connections between sources"""

    def _build_user_prompt(self, message: str, context: str) -> str:
        """Build user prompt with context."""
        return f"""Context from relevant sources:

{context}

---

User question: {message}

Please answer based on the context above. When referencing specific sources, use [LOCAL] or [WEB] tags."""
