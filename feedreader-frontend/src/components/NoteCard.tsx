/**
 * 笔记卡片组件
 *
 * 显示单条笔记，包含引用文字、笔记内容、时间戳和操作按钮
 *
 * 需求: 6.1, 6.5
 */

import { useState } from 'react';
import type { NoteItem } from '../types';

export interface NoteCardProps {
  note: NoteItem;
  onEdit: (noteId: string, newContent: string) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent) return;

    onEdit(note.id, trimmedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条笔记吗？')) {
      onDelete(note.id);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* 引用的文字 */}
      {note.quotedText && (
        <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {note.quotedText}
          </p>
        </div>
      )}

      {/* 笔记内容 */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex items-center justify-end space-x-2 mt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!editContent.trim()}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">
          {note.content}
        </p>
      )}

      {/* 底部信息栏 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatTime(note.createdAt)}</span>

        {!isEditing && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="hover:text-blue-600 transition-colors"
              title="编辑"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="hover:text-red-600 transition-colors"
              title="删除"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
