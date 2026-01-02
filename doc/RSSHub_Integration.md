# RSSHub Integration Guide

## Overview

AnkiFlow现在支持通过RSSHub将URL转换为RSS feed，作为URL导入的优先方案。如果RSSHub不支持该URL，系统会自动fallback到原有的网页爬取方案（trafilatura + BeautifulSoup）。

## What is RSSHub?

RSSHub是一个开源的万物皆可RSS项目，可以为各种网站生成标准的RSS feed。官方实例：https://rsshub.app

## Supported Sites (当前支持的网站)

### 中文网站
- **知乎**
  - 问题：`https://www.zhihu.com/question/123456`
  - 用户动态：`https://www.zhihu.com/people/username`

- **B站**
  - 视频：`https://www.bilibili.com/video/BV1xx411c7mD`
  - UP主：`https://space.bilibili.com/123456` 或 `https://www.bilibili.com/@username`

- **微博**
  - 用户：`https://weibo.com/u/1234567890` 或 `https://weibo.com/username`

- **小红书**
  - 用户：`https://www.xiaohongshu.com/user/profile/xxx`

- **豆瓣**
  - 用户：`https://www.douban.com/people/username`

### 国际网站
- **Twitter/X**
  - 用户：`https://twitter.com/username` 或 `https://x.com/username`

- **GitHub**
  - 仓库：`https://github.com/user/repo`
  - 用户followers：`https://github.com/username`

- **YouTube**
  - 频道：`https://www.youtube.com/channel/UCxxx` 或 `https://www.youtube.com/@handle`

## How It Works (工作流程)

```
URL Import Request
    ↓
1. Try RSSHub
   - Match URL pattern to RSSHub route
   - Fetch RSS feed from RSSHub
   - Extract latest entry content
    ↓
2. If RSSHub fails → Fallback to Web Scraping
   - Use trafilatura for article extraction
   - Use BeautifulSoup as secondary fallback
    ↓
3. Create Document
   - Save to database
   - Chunk & embed in background
```

## Configuration (配置)

在`.env`文件中可以配置以下选项：

```bash
# 启用/禁用RSSHub（默认启用）
RSSHUB_ENABLED=true

# RSSHub实例URL（默认使用官方实例）
RSSHUB_BASE_URL=https://rsshub.app

# RSSHub请求超时时间（秒）
RSSHUB_TIMEOUT=10.0
```

### 使用自建RSSHub实例

如果你有自己的RSSHub实例，可以修改`RSSHUB_BASE_URL`：

```bash
RSSHUB_BASE_URL=https://your-rsshub-instance.com
```

## API Usage (API使用)

URL导入API保持不变，RSSHub集成是透明的：

```bash
curl -X POST http://localhost:8000/api/import/url \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "url": "https://www.zhihu.com/question/123456",
    "custom_title": "Optional Custom Title"
  }'
```

### Response

成功响应示例：

```json
{
  "success": true,
  "data": {
    "document_id": "uuid-here",
    "title": "Article Title",
    "url": "https://www.zhihu.com/question/123456",
    "status": "pending",
    "text_length": 1234,
    "chunks_created": 0
  }
}
```

## Logging (日志)

系统会记录RSSHub的使用情况：

- `rsshub_route_matched`: URL成功匹配到RSSHub路由
- `rsshub_no_route`: URL没有对应的RSSHub路由
- `rsshub_entry_found_exact`: 找到精确匹配的RSS条目
- `rsshub_entry_found_latest`: 使用最新的RSS条目
- `url_import_fallback_to_scraping`: RSSHub失败，fallback到网页爬取

## Adding New Sites (添加新网站支持)

要添加新的网站支持，编辑`backend/app/services/rsshub_service.py`中的`RSSHUB_ROUTES`列表：

```python
RSSHUB_ROUTES = [
    # 格式：(hostname_pattern, path_regex, build_route_function)
    
    # 示例：添加新网站
    (r"example\.com", r"^/article/(?P<id>\d+)", lambda m: f"/example/article/{m['id']}"),
    
    # ... 其他规则
]
```

### Route Rule Format

每个规则包含三部分：

1. **hostname_pattern**: 正则表达式匹配域名
2. **path_regex**: 正则表达式匹配路径（可以为空）
3. **build_route_function**: 根据匹配结果构建RSSHub路由的函数

## Fallback Behavior (降级行为)

RSSHub在以下情况会fallback到网页爬取：

1. URL不匹配任何RSSHub路由规则
2. RSSHub实例返回错误（404, 500等）
3. RSS feed为空或解析失败
4. RSSHub被禁用（`RSSHUB_ENABLED=false`）

## Performance Considerations (性能考虑)

- **RSSHub优先**：通常比网页爬取更快更稳定
- **超时设置**：默认10秒超时，可通过`RSSHUB_TIMEOUT`调整
- **缓存**：RSSHub官方实例有缓存机制，重复请求会很快
- **自建实例**：如果需要更高性能，建议自建RSSHub实例

## Troubleshooting (故障排查)

### RSSHub返回404

- 检查URL格式是否正确
- 查看RSSHub文档确认路由是否存在
- 尝试在浏览器访问RSSHub URL验证

### 总是fallback到网页爬取

- 检查`RSSHUB_ENABLED`是否为true
- 查看日志确认是否有路由匹配
- 验证`RSSHUB_BASE_URL`是否可访问

### 内容提取不完整

- RSSHub可能只返回摘要，不是全文
- 可以禁用RSSHub强制使用网页爬取
- 或者修改RSSHub路由参数获取全文

## Examples (使用示例)

### 导入知乎问题

```bash
curl -X POST http://localhost:8000/api/import/url \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"url": "https://www.zhihu.com/question/12345678"}'
```

### 导入B站视频

```bash
curl -X POST http://localhost:8000/api/import/url \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"url": "https://www.bilibili.com/video/BV1xx411c7mD"}'
```

### 导入GitHub仓库

```bash
curl -X POST http://localhost:8000/api/import/url \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"url": "https://github.com/DIYgod/RSSHub"}'
```

## Future Enhancements (未来改进)

1. **动态路由发现**：自动检测RSSHub支持的路由
2. **批量导入**：一次导入整个RSS feed的所有文章
3. **自定义规则**：允许用户通过UI添加自定义RSSHub规则
4. **智能选择**：根据内容质量自动选择RSSHub或网页爬取

## References (参考资料)

- RSSHub官方文档：https://docs.rsshub.app
- RSSHub GitHub：https://github.com/DIYgod/RSSHub
- 支持的路由列表：https://docs.rsshub.app/routes/
