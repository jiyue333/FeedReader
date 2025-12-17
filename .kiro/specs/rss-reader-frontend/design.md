# 设计文档

## 概述

本设计文档描述了 RSS 阅读器前端应用的 MVP 版本架构。该应用采用现代 Web 技术栈，提供流畅的用户体验和增强型阅读功能。核心特性包括订阅源管理、文章浏览和带有目录、笔记、AI 聊天的三栏式阅读页面。

### 技术栈

- **前端框架**: React 18+ with TypeScript
- **路由**: React Router v6
- **状态管理**: Zustand（轻量级状态管理）
- **UI 组件库**: Tailwind CSS + Headless UI
- **数据获取**: TanStack Query (React Query)
- **本地存储**: LocalStorage（简化的 mock 数据存储）
- **Markdown 渲染**: react-markdown + remark/rehype 插件
- **构建工具**: Vite
- **Mock 数据**: 内置 mock 数据和 mock 服务层

## 架构

### 整体架构

应用采用典型的前端 SPA 架构，分为以下几层：

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (React Components + Tailwind CSS)      │
├─────────────────────────────────────────┤
│          Application Layer              │
│    (Hooks, State Management, Router)    │
├─────────────────────────────────────────┤
│            Service Layer                │
│  (API Client, Storage, Business Logic)  │
├─────────────────────────────────────────┤
│            Data Layer                   │
│    (IndexedDB, API, Local Storage)      │
└─────────────────────────────────────────┘
```

### 页面结构

应用包含两个主要页面：

1. **主页面 (Home)**: 左侧订阅源列表 + 右侧文章列表
2. **阅读页面 (Reader)**: 左侧目录 + 中间内容 + 右侧功能栏

### 路由设计

```
/                    - 主页面（默认显示所有文章）
/feed/:feedId        - 主页面（显示特定订阅源的文章）
/article/:articleId  - 阅读页面
```

## 组件和接口

### 核心组件树

```
App
├── Router
│   ├── HomePage
│   │   ├── Sidebar
│   │   │   ├── AddFeedButton
│   │   │   ├── FeedList
│   │   │   │   └── FeedItem
│   │   │   └── RefreshButton
│   │   └── ArticleList
│   │       ├── ArticleCard
│   │       └── LoadMoreTrigger
│   └── ReaderPage
│       ├── TableOfContents
│       │   └── TocItem
│       ├── ArticleContent
│       │   └── MarkdownRenderer
│       └── FunctionPanel
│           ├── NotesTab
│           │   └── NoteEditor
│           └── AIChatTab
│               ├── ChatMessage
│               └── ChatInput
```

### 关键组件接口

#### Sidebar 组件

```typescript
interface SidebarProps {
  feeds: Feed[];
  activeFeedId?: string;
  onFeedSelect: (feedId: string) => void;
  onAddFeed: (url: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}
```

#### ArticleList 组件

```typescript
interface ArticleListProps {
  feedId?: string;
  articles: Article[];
  isLoading: boolean;
  onArticleClick: (articleId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}
```

#### ArticleCard 组件

```typescript
interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}
```

#### ReaderPage 组件

```typescript
interface ReaderPageProps {
  articleId: string;
}
```

#### TableOfContents 组件

```typescript
interface TableOfContentsProps {
  headings: Heading[];
  activeId?: string;
  onHeadingClick: (id: string) => void;
}

interface Heading {
  id: string;
  level: number;
  text: string;
}
```

#### NoteEditor 组件

```typescript
interface NoteEditorProps {
  articleId: string;
  initialContent?: string;
  onSave: (content: string) => void;
}
```

#### AIChatTab 组件

```typescript
interface AIChatTabProps {
  articleId: string;
  articleContent: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## 数据模型

### Feed（订阅源）

```typescript
interface Feed {
  id: string;
  title: string;
  url: string;
  siteUrl?: string;
  description?: string;
  iconUrl?: string;
  unreadCount: number;
  lastFetchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Article（文章）

```typescript
interface Article {
  id: string;
  feedId: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  url: string;
  publishedAt: Date;
  isRead: boolean;
  createdAt: Date;
}
```

### Note（笔记）

```typescript
interface Note {
  id: string;
  articleId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ChatHistory（聊天历史）

```typescript
interface ChatHistory {
  id: string;
  articleId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 数据模型

### 状态管理

使用 Zustand 管理全局状态：

```typescript
interface AppState {
  // Feeds
  feeds: Feed[];
  addFeed: (feed: Feed) => void;
  updateFeed: (id: string, updates: Partial<Feed>) => void;
  removeFeed: (id: string) => void;
  
