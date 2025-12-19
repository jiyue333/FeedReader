/**
 * MockRSSService 演示文件
 * 用于验证 Mock RSS 服务的功能
 */

import { mockRSSService } from './MockRSSService';

async function demoMockRSSService() {
  console.log('=== MockRSSService 演示 ===\n');

  // 1. 测试 URL 验证
  console.log('1. 测试 URL 验证:');
  const validUrl = 'https://techcrunch.com/feed/';
  const invalidUrl1 = 'not-a-url';
  const invalidUrl2 = 'http://invalid';

  console.log(
    `  ${validUrl}: ${await mockRSSService.validateFeedUrl(validUrl)}`
  );
  console.log(
    `  ${invalidUrl1}: ${await mockRSSService.validateFeedUrl(invalidUrl1)}`
  );
  console.log(
    `  ${invalidUrl2}: ${await mockRSSService.validateFeedUrl(invalidUrl2)}`
  );
  console.log();

  // 2. 测试获取订阅源
  console.log('2. 测试获取订阅源:');
  const feed = await mockRSSService.fetchFeed(validUrl);
  console.log(`  标题: ${feed.title}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  描述: ${feed.description}`);
  console.log(`  未读数: ${feed.unreadCount}`);
  console.log();

  // 3. 测试获取文章列表
  console.log('3. 测试获取文章列表:');
  const articles = await mockRSSService.fetchArticles(validUrl);
  console.log(`  获取到 ${articles.length} 篇文章`);
  if (articles.length > 0) {
    console.log(`  第一篇文章: ${articles[0].title}`);
    console.log(`  作者: ${articles[0].author || '未知'}`);
    console.log(`  已读状态: ${articles[0].isRead ? '已读' : '未读'}`);
  }
  console.log();

  // 4. 测试 AI 聊天
  console.log('4. 测试 AI 聊天:');
  const message = '请总结一下这篇文章';
  const context = articles[0]?.content || '';
  const aiResponse = await mockRSSService.sendChatMessage(message, context);
  console.log(`  用户: ${message}`);
  console.log(`  AI: ${aiResponse.substring(0, 100)}...`);
  console.log();

  // 5. 测试新 URL
  console.log('5. 测试添加新订阅源:');
  const newUrl = 'https://example.com/feed.xml';
  const newFeed = await mockRSSService.fetchFeed(newUrl);
  console.log(`  新订阅源 ID: ${newFeed.id}`);
  console.log(`  标题: ${newFeed.title}`);
  console.log();

  console.log('=== 演示完成 ===');
}

export { demoMockRSSService };
