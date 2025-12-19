/**
 * RefreshButton 组件
 * 刷新所有订阅源，获取最新文章
 */

import { useState } from 'react';
import { useAppStore } from '../store';
import { mockRSSService } from '../services';
import type { ToastType } from './Toast';
import { getErrorMessage } from '../utils/errors';
import type { Article } from '../types';

export interface RefreshButtonProps {
  onShowToast: (message: string, type: ToastType) => void;
}

export function RefreshButton({ onShowToast }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { feeds, addArticles } = useAppStore();

  const handleRefresh = async () => {
    if (isRefreshing || feeds.length === 0) {
      return;
    }

    setIsRefreshing(true);

    try {
      // 为所有订阅源发起文章获取请求
      const results = await Promise.allSettled(
        feeds.map((feed) => mockRSSService.fetchArticles(feed.url))
      );

      // 收集成功获取的文章
      const allNewArticles: Article[] = [];
      let successCount = 0;
      let failureCount = 0;

      const failedFeeds: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          allNewArticles.push(...result.value);
        } else {
          failureCount++;
          failedFeeds.push(feeds[index].title);
          console.error(
            `Failed to fetch articles for feed ${feeds[index].title}:`,
            result.reason
          );
        }
      });

      // 合并新文章（addArticles 内部会处理去重）
      if (allNewArticles.length > 0) {
        addArticles(allNewArticles);
      }

      // 显示刷新结果
      if (failureCount === 0) {
        onShowToast(
          `刷新成功，获取了 ${allNewArticles.length} 篇文章`,
          'success'
        );
      } else if (successCount === 0) {
        onShowToast('所有订阅源刷新失败，请检查网络连接', 'error');
      } else {
        const failedList = failedFeeds.slice(0, 2).join(', ');
        const moreText =
          failedFeeds.length > 2 ? ` 等${failedFeeds.length}个` : '';
        onShowToast(
          `部分刷新成功，${failedList}${moreText}刷新失败`,
          'warning'
        );
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      const errorMsg = getErrorMessage(error);
      onShowToast(`刷新失败: ${errorMsg}`, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing || feeds.length === 0}
      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
      title={feeds.length === 0 ? '请先添加订阅源' : '刷新所有订阅源'}
    >
      {isRefreshing ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>刷新中...</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>刷新</span>
        </>
      )}
    </button>
  );
}
