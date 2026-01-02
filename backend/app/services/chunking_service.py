"""
Document chunking service for text segmentation.
"""
from typing import Generator

import tiktoken

from app.core.config import get_settings

settings = get_settings()


class ChunkingService:
    """Handles text chunking for embedding generation."""
    
    def __init__(self):
        self.chunk_size = settings.chunk_size
        self.chunk_overlap = settings.chunk_overlap
        # Use cl100k_base encoding (GPT-4, text-embedding-3-small)
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def chunk_text(self, text: str) -> Generator[tuple[int, str, int, int], None, None]:
        """
        Split text into overlapping chunks based on token count.
        
        Args:
            text: Full document text
            
        Yields:
            Tuples of (chunk_index, chunk_text, start_offset, end_offset)
        """
        if not text or not text.strip():
            return
        
        tokens = self.encoding.encode(text)
        total_tokens = len(tokens)
        
        if total_tokens == 0:
            return
        
        chunk_index = 0
        start_idx = 0
        
        while start_idx < total_tokens:
            # Get chunk of tokens
            end_idx = min(start_idx + self.chunk_size, total_tokens)
            chunk_tokens = tokens[start_idx:end_idx]
            
            # Decode tokens back to text
            chunk_text = self.encoding.decode(chunk_tokens)
            
            # Calculate character offsets (approximate)
            # This is a simplified approach; for precise offsets, we'd need token-to-char mapping
            char_start = self._estimate_char_offset(text, tokens, start_idx)
            char_end = self._estimate_char_offset(text, tokens, end_idx)
            
            yield chunk_index, chunk_text, char_start, char_end
            
            chunk_index += 1
            
            # Move to next chunk with overlap
            # Ensure we always advance by at least 1 token to prevent infinite loops
            advance = max(1, self.chunk_size - self.chunk_overlap)
            start_idx += advance
    
    def _estimate_char_offset(self, text: str, all_tokens: list[int], token_idx: int) -> int:
        """
        Estimate character offset for a given token index.
        
        This is an approximation based on proportional token/character positions.
        """
        if token_idx == 0:
            return 0
        if token_idx >= len(all_tokens):
            return len(text)
        
        # Proportional estimate: (token_idx / total_tokens) * total_chars
        ratio = token_idx / len(all_tokens)
        return int(ratio * len(text))
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text.
        
        Args:
            text: Text to tokenize
            
        Returns:
            Token count
        """
        if not text:
            return 0
        return len(self.encoding.encode(text))
