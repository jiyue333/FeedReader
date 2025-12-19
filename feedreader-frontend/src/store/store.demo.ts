/**
 * Store 使用示例
 *
 * 这个文件演示了如何使用 Zustand store
 * 可以在浏览器控制台中运行这些示例
 */

import { useAppStore } from './index';
import type { Feed, Article } from '../types';

/**
 * 示例 1: 添加订阅源
 */
export function demoAddFeed() {
  const store = useAppStore.getState();

  const newFeed: Feed = {
    id: 'demo-feed-1',
    title: 'Demo Feed',
    url: 'https://example.com/feed',
    siteUrl: 'https://example.com',
    description: 'A demo feed for testing',
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.addFeed(newFeed);
  console.log('Feed added:', newFeed);
  console.log('Current feeds:', store.feeds);
}

/**
 * 示例 2: 添加文章
 */
export function demoAddArticles() {
  const store = useAppStore.getState();

  const articles: Article[] = [
    {
      id: 'demo-article-1',
      feedId: 'demo-feed-1',
      title: 'Demo Article 1',
      content: '# Demo Article\n\nThis is a demo article.',
      summary: 'A demo article for testing',
      url: 'https://example.com/article-1',
      publishedAt: new Date(),
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: 'demo-article-2',
      feedId: 'demo-feed-1',
      title: 'Demo Article 2',
      content: '# Another Demo\n\nAnother demo article.',
      summary: 'Another demo article',
      url: 'https://example.com/article-2',
      publishedAt: new Date(),
      isRead: false,
      createdAt: new Date(),
    },
  ];

  store.addArticles(articles);
  console.log('Articles added:', articles);
  console.log('Current articles:', store.articles);
  console.log('Updated feeds with unread counts:', store.feeds);
}

/**
 * 示例 3: 标记文章为已读
 */
export function demoMarkAsRead() {
  const store = useAppStore.getState();

  const firstArticle = store.articles[0];
  if (firstArticle) {
    store.markAsRead(firstArticle.id);
    console.log('Article marked as read:', firstArticle.id);
    console.log(
      'Updated article:',
      store.articles.find((a) => a.id === firstArticle.id)
    );
    console.log('Updated feeds with unread counts:', store.feeds);
  }
}

/**
 * 示例 4: 设置活动订阅源
 */
export function demoSetActiveFeed() {
  const store = useAppStore.getState();

  const firstFeed = store.feeds[0];
  if (firstFeed) {
    store.setActiveFeedId(firstFeed.id);
    console.log('Active feed set to:', firstFeed.id);
    console.log('Current active feed ID:', store.activeFeedId);
  }
}

/**
 * 示例 5: 从 LocalStorage 初始化
 */
export function demoInitializeFromStorage() {
  const store = useAppStore.getState();

  store.initializeFromStorage();
  console.log('Store initialized from LocalStorage');
  console.log('Feeds:', store.feeds);
  console.log('Articles:', store.articles);
}

/**
 * 示例 6: 删除订阅源（级联删除文章）
 */
export function demoRemoveFeed() {
  const store = useAppStore.getState();

  const firstFeed = store.feeds[0];
  if (firstFeed) {
    console.log('Before removal:');
    console.log('Feeds:', store.feeds.length);
    console.log('Articles:', store.articles.length);

    store.removeFeed(firstFeed.id);

    console.log('After removal:');
    console.log('Feeds:', store.feeds.length);
    console.log('Articles:', store.articles.length);
    console.log('Feed removed:', firstFeed.id);
  }
}

/**
 * 运行所有示例
 */
export function runAllDemos() {
  console.log('=== Demo 1: Add Feed ===');
  demoAddFeed();

  console.log('\n=== Demo 2: Add Articles ===');
  demoAddArticles();

  console.log('\n=== Demo 3: Mark As Read ===');
  demoMarkAsRead();

  console.log('\n=== Demo 4: Set Active Feed ===');
  demoSetActiveFeed();

  console.log('\n=== Demo 5: Initialize From Storage ===');
  demoInitializeFromStorage();
}

// 在浏览器控制台中可以这样使用：
// import * as storeDemo from './store/store.demo';
// storeDemo.runAllDemos();
