"""
URL content extraction service using trafilatura and BeautifulSoup.
"""
from typing import Optional
from urllib.parse import urlparse

import httpx
import structlog
import trafilatura
from bs4 import BeautifulSoup

logger = structlog.get_logger()


class URLService:
    """Handles web page content extraction."""
    
    def __init__(self):
        self.logger = logger.bind(service="url")
        self.timeout = 30.0  # seconds
    
    def validate_url(self, url: str) -> bool:
        """
        Validate URL format.
        
        Args:
            url: URL to validate
            
        Returns:
            True if URL format is valid
        """
        try:
            result = urlparse(url)
            return all([result.scheme in ("http", "https"), result.netloc])
        except Exception:
            return False
    
    async def fetch_and_extract(
        self,
        url: str
    ) -> tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """
        Fetch URL and extract main content.
        
        Args:
            url: URL to fetch
            
        Returns:
            Tuple of (success, title, content, error_message)
        """
        if not self.validate_url(url):
            return False, None, None, "Invalid URL format"
        
        try:
            # Fetch HTML content
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()
                html_content = response.text
            
            # Extract using trafilatura (best for article content)
            extracted_text = trafilatura.extract(
                html_content,
                include_links=False,
                include_images=False,
                include_tables=True,
            )
            
            if not extracted_text or len(extracted_text.strip()) < 100:
                # Fallback to BeautifulSoup if trafilatura fails
                self.logger.info("url_fallback_bs4", url=url)
                return await self._extract_with_bs4(html_content, url)
            
            # Extract title using trafilatura metadata
            metadata = trafilatura.extract_metadata(html_content)
            title = None
            if metadata:
                title = metadata.title or metadata.sitename
            
            # Fallback: extract title from HTML
            if not title:
                soup = BeautifulSoup(html_content, "lxml")
                title_tag = soup.find("title")
                if title_tag:
                    title = title_tag.get_text().strip()
            
            self.logger.info(
                "url_extracted",
                url=url,
                text_length=len(extracted_text)
            )
            
            return True, title, extracted_text, None
        
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP error {e.response.status_code}: {url}"
            self.logger.error("url_http_error", url=url, status=e.response.status_code)
            return False, None, None, error_msg
        
        except httpx.TimeoutException:
            error_msg = f"Request timeout ({self.timeout}s): {url}"
            self.logger.error("url_timeout", url=url)
            return False, None, None, error_msg
        
        except Exception as e:
            error_msg = f"Failed to fetch URL: {str(e)}"
            self.logger.error("url_fetch_error", url=url, error=str(e))
            return False, None, None, error_msg
    
    async def _extract_with_bs4(
        self,
        html_content: str,
        url: str
    ) -> tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """
        Fallback content extraction using BeautifulSoup.
        
        Args:
            html_content: Raw HTML content
            url: Original URL (for logging)
            
        Returns:
            Tuple of (success, title, content, error_message)
        """
        try:
            soup = BeautifulSoup(html_content, "lxml")
            
            # Extract title
            title = None
            title_tag = soup.find("title")
            if title_tag:
                title = title_tag.get_text().strip()
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Get text from main content areas
            main_content = None
            for tag in ["article", "main", "div[class*='content']"]:
                content_element = soup.find(tag)
                if content_element:
                    main_content = content_element.get_text()
                    break
            
            # Fallback to body
            if not main_content:
                body = soup.find("body")
                if body:
                    main_content = body.get_text()
            
            if not main_content or len(main_content.strip()) < 100:
                return False, None, None, "No sufficient content extracted"
            
            # Clean up whitespace
            lines = (line.strip() for line in main_content.splitlines())
            content = "\n".join(line for line in lines if line)
            
            self.logger.info(
                "url_extracted_bs4",
                url=url,
                text_length=len(content)
            )
            
            return True, title, content, None
        
        except Exception as e:
            error_msg = f"BeautifulSoup extraction failed: {str(e)}"
            self.logger.error("url_bs4_error", url=url, error=str(e))
            return False, None, None, error_msg
