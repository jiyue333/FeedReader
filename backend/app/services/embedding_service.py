"""
Embedding generation service using OpenAI API.
"""
from typing import Optional

from openai import AsyncOpenAI, OpenAIError

from app.core.config import get_settings

settings = get_settings()


class EmbeddingService:
    """Handles vector embedding generation for text chunks."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.openai_api_key
        if not self.api_key:
            raise ValueError("OpenAI API key is required for embedding service")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = settings.embedding_model
        self.dim = settings.embedding_dim
    
    async def generate_embedding(self, text: str) -> list[float]:
        """
        Generate vector embedding for a single text chunk.
        
        Args:
            text: Text chunk to embed
            
        Returns:
            Embedding vector as list of floats
            
        Raises:
            OpenAIError: If API call fails
        """
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")
        
        try:
            response = await self.client.embeddings.create(
                model=self.model,
                input=text,
                encoding_format="float"
            )
            
            embedding = response.data[0].embedding
            
            # Validate dimension
            if len(embedding) != self.dim:
                raise ValueError(
                    f"Embedding dimension mismatch: expected {self.dim}, got {len(embedding)}"
                )
            
            return embedding
        
        except OpenAIError as e:
            raise OpenAIError(f"Failed to generate embedding: {str(e)}") from e
    
    async def generate_embeddings_batch(
        self,
        texts: list[str],
        batch_size: int = 100
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple texts in batches.
        
        Args:
            texts: List of text chunks
            batch_size: Number of texts per API call (max 2048 for OpenAI)
            
        Returns:
            List of embedding vectors
            
        Raises:
            OpenAIError: If API call fails
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            raise ValueError("No valid texts to embed")
        
        embeddings = []
        
        for i in range(0, len(valid_texts), batch_size):
            batch = valid_texts[i:i + batch_size]
            
            try:
                response = await self.client.embeddings.create(
                    model=self.model,
                    input=batch,
                    encoding_format="float"
                )
                
                batch_embeddings = [item.embedding for item in response.data]
                embeddings.extend(batch_embeddings)
            
            except OpenAIError as e:
                raise OpenAIError(
                    f"Failed to generate batch embeddings (batch {i // batch_size + 1}): {str(e)}"
                ) from e
        
        return embeddings
