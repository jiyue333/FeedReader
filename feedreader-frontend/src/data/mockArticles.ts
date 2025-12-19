import type { Article } from '../types';

/**
 * Mock 文章数据 - 每个订阅源 10-20 篇文章，包含 Markdown 内容
 */
export const mockArticles: Article[] = [
  // TechCrunch 文章 (feed-1)
  {
    id: 'article-1',
    feedId: 'feed-1',
    title: 'React 19 发布：新特性详解',
    content: `# React 19 新特性

React 19 带来了许多令人兴奋的新特性，这些特性将改变我们构建 React 应用的方式。

## 1. Server Components

Server Components 允许你在服务器端渲染组件，减少客户端 JavaScript 包的大小。

\`\`\`jsx
function ServerComponent() {
  // 这个组件在服务器端渲染
  const data = await fetchData();
  return <div>{data.title}</div>;
}
\`\`\`

## 2. Actions

新的 Actions API 简化了表单处理和数据变更操作。

\`\`\`jsx
function Form() {
  async function handleSubmit(formData) {
    'use server';
    await saveData(formData);
  }
  
  return <form action={handleSubmit}>...</form>;
}
\`\`\`

## 3. 改进的 Suspense

Suspense 现在支持更多场景，包括数据获取和代码分割。

### 主要优势

- 更好的用户体验
- 减少加载时间
- 简化异步逻辑

## 总结

React 19 是一个重大更新，为开发者提供了更强大的工具来构建高性能应用。`,
    summary: 'React 19 正式发布，带来 Server Components、Actions 等重要特性',
    author: 'Dan Abramov',
    url: 'https://techcrunch.com/article-1',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'article-2',
    feedId: 'feed-1',
    title: 'AI 驱动的代码审查工具获得千万美元融资',
    content: `# AI 代码审查工具融资新闻

一家专注于 AI 驱动代码审查的初创公司今天宣布完成 1000 万美元 A 轮融资。

## 产品特点

该工具使用先进的机器学习模型来：

1. 自动检测代码中的潜在问题
2. 提供智能修复建议
3. 学习团队的编码风格

## 市场前景

随着软件开发团队规模的扩大，代码审查变得越来越重要。

> "我们的目标是让每个开发者都能获得专家级的代码审查。" - CEO

## 技术细节

\`\`\`python
# 示例：AI 检测到的问题
def process_data(data):
    # 警告：未处理空值情况
    return data.strip().lower()
\`\`\`

投资者对这个领域充满信心，预计未来几年将有更多类似工具出现。`,
    summary: 'AI 代码审查工具完成千万美元融资，致力于提升代码质量',
    author: 'Sarah Johnson',
    url: 'https://techcrunch.com/article-2',
    publishedAt: new Date('2024-01-15T09:30:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T09:30:00Z'),
  },
  {
    id: 'article-3',
    feedId: 'feed-1',
    title: '云计算成本优化：企业如何节省 40% 开支',
    content: `# 云计算成本优化指南

企业正在寻找减少云计算开支的方法，本文介绍几个实用策略。

## 策略一：资源右sizing

确保使用合适大小的实例。

## 策略二：使用预留实例

长期使用可节省高达 70% 的成本。

## 策略三：自动化关闭未使用资源

\`\`\`bash
# 自动关闭开发环境
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
\`\`\``,
    summary: '企业通过优化云资源使用，平均节省 40% 云计算开支',
    author: 'Mike Chen',
    url: 'https://techcrunch.com/article-3',
    publishedAt: new Date('2024-01-15T08:00:00Z'),
    isRead: true,
    createdAt: new Date('2024-01-15T08:00:00Z'),
  },
  {
    id: 'article-4',
    feedId: 'feed-1',
    title: 'TypeScript 5.5 新特性预览',
    content: `# TypeScript 5.5 即将到来

TypeScript 团队公布了 5.5 版本的新特性。

## 改进的类型推断

更智能的类型推断减少了显式类型注解的需求。

## 新的工具类型

\`\`\`typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
\`\`\`

## 性能提升

编译速度提升 20%，特别是在大型项目中。`,
    summary: 'TypeScript 5.5 带来更好的类型推断和性能提升',
    author: 'Anders Hejlsberg',
    url: 'https://techcrunch.com/article-4',
    publishedAt: new Date('2024-01-14T18:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-14T18:00:00Z'),
  },
  {
    id: 'article-5',
    feedId: 'feed-1',
    title: 'Web3 项目融资趋势分析',
    content: `# 2024 年 Web3 融资趋势

尽管市场波动，Web3 项目仍在吸引大量投资。

## 主要趋势

1. DeFi 协议持续创新
2. NFT 应用场景扩展
3. 基础设施项目受青睐

## 数据分析

| 季度 | 融资额 | 项目数 |
|------|--------|--------|
| Q1   | $2.5B  | 150    |
| Q2   | $3.1B  | 180    |

投资者更加关注实际应用价值。`,
    summary: 'Web3 项目融资保持活跃，基础设施成为投资热点',
    author: 'Emily Zhang',
    url: 'https://techcrunch.com/article-5',
    publishedAt: new Date('2024-01-14T15:00:00Z'),
    isRead: true,
    createdAt: new Date('2024-01-14T15:00:00Z'),
  },
  // Hacker News 文章 (feed-2)
  {
    id: 'article-6',
    feedId: 'feed-2',
    title: 'Show HN: 我用 Rust 重写了 grep',
    content: `# 用 Rust 重写 grep

我花了三个月时间用 Rust 重写了 grep，性能提升了 3 倍。

## 为什么选择 Rust？

- 内存安全
- 零成本抽象
- 出色的并发支持

## 性能对比

\`\`\`bash
# 原始 grep
time grep -r "pattern" /large/directory
# 真实: 2.5s

# rust-grep
time rust-grep -r "pattern" /large/directory
# 真实: 0.8s
\`\`\`

## 实现细节

使用了 rayon 进行并行处理，memmap 进行文件映射。

\`\`\`rust
use rayon::prelude::*;

fn search_parallel(pattern: &str, files: Vec<PathBuf>) {
    files.par_iter().for_each(|file| {
        search_file(pattern, file);
    });
}
\`\`\`

项目已开源，欢迎贡献！`,
    summary: '开发者用 Rust 重写 grep，性能提升 3 倍',
    author: 'rustacean',
    url: 'https://news.ycombinator.com/item?id=1001',
    publishedAt: new Date('2024-01-15T09:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: 'article-7',
    feedId: 'feed-2',
    title: '为什么我从 Kubernetes 迁移回单体应用',
    content: `# 从微服务回归单体

经过两年的 Kubernetes 实践，我们决定回归单体架构。

## 微服务的问题

### 1. 复杂性爆炸

管理 50+ 微服务带来的运维负担远超预期。

### 2. 调试困难

分布式追踪虽然有工具，但仍然很痛苦。

### 3. 成本高昂

\`\`\`yaml
# 每个服务的最小资源
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
\`\`\`

50 个服务 = 大量资源浪费

## 单体的优势

- 简单的部署流程
- 更容易的事务管理
- 更低的延迟

## 结论

不是每个项目都需要微服务。根据实际需求选择架构。`,
    summary: '团队从 Kubernetes 微服务架构迁移回单体应用，分享经验教训',
    author: 'pragmatic_dev',
    url: 'https://news.ycombinator.com/item?id=1002',
    publishedAt: new Date('2024-01-15T08:30:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T08:30:00Z'),
  },
  {
    id: 'article-8',
    feedId: 'feed-2',
    title: 'SQLite 是被低估的数据库',
    content: `# SQLite：被低估的强大工具

SQLite 不仅仅是嵌入式数据库，它可以处理很多生产场景。

## 性能数据

- 读取：100,000+ QPS
- 写入：10,000+ TPS
- 数据库大小：支持 TB 级

## 适用场景

1. **边缘计算**：每个节点独立数据库
2. **移动应用**：完美的本地存储
3. **中小型 Web 应用**：足够应对大多数流量

## 代码示例

\`\`\`sql
-- 使用 WAL 模式提升并发
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
\`\`\`

## 何时不用 SQLite

- 高并发写入
- 分布式场景
- 需要复杂权限管理

简单、可靠、快速 - SQLite 值得更多关注。`,
    summary: 'SQLite 的性能和可靠性被严重低估，适合很多生产场景',
    author: 'db_enthusiast',
    url: 'https://news.ycombinator.com/item?id=1003',
    publishedAt: new Date('2024-01-15T07:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T07:00:00Z'),
  },
  {
    id: 'article-9',
    feedId: 'feed-2',
    title: 'Git 工作流：我们如何管理 100+ 开发者',
    content: `# 大规模团队的 Git 工作流

管理 100+ 开发者的代码库需要严格的流程。

## 分支策略

\`\`\`
main (生产)
  ├── develop (开发)
  │   ├── feature/user-auth
  │   ├── feature/payment
  │   └── feature/dashboard
  └── hotfix/critical-bug
\`\`\`

## 代码审查规则

1. 至少 2 人审查
2. 必须通过所有 CI 检查
3. 不允许直接推送到 main

## 自动化工具

\`\`\`yaml
# .github/workflows/pr-check.yml
name: PR Check
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
\`\`\`

## 经验教训

- 保持分支短命
- 频繁合并避免冲突
- 使用 rebase 保持历史清晰`,
    summary: '大型团队分享 Git 工作流最佳实践',
    author: 'tech_lead',
    url: 'https://news.ycombinator.com/item?id=1004',
    publishedAt: new Date('2024-01-14T20:00:00Z'),
    isRead: true,
    createdAt: new Date('2024-01-14T20:00:00Z'),
  },
  // CSS-Tricks 文章 (feed-3)
  {
    id: 'article-10',
    feedId: 'feed-3',
    title: 'CSS Grid 完全指南 2024 版',
    content: `# CSS Grid 完全指南

CSS Grid 是现代布局的基石，本文全面介绍其用法。

## 基础概念

Grid 容器和 Grid 项目是两个核心概念。

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

## 高级技巧

### 1. 命名网格线

\`\`\`css
.container {
  grid-template-columns: [start] 1fr [middle] 2fr [end];
}
\`\`\`

### 2. Grid Areas

\`\`\`css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
\`\`\`

## 响应式设计

使用 auto-fit 和 minmax 实现自适应布局。

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
\`\`\`

Grid 让复杂布局变得简单！`,
    summary: '2024 年最全面的 CSS Grid 使用指南',
    author: 'Chris Coyier',
    url: 'https://css-tricks.com/article-10',
    publishedAt: new Date('2024-01-15T08:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T08:00:00Z'),
  },
  {
    id: 'article-11',
    feedId: 'feed-3',
    title: '现代 CSS 动画技巧',
    content: `# 现代 CSS 动画

创建流畅动画的最佳实践。

## 使用 CSS 变量

\`\`\`css
:root {
  --duration: 0.3s;
  --easing: cubic-bezier(0.4, 0, 0.2, 1);
}

.animated {
  transition: transform var(--duration) var(--easing);
}
\`\`\`

## 性能优化

只动画 transform 和 opacity 属性。

\`\`\`css
/* 好 ✓ */
.box {
  transform: translateX(100px);
  opacity: 0.5;
}

/* 避免 ✗ */
.box {
  left: 100px;
  width: 200px;
}
\`\`\`

## View Transitions API

\`\`\`javascript
document.startViewTransition(() => {
  // 更新 DOM
});
\`\`\``,
    summary: '掌握现代 CSS 动画技巧，创建流畅用户体验',
    author: 'Sarah Drasner',
    url: 'https://css-tricks.com/article-11',
    publishedAt: new Date('2024-01-14T16:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-14T16:00:00Z'),
  },
  {
    id: 'article-12',
    feedId: 'feed-3',
    title: 'Tailwind CSS vs 传统 CSS：深度对比',
    content: `# Tailwind CSS vs 传统 CSS

两种方法的优缺点分析。

## Tailwind 的优势

### 1. 快速开发

\`\`\`html
<div class="flex items-center justify-between p-4 bg-blue-500">
  <h1 class="text-2xl font-bold text-white">标题</h1>
</div>
\`\`\`

### 2. 一致性

设计系统内置，避免魔法数字。

## 传统 CSS 的优势

### 1. 语义化

\`\`\`css
.card-header {
  display: flex;
  align-items: center;
}
\`\`\`

### 2. 更小的 HTML

## 我的建议

- 小项目：Tailwind 更快
- 大项目：混合使用
- 团队协作：看团队偏好`,
    summary: 'Tailwind CSS 和传统 CSS 的详细对比分析',
    author: 'Adam Wathan',
    url: 'https://css-tricks.com/article-12',
    publishedAt: new Date('2024-01-14T12:00:00Z'),
    isRead: true,
    createdAt: new Date('2024-01-14T12:00:00Z'),
  },
  // Dev.to 文章 (feed-4)
  {
    id: 'article-13',
    feedId: 'feed-4',
    title: '我如何在 6 个月内从零到全栈开发者',
    content: `# 从零到全栈的学习路径

分享我的学习经验和资源推荐。

## 第 1-2 月：前端基础

- HTML/CSS
- JavaScript 基础
- 响应式设计

## 第 3-4 月：前端框架

学习了 React 和 Vue。

\`\`\`jsx
// 我的第一个 React 组件
function HelloWorld() {
  return <h1>Hello, World!</h1>;
}
\`\`\`

## 第 5-6 月：后端和数据库

- Node.js + Express
- PostgreSQL
- RESTful API

## 学习资源

1. FreeCodeCamp
2. The Odin Project
3. YouTube 教程

## 建议

- 每天编码
- 做项目而不是只看教程
- 加入开发者社区`,
    summary: '新手开发者分享 6 个月全栈学习路径',
    author: 'junior_dev',
    url: 'https://dev.to/article-13',
    publishedAt: new Date('2024-01-15T07:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T07:00:00Z'),
  },
  {
    id: 'article-14',
    feedId: 'feed-4',
    title: '10 个提升代码可读性的技巧',
    content: `# 代码可读性技巧

好的代码应该像散文一样易读。

## 1. 有意义的命名

\`\`\`javascript
// 差 ✗
const d = new Date();
const x = u.filter(i => i.a);

// 好 ✓
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
\`\`\`

## 2. 函数应该小而专注

每个函数只做一件事。

## 3. 避免深层嵌套

\`\`\`javascript
// 使用 early return
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  
  return user.name;
}
\`\`\`

## 4. 添加注释解释"为什么"

不要注释"做什么"，而是"为什么这样做"。

## 5. 保持一致的代码风格

使用 ESLint 和 Prettier。`,
    summary: '10 个实用技巧让你的代码更易读',
    author: 'clean_coder',
    url: 'https://dev.to/article-14',
    publishedAt: new Date('2024-01-14T18:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-14T18:00:00Z'),
  },
  {
    id: 'article-15',
    feedId: 'feed-4',
    title: 'Docker 容器化实战指南',
    content: `# Docker 入门到实战

容器化你的应用程序。

## 什么是 Docker？

Docker 让你将应用和依赖打包到容器中。

## 基础命令

\`\`\`bash
# 构建镜像
docker build -t myapp:1.0 .

# 运行容器
docker run -p 3000:3000 myapp:1.0

# 查看运行中的容器
docker ps
\`\`\`

## Dockerfile 示例

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Docker Compose

管理多容器应用。

\`\`\`yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:14
\`\`\``,
    summary: 'Docker 容器化完整教程，从基础到实战',
    author: 'devops_guru',
    url: 'https://dev.to/article-15',
    publishedAt: new Date('2024-01-14T14:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-14T14:00:00Z'),
  },
  // Smashing Magazine 文章 (feed-5)
  {
    id: 'article-16',
    feedId: 'feed-5',
    title: 'Web 性能优化：Core Web Vitals 深度解析',
    content: `# Core Web Vitals 优化指南

Google 的 Core Web Vitals 是衡量用户体验的关键指标。

## 三大核心指标

### 1. LCP (Largest Contentful Paint)

最大内容绘制时间应 < 2.5s

\`\`\`html
<!-- 优化图片加载 -->
<img src="hero.jpg" loading="eager" fetchpriority="high" />
\`\`\`

### 2. FID (First Input Delay)

首次输入延迟应 < 100ms

\`\`\`javascript
// 使用 requestIdleCallback
requestIdleCallback(() => {
  // 非关键任务
});
\`\`\`

### 3. CLS (Cumulative Layout Shift)

累积布局偏移应 < 0.1

\`\`\`css
/* 为图片预留空间 */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}
\`\`\`

## 测量工具

- Lighthouse
- PageSpeed Insights
- Web Vitals 扩展

## 优化策略

1. 优化关键渲染路径
2. 减少 JavaScript 执行时间
3. 使用 CDN 加速资源加载`,
    summary: 'Core Web Vitals 完整优化指南，提升网站性能',
    author: 'Addy Osmani',
    url: 'https://www.smashingmagazine.com/article-16',
    publishedAt: new Date('2024-01-15T06:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T06:00:00Z'),
  },
  {
    id: 'article-17',
    feedId: 'feed-5',
    title: '无障碍设计：让每个人都能使用你的网站',
    content: `# Web 无障碍设计指南

创建包容性的 Web 体验。

## ARIA 属性

\`\`\`html
<button aria-label="关闭对话框" aria-pressed="false">
  <span aria-hidden="true">×</span>
</button>
\`\`\`

## 键盘导航

确保所有功能都可以通过键盘访问。

\`\`\`javascript
// 焦点管理
const modal = document.querySelector('.modal');
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
\`\`\`

## 颜色对比度

文本和背景的对比度至少 4.5:1

## 语义化 HTML

\`\`\`html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
  </ul>
</nav>
\`\`\`

## 测试工具

- axe DevTools
- WAVE
- 屏幕阅读器测试`,
    summary: 'Web 无障碍设计最佳实践，创建包容性体验',
    author: 'Heydon Pickering',
    url: 'https://www.smashingmagazine.com/article-17',
    publishedAt: new Date('2024-01-14T10:00:00Z'),
    isRead: true,
    createdAt: new Date('2024-01-14T10:00:00Z'),
  },
];