  // Articles
  articles: Article[];
  addArticles: (articles: Article[]) => void;
  markAsRead: (articleId: string) => void;
  
  // UI State
  activeFeedId?: string;
  setActiveFeedId: (id?: string) => void;
}
```

### 本地存储（LocalStorage）

使用 LocalStorage 简化数据持久化：

```typescript
interface StorageService {
  // Feed operations
  getFeeds(): Feed[];
  saveFeed(feed: Feed): void;
  updateFeed(id: string, updates: Partial<Feed>): void;
  deleteFeed(id: string): void;
  
  // Article operations
  getArticles(feedId?: string): Article[];
  saveArticles(articles: Article[]): void;
  updateArticle(id: string, updates: Partial<Article>): void;
  
  // Note operations
  getNote(articleId: string): Note | null;
  saveNote(note: Note): void;
  deleteNote(articleId: string): void;
  
  // Chat history operations
  getChatHistory(articleId: string): ChatHistory | null;
  saveChatHistory(history: ChatHistory): void;
}
```

### Mock 服务接口

前端使用 mock 服务模拟后端 API，便于开发和测试：

```typescript
interface MockRSSService {
  // Feed operations - 返回预设的 mock 数据
  validateFeedUrl(url: string): Promise<boolean>;
  fetchFeed(url: string): Promise<Feed>;
  fetchArticles(feedUrl: string): Promise<Article[]>;
  
