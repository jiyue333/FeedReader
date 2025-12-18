# RSS 阅读器后端 API 规范文档

## 概述

本文档定义了 RSS 阅读器前端应用所需的后端 API 接口规范。所有接口遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。

### 基础信息

- **Base URL**: `https://api.example.com/v1`
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`
- **字符编码**: UTF-8

### 通用响应格式

#### 成功响应

```json
{
  "success": true,
  "data": { /* 响应数据 */ },
  "message": "操作成功"
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { /* 可选的详细信息 */ }
  }
}
```

### 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `UNAUTHORIZED` | 401 | 未授权或 Token 无效 |
| `FORBIDDEN` | 403 | 无权限访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `DUPLICATE_RESOURCE` | 409 | 资源已存在（如重复订阅） |
| `NETWORK_ERROR` | 502 | 上游服务（RSS 源）连接失败 |
| `AI_SERVICE_ERROR` | 503 | AI 服务不可用 |
| `TIMEOUT_ERROR` | 504 | 请求超时 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 1. 订阅源管理 API

### 1.1 验证订阅源 URL

验证 RSS feed URL 的有效性，不保存到数据库。

**请求**

```http
POST /feeds/validate
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**

```json
{
  "url": "https://example.com/feed.xml"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "feedInfo": {
      "title": "示例博客",
      "description": "这是一个示例博客",
      "siteUrl": "https://example.com",
      "iconUrl": "https://example.com/favicon.ico"
    }
  }
}
```

**错误响应示例**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL 格式无效"
  }
}
```

---

### 1.2 添加订阅源

添加新的 RSS 订阅源到用户的订阅列表。

**请求**

```http
POST /feeds
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**

```json
{
  "url": "https://example.com/feed.xml"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "feed": {
      "id": "feed-123",
      "title": "示例博客",
      "url": "https://example.com/feed.xml",
      "siteUrl": "https://example.com",
      "description": "这是一个示例博客",
      "iconUrl": "https://example.com/favicon.ico",
      "unreadCount": 0,
      "lastFetchedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "订阅源添加成功"
}
```

**错误响应示例**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "该订阅源已存在"
  }
}
```

---

### 1.3 获取订阅源列表

获取当前用户的所有订阅源。

**请求**

```http
GET /feeds
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "feeds": [
      {
        "id": "feed-123",
        "title": "示例博客",
        "url": "https://example.com/feed.xml",
        "siteUrl": "https://example.com",
        "description": "这是一个示例博客",
        "iconUrl": "https://example.com/favicon.ico",
        "unreadCount": 5,
        "lastFetchedAt": "2024-01-15T10:00:00Z",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 1.4 删除订阅源

删除指定的订阅源及其所有文章。

**请求**

```http
DELETE /feeds/{feedId}
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "message": "订阅源删除成功"
}
```

---

### 1.5 刷新订阅源

刷新指定订阅源，获取最新文章。

**请求**

```http
POST /feeds/{feedId}/refresh
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "newArticlesCount": 3,
    "feed": {
      "id": "feed-123",
      "title": "示例博客",
      "unreadCount": 8,
      "lastFetchedAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  },
  "message": "刷新成功，获取了 3 篇新文章"
}
```

---

### 1.6 批量刷新订阅源

刷新所有订阅源或指定的多个订阅源。

**请求**

```http
POST /feeds/refresh-all
Authorization: Bearer {token}
```

**请求体（可选）**

```json
{
  "feedIds": ["feed-123", "feed-456"]
}
```

如果不提供 `feedIds`，则刷新所有订阅源。

**响应**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "feedId": "feed-123",
        "success": true,
        "newArticlesCount": 3
      },
      {
        "feedId": "feed-456",
        "success": false,
        "error": "网络连接失败"
      }
    ],
    "totalNewArticles": 3,
    "successCount": 1,
    "failureCount": 1
  },
  "message": "刷新完成"
}
```

---

## 2. 文章管理 API

### 2.1 获取文章列表

获取文章列表，支持按订阅源过滤和分页。

**请求**

```http
GET /articles?feedId={feedId}&page={page}&limit={limit}&unreadOnly={boolean}
Authorization: Bearer {token}
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `feedId` | string | 否 | 订阅源 ID，不提供则返回所有文章 |
| `page` | number | 否 | 页码，默认 1 |
| `limit` | number | 否 | 每页数量，默认 20，最大 100 |
| `unreadOnly` | boolean | 否 | 只返回未读文章，默认 false |

**响应**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article-123",
        "feedId": "feed-123",
        "title": "文章标题",
        "content": "# 文章内容\n\n这是文章正文...",
        "summary": "文章摘要",
        "author": "作者名",
        "url": "https://example.com/article-1",
        "publishedAt": "2024-01-15T10:00:00Z",
        "isRead": false,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2.2 获取单篇文章

获取指定文章的详细信息。

**请求**

