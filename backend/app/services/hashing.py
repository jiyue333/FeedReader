"""
Content hashing utilities for document deduplication.
"""
import hashlib


def compute_content_hash(content: str) -> str:
    """
    Compute SHA-256 hash of document content for deduplication.
    
    Args:
        content: Document text content
        
    Returns:
        Hexadecimal hash string (64 characters)
    """
    if not content:
        return ""
    
    # Normalize whitespace and lowercase for consistent hashing
    normalized = " ".join(content.lower().split())
    
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