  // AI operations - 返回模拟的 AI 响应
  sendChatMessage(message: string, context: string): Promise<string>;
}
```

**Mock 数据说明**：
- 预设 3-5 个示例订阅源（科技、新闻、博客等）
- 每个订阅源包含 10-20 篇示例文章
- 文章内容使用 Markdown 格式，包含标题、段落、代码块等
- AI 聊天返回预设的智能回复（基于关键词匹配）
- 所有异步操作添加延迟（200-500ms）模拟网络请求

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性反思

在分析所有可测试的验收标准后，我们识别出以下可以合并或简化的冗余属性：

- 属性 1.2（添加到列表）和 1.3（获取文章）可以合并为一个综合属性，验证添加操作的完整副作用
- 属性 2.2（点击显示文章）和 3.1（以卡片形式显示）描述相同的行为，可以合并
- 属性 4.2、4.3、4.4 都是关于阅读页面的不同区域，可以合并为一个综合的布局属性
- 属性 8.3（添加新文章）和 8.4（更新计数）是刷新操作的连续步骤，可以合并

经过反思，我们将保留最有价值的独立属性，避免重复测试相同的逻辑。

### 订阅源管理属性

**属性 1: URL 验证正确性**
*对于任何* 输入的字符串，URL 验证函数应该正确识别有效的 RSS feed URL 格式
**验证需求: 1.1**

**属性 2: 添加订阅源的完整性**
*对于任何* 有效的 feed URL，成功添加后订阅列表应该包含该订阅源，且应该触发文章获取
**验证需求: 1.2, 1.3**

**属性 3: 重复添加阻止**
*对于任何* 已存在于订阅列表中的 feed URL，再次添加应该被阻止并返回错误提示
**验证需求: 1.5**

**属性 4: 无效 URL 错误处理**
*对于任何* 无效或无法访问的 feed URL，添加操作应该失败并显示错误信息，不应修改订阅列表
**验证需求: 1.4**

### 订阅源显示属性

**属性 5: 订阅源列表完整性**
*对于任何* 订阅源集合，侧边栏应该显示所有订阅源，且每个订阅源都应该可点击
**验证需求: 2.1**

**属性 6: 未读计数准确性**
*对于任何* 订阅源，显示的未读文章数量应该等于该订阅源中 isRead 为 false 的文章数量
**验证需求: 2.3**

**属性 7: 未读状态视觉反馈**
*对于任何* 订阅源，当且仅当其未读计数大于 0 时，应该应用突出显示的样式类
**验证需求: 2.4**

### 文章列表属性

**属性 8: 文章过滤正确性**
*对于任何* 选中的订阅源，文章列表应该只显示属于该订阅源的文章
**验证需求: 2.2, 3.1**

**属性 9: 文章卡片内容完整性**
*对于任何* 文章，渲染的卡片应该包含标题、摘要、来源名称和发布时间这些必需字段
**验证需求: 3.2**

**属性 10: 已读未读样式区分**
*对于任何* 文章，根据其 isRead 状态应该应用不同的视觉样式
**验证需求: 3.4**

**属性 11: 文章导航正确性**
*对于任何* 文章，点击其卡片应该导航到正确的阅读页面路由（/article/:articleId）
**验证需求: 3.5**

### 阅读页面属性

**属性 12: 阅读页面布局完整性**
*对于任何* 文章，阅读页面应该包含三个主要区域：左侧目录栏、中间内容区、右侧功能栏
**验证需求: 4.1, 4.2, 4.3, 4.4**

**属性 13: 打开文章自动标记已读**
*对于任何* 文章，在阅读页面打开后，该文章的 isRead 状态应该被设置为 true
**验证需求: 4.5**

### 目录功能属性

**属性 14: 标题解析正确性**
*对于任何* 包含 Markdown 标题的文章内容，目录解析器应该正确提取所有标题及其层级关系
**验证需求: 5.1**

**属性 15: 目录点击滚动**
*对于任何* 目录项，点击应该触发内容区滚动到对应标题的 DOM 元素位置
**验证需求: 5.2**

### 笔记功能属性

**属性 16: 笔记持久化往返一致性**
*对于任何* 文章和笔记内容，保存到 IndexedDB 后重新加载应该得到相同的笔记内容
**验证需求: 6.2, 6.4**

**属性 17: 笔记删除完整性**
*对于任何* 文章，清空笔记操作应该从 IndexedDB 中删除对应的笔记记录
**验证需求: 6.5**

### AI 聊天属性

**属性 18: AI 消息上下文完整性**
*对于任何* 用户发送的聊天消息，发送到 AI 服务的请求应该包含消息内容和完整的文章上下文
**验证需求: 7.2**

**属性 19: AI 响应显示正确性**
*对于任何* AI 服务返回的响应，应该作为 assistant 角色的消息添加到聊天历史中
**验证需求: 7.3**

**属性 20: AI 服务错误处理**
*对于任何* 失败的 AI 服务请求，应该显示错误提示，且不应该修改聊天历史
**验证需求: 7.5**

### 刷新功能属性

**属性 21: 刷新请求完整性**
*对于任何* 订阅源集合，点击刷新应该为每个订阅源发起文章获取请求
**验证需求: 8.1**

**属性 22: 刷新加载状态**
*对于任何* 刷新操作，在异步请求进行中应该显示加载指示器，完成后应该隐藏
**验证需求: 8.2, 8.4**

**属性 23: 新文章合并正确性**
*对于任何* 刷新获取的新文章，应该添加到对应订阅源的文章列表中，且不应该产生重复
**验证需求: 8.3**

**属性 24: 刷新失败数据不变性**
*对于任何* 失败的刷新操作，现有的订阅源和文章数据应该保持不变
**验证需求: 8.5**

## Mock 数据设计

### Mock 订阅源数据

预设以下示例订阅源：

```typescript
const mockFeeds: Feed[] = [
  {
    id: 'feed-1',
    title: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    siteUrl: 'https://techcrunch.com',
    description: '科技新闻和创业资讯',
    iconUrl: 'https://techcrunch.com/favicon.ico',
    unreadCount: 5,
    lastFetchedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'feed-2',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    siteUrl: 'https://news.ycombinator.com',
    description: '黑客新闻 - 技术和创业讨论',
    iconUrl: 'https://news.ycombinator.com/favicon.ico',
    unreadCount: 12,
    lastFetchedAt: new Date('2024-01-15T09:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T09:30:00Z'),
  },
  {
    id: 'feed-3',
    title: 'CSS-Tricks',
    url: 'https://css-tricks.com/feed/',
    siteUrl: 'https://css-tricks.com',
    description: '前端开发技巧和教程',
    iconUrl: 'https://css-tricks.com/favicon.ico',
    unreadCount: 3,
    lastFetchedAt: new Date('2024-01-15T08:00:00Z'),
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z'),
  },
];
```

### Mock 文章数据

每个订阅源包含 10-20 篇文章，文章内容使用 Markdown 格式：

```typescript
const mockArticles: Article[] = [
  {
    id: 'article-1',
    feedId: 'feed-1',
    title: 'React 19 发布：新特性详解',
    content: `# React 19 新特性

React 19 带来了许多令人兴奋的新特性...

## 1. Server Components

Server Components 允许你在服务器端渲染组件...

\`\`\`jsx
function ServerComponent() {
  return <div>Hello from server!</div>;
}
\`\`\`

## 2. Actions

新的 Actions API 简化了表单处理...`,
    summary: 'React 19 正式发布，带来 Server Components、Actions 等重要特性',
    author: 'Dan Abramov',
    url: 'https://techcrunch.com/article-1',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    isRead: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  },
  // ... 更多文章
];
```

### Mock AI 响应

AI 聊天功能使用关键词匹配返回预设回复：

```typescript
const mockAIResponses = {
  keywords: {
    '总结': '根据文章内容，主要讨论了...',
    '解释': '让我为你解释一下这个概念...',
    '代码': '关于代码部分，我注意到...',
    '观点': '从文章来看，作者的观点是...',
  },
  default: '这是一个很好的问题。根据文章内容，我认为...',
};

function generateMockAIResponse(message: string, context: string): string {
  // 简单的关键词匹配
  for (const [keyword, response] of Object.entries(mockAIResponses.keywords)) {
    if (message.includes(keyword)) {
      return response;
    }
  }
  return mockAIResponses.default;
}
```

### Mock 服务实现

```typescript
class MockRSSService implements MockRSSService {
  // 模拟网络延迟
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async validateFeedUrl(url: string): Promise<boolean> {
    await this.delay(200);
    // 简单的 URL 格式验证
    return url.startsWith('http') && url.includes('.');
  }
  
