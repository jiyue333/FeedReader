import { useState, useEffect, useCallback } from 'react';
import { generateUniqueSlug } from '../utils/slugify';

/**
 * 标题接口
 */
export interface Heading {
  id: string;
  level: number;
  text: string;
}

export interface TableOfContentsProps {
  content: string;
}

/**
 * 从 Markdown 内容中提取标题
 *
 * 解析 h1-h6 标题，生成层级结构，确保 ID 唯一
 * 需求: 5.1
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const existingSlugs = new Set<string>();

  // 匹配 Markdown 标题格式: # 标题, ## 标题, 等
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // # 的数量表示层级
    const text = match[2].trim();

    // 生成唯一 ID（处理重复标题）
    const id = generateUniqueSlug(text, existingSlugs);
    existingSlugs.add(id);

    headings.push({
      id,
      level,
      text,
    });
  }

  return headings;
}

/**
 * TableOfContents 组件
 *
 * 功能：
 * - 解析并显示文章的层级目录
 * - 点击目录项滚动到对应章节
 * - 滚动时高亮当前目录项
 * - 处理无标题文章的空状态
 *
 * 需求: 5.1, 5.2, 5.3, 5.4, 5.5
 */
function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 提取标题
  useEffect(() => {
    const extractedHeadings = extractHeadings(content);
    setHeadings(extractedHeadings);
  }, [content]);

  // 监听滚动，高亮当前目录项
  // 使用 IntersectionObserver 监听标题元素的可见性
  useEffect(() => {
    if (headings.length === 0) return;

    // 获取正文滚动容器（main 元素）
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    // 收集所有标题元素
    const headingElements = new Map<string, Element>();
    headings.forEach((heading) => {
      const element =
        document.getElementById(heading.id) ||
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(
          (el) => el.textContent?.trim() === heading.text
        );
      if (element) {
        headingElements.set(heading.id, element);
      }
    });

    if (headingElements.size === 0) return;

    // 使用 IntersectionObserver 监听标题元素
    const observer = new IntersectionObserver(
      (entries) => {
        // 找到第一个可见的标题
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          const id = visibleEntry.target.id;
          if (id) {
            setActiveId(id);
          } else {
            // 如果没有 id，通过文本内容查找
            const text = visibleEntry.target.textContent?.trim();
            const heading = headings.find((h) => h.text === text);
            if (heading) {
              setActiveId(heading.id);
            }
          }
        }
      },
      {
        root: scrollContainer,
        rootMargin: '-80px 0px -80% 0px', // 顶部偏移，底部留大部分空间
        threshold: 0,
      }
    );

    // 观察所有标题元素
    headingElements.forEach((element) => {
      observer.observe(element);
    });

    // 初始化时设置第一个标题为激活状态（使用函数式更新避免依赖 activeId）
    setActiveId((current) => {
      if (!current && headings.length > 0) {
        return headings[0].id;
      }
      return current;
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]); // 移除 activeId 依赖，避免频繁重建 observer

  // 点击目录项，滚动到对应章节
  const handleHeadingClick = useCallback((heading: Heading) => {
    // 尝试多种方式查找元素
    const element =
      document.getElementById(heading.id) ||
      Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(
        (el) => el.textContent?.trim() === heading.text
      );

    if (element) {
      // 平滑滚动到目标位置
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setActiveId(heading.id);
    }
  }, []);

  // 空状态：无标题文章
  if (headings.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        <p>此文章没有标题结构</p>
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        // 根据层级设置缩进
        const paddingLeft = (heading.level - 1) * 12;

        return (
          <button
            key={heading.id}
            onClick={() => handleHeadingClick(heading)}
            className={`
              w-full text-left text-sm py-1.5 px-2 rounded transition-colors
              ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
            title={heading.text}
          >
            <span className="block truncate">{heading.text}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default TableOfContents;
