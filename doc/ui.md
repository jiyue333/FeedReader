# AnkiFlow - UI 设计规范文档 (v2.0)

## 1. 设计哲学 (Design Philosophy)

*   **隐喻**: **“From Flow to Memory”**（从流到记忆）。
*   **核心特质**:Fluidity (流动)**: 无阻碍的操作流。
    *   **Focus (专注)**: 极简的阅读环境，工具仅在需要时出现。
    *   **Persistence (持久)**: “暂存区”是连接阅读与记忆的锚点，在所有页面常驻。
*   **视觉风格**:
    *   **主题**: **Deep Dark Mode** (深灰底色 #121212 / #1E1E1E)。
    *   **强调色**:
        *   **AI/Synthesis**: `Electric Purple` (#8B5CF6).
        *   **Memory/Save**: `Anki Blue` (#2D9CDB).
    *   **字体**: Inter (UI), Merriweather (Reading), JetBrains Mono (Code).

---

## 2. 界面一：首页 / 仪表盘 (Dashboard)

**页面目标**: 快速筛选信息流 (Filter)，将有价值的颗粒“扔”进暂存区 (Staging)。

### 2.1 顶部导航栏 (Top Bar)
*   **布局**: 极简，去除面包屑，强调功能入口。
*   **Left**:
    *   `Logo` (AnkiFlow 图标).
    *   `View Switcher`: 图标组 `[Dashboard]` (激活) | `[Knowledge Graph]`.
*   **Center**: `Global Search Input` (搜索 Feed、本地文章、笔记).
*   **Right**:
    *   `+ Import` (触发导入模态窗).
    *   `User Avatar` (设置入口).

### 2.2 左侧栏 (Sidebar - Split View)
*   **布局**: 上下分层 (60% / 40%)。
*   **Upper: Feed Flow (订阅源)**
    *   `All Feeds`, `Favorites`, `Folders` (Tech, Paper).
    *   未读计数徽标。
*   **Lower: Staging Dock (暂存坞 - 核心)**
    *   **Header (功能区)**:
        *   左侧: `Staging (3)` 计数。
        *   右侧: `[Select All]` 图标按钮。
        *   **核心按钮**: `[⚡ Generate]` (紧凑型按钮，紫色高亮)。
    *   **List (向下增长)**:
        *   文章标题小卡片，最新的在最上面。
        *   Hover 时显示 `[x]` 移除按钮。

### 2.3 中间主视图 (Main Feed Stream)
*   **Header Filter**:
    *   Tabs: `All` | `Unread` | `Starred`.
    *   **交互**: 此筛选条件是持久的，切换左侧 Feed 源时，筛选条件保持不变。
*   **Article List**:
    *   **Style**: 类似 Linear 的紧凑行布局。
    *   **Content**: Favicon, Title (白亮), Smart Tags (灰), Date.
    *   **Hover Action**: 鼠标悬停行时，右侧显示 `[Pin to Staging]` 图标。

### 2.4 右侧栏 (Intelligence)
*   **状态**: **默认隐藏 (Collapsed)**。
*   **交互**: 仅当用户主动点击顶部栏的“AI 助手”图标，或使用快捷键 (`Cmd+B`) 时滑出。

---

## 3. 界面二：研读工作台 (Reader Workbench)

**页面目标**: 深度阅读，建立连接，在不被打扰的前提下补充暂存区。

### 3.1 顶部工具栏 (Sticky Header)
*   **布局**: 极简，向两侧停靠，中间留白防止干扰视线。
*   **Left**: `[< Back]` (返回首页).
*   **Right**:
    *   `[Toggle Sidebar]` (切换左/右侧栏显隐).
    *   `[Font Settings]` (字号/主题).

### 3.2 中间阅读区 (Reader Canvas)
*   **布局**: 居中，最大宽度 800px。
*   **Meta Info Bar (位于标题上方)**:
    *   **Left**: 浅灰色路径 (e.g., `Tech / LLM / Transformers...`)，**单行不换行**，超长省略。
    *   **Right (Actions)**:
        *   `[Pin]` (当前是否在暂存区，实心为已存)。
        *   `[Graph]` (查看当前文章关联图谱)。
        *   `[...]` (更多菜单)。
*   **Content**:
    *   **H1 Title**: 巨型标题。
    *   **Metadata**: 作者、时间、原文链接。
    *   **Body**: 正文内容。

### 3.3 左侧栏 (Sidebar - Reuse)
*   **状态**: 默认展开。
*   **Upper**: **Table of Contents (TOC)**
    *   文章大纲，随滚动高亮。
*   **Lower**: **Staging Dock**
    *   **复用首页组件**：保持一致的视觉和交互（Header 在上，列表向下）。
    *   **联动**: 当前阅读的文章如果在暂存区，这里对应的卡片应高亮。

### 3.4 右侧栏 (Notes & AI)
*   **状态**: 默认展开，**默认显示笔记页**。
*   **Tabs**:
    *   `[Notes]` (默认激活): 当前文章的随手记，支持 Markdown。
    *   `[AI Chat]`: 点击后切换到对话界面。
*   **Rationale**: 默认展示笔记是为了模拟“边读边写”的沉浸体验，避免 AI 的动态消息干扰阅读流。仅当用户在文中划线并点击 `Ask AI` 时，自动切换到 `AI Chat` Tab。

---

## 4. 界面三：记忆熔炼页 (Synthesis Modal)

**页面目标**: 对暂存的碎片进行最终的编辑、确认和归档。

### 4.1 弹窗容器 (The Modal)
*   **形态**: **Large Overlay** (大尺寸覆盖层)，背景高斯模糊。
*   **动画**: 从底部升起或中心放大。

### 4.2 头部 (Header)
*   **Title**: `#TK-1024` (自动生成的编号，可重命名)。
*   **Meta**: "Generated from 3 articles..."。
*   **Actions**: `[Copy Markdown]`, `[Save to Library]`, `[Close]`.

### 4.3 内容编辑区 (Editor)
*   **布局**: 单栏宽屏编辑模式。
*   **Content**:
    *   预填入 AI 生成的 Markdown 内容（核心概念、对比、结论）。
    *   **可编辑**: 用户可以像在 Notion 中一样直接修改文字、删除不准确的总结、补充自己的观点。
*   **Reference Block**:
    *   文章底部或侧边展示“引用来源列表”，点击来源可快速跳转回原文验证。

---

## 5. 关键组件设计 (Component Design)

### 5.1 暂存坞卡片 (Staging Card)
这是连接“瞬时阅读”与“永久记忆”的实体，设计需极其精致。

*   **布局**: 极简单行卡片。左侧 Checkbox，中间标题（截断），右侧移除按钮（Hover时出现）。
*   **状态 (States)**:
    *   **Default**: 标题灰色，Checkbox 未勾选。
    *   **Checked**: 标题高亮（白色），Checkbox 勾选（**默认状态**）。表示该文章将参与下一次 Takeaway 生成。
    *   **Active**: 如果该文章是当前 Reader 正在显示的文章，卡片左边框显示紫色竖条高亮，方便用户定位。
*   **排序**: 新加入的文章出现在列表**最上方**（栈式），符合用户“刚刚读了这个，想加入暂存”的心智。

### 5.2 引用胶囊 (Citation Chip)
在 AI 回答和 Takeaway 笔记中出现的来源标记，用于区分信息源头。

*   **视觉**: 圆角矩形 (`rounded-full`)，小字号，背景色轻微半透明。
*   **分类样式**:
    *   **Local (本地库)**: 带有文件夹/硬盘小图标。色调：`Blue/Teal` (冷静、可靠)。
    *   **Web (网络搜索)**: 带有地球/云小图标。色调：`Orange/Amber` (动态、外部)。
*   **交互**:
    *   **Hover**: 显示完整标题 Tooltip。
    *   **Click**: 触发锚点跳转（在 Reader 中打开并高亮）。

---

## 6. 图标系统建议 (Icon System)

推荐使用 **Lucide React**，因其线条统一、现代且开源。

*   **核心功能**:
    *   **Staging / Pin**: `Pin` (推荐) 或 `ArrowDownToLine` (表示收入囊中)。
    *   **Generate / Synthesis**: `Zap` (闪电，代表快速生成) 或 `Sparkles` (魔法)。
    *   **Takeaway**: `Scroll` (卷轴) 或 `StickyNote`。
    *   **Import**: `Plus` 或 `UploadCloud`.
*   **导航与视图**:
    *   **Dashboard**: `LayoutList` 或 `Rows`.
    *   **Knowledge Graph**: `Network` 或 `GitFork`.
    *   **Sidebar Toggle**: `PanelLeft` / `PanelRight`.
*   **状态与来源**:
    *   **Local Source**: `Library` 或 `HardDrive`.
    *   **Web Source**: `Globe`.
    *   **Notes**: `PenLine`.
    *   **AI Chat**: `BotMessageSquare`.

---

## 7. 核心交互动效 (Core Interactions)

### 1. 入坞吸附 (Pin to Staging)
*   **触发**: 点击文章列表或阅读页的 `Pin` 图标。
*   **动效**: 文章标题块做一个 **缩小并沿曲线飞入** 左下角暂存区的动画，伴随轻微的弹簧阻尼效果。
*   **目的**: 给予用户强烈的“收集感”和“实体感”，暗示知识已被捕获。

### 2. 能量脉冲 (Synthesis Pulse)
*   **触发**: 暂存区选中了新文章，处于待生成状态。
*   **动效**: 底部 `⚡ Generate` 按钮每隔几秒闪烁一次微弱的 **紫色呼吸光晕**；点击瞬间，按钮收缩并进入高频流光状态。
*   **目的**: 暗示“材料已就绪，等待释放”，建立对 AI 产出的期待感。

### 3. 回溯闪烁 (Anchor Flash)
*   **触发**: 点击笔记中的 `[1]` 引用链接跳转回原文时。
*   **动效**: 目标段落背景色立即变为 **高亮黄/紫**，并在 1.5 秒内缓慢 **淡出 (Fade Out)** 至透明。
*   **目的**: 在长文中迅速引导视线，让用户确信“这就是出处”。

### 4. 智能流式 (AI Streaming)
*   **触发**: AI Chat 回复或生成 Takeaway 时。
*   **动效**: 文本 **逐字显示 (Typewriter)**，末尾始终跟随一个高频闪烁的 **紫色光标块**。
*   **目的**: 模拟 AI 正在实时思考和撰写，减少等待焦虑，增强“智能感”。



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