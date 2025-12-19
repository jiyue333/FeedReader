/**
 * ArticleList 组件
 * 显示文章列表，支持过滤和虚拟滚动
 *
 * 性能优化：
 * - 使用 @tanstack/react-virtual 实现虚拟滚动
 * - 只渲染可见区域的文章，提升大列表性能
 */

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Article, Feed } from '../types';
import { ArticleCard } from './ArticleCard';

export interface ArticleListProps {
  articles: Article[];
  feeds: Feed[];
  activeFeedId?: string;
  isLoading?: boolean;
}

export function ArticleList({
  articles,
  feeds,
  activeFeedId,
  isLoading = false,
}: ArticleListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 过滤文章：根据选中的订阅源
  const filteredArticles = useMemo(() => {
    return activeFeedId
      ? articles.filter((article) => article.feedId === activeFeedId)
      : articles;
  }, [articles, activeFeedId]);

  // 按发布时间排序（最新的在前）
  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [filteredArticles]);

  // 获取文章对应的订阅源（使用 useMemo 优化）
  const getFeedForArticle = useMemo(() => {
    const feedMap = new Map(feeds.map((feed) => [feed.id, feed]));
    return (article: Article): Feed | undefined => feedMap.get(article.feedId);
  }, [feeds]);

  // 虚拟滚动配置
  const virtualizer = useVirtualizer({
    count: sortedArticles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // 估计每个文章卡片的高度
    overscan: 5, // 预渲染可见区域外的项目数量
  });

  // 空状态
  if (sortedArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">暂无文章</p>
        <p className="text-sm mt-2">
          {activeFeedId ? '该订阅源还没有文章' : '请先添加订阅源'}
        </p>
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      {/* 虚拟滚动容器 */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* 只渲染可见的文章 */}
        {items.map((virtualItem) => {
          const article = sortedArticles[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="pb-4"
            >
              <ArticleCard
                article={article}
                feed={getFeedForArticle(article)}
              />
            </div>
          );
        })}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg
              className="animate-spin h-5 w-5"
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
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* 文章总数提示 */}
      {sortedArticles.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-400">
          共 {sortedArticles.length} 篇文章
        </div>
      )}
    </div>
  );
}
