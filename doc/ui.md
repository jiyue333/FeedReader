# AnkiFlow - UI 设计规范文档 (v3.0)

## 1. 设计哲学 (Design Philosophy)

*   **隐喻**: **“From Flow to Memory”**（从流到记忆）。
*   **设计原则**:
    *   **Fluidity (流动)**: 无阻碍的操作流。
    *   **Focus (专注)**: 极简的阅读环境。
    *   **Extensibility (可扩展性)**: **"Always leave a door open."** 所有的工具栏和操作区必须预留 `[...] (More)` 或 `[+] (Add)` 槽位，以便未来低成本增加功能（如导出、分享、插件）而不破坏布局。
*   **视觉风格**:
    *   **主题**: **Deep Dark Mode** (深灰底色 #121212 / #1E1E1E)。
    *   **强调色**:
        *   **Primary/Action**: **`Sky Blue`** (#38BDF8) —— 用于生成、AI 交互、高亮。
        *   **Secondary/Staging**: `Slate Blue` (#64748B) —— 用于次级操作。
    *   **字体**: Inter (UI), Merriweather (Reading), JetBrains Mono (Code).

---

## 2. 界面一：首页 / 仪表盘 (Dashboard)

**页面目标**: 高效筛选信息流，将有价值的颗粒“扔”进暂存区。

### 2.1 顶部导航栏 (Top Bar)
*   **布局**: 极简，功能向右堆叠。
*   **Left**:
    *   `Logo` (AnkiFlow 图标) —— **点击可刷新/回到最顶层**。
*   **Center**: `Global Search Input` (搜索 Feed、本地文章、笔记).
*   **Right**:
    *   `+ Import` (触发导入模态窗).
    *   `[...]` (**Global More**): 预留给全局设置、插件管理、关于页等。
    *   `User Avatar`.

### 2.2 左侧栏 (Sidebar - Split View)
*   **布局**: 上下分层 (60% / 40%)。
*   **Upper: Feed Flow (订阅源)**
    *   `All Feeds`, `Favorites`, `Folders`.
    *   底部预留: `[+ Add Source]` (快速添加源).
*   **Lower: Staging Dock (暂存坞)**
    *   **Header (顶部固定区)**:
        *   Row 1: `Staging (3)` 计数标题 + `[Select All]` 按钮。
        *   Row 2: **核心按钮 `[⚡ Generate Takeaway]`** (天蓝色块，全宽或高亮)。
    *   **List (向下增长)**:
        *   文章标题小卡片，最新的插入到最上方。
        *   Hover 时显示 `[x]` 移除按钮。

### 2.3 中间主视图 (Main Feed Stream)
*   **Header Filter Box (核心增强)**:
    *   这是一个综合筛选容器，而不只是 Tabs。
    *   **Input Area**: `Filter by tags, author...` (支持输入 `#` 唤起标签选择).
    *   **Quick Toggles (Chips)**: `[Unread]` | `[Starred]` | `[PDF Only]`.
    *   **Extension Slot**: 右侧预留一个虚线边框的 `[+ Save View]` 或 `[...]` 按钮，用于未来扩展“保存筛选器”或“视图设置”功能。
*   **Article List**:
    *   **Style**: 类似 Linear 的紧凑行布局。
    *   **Content**: Favicon, Title (白亮), Smart Tags (灰), Date.
    *   **Hover Action**: 鼠标悬停行时，右侧显示 `[Pin to Staging]` 图标。

### 2.4 右侧栏 (Intelligence)
*   **状态**: **默认隐藏**。

---

## 3. 界面二：研读工作台 (Reader Workbench)

**页面目标**: 深度阅读，建立连接，在不被打扰的前提下补充暂存区。

### 3.1 顶部导航栏 (Global Top Bar - Compact Mode)

- **布局**: 复用首页顶部栏结构，但在阅读模式下 **高度压缩 (Compact)**，并向两侧严格停靠，中间完全留白以减少视觉干扰。
- **Left**:Logo (Icon Only): 点击返回首页 / Dashboard。[Toggle Left Sidebar] (侧边栏开关图标).
- **Center**: **(Empty / Transparent)** —— 留白，让视线穿透。
- **Right**:Search Icon: (搜索框收缩为一个图标，点击展开).[...] (**Global More**): 全局设置入口。User Avatar: 用户头像。[Toggle Right Sidebar] (AI 栏开关图标).

### 3.2 中间阅读区 (Reader Canvas)

- **布局**: 居中，最大宽度 800px。
- **Context Bar (位于 H1 标题上方)**:这是一个属于文章内容的 “信息栏”，随文章内容滚动（或在滚动到顶部时吸附）。**Left (Path)**:Breadcrumbs: Library / Tech / LLM (浅灰色小字，**单行不换行**，点击节点可跳转)。**Right (Article Actions)**:[Pin] (**Staging Switch**): 核心功能，实心表示已暂存。[Graph]: 触发知识图谱模态窗。[+] (**Extension Slot**): 预留给未来插件（如 “翻译”、“朗读”、“Web Archive”）。[...]: 更多文章操作（如导出 PDF、复制链接、字号设置）。
- **Content**:**H1 Title**: 巨型标题。**Metadata**: 作者、时间、原文链接。**Body**: 正文内容。

### 3.3 左侧栏 (Sidebar - Reuse)

- **状态**: 默认展开。
- **Upper**: **Table of Contents (TOC)** (支持折叠).
- **Lower**: **Staging Dock** (复用首页组件，保持一致性).

### 3.4 右侧栏 (Notes & AI)

- **状态**: 默认展开，**默认显示笔记页**。
- **Tabs**:[Notes] (默认激活): 模拟沉浸式笔记体验。[AI Chat]: 需要对话时切换。[...] (预留槽位).

---

## 4. 界面三：记忆熔炼页 (Synthesis Modal)

**页面目标**: 对暂存的碎片进行最终的编辑、确认和归档。

### 4.1 弹窗容器 (The Modal)
*   **形态**: **Large Overlay** (大尺寸覆盖层)，背景高斯模糊。

### 4.2 头部 (Header)
*   **Title**: `#TK-1024` (可重命名).
*   **Toolbar**:
    *   `[Copy]` | `[Save]`.
    *   `[...]` (**Extension**): 预留给 `Export to Notion`, `Share as Image`, `History Versions` 等功能。
    *   `[Close]`.

### 4.3 内容编辑区 (Editor)
*   **布局**: 单栏宽屏编辑模式。
*   **Content**: 预填入 AI 生成的 Markdown 内容。
*   **Reference Block**: 底部展示引用来源。

---

## 5. 关键组件设计 (Component Design)

### 5.1 暂存坞卡片 (Staging Card)
*   **布局**: 极简单行卡片。
*   **交互**:
    *   **Left**: Checkbox (勾选参与生成)。
    *   **Center**: Title (截断)。
    *   **Right**: `[x]` (移除) + `[...]` (更多操作，如“定位到原文”、“只读模式”等).
*   **排序**: **栈式排序** (最新加入的在最上面，符合“刚刚读完”的直觉)。

### 5.2 引用胶囊 (Citation Chip)
*   **视觉**: 天蓝色 (`Sky Blue`) 边框或浅底色。
*   **分类样式**:
    *   `[Local]` (文件夹图标).
    *   `[Web]` (地球图标).

---

## 6. 图标系统建议 (Icon System)

推荐使用 **Lucide React**。

*   **Core**:
    *   **Staging**: `Pin` / `Inbox`.
    *   **Generate**: `Zap` (天蓝色).
    *   **More/Extensibility**: `MoreHorizontal` (...) 或 `PlusCircle`.
*   **Nav**:
    *   **Dashboard**: `LayoutGrid`.
    *   **Graph**: `GitFork`.
*   **Status**:
    *   **Unread**: `Circle` (实心小点).
    *   **Starred**: `Star`.

---

## 7. 核心交互动效 (Core Interactions)

### 1. 入坞吸附 (Pin to Staging)
*   **触发**: 点击 `Pin` 图标。
*   **动效**: 标题块缩小并飞入左下角，伴随 **天蓝色 (Sky Blue)** 闪光。

### 2. 能量脉冲 (Synthesis Pulse)
*   **触发**: 暂存区有新内容待生成。
*   **动效**: `[⚡ Generate]` 按钮边缘有微弱的蓝色呼吸光晕。

### 3. 回溯闪烁 (Anchor Flash)
*   **触发**: 点击引用跳转。
*   **动效**: 目标段落背景变为 **淡蓝色** 并缓慢褪色。

### 4. 智能流式 (AI Streaming)
*   **触发**: 生成内容时。
*   **动效**: 光标块为 **天蓝色**，高频闪烁。

## X. 附录

### V2.0 prompt

这个UI文档需要重构，请参考我给予的信息

1. 全局布局框架这一章节有点没必要，详细描述每一页如何设计（因为我们严格来说只有三页，所以可以穷尽

2. 首页布局

   - 其实顶部栏的路径面包屑有点没必要（阅读页可以有因为有回退逻辑），可以删掉，这样页面不至于太拥挤。保留logo，搜索，import，usericon即可（可以添加一些小图标，比如dashboard，graph之类的）

   - 左边栏上部是feed流，下部是暂存区。暂存数量，takeaway，一键全选按钮应该放在顶部，然后文章向下增长。
   - 中部展示feed流下对应文章，提供筛选功能（筛选后选中其他流也应该生效）
   - 右侧是AI栏，**默认应该隐藏**

3. 阅读页布局

   1. 顶部和首页保持一致，但是尽量小且往两侧停靠，防止干扰
   2. 中部文章页顶部左侧应该是浅色的路径且不换行，右侧是pin，和三个点，预留一些功能（该文章takeaway，graph）；然后才展示文章标题，信息和正文。
   3. 左侧上方是目录，下方是暂存区，和其他页保持一致
   4. 右侧应该默认展示笔记栏（AI页面会干扰阅读）

4. 记忆熔炼页：这应该是一个弹出效果，可以对这条笔记做一些编辑，你可以自行设计

### 3.0 prompt

该UI文档如下地方可以改进

1. 应该遵循多留拓展点的原则设计，防止疏漏（即使后续不实现，也可以快速删去）
2. 首页：中间主视图功能过少，应提供过滤box，支持按标签筛选，你的star，unread也是一种筛选类型，可以考虑主视图除了筛选还可以添加什么功能（如果未想到，可以在内容中写一个待定，留一个扩展按钮，其他页面同理）
3. 研读工作台页：不需要back按钮，有路径和logo两种返回方式足够了，字号分栏等功能应该放在文章顶部的三个点内。
4. 熔炼页如果不知道还有什么功能，留拓展按钮。
5. 主题色为浅蓝。









![image-20260102185556567](/Users/taless/Library/Application Support/typora-user-images/image-20260102185556567.png)

![image-20260102191831318](/Users/taless/Library/Application Support/typora-user-images/image-20260102191831318.png)

![image-20260102192141579](/Users/taless/Library/Application Support/typora-user-images/image-20260102192141579.png)

![image-20260102192220011](/Users/taless/Library/Application Support/typora-user-images/image-20260102192220011.png)