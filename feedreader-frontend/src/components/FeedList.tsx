/**
 * FeedList 组件
 * 显示订阅源列表
 */

import type { Feed } from '../types';
import { FeedItem } from './FeedItem';

export interface FeedListProps {
  feeds: Feed[];
  activeFeedId?: string;
  onFeedSelect: (feedId: string) => void;
}

export function FeedList({ feeds, activeFeedId, onFeedSelect }: FeedListProps) {
  // 空状态
  if (feeds.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8 px-4">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-medium">暂无订阅源</p>
        <p className="mt-2 text-xs">请在上方添加 RSS feed URL 开始使用</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feeds.map((feed) => (
        <FeedItem
          key={feed.id}
          feed={feed}
          isActive={feed.id === activeFeedId}
          onClick={onFeedSelect}
        />
      ))}
    </div>
  );
}