```http
GET /articles/{articleId}
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": "article-123",
      "feedId": "feed-123",
      "title": "文章标题",
      "content": "# 文章内容\n\n这是文章正文...",
      "summary": "文章摘要",
      "author": "作者名",
      "url": "https://example.com/article-1",
      "publishedAt": "2024-01-15T10:00:00Z",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "feed": {
      "id": "feed-123",
      "title": "示例博客",
      "iconUrl": "https://example.com/favicon.ico"
    }
  }
}
```

---

### 2.3 标记文章为已读

将指定文章标记为已读。

**请求**

```http
PATCH /articles/{articleId}/read
Authorization: Bearer {token}
```

**请求体**

```json
{
  "isRead": true
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": "article-123",
      "isRead": true
    }
  },
  "message": "文章已标记为已读"
}
```

---

### 2.4 批量标记文章为已读

批量标记多篇文章为已读。

**请求**

```http
PATCH /articles/batch-read
Authorization: Bearer {token}
```

**请求体**

```json
{
  "articleIds": ["article-123", "article-456"],
  "isRead": true
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "updatedCount": 2
  },
  "message": "已标记 2 篇文章为已读"
}
```

---

## 3. 笔记管理 API

### 3.1 获取文章笔记

获取指定文章的所有笔记。

**请求**

```http
GET /articles/{articleId}/notes
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-123",
      "articleId": "article-123",
      "items": [
        {
          "id": "note-item-1",
          "content": "这是我的笔记内容",
          "quotedText": "引用的文章文字",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

### 3.2 保存笔记

保存或更新文章笔记。如果笔记不存在则创建，存在则更新。

**请求**

```http
PUT /articles/{articleId}/notes
Authorization: Bearer {token}
```

**请求体**

```json
{
  "items": [
    {
      "id": "note-item-1",
      "content": "这是我的笔记内容",
      "quotedText": "引用的文章文字"
    }
  ]
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-123",
      "articleId": "article-123",
      "items": [
        {
          "id": "note-item-1",
          "content": "这是我的笔记内容",
          "quotedText": "引用的文章文字",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "笔记保存成功"
}
```

---

### 3.3 删除笔记

删除指定文章的所有笔记。

**请求**

```http
DELETE /articles/{articleId}/notes
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "message": "笔记删除成功"
}
```

---

### 3.4 删除单条笔记项

删除笔记中的某一条记录。

**请求**

```http
DELETE /articles/{articleId}/notes/{noteItemId}
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "message": "笔记项删除成功"
}
```

---

## 4. AI 聊天 API

### 4.1 发送聊天消息

向 AI 服务发送消息，获取基于文章内容的回复。

**请求**

```http
POST /ai/chat
Authorization: Bearer {token}
```

**请求体**

```json
{
  "articleId": "article-123",
  "message": "请总结这篇文章的主要观点",
  "context": "# 文章标题\n\n文章内容...",
  "conversationHistory": [
    {
      "role": "user",
      "content": "之前的问题"
    },
    {
      "role": "assistant",
      "content": "之前的回答"
    }
  ]
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `articleId` | string | 是 | 文章 ID |
| `message` | string | 是 | 用户消息 |
| `context` | string | 是 | 文章内容（Markdown 格式） |
| `conversationHistory` | array | 否 | 对话历史，用于上下文理解 |

**响应**

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-123",
      "role": "assistant",
      "content": "根据文章内容，主要观点包括...",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  }
}
```

**错误响应示例**

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI 服务暂时不可用，请稍后重试"
  }
}
```

---

### 4.2 获取聊天历史

获取指定文章的聊天历史记录。

**请求**

```http
GET /articles/{articleId}/chat-history
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "chatHistory": {
      "id": "chat-123",
      "articleId": "article-123",
      "messages": [
        {
          "id": "msg-1",
          "role": "user",
          "content": "请总结这篇文章",
          "timestamp": "2024-01-15T10:00:00Z"
        },
        {
          "id": "msg-2",
          "role": "assistant",
          "content": "文章主要讨论了...",
          "timestamp": "2024-01-15T10:00:05Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:05Z"
    }
  }
}
```

---

### 4.3 保存聊天历史

保存或更新聊天历史记录。

**请求**

```http
PUT /articles/{articleId}/chat-history
Authorization: Bearer {token}
```

**请求体**

```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "请总结这篇文章",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "文章主要讨论了...",
      "timestamp": "2024-01-15T10:00:05Z"
    }
  ]
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "chatHistory": {
      "id": "chat-123",
      "articleId": "article-123",
      "messages": [ /* ... */ ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:05Z"
    }
  },
  "message": "聊天历史保存成功"
}
```

---

### 4.4 删除聊天历史

删除指定文章的聊天历史。

**请求**

```http
DELETE /articles/{articleId}/chat-history
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "message": "聊天历史删除成功"
}
```

---

## 5. 用户认证 API

### 5.1 用户注册

注册新用户账号。

**请求**

```http
POST /auth/register
Content-Type: application/json
```

**请求体**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "用户名"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "用户名",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

---

### 5.2 用户登录

用户登录获取访问令牌。

**请求**

```http
POST /auth/login
Content-Type: application/json
```

