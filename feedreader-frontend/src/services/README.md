# Storage Service

本地存储服务，基于 LocalStorage 实现数据持久化。

## 功能特性

- ✅ Feed（订阅源）的 CRUD 操作
- ✅ Article（文章）的 CRUD 操作
- ✅ Note（笔记）的 CRUD 操作
- ✅ ChatHistory（聊天历史）的 CRUD 操作
- ✅ 自动处理日期序列化和反序列化
- ✅ 错误处理和日志记录

## 使用方法

### 导入服务

```typescript
import { storageService } from './services';
```

### Feed 操作

```typescript
// 获取所有订阅源
const feeds = storageService.getFeeds();

// 保存订阅源
storageService.saveFeed(feed);

// 更新订阅源
storageService.updateFeed(feedId, { unreadCount: 5 });

// 删除订阅源（会同时删除相关文章）
storageService.deleteFeed(feedId);
```

### Article 操作

```typescript
// 获取所有文章
const allArticles = storageService.getArticles();

// 获取特定订阅源的文章
const feedArticles = storageService.getArticles(feedId);

// 保存文章（自动合并去重）
storageService.saveArticles(articles);

// 更新文章
storageService.updateArticle(articleId, { isRead: true });
```

### Note 操作

```typescript
// 获取文章的笔记
const note = storageService.getNote(articleId);

// 保存笔记
storageService.saveNote(note);

// 删除笔记
storageService.deleteNote(articleId);
```

### ChatHistory 操作

```typescript
// 获取文章的聊天历史
const chatHistory = storageService.getChatHistory(articleId);

// 保存聊天历史
storageService.saveChatHistory(chatHistory);
```

## 数据持久化

所有数据存储在 LocalStorage 中，使用以下键：

- `rss_reader_feeds` - 订阅源列表
- `rss_reader_articles` - 文章列表
- `rss_reader_notes` - 笔记列表
- `rss_reader_chat_histories` - 聊天历史列表

## 日期处理

服务自动处理日期的序列化和反序列化：

- 保存时：Date 对象 → ISO 字符串
- 读取时：ISO 字符串 → Date 对象

支持的日期字段：
- Feed: `createdAt`, `updatedAt`, `lastFetchedAt`
- Article: `publishedAt`, `createdAt`
- Note: `createdAt`, `updatedAt`
- ChatHistory: `createdAt`, `updatedAt`
- ChatMessage: `timestamp`

## 错误处理

所有操作都包含错误处理：

- 读取操作失败时返回空数组或 null
- 写入操作失败时抛出错误
- 所有错误都会记录到控制台

## 测试

运行演示代码来验证功能：

```typescript
import { runAllDemos } from './services/StorageService.demo';

// 在浏览器控制台运行
runAllDemos();
```

## 实现细节

### 数据合并策略

- **Feeds**: 按 ID 去重，相同 ID 的 Feed 会被更新
- **Articles**: 按 ID 去重，使用 Map 确保唯一性
- **Notes**: 每个文章只能有一个笔记，按 articleId 去重
- **ChatHistories**: 每个文章只能有一个聊天历史，按 articleId 去重

### 级联删除

删除 Feed 时会自动删除该 Feed 下的所有 Articles。

### 性能考虑

- 使用 Map 数据结构优化查找和去重
- 批量操作（如 saveArticles）一次性写入
- 错误时不影响现有数据
