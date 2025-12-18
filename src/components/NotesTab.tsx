/**
 * 笔记 Tab 组件
 * 
 * 提供笔记功能的容器，包含：
 * - 笔记列表（按时间倒序）
 * - 添加笔记按钮
 * - 文本选中添加笔记
 * 
 * 需求: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect } from 'react';
import { AddNoteDialog } from './AddNoteDialog';
import { NoteCard } from './NoteCard';
import { TextSelectionPopup } from './TextSelectionPopup';
import { storageService } from '../services/StorageService';
import type { Note, NoteItem } from '../types';

export interface NotesTabProps {
  articleId: string;
}

export function NotesTab({ articleId }: NotesTabProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | undefined>(undefined);

  // 加载笔记（需求 6.4）
  useEffect(() => {
    const loadNote = () => {
      try {
        const savedNote = storageService.getNote(articleId);
        setNote(savedNote);
      } catch (error) {
        console.error('Failed to load note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [articleId]);

  // 处理从浮动按钮添加笔记
  const handleAddNoteFromSelection = (text: string) => {
    setSelectedText(text);
    setIsDialogOpen(true);
  };

  // 添加笔记（需求 6.2）
  const handleAddNote = (content: string, quotedText?: string) => {
    try {
      const now = new Date();
      const newItem: NoteItem = {
        id: `note-item-${Date.now()}`,
        content,
        quotedText,
        createdAt: now,
        updatedAt: now,
      };

      const updatedNote: Note = note
        ? {
            ...note,
            items: [...note.items, newItem], // 新笔记添加到末尾（正序）
            updatedAt: now,
          }
        : {
            id: `note-${articleId}-${Date.now()}`,
            articleId,
            items: [newItem],
            createdAt: now,
            updatedAt: now,
          };

      storageService.saveNote(updatedNote);
      setNote(updatedNote);
      setIsDialogOpen(false);
      setSelectedText(undefined);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  // 编辑笔记
  const handleEditNote = (noteId: string, newContent: string) => {
    if (!note) return;

    try {
      const now = new Date();
      const updatedItems = note.items.map((item) =>
        item.id === noteId
          ? { ...item, content: newContent, updatedAt: now }
          : item
      );

      const updatedNote: Note = {
        ...note,
        items: updatedItems,
        updatedAt: now,
      };

      storageService.saveNote(updatedNote);
      setNote(updatedNote);
    } catch (error) {
      console.error('Failed to edit note:', error);
    }
  };

  // 删除笔记（需求 6.5）
  const handleDeleteNote = (noteId: string) => {
    if (!note) return;

    try {
      const now = new Date();
      const updatedItems = note.items.filter((item) => item.id !== noteId);

      if (updatedItems.length === 0) {
        // 如果没有笔记了，删除整个 note
        storageService.deleteNote(articleId);
        setNote(null);
      } else {
        const updatedNote: Note = {
          ...note,
          items: updatedItems,
          updatedAt: now,
        };

        storageService.saveNote(updatedNote);
        setNote(updatedNote);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // 打开添加笔记对话框
  const handleOpenDialog = () => {
    setSelectedText(undefined); // 清除选中文字
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">加载笔记中...</div>
      </div>
    );
  }

  const noteItems = note?.items || [];

  return (
    <>
      {/* 文本选中浮动按钮 */}
      <TextSelectionPopup onAddNote={handleAddNoteFromSelection} />

      <div className="flex flex-col h-full">
        {/* 工具栏 */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">标注</h3>
          <button
            onClick={handleOpenDialog}
            className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
          >
            创建笔记
          </button>
        </div>

        {/* 笔记列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {noteItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-sm text-gray-400 mb-2">还没有笔记</div>
              <div className="text-xs text-gray-400">
                点击"创建笔记"或选中文章中的文字来添加笔记
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {noteItems.map((item) => (
                <NoteCard
                  key={item.id}
                  note={item}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>

        {/* 添加笔记对话框 */}
        <AddNoteDialog
          isOpen={isDialogOpen}
          quotedText={selectedText}
          onSave={(content) => handleAddNote(content, selectedText)}
          onCancel={() => {
            setIsDialogOpen(false);
            setSelectedText(undefined);
          }}
        />
      </div>
    </>
  );
}