  async fetchFeed(url: string): Promise<Feed> {
    await this.delay(500);
    // 返回预设的 feed 或生成新的 mock feed
    const existingFeed = mockFeeds.find(f => f.url === url);
    if (existingFeed) {
      return existingFeed;
    }
    // 生成新的 mock feed
    return {
      id: `feed-${Date.now()}`,
      title: `订阅源 ${url}`,
      url,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  async fetchArticles(feedUrl: string): Promise<Article[]> {
    await this.delay(400);
    // 返回该 feed 的文章
    const feed = mockFeeds.find(f => f.url === feedUrl);
    if (!feed) return [];
    return mockArticles.filter(a => a.feedId === feed.id);
  }
  
  async sendChatMessage(message: string, context: string): Promise<string> {
    await this.delay(800);
    return generateMockAIResponse(message, context);
  }
}
```

## 错误处理

### 错误类型

应用需要处理以下类型的错误：

1. **网络错误**: API 请求失败、超时
2. **验证错误**: 无效的 feed URL、重复的订阅源
3. **解析错误**: RSS/Atom feed 格式错误
4. **存储错误**: IndexedDB 操作失败
5. **AI 服务错误**: AI API 调用失败或超时

### 错误处理策略

#### Feed 添加错误

```typescript
try {
  const isValid = await mockRSSService.validateFeedUrl(url);
  if (!isValid) {
    throw new ValidationError('无效的 RSS feed URL');
  }
  
  const existingFeed = feeds.find(f => f.url === url);
  if (existingFeed) {
    throw new ValidationError('该订阅源已存在');
  }
  
  const feed = await mockRSSService.fetchFeed(url);
  storageService.saveFeed(feed);
  
} catch (error) {
  if (error instanceof ValidationError) {
    showToast(error.message, 'error');
  } else if (error instanceof NetworkError) {
    showToast('网络连接失败，请检查网络设置', 'error');
  } else {
    showToast('添加订阅源失败，请稍后重试', 'error');
  }
}
```

#### 刷新错误

```typescript
try {
  setIsRefreshing(true);
  const results = await Promise.allSettled(
    feeds.map(feed => mockRSSService.fetchArticles(feed.url))
  );
  
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    showToast(`${failures.length} 个订阅源刷新失败`, 'warning');
  }
  
} catch (error) {
  showToast('刷新失败，请稍后重试', 'error');
} finally {
  setIsRefreshing(false);
}
```

#### AI 聊天错误

```typescript
try {
  const response = await mockRSSService.sendChatMessage(message, articleContent);
  addMessage({ role: 'assistant', content: response });
  
} catch (error) {
  if (error instanceof TimeoutError) {
    showToast('AI 响应超时，请重试', 'error');
  } else {
    showToast('AI 服务暂时不可用', 'error');
  }
  // 保持聊天历史不变，允许用户重试
}
```

### 用户反馈

所有错误都应该通过以下方式向用户反馈：

- **Toast 通知**: 临时的错误提示（3-5秒自动消失）
- **内联错误**: 表单验证错误显示在输入框下方
- **错误状态**: 订阅源旁显示错误图标，悬停显示详情
- **重试按钮**: 对于可恢复的错误，提供重试操作

## 测试策略

### 单元测试

使用 Vitest 进行单元测试，覆盖以下内容：

#### 工具函数测试

- URL 验证函数
- 日期格式化函数
- Markdown 标题提取函数
- 文章去重逻辑

#### 组件测试

使用 React Testing Library 测试组件：

- ArticleCard 渲染正确的内容
- FeedItem 显示正确的未读计数
- NoteEditor 保存和加载笔记
- TableOfContents 生成正确的目录结构

#### 服务层测试

- RSSService 的 API 调用
- IndexedDB 的 CRUD 操作
- 状态管理的 actions 和 selectors

### 属性测试

使用 fast-check 进行属性测试，验证正确性属性：

#### 配置

每个属性测试应该运行至少 100 次迭代：

```typescript
import fc from 'fast-check';

fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // property assertion
  }),
  { numRuns: 100 }
);
```

#### 测试标注

每个属性测试必须使用注释标注对应的设计文档属性：

```typescript
/**
 * Feature: rss-reader-frontend, Property 1: URL 验证正确性
 */
test('URL validation correctly identifies valid RSS feed URLs', () => {
  fc.assert(
    fc.property(fc.webUrl(), (url) => {
      const isValid = validateFeedUrl(url);
      // assertion logic
    }),
    { numRuns: 100 }
  );
});
```

#### 生成器策略

为测试编写智能生成器：

```typescript
// Feed 生成器
const feedArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  url: fc.webUrl(),
  unreadCount: fc.nat(),
  createdAt: fc.date(),
});