**请求体**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "用户名"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "message": "登录成功"
}
```

---

### 5.3 刷新令牌

刷新访问令牌。

**请求**

```http
POST /auth/refresh
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

### 5.4 用户登出

用户登出，使令牌失效。

**请求**

```http
POST /auth/logout
Authorization: Bearer {token}
```

**响应**

```json
{
  "success": true,
  "message": "登出成功"
}
```

---

## 6. 数据模型

### 6.1 Feed（订阅源）

```typescript
interface Feed {
  id: string;                // 订阅源 ID
  title: string;             // 订阅源标题
  url: string;               // RSS feed URL
  siteUrl?: string;          // 网站 URL
  description?: string;      // 描述
  iconUrl?: string;          // 图标 URL
  unreadCount: number;       // 未读文章数
  lastFetchedAt?: Date;      // 最后获取时间
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
}
```

---

### 6.2 Article（文章）

```typescript
interface Article {
  id: string;                // 文章 ID
  feedId: string;            // 所属订阅源 ID
  title: string;             // 文章标题
  content: string;           // 文章内容（Markdown 格式）
  summary?: string;          // 摘要
  author?: string;           // 作者
  url: string;               // 原文链接
  publishedAt: Date;         // 发布时间
  isRead: boolean;           // 是否已读
  createdAt: Date;           // 创建时间
}
```

---

### 6.3 Note（笔记）

```typescript
interface NoteItem {
  id: string;                // 笔记项 ID
  content: string;           // 笔记内容
  quotedText?: string;       // 引用的文章文字
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
}

interface Note {
  id: string;                // 笔记 ID
  articleId: string;         // 关联的文章 ID
  items: NoteItem[];         // 笔记项列表
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
}
```

---

### 6.4 ChatHistory（聊天历史）

```typescript
interface ChatMessage {
  id: string;                // 消息 ID
  role: 'user' | 'assistant'; // 角色
  content: string;           // 消息内容
  timestamp: Date;           // 时间戳
}

interface ChatHistory {
  id: string;                // 聊天历史 ID
  articleId: string;         // 关联的文章 ID
  messages: ChatMessage[];   // 消息列表
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
}
```

---

## 7. 实现建议

### 7.1 RSS 解析

后端需要实现 RSS/Atom feed 解析功能：

- 支持 RSS 2.0、RSS 1.0、Atom 格式
- 提取文章标题、内容、作者、发布时间等信息
- 将 HTML 内容转换为 Markdown 格式（推荐使用 Turndown 或类似库）
- 处理相对 URL 转换为绝对 URL
- 处理图片、链接等资源

### 7.2 定时任务

建议实现定时任务自动刷新订阅源：

- 每 15-30 分钟刷新一次所有订阅源
- 使用队列系统（如 Bull、BullMQ）处理刷新任务
- 实现失败重试机制
- 记录刷新日志

### 7.3 AI 集成

AI 聊天功能建议集成以下服务之一：

- OpenAI GPT-4 API
- Anthropic Claude API
- Google Gemini API
- 自建 LLM 服务

实现要点：
- 限制上下文长度（建议 4000-8000 tokens）
- 实现流式响应（Server-Sent Events）
- 添加速率限制
- 缓存常见问题的回答

### 7.4 性能优化

- 使用 Redis 缓存订阅源和文章数据
- 实现分页和游标分页
- 为文章内容建立全文搜索索引（Elasticsearch）
- 使用 CDN 缓存静态资源

### 7.5 安全性

- 实现 JWT 认证和刷新机制
- 添加请求速率限制（Rate Limiting）
- 验证和清理用户输入
- 使用 HTTPS 加密传输
- 实现 CORS 策略

---

## 8. 测试建议

### 8.1 单元测试

- RSS 解析器测试
- 数据模型验证测试
- 业务逻辑测试

### 8.2 集成测试

- API 端点测试
- 数据库操作测试
- 外部服务集成测试

### 8.3 端到端测试

- 完整用户流程测试
- 错误处理测试
- 性能测试

---

## 9. 部署建议

### 9.1 技术栈推荐

- **Node.js**: Express.js / Fastify / NestJS
- **Python**: FastAPI / Django REST Framework
- **Go**: Gin / Echo
- **数据库**: PostgreSQL + Redis
- **消息队列**: Redis / RabbitMQ
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes（生产环境）

### 9.2 环境变量

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/rss_reader
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=86400

# AI 服务
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4

# 应用配置
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# RSS 刷新
RSS_REFRESH_INTERVAL=1800000  # 30 分钟（毫秒）
```

---

## 10. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2024-01-15 | 初始版本 |

---

## 附录

### A. HTTP 状态码使用规范

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 500 | Internal Server Error | 服务器错误 |
| 502 | Bad Gateway | 上游服务错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

### B. 日期时间格式

所有日期时间字段使用 ISO 8601 格式：

```
2024-01-15T10:00:00Z
```

### C. 分页参数

标准分页参数：

- `page`: 页码，从 1 开始
- `limit`: 每页数量，默认 20，最大 100

响应包含分页信息：

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
