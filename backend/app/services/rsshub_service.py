"""
RSSHub service for converting URLs to RSS feeds.
Supports popular Chinese and international websites.
"""
import re
from typing import Callable, Optional
from urllib.parse import urlparse

import httpx
import structlog

from app.core.config import get_settings
from app.services.rss_service import RSSService

settings = get_settings()
logger = structlog.get_logger()


# RSSHub route mapping rules
# Format: (hostname_pattern, path_regex, build_route_function)
RSSHUB_ROUTES = [
    # 知乎
    (r"zhihu\.com", r"^/question/(?P<id>\d+)", lambda m: f"/zhihu/question/{m['id']}"),
    (r"zhihu\.com", r"^/people/(?P<id>[^/]+)", lambda m: f"/zhihu/people/activities/{m['id']}"),
    
    # B站
    (r"bilibili\.com", r"^/video/(?P<bv>BV\w+)", lambda m: f"/bilibili/video/dynamic/{m['bv']}"),
    (r"bilibili\.com", r"^/@(?P<uid>[^/]+)", lambda m: f"/bilibili/user/dynamic/{m['uid']}"),
    (r"space\.bilibili\.com/(?P<uid>\d+)", r"", lambda m: f"/bilibili/user/dynamic/{m['uid']}"),
    
    # 微博
    (r"weibo\.com", r"^/u/(?P<uid>\d+)", lambda m: f"/weibo/user/{m['uid']}"),
    (r"weibo\.com", r"^/(?P<username>[^/]+)$", lambda m: f"/weibo/user/{m['username']}"),
    
    # Twitter/X
    (r"(twitter\.com|x\.com)", r"^/(?P<user>[^/]+)$", lambda m: f"/twitter/user/{m['user']}"),
    
    # 微信公众号（需要通过其他方式获取biz参数）
    # (r"mp\.weixin\.qq\.com", r"", lambda m: f"/wechat/mp/xxx"),
    
    # GitHub
    (r"github\.com", r"^/(?P<user>[^/]+)/(?P<repo>[^/]+)$", lambda m: f"/github/repos/{m['user']}/{m['repo']}"),
    (r"github\.com", r"^/(?P<user>[^/]+)$", lambda m: f"/github/user/followers/{m['user']}"),
    
    # 小红书
    (r"xiaohongshu\.com", r"^/user/profile/(?P<user_id>[^/]+)", lambda m: f"/xiaohongshu/user/{m['user_id']}"),
    
    # 豆瓣
    (r"douban\.com", r"^/people/(?P<userid>[^/]+)", lambda m: f"/douban/people/{m['userid']}"),
    
    # YouTube
    (r"youtube\.com", r"^/channel/(?P<id>[^/]+)", lambda m: f"/youtube/channel/{m['id']}"),
    (r"youtube\.com", r"^/@(?P<handle>[^/]+)", lambda m: f"/youtube/user/{m['handle']}"),
]


class RSSHubService:
    """Handles URL to RSS conversion via RSSHub."""
    
    def __init__(self):
        self.base_url = settings.rsshub_base_url.rstrip("/")
        self.timeout = settings.rsshub_timeout
        self.enabled = settings.rsshub_enabled
        self.rss_service = RSSService()
        self.logger = logger.bind(service="rsshub")
    
    def match_rsshub_route(self, url: str) -> Optional[str]:
        """
        Match URL to RSSHub route based on predefined rules.
        
        Args:
            url: Original URL
            
        Returns:
            RSSHub route path (e.g., "/zhihu/question/123") or None
        """
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.lower()
            path = parsed.path
            
            # Try each rule
            for host_pattern, path_pattern, build_fn in RSSHUB_ROUTES:
                # Check hostname match
                if not re.search(host_pattern, hostname):
                    continue
                
                # Check if there's a path pattern
                if path_pattern:
                    # Try to match path
                    path_match = re.match(path_pattern, path)
                    if path_match:
                        # Build route using matched groups
                        route = build_fn(path_match.groupdict())
                        self.logger.info(
                            "rsshub_route_matched",
                            url=url,
                            route=route
                        )
                        return route
                else:
                    # No path pattern, just hostname match
                    # Extract uid from hostname if present
                    host_match = re.search(host_pattern, hostname)
                    if host_match:
                        route = build_fn(host_match.groupdict())
                        self.logger.info(
                            "rsshub_route_matched",
                            url=url,
                            route=route
                        )
                        return route
            
            self.logger.debug("rsshub_no_route", url=url)
            return None
        
        except Exception as e:
            self.logger.warning("rsshub_route_match_error", url=url, error=str(e))
            return None
    
    async def fetch_entry_for_url(
        self,
        original_url: str
    ) -> tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """
        Try to fetch content for URL via RSSHub.
        
        Args:
            original_url: Original URL to fetch
            
        Returns:
            Tuple of (success, title, content, error_message)
        """
        if not self.enabled:
            return False, None, None, "RSSHub is disabled"
        
        # Match route
        route = self.match_rsshub_route(original_url)
        if not route:
            return False, None, None, "No RSSHub route found for this URL"
        
        # Construct RSSHub feed URL
        rsshub_url = f"{self.base_url}{route}"
        
        try:
            # Fetch RSS feed from RSSHub
            success, entries, error = await self.rss_service.fetch_feed(rsshub_url)
            
            if not success or not entries:
                self.logger.warning(
                    "rsshub_feed_fetch_failed",
                    rsshub_url=rsshub_url,
                    error=error
                )
                return False, None, None, error or "Failed to fetch RSSHub feed"
            
            # Try to find entry matching original URL
            # First try exact match
            for entry in entries:
                if entry.url and entry.url.strip() == original_url.strip():
                    self.logger.info(
                        "rsshub_entry_found_exact",
                        original_url=original_url,
                        entry_title=entry.title
                    )
                    return True, entry.title, entry.content or entry.summary, None
            
            # If no exact match, return the first entry (most recent)
            # This is useful for user/channel feeds where we want latest content
            if entries:
                entry = entries[0]
                self.logger.info(
                    "rsshub_entry_found_latest",
                    original_url=original_url,
                    entry_title=entry.title
                )
                return True, entry.title, entry.content or entry.summary, None
            
            return False, None, None, "No matching entry found in RSSHub feed"
        
        except Exception as e:
            error_msg = f"RSSHub fetch error: {str(e)}"
            self.logger.error(
                "rsshub_fetch_error",
                rsshub_url=rsshub_url,
                error=str(e)
            )
            return False, None, None, error_msg
