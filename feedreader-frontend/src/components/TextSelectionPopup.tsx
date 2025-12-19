/**
 * 文本选中浮动按钮组件
 *
 * 当用户在文章中选中文字时，显示浮动的"添加笔记"按钮
 *
 * 需求: 6.3
 */

import { useEffect, useState } from 'react';

export interface TextSelectionPopupProps {
  onAddNote: (selectedText: string) => void;
}

interface PopupPosition {
  top: number;
  left: number;
}

export function TextSelectionPopup({ onAddNote }: TextSelectionPopupProps) {
  const [selectedText, setSelectedText] = useState<string>('');
  const [position, setPosition] = useState<PopupPosition | null>(null);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        // 检查选中的文本是否来自文章内容区域
        const articleContentElement = document.querySelector(
          '[data-article-content]'
        );
        if (articleContentElement && selection?.anchorNode) {
          const isFromArticle = articleContentElement.contains(
            selection.anchorNode
          );

          if (isFromArticle && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 计算浮动按钮的位置（在选中文字的上方居中）
            setPosition({
              top: rect.top + window.scrollY - 50, // 在选中文字上方 50px
              left: rect.left + window.scrollX + rect.width / 2, // 居中
            });
            setSelectedText(text);
            return;
          }
        }
      }

      // 如果没有选中文字或不在文章区域，隐藏按钮
      setPosition(null);
      setSelectedText('');
    };

    // 监听鼠标松开事件
    document.addEventListener('mouseup', handleTextSelection);
    // 监听选择变化事件
    document.addEventListener('selectionchange', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, []);

  const handleAddNote = () => {
    if (selectedText) {
      onAddNote(selectedText);
      // 清除选中状态
      window.getSelection()?.removeAllRanges();
      setPosition(null);
      setSelectedText('');
    }
  };

  const handleHighlight = () => {
    // 高亮文本功能（可选，暂不实现）
    console.log('Highlight text:', selectedText);
  };

  if (!position || !selectedText) {
    return null;
  }

  return (
    <div
      className="fixed z-50 flex items-center space-x-2 bg-gray-800 text-white rounded-lg shadow-lg px-3 py-2 transform -translate-x-1/2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* 高亮文本按钮 */}
      <button
        onClick={handleHighlight}
        className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-700 rounded transition-colors"
        title="高亮文本"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        <span className="text-xs">高亮文本</span>
      </button>

      {/* 添加笔记按钮 */}
      <button
        onClick={handleAddNote}
        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        title="添加笔记"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        <span className="text-xs font-medium">添加笔记</span>
      </button>

      {/* 小三角形指示器 */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
        style={{ marginTop: '-1px' }}
      />
    </div>
  );
}
