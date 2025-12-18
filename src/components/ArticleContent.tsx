import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-light.css';
import { generateUniqueSlug } from '../utils/slugify';

interface ArticleContentProps {
  content: string;
}

/**
 * ArticleContent 组件
 *
 * 使用 react-markdown 渲染 Markdown 内容
 * 支持：
 * - GFM (GitHub Flavored Markdown) - 表格、删除线、任务列表等
 * - 原始 HTML（经过净化处理，防止 XSS）
 * - 代码高亮
 * - 标题自动添加唯一 ID（用于目录导航）
 * - 图片懒加载（性能优化）
 *
 * 安全性：使用 rehype-sanitize 净化 HTML，防止 XSS 攻击
 * 需求: 4.3, 5.2
 */
function ArticleContent({ content }: ArticleContentProps) {
  // 预先收集所有标题并生成唯一 ID（按出现顺序）
  const headingSlugs = useMemo(() => {
    const slugsByText = new Map<string, string[]>(); // text -> [slug1, slug2, ...]
    const existingSlugs = new Set<string>();

    // 提取所有标题文本
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[2].trim();
      const slug = generateUniqueSlug(text, existingSlugs);
      existingSlugs.add(slug);

      // 按出现顺序存储 slug
      if (!slugsByText.has(text)) {
        slugsByText.set(text, []);
      }
      slugsByText.get(text)!.push(slug);
    }

    return slugsByText;
  }, [content]);

  // 创建标题组件工厂函数（使用闭包跟踪每个文本的使用次数）
  const createHeadingComponent = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    const textCounters = new Map<string, number>(); // 跟踪每个文本已使用的次数

    return ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(children);
      const slugs = headingSlugs.get(text);

      let id: string;
      if (slugs && slugs.length > 0) {
        // 获取当前文本的使用次数
        const currentCount = textCounters.get(text) || 0;
        // 使用对应顺序的 slug
        id = slugs[currentCount] || slugs[slugs.length - 1];
        // 更新计数器
        textCounters.set(text, currentCount + 1);
      } else {
        // 降级处理：如果没有预先生成的 slug
        id = generateUniqueSlug(text, new Set());
      }

      return (
        <Tag id={id} {...props}>
          {children}
        </Tag>
      );
    };
  };

  return (
    <div
      data-article-content
      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:text-gray-900 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-img:rounded-lg prose-img:shadow-md prose-hr:border-gray-300 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-800"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize, // 净化 HTML，防止 XSS
          rehypeHighlight,
        ]}
        components={{
          // 为标题添加唯一 ID，用于目录导航
          h1: createHeadingComponent('h1'),
          h2: createHeadingComponent('h2'),
          h3: createHeadingComponent('h3'),
          h4: createHeadingComponent('h4'),
          h5: createHeadingComponent('h5'),
          h6: createHeadingComponent('h6'),
          // 图片懒加载优化
          img: ({ src, alt, ...props }) => {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default ArticleContent;
