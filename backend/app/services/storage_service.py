"""
File storage service for uploaded documents (PDFs).
"""
import os
import shutil
from pathlib import Path
from uuid import UUID, uuid4

from app.core.config import get_settings

settings = get_settings()


class FileStorage:
    """Handles file storage operations for uploaded documents."""
    
    def __init__(self):
        self.base_dir = Path(settings.upload_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def save_uploaded_file(
        self,
        user_id: UUID,
        file_content: bytes,
        original_filename: str
    ) -> tuple[str, str]:
        """
        Save an uploaded file to user-specific directory.
        
        Args:
            user_id: User ID for directory organization
            file_content: Binary file content
            original_filename: Original filename (for extension extraction)
            
        Returns:
            Tuple of (file_path, file_id) where file_path is relative to backend/
            
        Raises:
            ValueError: If file is too large
        """
        # Check size limit
        max_bytes = settings.max_upload_mb * 1024 * 1024
        if len(file_content) > max_bytes:
            raise ValueError(
                f"File size ({len(file_content)} bytes) exceeds limit ({max_bytes} bytes)"
            )
        
        # Create user directory
        user_dir = self.base_dir / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique file ID and preserve extension
        file_id = str(uuid4())
        ext = Path(original_filename).suffix.lower()
        filename = f"{file_id}{ext}"
        file_path = user_dir / filename
        
        # Write file
        file_path.write_bytes(file_content)
        
        # Return relative path from backend/
        relative_path = file_path.relative_to(Path.cwd())
        return str(relative_path), file_id
    
    def get_file_path(self, relative_path: str) -> Path:
        """
        Get absolute path for a stored file.
        
        Args:
            relative_path: Relative path from backend/
            
        Returns:
            Absolute Path object
        """
        return Path.cwd() / relative_path
    
    def delete_file(self, relative_path: str) -> bool:
        """
        Delete a stored file.
        
        Args:
            relative_path: Relative path from backend/
            
        Returns:
            True if deleted, False if file doesn't exist
        """
        file_path = self.get_file_path(relative_path)
        if file_path.exists():
            file_path.unlink()
            return True
        return False
