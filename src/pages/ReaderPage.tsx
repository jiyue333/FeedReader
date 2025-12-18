import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArticleContent, TableOfContents, FunctionPanel } from '../components';

/**
 * 阅读页面组件
 * 
 * 实现三栏布局：
 * - 左侧：目录栏（Table of Contents）
 * - 中间：文章内容区（Article Content）
 * - 右侧：功能栏（Function Panel - 笔记和AI聊天）
 * 
 * 需求: 4.1, 4.2, 4.3, 4.4
 */
function ReaderPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { articles, markAsRead } = useAppStore();

  // 查找当前文章
  const article = articles.find((a) => a.id === articleId);

  // 如果文章不存在且已经加载完成，返回首页
  useEffect(() => {
    // 给一点时间让 store 初始化
    const timer = setTimeout(() => {
      if (!article && articles.length > 0) {
        console.warn(`Article ${articleId} not found, redirecting to home`);
        navigate('/');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [article, articles.length, articleId, navigate]);

  // 自动标记文章为已读（需求 4.5）
  useEffect(() => {
    if (article && !article.isRead) {
      markAsRead(article.id);
    }
  }, [article, markAsRead]);

  // 加载中状态
  if (!article) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-500">加载文章中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* 左侧：目录栏 (Table of Contents) */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            目录
          </h2>
          <TableOfContents content={article.content} />
        </div>
      </aside>

      {/* 中间：文章内容区 (Article Content) */}
      <main className="flex-1 overflow-y-auto">
        <article className="max-w-3xl mx-auto px-8 py-12">
          {/* 文章头部信息 */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              {article.author && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {article.author}
                </span>
              )}
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(article.publishedAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  原文链接
                </a>
              )}
            </div>
          </header>

          {/* 文章内容 */}
          <ArticleContent content={article.content} />
        </article>
      </main>

      {/* 右侧：功能栏 (Function Panel) */}
      <aside className="w-96 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
        <FunctionPanel articleId={article.id} articleContent={article.content} />
      </aside>
    </div>
  );
}

export default ReaderPage;
