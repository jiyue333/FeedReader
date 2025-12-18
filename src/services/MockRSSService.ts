import type { Feed, Article } from '../types';
import { mockFeeds } from '../data/mockFeeds';
import { mockArticles } from '../data/mockArticles';
import { generateMockAIResponse } from '../data/mockAI';
import { ValidationError, NetworkError, AIServiceError, TimeoutError } from '../utils/errors';

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
   * @throws {ValidationError} 当 URL 格式无效时
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    await this.delay(200, 400);
    
    // 简单的 URL 格式验证
    if (!url || typeof url !== 'string') {
      throw new ValidationError('URL 不能为空');
    }
    
    // 检查是否以 http:// 或 https:// 开头
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new ValidationError('URL 必须以 http:// 或 https:// 开头');
    }
    
    // 检查是否包含域名（至少有一个点）
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    if (!urlWithoutProtocol.includes('.')) {
      throw new ValidationError('URL 格式无效');
    }
    
    // 模拟网络错误（5% 概率）
    if (Math.random() < 0.05) {
      throw new NetworkError('无法连接到服务器');
    }
    
    return true;
  }

  /**
   * 获取订阅源信息
   * @param url Feed URL
   * @returns 订阅源对象
   * @throws {NetworkError} 当网络请求失败时
   */
  async fetchFeed(url: string): Promise<Feed> {
    await this.delay(400, 600);
    
    // 模拟网络错误（3% 概率）
    if (Math.random() < 0.03) {
      throw new NetworkError('获取订阅源信息失败');
    }
    
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
   * @throws {NetworkError} 当网络请求失败时
   */
  async fetchArticles(feedUrl: string): Promise<Article[]> {
    await this.delay(300, 700);
    
    // 模拟网络错误（3% 概率）
    if (Math.random() < 0.03) {
      throw new NetworkError('获取文章列表失败');
    }
    
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
   * @throws {AIServiceError} 当 AI 服务调用失败时
   * @throws {TimeoutError} 当请求超时时
   */
  async sendChatMessage(message: string, context: string): Promise<string> {
    // 模拟超时错误（2% 概率）
    if (Math.random() < 0.02) {
      await this.delay(3000, 3000);
      throw new TimeoutError('AI 响应超时');
    }
    
    // 模拟 AI 服务错误（3% 概率）
    if (Math.random() < 0.03) {
      await this.delay(600, 800);
      throw new AIServiceError('AI 服务暂时不可用');
    }
    
    await this.delay(600, 800);
    
    // 使用 mock AI 响应生成器
    return generateMockAIResponse(message, context);
  }
}

// 导出单例实例
export const mockRSSService = new MockRSSService();
