/**
 * 添加订阅源按钮组件
 * 包含输入框和添加按钮，实现订阅源管理功能
 */

import { useState } from 'react';
import { useAppStore } from '../store';
import { mockRSSService } from '../services';
import type { ToastType } from './Toast';
import { ValidationError, getErrorMessage } from '../utils/errors';

export interface AddFeedButtonProps {
  onShowToast: (message: string, type: ToastType) => void;
}

export function AddFeedButton({ onShowToast }: AddFeedButtonProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { feeds, addFeed, addArticles } = useAppStore();

  const handleAddFeed = async () => {
    // 验证输入不为空
    if (!url.trim()) {
      onShowToast('请输入 RSS feed URL', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 验证 URL 格式
      await mockRSSService.validateFeedUrl(url.trim());

      // 2. 检查是否已存在（去重）
      const existingFeed = feeds.find((f) => f.url === url.trim());
      if (existingFeed) {
        throw new ValidationError('该订阅源已存在');
      }

      // 3. 获取订阅源信息
      const feed = await mockRSSService.fetchFeed(url.trim());

      // 4. 添加到状态和 LocalStorage
      addFeed(feed);

      // 5. 自动获取文章列表
      try {
        const articles = await mockRSSService.fetchArticles(feed.url);
        addArticles(articles);

        onShowToast(`成功添加订阅源: ${feed.title}`, 'success');
      } catch (articleError) {
        // 即使获取文章失败，订阅源也已添加成功
        console.error('Failed to fetch articles:', articleError);
        const errorMsg = getErrorMessage(articleError);
        onShowToast(`订阅源已添加，但获取文章失败: ${errorMsg}`, 'warning');
      }

      // 清空输入框
      setUrl('');
    } catch (error) {
      console.error('Failed to add feed:', error);
      const errorMsg = getErrorMessage(error);
      onShowToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddFeed();
            }
          }}
          placeholder="输入 RSS feed URL"
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
        />
        <button
          onClick={handleAddFeed}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isLoading ? '添加中...' : '添加'}
        </button>
      </div>
    </div>
  );
}
