/**
 * Sidebar 组件
 * 应用左侧边栏，包含订阅源列表和添加按钮
 */

import type { Feed } from '../types';
import type { ToastType } from './Toast';
import { AddFeedButton } from './AddFeedButton';
import { RefreshButton } from './RefreshButton';
import { FeedList } from './FeedList';

export interface SidebarProps {
  feeds: Feed[];
  activeFeedId?: string;
  onFeedSelect: (feedId: string) => void;
  onShowToast: (message: string, type: ToastType) => void;
}

export function Sidebar({
  feeds,
  activeFeedId,
  onFeedSelect,
  onShowToast,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3">订阅源</h2>

        {/* 添加订阅源按钮 */}
        <AddFeedButton onShowToast={onShowToast} />

        {/* 刷新按钮 */}
        <RefreshButton onShowToast={onShowToast} />
      </div>

      {/* 订阅源列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <FeedList
          feeds={feeds}
          activeFeedId={activeFeedId}
          onFeedSelect={onFeedSelect}
        />
      </div>
    </div>
  );
}
