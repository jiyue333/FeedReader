/**
 * 本地存储服务
 * 基于 LocalStorage 实现数据持久化
 */

import type { Feed, Article, Note, ChatHistory } from '../types';
import { StorageError } from '../utils/errors';

/**
 * 存储键常量
 */
const STORAGE_KEYS = {
  FEEDS: 'rss_reader_feeds',
  ARTICLES: 'rss_reader_articles',
  NOTES: 'rss_reader_notes',
  CHAT_HISTORIES: 'rss_reader_chat_histories',
} as const;

/**
 * 存储服务接口
 */
export interface IStorageService {
  // Feed operations
  getFeeds(): Feed[];
  saveFeed(feed: Feed): void;
  updateFeed(id: string, updates: Partial<Feed>): void;
  deleteFeed(id: string): void;

  // Article operations
  getArticles(feedId?: string): Article[];
  saveArticles(articles: Article[]): void;
  updateArticle(id: string, updates: Partial<Article>): void;

  // Note operations
  getNote(articleId: string): Note | null;
  saveNote(note: Note): void;
  deleteNote(articleId: string): void;

  // Chat history operations
  getChatHistory(articleId: string): ChatHistory | null;
  saveChatHistory(history: ChatHistory): void;
}

/**
 * 日期序列化辅助函数
 */
function serializeDates<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDates(value);
    }
    return serialized;
  }

  return obj;
}

/**
 * 日期反序列化辅助函数
 */
function deserializeDates<T>(obj: any, dateFields: string[]): T {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => deserializeDates(item, dateFields)) as any;
  }

  if (typeof obj === 'object') {
    const deserialized: any = { ...obj };
    for (const field of dateFields) {
      if (deserialized[field] && typeof deserialized[field] === 'string') {
        deserialized[field] = new Date(deserialized[field]);
      }
    }

    // 递归处理嵌套对象（如 ChatHistory 中的 messages）
    if (deserialized.messages && Array.isArray(deserialized.messages)) {
      deserialized.messages = deserialized.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : msg.timestamp,
      }));
    }

    // 递归处理 Note 中的 items
    if (deserialized.items && Array.isArray(deserialized.items)) {
      deserialized.items = deserialized.items.map((item: any) => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : item.createdAt,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : item.updatedAt,
      }));
    }

    return deserialized;
  }

  return obj;
}

/**
 * LocalStorage 存储服务实现
 */
export class StorageService implements IStorageService {
  // Feed operations
  getFeeds(): Feed[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDS);
      if (!data) return [];

