import type { Feed, Article } from '../types';

/**
 * Calculate unread count for a feed based on articles
 */
export function calculateUnreadCount(
  feedId: string,
  articles: Article[]
): number {
  return articles.filter((a) => a.feedId === feedId && !a.isRead).length;
}

/**
 * Check if a URL is valid RSS feed format
 */
export function isValidFeedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(markdown: string): Array<{
  level: number;
  text: string;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  return headings;
}

/**
 * Check if a string is only whitespace
 */
export function isWhitespaceOnly(str: string): boolean {
  return str.trim().length === 0 && str.length > 0;
}

/**
 * Merge articles without duplicates
 */
export function mergeArticles(
  existing: Article[],
  newArticles: Article[]
): Article[] {
  const existingIds = new Set(existing.map((a) => a.id));
  const uniqueNew = newArticles.filter((a) => !existingIds.has(a.id));
  return [...existing, ...uniqueNew];
}

/**
 * Update feed unread counts based on articles
 */
export function updateFeedUnreadCounts(
  feeds: Feed[],
  articles: Article[]
): Feed[] {
  return feeds.map((feed) => ({
    ...feed,
    unreadCount: calculateUnreadCount(feed.id, articles),
  }));
}

/**
 * Check if two arrays have the same elements (order-independent)
 */
export function haveSameElements<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

/**
 * Create a deep copy of an object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
