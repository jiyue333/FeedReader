"""
Document ingestion orchestrator service.
Coordinates the full pipeline: source → document → chunks → embeddings.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    Document,
    DocumentChunk,
    DocumentStatus,
    Embedding,
    Source,
    SourceType,
)
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.hashing import compute_content_hash

logger = structlog.get_logger()


class IngestionOrchestrator:
    """Orchestrates document ingestion,chunking, and embedding."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.chunking_service = ChunkingService()
        self.embedding_service = None  # Lazy init to avoid API key requirement
        self.logger = logger.bind(service="ingestion")
    
    async def create_document(
        self,
        source_id: UUID,
        title: str,
        content: str,
        url: Optional[str] = None,
        author: Optional[str] = None,
        summary: Optional[str] = None,
        published_at: Optional[datetime] = None,
    ) -> tuple[Optional[Document], bool, Optional[str]]:
        """
        Create a document with deduplication check.
        
        Args:
            source_id: Source ID
            title: Document title
            content: Document content
            url: Optional URL
            author: Optional author
            summary: Optional summary
            published_at: Optional publication date
            
        Returns:
            Tuple of (document, is_new, error_message)
            - document: Created or existing document
            - is_new: True if newly created, False if duplicate
            - error_message: Error description if failed
        """
        try:
            # Compute content hash for deduplication
            content_hash = compute_content_hash(content)
            
            if not content_hash:
                return None, False, "Empty content cannot be ingested"
            
            # Check for duplicate within THIS source (user isolation)
            stmt = select(Document).where(
                Document.source_id == source_id,
                Document.content_hash == content_hash
            )
            result = await self.db.execute(stmt)
            existing_doc = result.scalar_one_or_none()
            
            if existing_doc:
                self.logger.info(
                    "document_duplicate_skipped",
                    content_hash=content_hash,
                    existing_id=str(existing_doc.id)
                )
                return existing_doc, False, None
            
            # Create new document
            document = Document(
                source_id=source_id,
                title=title,
                url=url,
                author=author,
                summary=summary,
                content=content,
                content_hash=content_hash,
                published_at=published_at,
                status=DocumentStatus.PENDING,
            )
            
            self.db.add(document)
            await self.db.commit()
            await self.db.refresh(document)
            
            self.logger.info(
                "document_created",
                document_id=str(document.id),
                title=title
            )
            
            return document, True, None
        
        except Exception as e:
            await self.db.rollback()
            error_msg = f"Failed to create document: {str(e)}"
            self.logger.error("document_creation_error", error=str(e))
            return None, False, error_msg
    
    async def process_document(
        self,
        document_id: UUID
    ) -> tuple[bool, int, Optional[str]]:
        """
        Process document: chunk + embed.
        
        Args:
            document_id: Document ID to process
            
        Returns:
            Tuple of (success, chunks_created, error_message)
        """
        try:
            # Fetch document
            stmt = select(Document).where(Document.id == document_id)
            result = await self.db.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                return False, 0, "Document not found"
            
            if not document.content:
                document.status = DocumentStatus.FAILED
                await self.db.commit()
                return False, 0, "Document has no content"
            
            # Update status to processing
            document.status = DocumentStatus.PROCESSING
            await self.db.commit()
            
            # Chunk the document
            chunks = list(self.chunking_service.chunk_text(document.content))
            
            if not chunks:
                document.status = DocumentStatus.FAILED
                await self.db.commit()
                return False, 0, "No chunks generated (content may be too short)"
            
            # Create chunk records
            chunk_objects = []
            chunk_texts = []
            
            for chunk_idx, chunk_text, start_offset, end_offset in chunks:
                token_count = self.chunking_service.count_tokens(chunk_text)
                
                chunk_obj = DocumentChunk(
                    document_id=document_id,
                    chunk_index=chunk_idx,
                    content=chunk_text,
                    start_offset=start_offset,
                    end_offset=end_offset,
                    token_count=token_count,
                )
                chunk_objects.append(chunk_obj)
                chunk_texts.append(chunk_text)
            
            # Save chunks
            self.db.add_all(chunk_objects)
            await self.db.commit()
            
            # Refresh to get IDs
            for chunk_obj in chunk_objects:
                await self.db.refresh(chunk_obj)
            
            # Generate embeddings (lazy init)
            try:
                if self.embedding_service is None:
                    self.embedding_service = EmbeddingService()
                
                embeddings = await self.embedding_service.generate_embeddings_batch(chunk_texts)
                
                # Create embedding records
                embedding_objects = []
                for chunk_obj, embedding_vector in zip(chunk_objects, embeddings):
                    embedding_obj = Embedding(
                        chunk_id=chunk_obj.id,
                        vector=embedding_vector,
                        model=self.embedding_service.model,
                    )
                    embedding_objects.append(embedding_obj)
                
                self.db.add_all(embedding_objects)
                await self.db.commit()
                
                # Update status to ready
                document.status = DocumentStatus.READY
                await self.db.commit()
                
                self.logger.info(
                    "document_processed",
                    document_id=str(document_id),
                    chunks_count=len(chunks),
                    embeddings_count=len(embeddings)
                )
                
                return True, len(chunks), None
            
            except Exception as e:
                # Embedding failed, but keep chunks
                document.status = DocumentStatus.FAILED
                await self.db.commit()
                
                error_msg = f"Embedding generation failed: {str(e)}"
                self.logger.error(
                    "embedding_error",
                    document_id=str(document_id),
                    error=str(e)
                )
                return False, len(chunks), error_msg
        
        except Exception as e:
            await self.db.rollback()
            
            # Try to update status
            try:
                stmt = select(Document).where(Document.id == document_id)
                result = await self.db.execute(stmt)
                document = result.scalar_one_or_none()
                if document:
                    document.status = DocumentStatus.FAILED
                    await self.db.commit()
            except:
                pass
            
            error_msg = f"Document processing failed: {str(e)}"
            self.logger.error("processing_error", document_id=str(document_id), error=str(e))
            return False, 0, error_msg
