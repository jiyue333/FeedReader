/**
 * StorageService 演示和手动验证
 * 这个文件可以用来手动测试存储服务的功能
 */

import { storageService } from './StorageService';
import type { Feed, Article, Note, ChatHistory } from '../types';

/**
 * 演示 Feed 操作
 */
export function demoFeedOperations() {
  console.log('=== Feed Operations Demo ===');
  
  // 创建测试 Feed
  const testFeed: Feed = {
    id: 'test-feed-1',
    title: 'Test Feed',
    url: 'https://example.com/feed',
    siteUrl: 'https://example.com',
    description: 'A test feed',
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // 保存 Feed
  storageService.saveFeed(testFeed);
  console.log('Saved feed:', testFeed);
  
  // 获取所有 Feeds
  const feeds = storageService.getFeeds();
  console.log('All feeds:', feeds);
  
  // 更新 Feed
  storageService.updateFeed('test-feed-1', { unreadCount: 5 });
  const updatedFeeds = storageService.getFeeds();
  console.log('Updated feeds:', updatedFeeds);
  
  // 删除 Feed
  storageService.deleteFeed('test-feed-1');
  const remainingFeeds = storageService.getFeeds();
  console.log('Remaining feeds:', remainingFeeds);
}

/**
 * 演示 Article 操作
 */
export function demoArticleOperations() {
  console.log('=== Article Operations Demo ===');
  
  // 创建测试 Articles
  const testArticles: Article[] = [
    {
      id: 'article-1',
      feedId: 'feed-1',
      title: 'Test Article 1',
      content: '# Test Content',
      summary: 'A test article',
      url: 'https://example.com/article-1',
      publishedAt: new Date(),
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: 'article-2',
      feedId: 'feed-1',
      title: 'Test Article 2',
      content: '# Another Test',
      url: 'https://example.com/article-2',
      publishedAt: new Date(),
      isRead: false,
      createdAt: new Date(),
    },
  ];
  
  // 保存 Articles
  storageService.saveArticles(testArticles);
  console.log('Saved articles:', testArticles);
  
  // 获取所有 Articles
  const allArticles = storageService.getArticles();
  console.log('All articles:', allArticles);
  
  // 获取特定 Feed 的 Articles
  const feedArticles = storageService.getArticles('feed-1');
  console.log('Feed articles:', feedArticles);
  
  // 更新 Article
  storageService.updateArticle('article-1', { isRead: true });
  const updatedArticles = storageService.getArticles();
  console.log('Updated articles:', updatedArticles);
}

/**
 * 演示 Note 操作
 */
export function demoNoteOperations() {
  console.log('=== Note Operations Demo ===');
  
  // 创建测试 Note
  const testNote: Note = {
    id: 'note-1',
    articleId: 'article-1',
    content: 'This is my note about the article',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // 保存 Note
  storageService.saveNote(testNote);
  console.log('Saved note:', testNote);
  
  // 获取 Note
  const note = storageService.getNote('article-1');
  console.log('Retrieved note:', note);
  
  // 更新 Note (通过保存相同 articleId 的新 Note)
  const updatedNote: Note = {
    ...testNote,
    content: 'Updated note content',
    updatedAt: new Date(),
  };
  storageService.saveNote(updatedNote);
  const retrievedUpdatedNote = storageService.getNote('article-1');
  console.log('Updated note:', retrievedUpdatedNote);
  
  // 删除 Note
  storageService.deleteNote('article-1');
  const deletedNote = storageService.getNote('article-1');
  console.log('After deletion (should be null):', deletedNote);
}

/**
 * 演示 ChatHistory 操作
 */
export function demoChatHistoryOperations() {
  console.log('=== ChatHistory Operations Demo ===');
  
  // 创建测试 ChatHistory
  const testChatHistory: ChatHistory = {
    id: 'chat-1',
    articleId: 'article-1',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What is this article about?',
        timestamp: new Date(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'This article discusses...',
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // 保存 ChatHistory
  storageService.saveChatHistory(testChatHistory);
  console.log('Saved chat history:', testChatHistory);
  
  // 获取 ChatHistory
  const chatHistory = storageService.getChatHistory('article-1');
  console.log('Retrieved chat history:', chatHistory);
  
  // 更新 ChatHistory (添加新消息)
  const updatedChatHistory: ChatHistory = {
    ...testChatHistory,
    messages: [
      ...testChatHistory.messages,
      {
        id: 'msg-3',
        role: 'user',
        content: 'Tell me more',
        timestamp: new Date(),
      },
    ],
    updatedAt: new Date(),
  };
  storageService.saveChatHistory(updatedChatHistory);
  const retrievedUpdatedHistory = storageService.getChatHistory('article-1');
  console.log('Updated chat history:', retrievedUpdatedHistory);
}

/**
 * 演示日期序列化/反序列化
 */
export function demoDateSerialization() {
  console.log('=== Date Serialization Demo ===');
  
  const testFeed: Feed = {
    id: 'date-test-feed',
    title: 'Date Test',
    url: 'https://example.com/feed',
    unreadCount: 0,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z'),
    lastFetchedAt: new Date('2024-01-15T11:00:00Z'),
  };
  
  // 保存并重新获取
  storageService.saveFeed(testFeed);
  const retrieved = storageService.getFeeds().find(f => f.id === 'date-test-feed');
  
  console.log('Original dates:', {
    createdAt: testFeed.createdAt,
    updatedAt: testFeed.updatedAt,
    lastFetchedAt: testFeed.lastFetchedAt,
  });
  
  console.log('Retrieved dates:', {
    createdAt: retrieved?.createdAt,
    updatedAt: retrieved?.updatedAt,
    lastFetchedAt: retrieved?.lastFetchedAt,
  });
  
  console.log('Dates are Date objects:', {
    createdAt: retrieved?.createdAt instanceof Date,
    updatedAt: retrieved?.updatedAt instanceof Date,
    lastFetchedAt: retrieved?.lastFetchedAt instanceof Date,
  });
  
  // 清理
  storageService.deleteFeed('date-test-feed');
}

/**
 * 运行所有演示
 */
export function runAllDemos() {
  console.log('Starting StorageService demos...\n');
  
  demoFeedOperations();
  console.log('\n');
  
  demoArticleOperations();
  console.log('\n');
  
  demoNoteOperations();
  console.log('\n');
  
  demoChatHistoryOperations();
  console.log('\n');
  
  demoDateSerialization();
  console.log('\n');
  
  console.log('All demos completed!');
}
