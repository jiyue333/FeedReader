/**
 * 全局状态管理 Store
 * 使用 Zustand 实现
 */

import { create } from 'zustand';
import type { Feed, Article } from '../types';
import { storageService } from '../services/StorageService';

/**
 * 应用状态接口
 */
interface AppState {
  // Feeds 状态
  feeds: Feed[];
  
  // Articles 状态
  articles: Article[];
  
  // UI 状态
  activeFeedId?: string;
  
  // Feed Actions
  addFeed: (feed: Feed) => void;
  updateFeed: (id: string, updates: Partial<Feed>) => void;
  removeFeed: (id: string) => void;
  setFeeds: (feeds: Feed[]) => void;
  
  // Article Actions
  addArticles: (articles: Article[]) => void;
  markAsRead: (articleId: string) => void;
  setArticles: (articles: Article[]) => void;
  
  // UI Actions
  setActiveFeedId: (id?: string) => void;
  
  // 初始化方法
  initializeFromStorage: () => void;
  
  // 更新未读计数
  updateUnreadCounts: () => void;
}

/**
 * 创建 Zustand Store
 */
export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  feeds: [],
  articles: [],
  activeFeedId: undefined,
  
  // Feed Actions
  addFeed: (feed: Feed) => {
    set((state) => ({
      feeds: [...state.feeds, feed],
    }));
    
    // 持久化到 LocalStorage
    storageService.saveFeed(feed);
  },
  
  updateFeed: (id: string, updates: Partial<Feed>) => {
    set((state) => ({
      feeds: state.feeds.map((feed) =>
        feed.id === id ? { ...feed, ...updates, updatedAt: new Date() } : feed
      ),
    }));
    
    // 持久化到 LocalStorage
    storageService.updateFeed(id, updates);
  },
  
  removeFeed: (id: string) => {
    set((state) => ({
      feeds: state.feeds.filter((feed) => feed.id !== id),
      articles: state.articles.filter((article) => article.feedId !== id),
      activeFeedId: state.activeFeedId === id ? undefined : state.activeFeedId,
    }));
    
    // 从 LocalStorage 删除
    storageService.deleteFeed(id);
  },
  
  setFeeds: (feeds: Feed[]) => {
    set({ feeds });
  },
  
  // Article Actions
  addArticles: (articles: Article[]) => {
    set((state) => {
      // 使用 Map 去重，保留新文章
      const articleMap = new Map(state.articles.map((a) => [a.id, a]));
      
      for (const article of articles) {
        articleMap.set(article.id, article);
      }
      
      return {
        articles: Array.from(articleMap.values()),
      };
    });
    
    // 持久化到 LocalStorage
    storageService.saveArticles(articles);
    
    // 更新未读计数
    get().updateUnreadCounts();
  },
  
  markAsRead: (articleId: string) => {
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === articleId ? { ...article, isRead: true } : article
      ),
    }));
    
    // 持久化到 LocalStorage
    storageService.updateArticle(articleId, { isRead: true });
    
    // 更新未读计数
    get().updateUnreadCounts();
  },
  
  setArticles: (articles: Article[]) => {
    set({ articles });
  },
  
  // UI Actions
  setActiveFeedId: (id?: string) => {
    set({ activeFeedId: id });
  },
  
  // 初始化方法
  initializeFromStorage: () => {
    const feeds = storageService.getFeeds();
    const articles = storageService.getArticles();
    
    set({
      feeds,
      articles,
    });
    
    // 初始化后更新未读计数
    get().updateUnreadCounts();
  },
  
  // 更新未读计数
  updateUnreadCounts: () => {
    const { feeds, articles } = get();
    
    const updatedFeeds = feeds.map((feed) => {
      const unreadCount = articles.filter(
        (article) => article.feedId === feed.id && !article.isRead
      ).length;
      
      return { ...feed, unreadCount };
    });
    
    set({ feeds: updatedFeeds });
    
    // 持久化更新后的 feeds
    updatedFeeds.forEach((feed) => {
      storageService.updateFeed(feed.id, { unreadCount: feed.unreadCount });
    });
  },
}));
