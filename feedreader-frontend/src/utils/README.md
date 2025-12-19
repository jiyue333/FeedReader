# 错误处理工具

本目录包含应用的错误处理工具和自定义错误类。

## 自定义错误类

### ValidationError
用于输入验证失败的场景。

**使用场景:**
- 无效的 RSS feed URL
- 重复添加订阅源
- 空输入或格式错误

**示例:**
```typescript
if (!url.trim()) {
  throw new ValidationError('URL 不能为空');
}
```

### NetworkError
用于网络请求失败的场景。

**使用场景:**
- API 请求失败
- 无法连接到服务器
- DNS 解析失败

**示例:**
```typescript
if (response.status >= 500) {
  throw new NetworkError('服务器错误');
}
```

### StorageError
用于本地存储操作失败的场景。

**使用场景:**
- LocalStorage 空间不足
- 数据序列化失败
- 读写权限问题

**示例:**
```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  throw new StorageError('保存数据失败');
}
```

### AIServiceError
用于 AI 服务调用失败的场景。

**使用场景:**
- AI API 不可用
- API 密钥无效
- 请求配额超限

**示例:**
```typescript
if (response.status === 503) {
  throw new AIServiceError('AI 服务暂时不可用');
}
```

### TimeoutError
用于请求超时的场景。

**使用场景:**
- 网络请求超时
- 长时间无响应
- 服务器响应缓慢

**示例:**
```typescript
const timeout = setTimeout(() => {
  throw new TimeoutError('请求超时');
}, 5000);
```

## 工具函数

### getErrorMessage(error: unknown): string
根据错误类型返回用户友好的错误消息。

**参数:**
- `error`: 任意类型的错误对象

**返回:**
- 用户友好的错误消息字符串

**示例:**
```typescript
try {
  await someOperation();
} catch (error) {
  const message = getErrorMessage(error);
  showToast(message, 'error');
}
```

### isRetryableError(error: unknown): boolean
判断错误是否可以重试。

**参数:**
- `error`: 任意类型的错误对象

**返回:**
- `true` 如果错误可以重试（NetworkError, TimeoutError, AIServiceError）
- `false` 如果错误不应该重试（ValidationError, StorageError）

**示例:**
```typescript
try {
  await sendMessage();
} catch (error) {
  if (isRetryableError(error)) {
    // 显示重试按钮
    setShowRetryButton(true);
  } else {
    // 显示错误消息，不提供重试选项
    showError(getErrorMessage(error));
  }
}
```

## 错误处理最佳实践

### 1. 使用特定的错误类型
```typescript
// ❌ 不好
throw new Error('Invalid URL');

// ✅ 好
throw new ValidationError('Invalid URL');
```

### 2. 在服务层抛出错误
```typescript
// 在服务层
async fetchFeed(url: string): Promise<Feed> {
  if (!url) {
    throw new ValidationError('URL 不能为空');
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new NetworkError('获取订阅源失败');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('网络请求失败');
  }
}
```

### 3. 在组件中捕获并显示错误
```typescript
// 在组件中
const handleAddFeed = async () => {
  try {
    await mockRSSService.validateFeedUrl(url);
    const feed = await mockRSSService.fetchFeed(url);
    addFeed(feed);
    showToast('添加成功', 'success');
  } catch (error) {
    const message = getErrorMessage(error);
    showToast(message, 'error');
  }
};
```

### 4. 为可重试的错误提供重试选项
```typescript
const handleSendMessage = async () => {
  try {
    await sendChatMessage(message);
  } catch (error) {
    setError(getErrorMessage(error));
    
    if (isRetryableError(error)) {
      // 保留消息，允许重试
      setShowRetryButton(true);
    } else {
      // 清除消息，不允许重试
      clearMessage();
    }
  }
};
```

### 5. 在状态管理中处理错误并回滚
```typescript
addFeed: (feed: Feed) => {
  set((state) => ({
    feeds: [...state.feeds, feed],
  }));
  
  try {
    storageService.saveFeed(feed);
  } catch (error) {
    // 回滚状态
    set((state) => ({
      feeds: state.feeds.filter(f => f.id !== feed.id),
    }));
    throw error;
  }
}
```

## 全局错误边界

应用使用 `ErrorBoundary` 组件捕获 React 组件树中的错误，防止整个应用崩溃。

**位置:** `src/components/ErrorBoundary.tsx`

**使用:**
```typescript
// 在 App.tsx 中
<ErrorBoundary>
  <BrowserRouter>
    <Routes>
      {/* 路由配置 */}
    </Routes>
  </BrowserRouter>
</ErrorBoundary>
```

**自定义错误 UI:**
```typescript
<ErrorBoundary
  fallback={(error, resetError) => (
    <CustomErrorUI error={error} onReset={resetError} />
  )}
>
  {children}
</ErrorBoundary>
```
