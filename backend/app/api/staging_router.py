"""
Staging area API endpoints.
"""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.response import APIResponse
from app.schemas.staging_schemas import (
    StagingItemCreate,
    StagingItemResponse,
    StagingItemUpdate,
    StagingListResponse,
)
from app.services.staging_service import StagingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/staging", tags=["staging"])

# TODO: Replace with actual user ID from auth
MOCK_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


@router.get("", response_model=APIResponse[StagingListResponse])
async def list_staging_items(
    db: AsyncSession = Depends(get_db),
) -> APIResponse[StagingListResponse]:
    """
    List all staging items for the current user.

    Returns:
        List of staging items with metadata
    """
    staging_service = StagingService(db)
    result = await staging_service.list_items(user_id=MOCK_USER_ID)

    return APIResponse(
        success=True,
        message=f"Retrieved {result.total} staging items",
        data=result,
    )


@router.post("", response_model=APIResponse[StagingItemResponse], status_code=status.HTTP_201_CREATED)
async def add_staging_item(
    create_data: StagingItemCreate,
    db: AsyncSession = Depends(get_db),
) -> APIResponse[StagingItemResponse]:
    """
    Add document to staging area.

    Args:
        create_data: Document ID and optional notes

    Returns:
        Created or updated staging item
    """
    staging_service = StagingService(db)
    result = await staging_service.add_item(
        user_id=MOCK_USER_ID, create_data=create_data
    )

    return APIResponse(
        success=True,
        message="Added to staging area",
        data=result,
    )


@router.patch("/{item_id}", response_model=APIResponse[StagingItemResponse])
async def update_staging_item(
    item_id: UUID,
    update_data: StagingItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> APIResponse[StagingItemResponse]:
    """
    Update staging item (selection status or notes).

    Args:
        item_id: Staging item ID
        update_data: Fields to update

    Returns:
        Updated staging item
    """
    staging_service = StagingService(db)
    result = await staging_service.update_item(
        user_id=MOCK_USER_ID, item_id=item_id, update_data=update_data
    )

    return APIResponse(
        success=True,
        message="Staging item updated",
        data=result,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_staging_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Remove item from staging area.

    Args:
        item_id: Staging item ID
    """
    staging_service = StagingService(db)
    await staging_service.remove_item(user_id=MOCK_USER_ID, item_id=item_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_staging(
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Clear all staging items for the current user.
    """
    staging_service = StagingService(db)
    await staging_service.clear_staging(user_id=MOCK_USER_ID)
