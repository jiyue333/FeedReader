import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-light.css';

interface ArticleContentProps {
  content: string;
}

/**
 * ArticleContent 组件
 * 
 * 使用 react-markdown 渲染 Markdown 内容
 * 支持：
 * - GFM (GitHub Flavored Markdown) - 表格、删除线、任务列表等
 * - 原始 HTML
 * - 代码高亮
 * - 标题自动添加 ID（用于目录导航）
 * 
 * 需求: 4.3, 5.2
 */
function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div 
      data-article-content
      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:text-gray-900 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-img:rounded-lg prose-img:shadow-md prose-hr:border-gray-300 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-800"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // 为标题添加 ID，用于目录导航
          h1: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h3 id={id} {...props}>{children}</h3>;
          },
          h4: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h4 id={id} {...props}>{children}</h4>;
          },
          h5: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h5 id={id} {...props}>{children}</h5>;
          },
          h6: ({ children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return <h6 id={id} {...props}>{children}</h6>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default ArticleContent;
