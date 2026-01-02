"""
SQLAlchemy database models for AnkiFlow.

Core tables:
- users: User accounts
- sources: RSS/URL/PDF sources
- documents: Individual articles/documents
- document_chunks: Text chunks for embedding
- embeddings: Vector embeddings (pgvector)
- tags: Document tags
- document_tags: Many-to-many junction
- staging_items: Staging area items
- takeaways: Generated takeaway notes
- takeaway_sources: Takeaway source references
- anchors: Text anchors for citations
- takeaway_refs: Takeaway to anchor references
"""
from datetime import datetime
from typing import Optional
from uuid import uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import get_settings
from app.db.session import Base

settings = get_settings()

# Enums
import enum


class SourceType(str, enum.Enum):
    RSS = "rss"
    PDF = "pdf"
    URL = "url"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    sources: Mapped[list["Source"]] = relationship("Source", back_populates="user")
    staging_items: Mapped[list["StagingItem"]] = relationship(
        "StagingItem", back_populates="user"
    )
    takeaways: Mapped[list["Takeaway"]] = relationship("Takeaway", back_populates="user")


class Source(Base):
    """RSS/PDF/URL source model."""

    __tablename__ = "sources"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[SourceType] = mapped_column(
        Enum(SourceType), nullable=False, default=SourceType.RSS
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    icon_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_fetched_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sources")
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="source"
    )


class Document(Base):
    """Article/document model."""

    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    source_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus), default=DocumentStatus.PENDING, nullable=False
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_position: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="documents")
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk", back_populates="document"
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary="document_tags", back_populates="documents"
    )
    staging_items: Mapped[list["StagingItem"]] = relationship(
        "StagingItem", back_populates="document"
    )
    anchors: Mapped[list["Anchor"]] = relationship("Anchor", back_populates="document")

    # Indexes
    __table_args__ = (
        Index("ix_documents_source_id", "source_id"),
        Index("ix_documents_status", "status"),
        Index("ix_documents_published_at", "published_at"),
    )


class DocumentChunk(Base):
    """Text chunk for embedding/retrieval."""

    __tablename__ = "document_chunks"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    document_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    start_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    end_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
    embedding: Mapped[Optional["Embedding"]] = relationship(
        "Embedding", back_populates="chunk", uselist=False
    )

    __table_args__ = (
        Index("ix_document_chunks_document_id", "document_id"),
        UniqueConstraint("document_id", "chunk_index", name="uq_chunk_index"),
    )


class Embedding(Base):
    """Vector embedding for a chunk (pgvector)."""

    __tablename__ = "embeddings"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    chunk_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("document_chunks.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    vector = mapped_column(Vector(settings.embedding_dim), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    chunk: Mapped["DocumentChunk"] = relationship(
        "DocumentChunk", back_populates="embedding"
    )


class Tag(Base):
    """Document tag/label."""

    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)  # hex color
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    documents: Mapped[list["Document"]] = relationship(
        "Document", secondary="document_tags", back_populates="tags"
    )


class DocumentTag(Base):
    """Many-to-many junction table for documents and tags."""

    __tablename__ = "document_tags"

    document_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class StagingItem(Base):
    """Staging area item for research workflow."""

    __tablename__ = "staging_items"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    is_selected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="staging_items")
    document: Mapped["Document"] = relationship(
        "Document", back_populates="staging_items"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "document_id", name="uq_user_document_staging"),
        Index("ix_staging_items_user_id", "user_id"),
    )


class Takeaway(Base):
    """Generated takeaway/research note."""

    __tablename__ = "takeaways"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Auto-incrementing display ID (TK-0001)
    display_id: Mapped[int] = mapped_column(
        Integer, autoincrement=True, unique=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    prompt_template: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="takeaways")
    sources: Mapped[list["TakeawaySource"]] = relationship(
        "TakeawaySource", back_populates="takeaway"
    )
    refs: Mapped[list["TakeawayRef"]] = relationship(
        "TakeawayRef", back_populates="takeaway"
    )

    __table_args__ = (Index("ix_takeaways_user_id", "user_id"),)


class TakeawaySource(Base):
    """Source document references in a takeaway."""

    __tablename__ = "takeaway_sources"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    takeaway_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("takeaways.id", ondelete="CASCADE"),
        nullable=False,
    )
    document_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )
    source_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # "local" or "web"
    url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    takeaway: Mapped["Takeaway"] = relationship("Takeaway", back_populates="sources")


class Anchor(Base):
    """Text anchor for citation/highlighting."""

    __tablename__ = "anchors"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    document_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    start_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    end_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    context_before: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    context_after: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="anchors")
    refs: Mapped[list["TakeawayRef"]] = relationship("TakeawayRef", back_populates="anchor")

    __table_args__ = (Index("ix_anchors_document_id", "document_id"),)


class TakeawayRef(Base):
    """Reference from takeaway to anchor."""

    __tablename__ = "takeaway_refs"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    takeaway_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("takeaways.id", ondelete="CASCADE"),
        nullable=False,
    )
    anchor_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("anchors.id", ondelete="CASCADE"),
        nullable=False,
    )
    position_in_content: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # char offset in takeaway content
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    takeaway: Mapped["Takeaway"] = relationship("Takeaway", back_populates="refs")
    anchor: Mapped["Anchor"] = relationship("Anchor", back_populates="refs")

    __table_args__ = (
        UniqueConstraint("takeaway_id", "anchor_id", name="uq_takeaway_anchor"),
    )
