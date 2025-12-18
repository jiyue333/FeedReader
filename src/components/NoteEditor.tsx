/**
 * 笔记编辑器组件
 * 
 * 提供笔记编辑功能，包含：
 * - 文本输入区域
 * - 实时保存（防抖优化）
 * - 文本选中添加到笔记的快捷操作
 * 
 * 需求: 6.2, 6.3
 * 性能优化: 使用防抖减少保存频率
 */

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export interface NoteEditorProps {
  articleId: string;
  initialContent: string;
  onSave: (content: string) => void;
}

// 防抖延迟时间（毫秒）
const DEBOUNCE_DELAY = 500;

export function NoteEditor({ articleId, initialContent, onSave }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 使用防抖 Hook 优化保存性能
  const debouncedContent = useDebounce(content, DEBOUNCE_DELAY);

  // 当 articleId 变化时，重置内容
  useEffect(() => {
    setContent(initialContent);
    setLastSaved(null);
  }, [articleId, initialContent]);

  // 当防抖后的内容变化时，执行保存（需求 6.2）
  useEffect(() => {
    // 跳过初始渲染和空内容
    if (debouncedContent === initialContent) {
      return;
    }

    setIsSaving(true);
    onSave(debouncedContent);
    setLastSaved(new Date());
    setIsSaving(false);
  }, [debouncedContent, onSave, initialContent]);

  // 处理内容变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // 处理文本选中添加到笔记（需求 6.3）
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      // 只处理来自文章内容区域的选中文本
      if (
        selectedText &&
        selectedText.length > 0 &&
        selection?.anchorNode &&
        !textareaRef.current?.contains(selection.anchorNode)
      ) {
        // 检查选中的文本是否来自文章内容区域（main 标签）
        let node = selection.anchorNode as Node;
        let isFromArticle = false;

        while (node && node !== document.body) {
          if (node.nodeName === 'MAIN') {
            isFromArticle = true;
            break;
          }
          node = node.parentNode as Node;
        }

        if (isFromArticle) {
          // 显示添加到笔记的提示
          showAddToNotePrompt(selectedText);
        }
      }
    };

    // 监听鼠标抬起事件
    document.addEventListener('mouseup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [content]);

  // 显示添加到笔记的提示
  const showAddToNotePrompt = (selectedText: string) => {
    // 创建一个临时的提示元素
    const existingPrompt = document.getElementById('add-to-note-prompt');
    if (existingPrompt) {
      existingPrompt.remove();
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const prompt = document.createElement('div');
    prompt.id = 'add-to-note-prompt';
    prompt.className =
      'fixed z-50 bg-blue-600 text-white text-xs px-3 py-2 rounded shadow-lg cursor-pointer hover:bg-blue-700 transition-colors';
    prompt.textContent = '添加到笔记';
    prompt.style.left = `${rect.left + window.scrollX}px`;
    prompt.style.top = `${rect.bottom + window.scrollY + 5}px`;

    prompt.onclick = () => {
      addTextToNote(selectedText);
      prompt.remove();
      selection.removeAllRanges();
    };

    document.body.appendChild(prompt);

    // 3秒后自动移除提示
    setTimeout(() => {
      prompt.remove();
    }, 3000);
  };

  // 添加文本到笔记
  const addTextToNote = (text: string) => {
    const newContent = content
      ? `${content}\n\n> ${text}`
      : `> ${text}`;
    
    setContent(newContent);

    // 聚焦到文本框末尾
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newContent.length, newContent.length);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* 编辑器 */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="在此记录你的想法...&#10;&#10;提示：选中文章中的文本可以快速添加到笔记"
        className="flex-1 w-full p-4 text-sm text-gray-800 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* 状态提示 */}
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>
          {isSaving && '保存中...'}
          {!isSaving && lastSaved && (
            <>
              已保存于{' '}
              {lastSaved.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </>
          )}
          {!isSaving && !lastSaved && content && '输入中...'}
        </span>
        <span className="text-gray-400">
          {content.length} 字符
        </span>
      </div>
    </div>
  );
}
