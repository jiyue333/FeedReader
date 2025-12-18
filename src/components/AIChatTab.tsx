/**
 * AI 聊天 Tab 组件
 * 
 * 提供 AI 聊天功能，包含：
 * - 聊天消息列表
 * - 消息输入框
 * - 加载状态和错误提示
 * - 聊天历史持久化
 * 
 * 需求: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { storageService } from '../services/StorageService';
import { mockRSSService } from '../services/MockRSSService';
import type { ChatHistory, ChatMessage as ChatMessageType } from '../types';

export interface AIChatTabProps {
  articleId: string;
  articleContent: string;
}

export function AIChatTab({ articleId, articleContent }: AIChatTabProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载聊天历史（需求 7.1）
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const history = storageService.getChatHistory(articleId);
        if (history) {
          setMessages(history.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadChatHistory();
  }, [articleId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 保存聊天历史到 LocalStorage
  const saveChatHistory = (updatedMessages: ChatMessageType[]) => {
    try {
      const now = new Date();
      const existingHistory = storageService.getChatHistory(articleId);
      
      const history: ChatHistory = existingHistory
        ? { ...existingHistory, messages: updatedMessages, updatedAt: now }
        : {
            id: `chat-${articleId}-${Date.now()}`,
            articleId,
            messages: updatedMessages,
            createdAt: now,
            updatedAt: now,
          };

      storageService.saveChatHistory(history);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  // 发送消息（需求 7.2, 7.3, 7.5）
  const handleSendMessage = async (content: string) => {
    // 清除之前的错误
    setError(null);
    
    // 创建用户消息
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // 添加用户消息到列表
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    // 设置加载状态
    setIsLoading(true);

    try {
      // 调用 AI 服务（需求 7.2）
      const aiResponse = await mockRSSService.sendChatMessage(content, articleContent);

      // 创建 AI 响应消息（需求 7.3）
      const aiMessage: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      // 添加 AI 消息到列表
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      // 错误处理（需求 7.5）
      console.error('Failed to send chat message:', error);
      setError('AI 服务暂时不可用，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 重试发送最后一条消息
  const handleRetry = () => {
    if (messages.length === 0) return;
    
    // 找到最后一条用户消息
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  // 处理文本选中快捷提问（需求 7.4）
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        // 检查选中的文本是否来自文章内容区域
        const articleContentElement = document.querySelector('[data-article-content]');
        if (articleContentElement && selection?.anchorNode) {
          const isFromArticle = articleContentElement.contains(selection.anchorNode);
          
          if (isFromArticle) {
            // 可以在这里添加一个浮动按钮或其他 UI 来触发快捷提问
            // 目前暂时不实现，因为需要更复杂的 UI 交互
          }
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">加载聊天历史中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 聊天消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-sm text-gray-400 mb-2">
              还没有聊天记录
            </div>
            <div className="text-xs text-gray-400">
              向 AI 提问关于这篇文章的任何问题
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="px-6 py-4 border-t border-gray-200">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="向 AI 提问关于这篇文章的问题..."
        />
        <div className="mt-2 text-xs text-gray-400">
          提示：可以询问文章总结、解释概念、分析观点等
        </div>
      </div>
    </div>
  );
}