      const feeds = JSON.parse(data);
      return deserializeDates<Feed[]>(feeds, [
        'lastFetchedAt',
        'createdAt',
        'updatedAt',
      ]);
    } catch (error) {
      console.error('Failed to get feeds from storage:', error);
      return [];
    }
  }

  saveFeed(feed: Feed): void {
    try {
      const feeds = this.getFeeds();
      const existingIndex = feeds.findIndex((f) => f.id === feed.id);

      if (existingIndex >= 0) {
        feeds[existingIndex] = feed;
      } else {
        feeds.push(feed);
      }

      const serialized = serializeDates(feeds);
      localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save feed to storage:', error);
      throw new StorageError('保存订阅源失败，请检查浏览器存储空间');
    }
  }

  updateFeed(id: string, updates: Partial<Feed>): void {
    try {
      const feeds = this.getFeeds();
      const index = feeds.findIndex((f) => f.id === id);

      if (index === -1) {
        throw new StorageError(`订阅源不存在 (ID: ${id})`);
      }

      feeds[index] = { ...feeds[index], ...updates, updatedAt: new Date() };

      const serialized = serializeDates(feeds);
      localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to update feed in storage:', error);
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('更新订阅源失败');
    }
  }

  deleteFeed(id: string): void {
    try {
      const feeds = this.getFeeds();
      const filtered = feeds.filter((f) => f.id !== id);

      const serialized = serializeDates(filtered);
      localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(serialized));

      // Also delete related articles
      const articles = this.getArticles();
      const filteredArticles = articles.filter((a) => a.feedId !== id);
      const serializedArticles = serializeDates(filteredArticles);
      localStorage.setItem(
        STORAGE_KEYS.ARTICLES,
        JSON.stringify(serializedArticles)
      );
    } catch (error) {
      console.error('Failed to delete feed from storage:', error);
      throw new StorageError('删除订阅源失败');
    }
  }

  // Article operations
  getArticles(feedId?: string): Article[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (!data) return [];

      const articles = JSON.parse(data);
      const deserialized = deserializeDates<Article[]>(articles, [
        'publishedAt',
        'createdAt',
      ]);

      if (feedId) {
        return deserialized.filter((a) => a.feedId === feedId);
      }

      return deserialized;
    } catch (error) {
      console.error('Failed to get articles from storage:', error);
      return [];
    }
  }

  saveArticles(articles: Article[]): void {
    try {
      const existingArticles = this.getArticles();
      const articleMap = new Map(existingArticles.map((a) => [a.id, a]));

      // Merge new articles with existing ones
      for (const article of articles) {
        articleMap.set(article.id, article);
      }

      const merged = Array.from(articleMap.values());
      const serialized = serializeDates(merged);
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save articles to storage:', error);
      throw new StorageError('保存文章失败');
    }
  }

  updateArticle(id: string, updates: Partial<Article>): void {
    try {
      const articles = this.getArticles();
      const index = articles.findIndex((a) => a.id === id);

      if (index === -1) {
        throw new StorageError(`文章不存在 (ID: ${id})`);
      }

      articles[index] = { ...articles[index], ...updates };

      const serialized = serializeDates(articles);
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to update article in storage:', error);
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('更新文章失败');
    }
  }

  // Note operations
  getNote(articleId: string): Note | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return null;

      const notes = JSON.parse(data);
      const deserialized = deserializeDates<Note[]>(notes, [
        'createdAt',
        'updatedAt',
      ]);

      return deserialized.find((n) => n.articleId === articleId) || null;
    } catch (error) {
      console.error('Failed to get note from storage:', error);
      return null;
    }
  }

  saveNote(note: Note): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      const notes: Note[] = data ? JSON.parse(data) : [];
      const deserialized = deserializeDates<Note[]>(notes, [
        'createdAt',
        'updatedAt',
      ]);

      const existingIndex = deserialized.findIndex(
        (n) => n.articleId === note.articleId
      );

      if (existingIndex >= 0) {
        deserialized[existingIndex] = note;
      } else {
        deserialized.push(note);
      }

      const serialized = serializeDates(deserialized);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save note to storage:', error);
      throw new StorageError('保存笔记失败');
    }
  }

  deleteNote(articleId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return;

      const notes = JSON.parse(data);
      const deserialized = deserializeDates<Note[]>(notes, [
        'createdAt',
        'updatedAt',
      ]);
      const filtered = deserialized.filter((n) => n.articleId !== articleId);

      const serialized = serializeDates(filtered);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to delete note from storage:', error);
      throw new StorageError('删除笔记失败');
    }
  }

  // Chat history operations
  getChatHistory(articleId: string): ChatHistory | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORIES);
      if (!data) return null;

      const histories = JSON.parse(data);
      const deserialized = deserializeDates<ChatHistory[]>(histories, [
        'createdAt',
        'updatedAt',
      ]);

      return deserialized.find((h) => h.articleId === articleId) || null;
    } catch (error) {
      console.error('Failed to get chat history from storage:', error);
      return null;
    }
  }

  saveChatHistory(history: ChatHistory): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORIES);
      const histories: ChatHistory[] = data ? JSON.parse(data) : [];
      const deserialized = deserializeDates<ChatHistory[]>(histories, [
        'createdAt',
        'updatedAt',
      ]);

      const existingIndex = deserialized.findIndex(
        (h) => h.articleId === history.articleId
      );

      if (existingIndex >= 0) {
        deserialized[existingIndex] = history;
      } else {
        deserialized.push(history);
      }

      const serialized = serializeDates(deserialized);
      localStorage.setItem(
        STORAGE_KEYS.CHAT_HISTORIES,
        JSON.stringify(serialized)
      );
    } catch (error) {
      console.error('Failed to save chat history to storage:', error);
      throw new StorageError('保存聊天历史失败');
    }
  }
}

/**
 * 导出单例实例
 */
export const storageService = new StorageService();
