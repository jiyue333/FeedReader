"""
PDF text extraction service using PyMuPDF.
"""
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import structlog

logger = structlog.get_logger()


class PDFService:
    """Handles PDF text extraction."""
    
    def __init__(self):
        self.logger = logger.bind(service="pdf")
    
    def extract_text(self, file_path: Path) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Extract text content from PDF file.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Tuple of (success, extracted_text, error_message)
        """
        if not file_path.exists():
            return False, None, f"PDF file not found: {file_path}"
        
        if file_path.suffix.lower() != ".pdf":
            return False, None, f"File is not a PDF: {file_path}"
        
        try:
            doc = fitz.open(str(file_path))
            
            text_content = []
            page_count = doc.page_count
            
            for page_num in range(page_count):
                page = doc[page_num]
                page_text = page.get_text()
                if page_text.strip():
                    text_content.append(page_text)
            
            doc.close()
            
            if not text_content:
                self.logger.warning("pdf_empty", file_path=str(file_path))
                return False, None, "PDF contains no extractable text"
            
            full_text = "\n\n".join(text_content)
            
            self.logger.info(
                "pdf_extracted",
                file_path=str(file_path),
                page_count=page_count,
                text_length=len(full_text)
            )
            
            return True, full_text, None
        
        except fitz.FileDataError as e:
            error_msg = f"Corrupted or invalid PDF file: {str(e)}"
            self.logger.error("pdf_corrupt", file_path=str(file_path), error=str(e))
            return False, None, error_msg
        
        except Exception as e:
            error_msg = f"Failed to extract PDF text: {str(e)}"
            self.logger.error("pdf_extraction_error", file_path=str(file_path), error=str(e))
            return False, None, error_msg
    
    def get_metadata(self, file_path: Path) -> dict:
        """
        Extract PDF metadata.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dictionary with metadata (title, author, etc.)
        """
        metadata = {}
        
        try:
            doc = fitz.open(str(file_path))
            meta = doc.metadata
            
            metadata = {
                "title": meta.get("title", ""),
                "author": meta.get("author", ""),
                "subject": meta.get("subject", ""),
                "keywords": meta.get("keywords", ""),
                "creator": meta.get("creator", ""),
                "producer": meta.get("producer", ""),
                "page_count": doc.page_count,
            }
            
            doc.close()
        
        except Exception as e:
            self.logger.warning("pdf_metadata_error", file_path=str(file_path), error=str(e))
        
        return metadata
