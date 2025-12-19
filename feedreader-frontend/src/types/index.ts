/**
 * 数据模型类型定义
 */

/**
 * 订阅源
 */
export interface Feed {
  id: string;
  title: string;
  url: string;
  siteUrl?: string;
  description?: string;
  iconUrl?: string;
  unreadCount: number;
  lastFetchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 文章
 */
export interface Article {
  id: string;
  feedId: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  url: string;
  publishedAt: Date;
  isRead: boolean;
  createdAt: Date;
}

/**
 * 单条笔记项
 */
export interface NoteItem {
  id: string;
  content: string;
  quotedText?: string; // 引用的文章文字
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 笔记集合（一篇文章的所有笔记）
 */
export interface Note {
  id: string;
  articleId: string;
  items: NoteItem[]; // 多条笔记
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * 聊天历史
 */
export interface ChatHistory {
  id: string;
  articleId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