// Article 生成器
const articleArbitrary = fc.record({
  id: fc.uuid(),
  feedId: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  content: fc.lorem({ maxCount: 10 }),
  isRead: fc.boolean(),
  publishedAt: fc.date(),
});

// Markdown 内容生成器（包含标题）
const markdownWithHeadingsArbitrary = fc.array(
  fc.tuple(
    fc.integer({ min: 1, max: 6 }), // heading level
    fc.string({ minLength: 1, maxLength: 50 }) // heading text
  )
).map(headings => 
  headings.map(([level, text]) => `${'#'.repeat(level)} ${text}`).join('\n\n')
);
```

#### 核心属性测试

重点测试以下属性：

1. **属性 2**: 添加订阅源的完整性
2. **属性 6**: 未读计数准确性
3. **属性 8**: 文章过滤正确性
4. **属性 14**: 标题解析正确性
5. **属性 16**: 笔记持久化往返一致性
6. **属性 23**: 新文章合并正确性

### 集成测试

使用 Playwright 进行端到端测试：

- 完整的添加订阅源流程
- 文章列表到阅读页面的导航
- 笔记保存和加载
- AI 聊天交互

### 测试覆盖率目标

- 单元测试覆盖率: > 80%
- 属性测试: 覆盖所有 24 个正确性属性
- 集成测试: 覆盖主要用户流程

## 性能考虑

### 优化策略

1. **虚拟滚动**: 文章列表使用虚拟滚动，只渲染可见区域的文章
2. **懒加载**: 图片和 Markdown 内容懒加载
3. **防抖**: 搜索和笔记自动保存使用防抖
4. **缓存**: 使用 React Query 缓存 API 响应
5. **代码分割**: 按路由分割代码，减少初始加载时间

### 性能指标

- 首次内容绘制 (FCP): < 1.5s
- 最大内容绘制 (LCP): < 2.5s
- 首次输入延迟 (FID): < 100ms
- 累积布局偏移 (CLS): < 0.1

## 部署和构建

### 构建配置

使用 Vite 进行生产构建：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw'],
        }
      }
    }
  }
});
```

### 环境变量

```
VITE_API_BASE_URL=https://api.example.com
VITE_AI_API_KEY=your_api_key
```

### 部署目标

- 静态托管平台（Vercel, Netlify, Cloudflare Pages）
- 支持客户端路由的配置
- HTTPS 强制启用

## 未来扩展

以下功能可以在 MVP 之后添加：

1. **搜索功能**: 全文搜索文章
2. **收藏功能**: 收藏重要文章
3. **分类管理**: 将订阅源组织到文件夹
4. **导入导出**: OPML 格式的订阅源导入导出
5. **主题切换**: 浅色/深色主题
6. **响应式设计**: 移动端适配
7. **离线支持**: Service Worker 和离线缓存
8. **快捷键**: 键盘快捷键支持
9. **文章分享**: 分享到社交媒体
10. **阅读统计**: 阅读时间和习惯统计
