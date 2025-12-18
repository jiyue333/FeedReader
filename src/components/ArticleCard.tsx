/**
 * ArticleCard 组件
 * 显示文章卡片，包含标题、摘要、来源、时间、已读状态
 */

import { useNavigate } from 'react-router-dom';
import type { Article, Feed } from '../types';

export interface ArticleCardProps {
  article: Article;
  feed?: Feed;
  onClick?: () => void;
}

export function ArticleCard({ article, feed, onClick }: ArticleCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/article/${article.id}`);
    }
  };

  // 格式化发布时间
  const formatDate = (date: Date) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffMs = now.getTime() - publishedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return publishedDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <article
      onClick={handleClick}
      className={`
        p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
        ${article.isRead 
          ? 'bg-gray-50 border-gray-200 text-gray-600' 
          : 'bg-white border-gray-300 text-gray-900'
        }
      `}
    >
      {/* 标题 */}
      <h3 
        className={`
          text-lg font-semibold mb-2 line-clamp-2
          ${article.isRead ? 'text-gray-600' : 'text-gray-900'}
        `}
      >
        {article.title}
      </h3>

      {/* 摘要 */}
      {article.summary && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {article.summary}
        </p>
      )}

      {/* 元信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {/* 来源名称 */}
          {feed && (
            <span className="font-medium text-blue-600">
              {feed.title}
            </span>
          )}

          {/* 作者 */}
          {article.author && (
            <span>
              {article.author}
            </span>
          )}

          {/* 发布时间 */}
          <span>
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* 已读/未读标识 */}
        {!article.isRead && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            未读
          </span>
        )}
      </div>
    </article>
  );
}
