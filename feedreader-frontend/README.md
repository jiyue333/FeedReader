# RSS Reader Frontend

一个现代化的 RSS 阅读器前端应用，使用 React + TypeScript + Tailwind CSS 构建。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **UI 框架**: Tailwind CSS + Headless UI
- **代码规范**: ESLint + Prettier

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format
```

## 项目结构

```
src/
├── pages/          # 页面组件
│   ├── HomePage.tsx    # 主页（订阅源列表 + 文章列表）
│   └── ReaderPage.tsx  # 阅读页面（三栏布局）
├── App.tsx         # 应用根组件和路由配置
├── main.tsx        # 应用入口
└── index.css       # 全局样式（Tailwind）
```

## 路由

- `/` - 主页（显示所有文章）
- `/feed/:feedId` - 主页（显示特定订阅源的文章）
- `/article/:articleId` - 阅读页面

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件和 Hooks
