"""
RSS feed parsing and article extraction service.
"""
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

import feedparser
import structlog

logger = structlog.get_logger()


class RSSEntry:
    """Parsed RSS feed entry."""
    
    def __init__(
        self,
        title: str,
        url: Optional[str],
        content: Optional[str],
        summary: Optional[str],
        author: Optional[str],
        published_at: Optional[datetime],
    ):
        self.title = title
        self.url = url
        self.content = content
        self.summary = summary
        self.author = author
        self.published_at = published_at


class RSSService:
    """Handles RSS feed fetching and parsing."""
    
    def __init__(self):
        self.logger = logger.bind(service="rss")
    
    def validate_rss_url(self, url: str) -> bool:
        """
        Validate RSS feed URL format.
        
        Args:
            url: RSS feed URL
            
        Returns:
            True if URL format is valid
        """
        try:
            result = urlparse(url)
            return all([result.scheme in ("http", "https"), result.netloc])
        except Exception:
            return False
    
    async def fetch_feed(self, feed_url: str) -> tuple[bool, list[RSSEntry], Optional[str]]:
        """
        Fetch and parse RSS feed.
        
        Args:
            feed_url: URL of the RSS feed
            
        Returns:
            Tuple of (success, entries, error_message)
        """
        if not self.validate_rss_url(feed_url):
            return False, [], "Invalid RSS feed URL format"
        
        try:
            # feedparser is synchronous, but it's fast enough for MVP
            feed = feedparser.parse(feed_url)
            
            # Check for feed errors
            if hasattr(feed, "bozo") and feed.bozo:
                error_msg = getattr(feed, "bozo_exception", "Unknown parsing error")
                self.logger.warning(
                    "rss_feed_parse_warning",
                    url=feed_url,
                    error=str(error_msg)
                )
                # Continue anyway if we got some entries
                if not feed.entries:
                    return False, [], f"Failed to parse feed: {error_msg}"
            
            entries = []
            for entry in feed.entries:
                # Extract title (required)
                title = entry.get("title", "Untitled")
                
                # Extract URL
                url = entry.get("link")
                
                # Extract content (try multiple fields)
                content = None
                if hasattr(entry, "content") and entry.content:
                    content = entry.content[0].value
                elif hasattr(entry, "description"):
                    content = entry.description
                elif hasattr(entry, "summary"):
                    content = entry.summary
                
                # Extract summary
                summary = entry.get("summary")
                
                # Extract author
                author = entry.get("author")
                
                # Extract published date
                published_at = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    try:
                        published_at = datetime(*entry.published_parsed[:6])
                    except (TypeError, ValueError):
                        pass
                
                entries.append(RSSEntry(
                    title=title,
                    url=url,
                    content=content,
                    summary=summary,
                    author=author,
                    published_at=published_at,
                ))
            
            self.logger.info(
                "rss_feed_fetched",
                url=feed_url,
                entry_count=len(entries)
            )
            
            return True, entries, None
        
        except Exception as e:
            error_msg = f"Failed to fetch RSS feed: {str(e)}"
            self.logger.error("rss_fetch_error", url=feed_url, error=str(e))
            return False, [], error_msg
