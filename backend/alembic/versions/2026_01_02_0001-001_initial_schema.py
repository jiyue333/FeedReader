"""Initial schema with all core tables and pgvector

Revision ID: 001
Revises: 
Create Date: 2026-01-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Enum types
source_type_enum = ENUM("rss", "pdf", "url", name="sourcetype", create_type=False)
document_status_enum = ENUM(
    "pending", "processing", "ready", "failed", name="documentstatus", create_type=False
)


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create enum types
    source_type_enum.create(op.get_bind(), checkfirst=True)
    document_status_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Create sources table
    op.create_table(
        "sources",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", source_type_enum, nullable=False, server_default="rss"),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("url", sa.String(2048), nullable=True),
        sa.Column("file_path", sa.String(512), nullable=True),
        sa.Column("icon_url", sa.String(512), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("last_fetched_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Create documents table
    op.create_table(
        "documents",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("url", sa.String(2048), nullable=True),
        sa.Column("author", sa.String(255), nullable=True),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("content", sa.Text, nullable=True),
        sa.Column("content_hash", sa.String(64), nullable=True),
        sa.Column("published_at", sa.DateTime, nullable=True),
        sa.Column("status", document_status_enum, nullable=False, server_default="pending"),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_starred", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("read_position", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_documents_source_id", "documents", ["source_id"])
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_documents_published_at", "documents", ["published_at"])

    # Create document_chunks table
    op.create_table(
        "document_chunks",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("start_offset", sa.Integer, nullable=False),
        sa.Column("end_offset", sa.Integer, nullable=False),
        sa.Column("token_count", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("document_id", "chunk_index", name="uq_chunk_index"),
    )
    op.create_index("ix_document_chunks_document_id", "document_chunks", ["document_id"])

    # Create embeddings table (pgvector)
    # Vector dimension is configurable, default 1536 for OpenAI ada-002
    op.create_table(
        "embeddings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("chunk_id", UUID(as_uuid=True), sa.ForeignKey("document_chunks.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("vector", Vector(1536), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    # Create HNSW index for fast approximate nearest neighbor search
    op.execute(
        "CREATE INDEX ix_embeddings_vector ON embeddings USING hnsw (vector vector_cosine_ops)"
    )

    # Create tags table
    op.create_table(
        "tags",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("color", sa.String(7), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Create document_tags junction table
    op.create_table(
        "document_tags",
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", UUID(as_uuid=True), sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Create staging_items table
    op.create_table(
        "staging_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("is_selected", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "document_id", name="uq_user_document_staging"),
    )
    op.create_index("ix_staging_items_user_id", "staging_items", ["user_id"])

    # Create takeaways table
    op.create_table(
        "takeaways",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("display_id", sa.Integer, autoincrement=True, unique=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("prompt_template", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_takeaways_user_id", "takeaways", ["user_id"])
    # Create sequence for display_id
    op.execute("CREATE SEQUENCE takeaway_display_id_seq START 1")
    op.execute("ALTER TABLE takeaways ALTER COLUMN display_id SET DEFAULT nextval('takeaway_display_id_seq')")

    # Create takeaway_sources table
    op.create_table(
        "takeaway_sources",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("takeaway_id", UUID(as_uuid=True), sa.ForeignKey("takeaways.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("url", sa.String(2048), nullable=True),
        sa.Column("title", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Create anchors table
    op.create_table(
        "anchors",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quote", sa.Text, nullable=False),
        sa.Column("start_offset", sa.Integer, nullable=False),
        sa.Column("end_offset", sa.Integer, nullable=False),
        sa.Column("context_before", sa.Text, nullable=True),
        sa.Column("context_after", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_anchors_document_id", "anchors", ["document_id"])

    # Create takeaway_refs table
    op.create_table(
        "takeaway_refs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("takeaway_id", UUID(as_uuid=True), sa.ForeignKey("takeaways.id", ondelete="CASCADE"), nullable=False),
        sa.Column("anchor_id", UUID(as_uuid=True), sa.ForeignKey("anchors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position_in_content", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("takeaway_id", "anchor_id", name="uq_takeaway_anchor"),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("takeaway_refs")
    op.drop_table("anchors")
    op.drop_table("takeaway_sources")
    op.execute("DROP SEQUENCE IF EXISTS takeaway_display_id_seq")
    op.drop_table("takeaways")
    op.drop_table("staging_items")
    op.drop_table("document_tags")
    op.drop_table("tags")
    op.execute("DROP INDEX IF EXISTS ix_embeddings_vector")
    op.drop_table("embeddings")
    op.drop_table("document_chunks")
    op.drop_table("documents")
    op.drop_table("sources")
    op.drop_table("users")

    # Drop enum types
    document_status_enum.drop(op.get_bind(), checkfirst=True)
    source_type_enum.drop(op.get_bind(), checkfirst=True)

    # Drop pgvector extension (optional, may want to keep it)
    # op.execute("DROP EXTENSION IF EXISTS vector")
