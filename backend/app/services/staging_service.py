"""
Staging area service for managing research workflow items.
"""
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models.models import Document, StagingItem
from app.schemas.staging_schemas import (
    StagingItemCreate,
    StagingItemResponse,
    StagingItemUpdate,
    StagingListResponse,
)

logger = logging.getLogger(__name__)


class StagingService:
    """Service for staging area operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_item(
        self, user_id: UUID, create_data: StagingItemCreate
    ) -> StagingItemResponse:
        """
        Add document to staging area.

        Args:
            user_id: User ID
            create_data: Staging item creation data

        Returns:
            Created staging item

        Raises:
            NotFoundError: If document doesn't exist
        """
        # Check if document exists and belongs to user (via source)
        from app.models.models import Source
        doc_stmt = (
            select(Document)
            .join(Source, Document.source_id == Source.id)
            .where(Document.id == create_data.document_id, Source.user_id == user_id)
        )
        doc_result = await self.db.execute(doc_stmt)
        document = doc_result.scalar_one_or_none()

        if not document:
            raise NotFoundError(
                f"Document {create_data.document_id} not found or access denied"
            )

        # Check if already in staging (unique constraint: user_id + document_id)
        existing_stmt = select(StagingItem).where(
            StagingItem.user_id == user_id,
            StagingItem.document_id == create_data.document_id,
        )
        existing_result = await self.db.execute(existing_stmt)
        existing = existing_result.scalar_one_or_none()

        if existing:
            # Update existing item
            existing.notes = create_data.notes
            await self.db.commit()
            await self.db.refresh(existing)
            logger.info(f"Updated existing staging item: {existing.id}")
            return self._to_response(existing, document)

        # Create new staging item
        staging_item = StagingItem(
            user_id=user_id,
            document_id=create_data.document_id,
            notes=create_data.notes,
            is_selected=False,
        )

        self.db.add(staging_item)
        await self.db.commit()
        await self.db.refresh(staging_item)

        logger.info(f"Added document {create_data.document_id} to staging")
        return self._to_response(staging_item, document)

    async def list_items(self, user_id: UUID) -> StagingListResponse:
        """
        List all staging items for a user.

        Args:
            user_id: User ID

        Returns:
            List of staging items with metadata
        """
        stmt = (
            select(StagingItem, Document)
            .join(Document, StagingItem.document_id == Document.id)
            .where(StagingItem.user_id == user_id)
            .order_by(StagingItem.created_at.desc())
        )

        result = await self.db.execute(stmt)
        rows = result.all()

        items = [self._to_response(staging_item, document) for staging_item, document in rows]

        selected_count = sum(1 for item in items if item.is_selected)

        return StagingListResponse(
            items=items,
            total=len(items),
            selected_count=selected_count,
        )

    async def update_item(
        self, user_id: UUID, item_id: UUID, update_data: StagingItemUpdate
    ) -> StagingItemResponse:
        """
        Update staging item.

        Args:
            user_id: User ID
            item_id: Staging item ID
            update_data: Update data

        Returns:
            Updated staging item

        Raises:
            NotFoundError: If item doesn't exist or doesn't belong to user
        """
        stmt = (
            select(StagingItem, Document)
            .join(Document, StagingItem.document_id == Document.id)
            .where(StagingItem.id == item_id, StagingItem.user_id == user_id)
        )

        result = await self.db.execute(stmt)
        row = result.one_or_none()

        if not row:
            raise NotFoundError(f"Staging item {item_id} not found")

        staging_item, document = row

        # Update fields
        if update_data.is_selected is not None:
            staging_item.is_selected = update_data.is_selected
        if update_data.notes is not None:
            staging_item.notes = update_data.notes

        await self.db.commit()
        await self.db.refresh(staging_item)

        logger.info(f"Updated staging item {item_id}")
        return self._to_response(staging_item, document)

    async def remove_item(self, user_id: UUID, item_id: UUID) -> None:
        """
        Remove item from staging area.

        Args:
            user_id: User ID
            item_id: Staging item ID

        Raises:
            NotFoundError: If item doesn't exist or doesn't belong to user
        """
        stmt = select(StagingItem).where(
            StagingItem.id == item_id, StagingItem.user_id == user_id
        )

        result = await self.db.execute(stmt)
        staging_item = result.scalar_one_or_none()

        if not staging_item:
            raise NotFoundError(f"Staging item {item_id} not found")

        await self.db.delete(staging_item)
        await self.db.commit()

        logger.info(f"Removed staging item {item_id}")

    async def clear_staging(self, user_id: UUID) -> int:
        """
        Clear all staging items for a user.

        Args:
            user_id: User ID

        Returns:
            Number of items removed
        """
        stmt = select(StagingItem).where(StagingItem.user_id == user_id)
        result = await self.db.execute(stmt)
        items = result.scalars().all()

        count = len(items)
        for item in items:
            await self.db.delete(item)

        await self.db.commit()

        logger.info(f"Cleared {count} staging items for user {user_id}")
        return count

    def _to_response(
        self, staging_item: StagingItem, document: Document
    ) -> StagingItemResponse:
        """Convert staging item to response model."""
        return StagingItemResponse(
            id=staging_item.id,
            user_id=staging_item.user_id,
            document_id=staging_item.document_id,
            is_selected=staging_item.is_selected,
            notes=staging_item.notes,
            created_at=staging_item.created_at,
            updated_at=staging_item.updated_at,
            document_title=document.title,
            document_url=document.url,
            document_author=document.author,
        )
