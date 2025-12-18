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
    try {
      storageService.saveFeed(feed);
    } catch (error) {
      console.error('Failed to save feed:', error);
      // 回滚状态
      set((state) => ({
        feeds: state.feeds.filter((f) => f.id !== feed.id),
      }));
      throw error;
    }
  },

  updateFeed: (id: string, updates: Partial<Feed>) => {
    const oldFeeds = get().feeds;

    set((state) => ({
      feeds: state.feeds.map((feed) =>
        feed.id === id ? { ...feed, ...updates, updatedAt: new Date() } : feed
      ),
    }));

    // 持久化到 LocalStorage
    try {
      storageService.updateFeed(id, updates);
    } catch (error) {
      console.error('Failed to update feed:', error);
      // 回滚状态
      set({ feeds: oldFeeds });
      throw error;
    }
  },

  removeFeed: (id: string) => {
    const oldState = {
      feeds: get().feeds,
      articles: get().articles,
      activeFeedId: get().activeFeedId,
    };

    set((state) => ({
      feeds: state.feeds.filter((feed) => feed.id !== id),
      articles: state.articles.filter((article) => article.feedId !== id),
      activeFeedId: state.activeFeedId === id ? undefined : state.activeFeedId,
    }));

    // 从 LocalStorage 删除
    try {
      storageService.deleteFeed(id);
    } catch (error) {
      console.error('Failed to delete feed:', error);
      // 回滚状态
      set(oldState);
      throw error;
    }
  },

  setFeeds: (feeds: Feed[]) => {
    set({ feeds });
  },

  // Article Actions
  addArticles: (articles: Article[]) => {
    const oldArticles = get().articles;

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
    try {
      storageService.saveArticles(articles);

      // 更新未读计数
      get().updateUnreadCounts();
    } catch (error) {
      console.error('Failed to save articles:', error);
      // 回滚状态
      set({ articles: oldArticles });
      throw error;
    }
  },

  markAsRead: (articleId: string) => {
    const oldArticles = get().articles;

    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === articleId ? { ...article, isRead: true } : article
      ),
    }));

    // 持久化到 LocalStorage
    try {
      storageService.updateArticle(articleId, { isRead: true });

      // 更新未读计数
      get().updateUnreadCounts();
    } catch (error) {
      console.error('Failed to mark article as read:', error);
      // 回滚状态
      set({ articles: oldArticles });
      // 不抛出错误，因为这不是关键操作
    }
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

    // 如果 LocalStorage 为空，加载 mock 数据
    if (feeds.length === 0) {
      // 动态导入 mock 数据
      import('../data').then(({ mockFeeds, mockArticles }) => {
        // 保存 mock 数据到 LocalStorage
        mockFeeds.forEach((feed) => storageService.saveFeed(feed));
        storageService.saveArticles(mockArticles);

        // 更新状态
        set({
          feeds: mockFeeds,
          articles: mockArticles,
        });

        // 更新未读计数
        get().updateUnreadCounts();
      });
    } else {
      set({
        feeds,
        articles,
      });

      // 初始化后更新未读计数
      get().updateUnreadCounts();
    }
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
    try {
      updatedFeeds.forEach((feed) => {
        storageService.updateFeed(feed.id, { unreadCount: feed.unreadCount });
      });
    } catch (error) {
      console.error('Failed to update unread counts:', error);
      // 不抛出错误，因为这不是关键操作
    }
  },
}));
