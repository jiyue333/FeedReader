/**
 * FeedItem 组件
 * 显示单个订阅源项
 */

import type { Feed } from '../types';

export interface FeedItemProps {
  feed: Feed;
  isActive: boolean;
  onClick: (feedId: string) => void;
}

export function FeedItem({ feed, isActive, onClick }: FeedItemProps) {
  const hasUnread = feed.unreadCount > 0;

  return (
    <div
      onClick={() => onClick(feed.id)}
      className={`
        p-3 rounded-md cursor-pointer transition-all
        ${
          isActive
            ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
            : 'bg-white border-2 border-transparent hover:shadow-md'
        }
        ${hasUnread ? 'font-semibold' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        {/* 左侧：图标和标题 */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* 订阅源图标 */}
          {feed.iconUrl ? (
            <img
              src={feed.iconUrl}
              alt=""
              className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
              onError={(e) => {
                // 图标加载失败时显示默认图标
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-5 h-5 rounded bg-gray-300 flex-shrink-0 mt-0.5 flex items-center justify-center">
              <span className="text-xs text-gray-600">📰</span>
            </div>
          )}

          {/* 订阅源标题 */}
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}
            >
              {feed.title}
            </div>
          </div>
        </div>

        {/* 右侧：未读计数 */}
        {hasUnread && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {feed.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
