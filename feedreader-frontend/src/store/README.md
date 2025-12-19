# 状态管理 Store

本目录包含使用 Zustand 实现的全局状态管理。

## 使用方法

### 在组件中使用

```tsx
import { useAppStore } from '../store';

function MyComponent() {
  // 获取状态
  const feeds = useAppStore((state) => state.feeds);
  const articles = useAppStore((state) => state.articles);
  const activeFeedId = useAppStore((state) => state.activeFeedId);
  
  // 获取 actions
  const addFeed = useAppStore((state) => state.addFeed);
  const markAsRead = useAppStore((state) => state.markAsRead);
  const setActiveFeedId = useAppStore((state) => state.setActiveFeedId);
  
  // 使用状态和 actions
  return (
    <div>
      <button onClick={() => setActiveFeedId('feed-1')}>
        Select Feed
      </button>
    </div>
  );
}
```

### 初始化 Store

在应用启动时，需要从 LocalStorage 加载数据：

```tsx
import { useAppStore } from './store';
import { useEffect } from 'react';

function App() {
  const initializeFromStorage = useAppStore((state) => state.initializeFromStorage);
  
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);
  
  return <div>...</div>;
}
```

## API

### 状态

- `feeds: Feed[]` - 订阅源列表
- `articles: Article[]` - 文章列表
- `activeFeedId?: string` - 当前选中的订阅源 ID

### Feed Actions

- `addFeed(feed: Feed)` - 添加订阅源
- `updateFeed(id: string, updates: Partial<Feed>)` - 更新订阅源
- `removeFeed(id: string)` - 删除订阅源
- `setFeeds(feeds: Feed[])` - 设置订阅源列表

### Article Actions

- `addArticles(articles: Article[])` - 添加文章（自动去重）
- `markAsRead(articleId: string)` - 标记文章为已读
- `setArticles(articles: Article[])` - 设置文章列表

### UI Actions

- `setActiveFeedId(id?: string)` - 设置当前选中的订阅源

### 工具方法

- `initializeFromStorage()` - 从 LocalStorage 初始化状态
- `updateUnreadCounts()` - 更新所有订阅源的未读计数

## 特性

### 自动持久化

所有状态变更会自动同步到 LocalStorage，确保数据持久化。

### 未读计数自动更新

当文章被标记为已读或添加新文章时，相关订阅源的未读计数会自动更新。

### 文章去重

`addArticles` 方法会自动去重，避免重复添加相同的文章。

### 级联删除

删除订阅源时，会自动删除该订阅源下的所有文章。
