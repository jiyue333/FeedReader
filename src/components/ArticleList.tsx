/**
 * ArticleList 组件
 * 显示文章列表，支持过滤和分页加载
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Article, Feed } from '../types';
import { ArticleCard } from './ArticleCard';

export interface ArticleListProps {
  articles: Article[];
  feeds: Feed[];
  activeFeedId?: string;
  isLoading?: boolean;
}

const ARTICLES_PER_PAGE = 10;

export function ArticleList({ articles, feeds, activeFeedId, isLoading = false }: ArticleListProps) {
  const [displayedCount, setDisplayedCount] = useState(ARTICLES_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 过滤文章：根据选中的订阅源
  const filteredArticles = activeFeedId
    ? articles.filter(article => article.feedId === activeFeedId)
    : articles;

  // 按发布时间排序（最新的在前）
  const sortedArticles = [...filteredArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // 当前显示的文章
  const displayedArticles = sortedArticles.slice(0, displayedCount);
  const hasMore = displayedCount < sortedArticles.length;

  // 获取文章对应的订阅源
  const getFeedForArticle = (article: Article): Feed | undefined => {
    return feeds.find(feed => feed.id === article.feedId);
  };

  // 加载更多文章
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setDisplayedCount(prev => prev + ARTICLES_PER_PAGE);
    }
  }, [hasMore, isLoading]);

  // 无限滚动：使用 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // 当 activeFeedId 改变时，重置显示数量
  useEffect(() => {
    setDisplayedCount(ARTICLES_PER_PAGE);
  }, [activeFeedId]);

  // 空状态
  if (filteredArticles.length === 0) {
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

  return (
    <div className="space-y-4">
      {/* 文章列表 */}
      {displayedArticles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          feed={getFeedForArticle(article)}
        />
      ))}

      {/* 加载更多触发器 */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 text-center">
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
            <span>加载更多...</span>
          </div>
        </div>
      )}

      {/* 已加载全部 */}
      {!hasMore && displayedArticles.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-400">
          已显示全部 {sortedArticles.length} 篇文章
        </div>
      )}
    </div>
  );
}
