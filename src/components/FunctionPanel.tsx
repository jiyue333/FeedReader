/**
 * 功能面板组件
 * 
 * 提供 Tab 切换功能，包含：
 * - 笔记 Tab
 * - AI 聊天 Tab
 * 
 * 需求: 6.1, 7.1
 */

import { useState } from 'react';
import { NotesTab } from './NotesTab';
import { AIChatTab } from './AIChatTab';

export interface FunctionPanelProps {
  articleId: string;
  articleContent: string;
}

type TabType = 'notes' | 'chat';

export function FunctionPanel({ articleId, articleContent }: FunctionPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  return (
    <div className="flex flex-col h-full">
      {/* Tab 切换按钮 */}
      <div className="flex space-x-1 border-b border-gray-200 px-6 pt-6">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          笔记
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AI 聊天
        </button>
      </div>

      {/* Tab 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'notes' && <NotesTab articleId={articleId} />}
        {activeTab === 'chat' && (
          <AIChatTab articleId={articleId} articleContent={articleContent} />
        )}
      </div>
    </div>
  );
}
