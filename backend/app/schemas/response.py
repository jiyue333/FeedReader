"""
Unified API response models and utilities.
"""
from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ErrorDetail(BaseModel):
    """Error detail for API responses."""

    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable error message")
    details: dict[str, Any] | None = Field(
        default=None, description="Additional error details"
    )


class APIResponse(BaseModel, Generic[DataT]):
    """Unified API response format."""

    success: bool = Field(..., description="Whether the request succeeded")
    data: DataT | None = Field(default=None, description="Response data")
    error: ErrorDetail | None = Field(default=None, description="Error details if any")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Response timestamp"
    )

    @classmethod
    def ok(cls, data: DataT) -> "APIResponse[DataT]":
        """Create a successful response."""
        return cls(success=True, data=data)

    @classmethod
    def fail(
        cls,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> "APIResponse[None]":
        """Create an error response."""
        return cls(
            success=False,
            error=ErrorDetail(code=code, message=message, details=details),
        )


class HealthStatus(BaseModel):
    """Health check response model."""

    status: str = Field(default="healthy", description="Service health status")
    version: str = Field(..., description="Application version")
    environment: str = Field(..., description="Deployment environment")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Check timestamp"
    )
