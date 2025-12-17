import type { Feed, Article } from '../types';
import { mockFeeds } from '../data/mockFeeds';
import { mockArticles } from '../data/mockArticles';
import { generateMockAIResponse } from '../data/mockAI';

/**
 * Mock RSS 服务 - 模拟后端 API
 * 用于开发和测试，返回预设的 mock 数据
 */
export class MockRSSService {
  /**
   * 模拟网络延迟
   * @param min 最小延迟（毫秒）
   * @param max 最大延迟（毫秒）
   */
  private delay(min: number = 200, max: number = 800): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 验证 Feed URL 的有效性
   * @param url Feed URL
   * @returns 是否有效
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    await this.delay(200, 400);
    
    // 简单的 URL 格式验证
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    // 检查是否以 http:// 或 https:// 开头
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // 检查是否包含域名（至少有一个点）
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    if (!urlWithoutProtocol.includes('.')) {
      return false;
    }
    
    return true;
  }

  /**
   * 获取订阅源信息
   * @param url Feed URL
   * @returns 订阅源对象
   */
  async fetchFeed(url: string): Promise<Feed> {
    await this.delay(400, 600);
    
    // 查找已存在的 feed
    const existingFeed = mockFeeds.find((f) => f.url === url);
    if (existingFeed) {
      return {
        ...existingFeed,
        lastFetchedAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    // 生成新的 mock feed
    const newFeed: Feed = {
      id: `feed-${Date.now()}`,
      title: `订阅源 ${url.split('/')[2] || 'Unknown'}`,
      url,
      siteUrl: url.split('/').slice(0, 3).join('/'),
      description: '新添加的订阅源',
      unreadCount: 0,
      lastFetchedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return newFeed;
  }

  /**
   * 获取订阅源的文章列表
   * @param feedUrl Feed URL
   * @returns 文章列表
   */
  async fetchArticles(feedUrl: string): Promise<Article[]> {
    await this.delay(300, 700);
    
    // 查找对应的 feed
    const feed = mockFeeds.find((f) => f.url === feedUrl);
    if (!feed) {
      return [];
    }
    
    // 返回该 feed 的所有文章
    const articles = mockArticles.filter((article) => article.feedId === feed.id);
    
    // 返回文章的副本，避免修改原始数据
    return articles.map((article) => ({ ...article }));
  }

  /**
   * 发送聊天消息到 AI 服务
   * @param message 用户消息
   * @param context 文章上下文
   * @returns AI 响应
   */
  async sendChatMessage(message: string, context: string): Promise<string> {
    await this.delay(600, 800);
    
    // 使用 mock AI 响应生成器
    return generateMockAIResponse(message, context);
  }
}

// 导出单例实例
export const mockRSSService = new MockRSSService();
