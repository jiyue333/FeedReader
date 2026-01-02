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

# AnkiFlow - UI 设计规范文档 (v1.0)

## 1. 设计哲学 (Design Philosophy)

*   **隐喻 (Metaphor)**: **“From Flow to Memory”**（从流到记忆）。
    *   界面左侧代表流动的 **Feed**，中间是处理知识的 **Workbench**，最终产出沉淀为 **Anki-style Memories** (Takeaways)。
*   **核心特质**:Fluidity (流动感)**: 操作流程顺畅无阻，从阅读到暂存再到生成，一气呵成。
    *   **Focus (专注)**: 阅读区极其纯净，工具栏在需要时才显现。
    *   **Persistence (持久性)**: 左侧下方的“暂存区”是连接“瞬时阅读”与“永久记忆”的桥梁，必须在视觉上给予足够的“厚重感”和常驻地位。
*   **视觉风格**:
    *   **主题**: 默认 **Deep Dark Mode**（类似 Linear/VS Code 的深灰底色），强调专业工具属性。
    *   **强调色**:
        *   **AI/Synthesis**: `Electric Purple` (#8B5CF6)，代表智能熔炼。
        *   **Memory/Save**: `Anki Blue` (#2D9CDB) 或 `Teal`，代表知识的冷却与固化。
    *   **字体**:
        *   UI: Inter / SF Pro (高效、中性)。
        *   Reading: Merriweather / Lora (适合长文阅读的衬线体)。
        *   Code: JetBrains Mono。

---

## 2. 全局布局框架 (Global Layout)

采用 **三栏式布局 (Three-Pane Layout)**，左侧栏采用 **"Split-Pane" (上下分层)** 设计，是 AnkiFlow 的标志性特征。

*   **Left Sidebar (280px, Resizable)**: **Flow & Staging**。
    *   **上部 (60%)**: **Source Library**。RSS 订阅源、PDF 文件夹。
    *   **下部 (40%)**: **Staging Dock (暂存坞)**。这是 AnkiFlow 的心脏，所有待处理的知识都在此候命。
*   **Middle Pane (Flex)**: **Workspace**。
    *   列表视图 (Dashboa1rd) 或 阅读器 (Reader)。
*   **Right Sidebar (340px, Collapsible)**: **Intelligence**。
    *   AI Chat、关联推荐、Context 面板。

---

## 3. 详细界面设计 (Detailed Screens)

### 3.1 首页 / 仪表盘 (Dashboard)

**目标**: 高效筛选信息流 (Flow)，将有价值的颗粒捕捉到暂存区。

*   **顶部栏 (Header)**:
    *   左侧: 路径面包屑 (e.g., `Library > Tech > LLM`).
    *   右侧: `+ Import` 按钮 (支持粘贴 URL / 拖拽 PDF / 导入 OPML)。
*   **文章列表 (List View)**: 高密度的信息流。
    *   **Row Item (列表项)**:
        *   `Favicon` + `Source` (弱化显示)。
        *   `Title` (高亮显示，未读加粗)。
        *   `Smart Tags` (AI 自动生成的胶囊标签，如 `[RAG]`, `[Optimization]`)。
        *   `Time` (如 "2h ago")。
    *   **Hover Actions (悬停交互)**:
        *   鼠标悬停时，右侧浮现操作组：
        *   `[Pin to Staging]` (**核心动作**: 图标为一个“下沉”的箭头或图钉，点击后飞入左下角)。
        *   `[Mark Read]`.
        *   `[Delete]`.

### 3.2 研读工作台 (Reader Workbench)

**目标**: 深度阅读，建立连接，为生成记忆素材做准备。

*   **左侧栏 (Split Sidebar)**:
    *   **Top (Navigation)**:
        *   Tab: `[Files]` | `[Outline (TOC)]`.
        *   TOC 模式下，随滚动自动高亮当前章节。
    *   **Bottom (Staging Dock - Persistent)**:
        *   **Header**: "Staging (3)" —— 显示当前暂存数量。
        *   **List**: 卡片式列表，显示暂存的文章/PDF 标题。
        *   **Item Action**: 每个卡片前有 `Checkbox` (勾选即参与总结)。
        *   **Primary Action**: 底部常驻按钮 **`⚡ Synthesize Memory`** (生成 Takeaway)。

*   **中间栏 (Reader Area)**:
    *   **排版**: 纯净阅读模式，最大宽度 800px，居中。
    *   **Header**: 标题，元数据，以及 `[Pin State]` (已暂存/未暂存)。
    *   **Context Menu (划词菜单)**:
        *   选中并释放鼠标后弹出：
        *   `Highlight` (高亮)。
        *   `Note` (批注)。
        *   **`Ask AI`** (紫色图标): 立即将选中内容作为 Context 发送给右侧栏。

*   **右侧栏 (AI Copilot)**:
    *   **Mode Switch**: `[Local Knowledge]` (默认) <-> `[Web Search]` (联网)。
    *   **Chat Stream**:
        *   **AI Response**: 清晰的 Markdown 输出。
        *   **Citations**: 引用必须显眼，如 `[Doc A]`, `[Web B]`。
        *   **Action**: 点击引用链接，不跳转页面，而是弹出 `Preview Card`，并提供 `[Add to Staging]` 按钮。

### 3.3 记忆熔炼页 (The Synthesis Modal)

**目标**: 将暂存的碎片熔炼成结构化的 Takeaway 笔记。

*   **触发**: 点击左下角的 `⚡ Synthesize Memory`。
*   **形态**: 全屏模态窗 (Full-screen Modal) 或 覆盖层。
*   **Header**:
    *   Title: `#TK-1024: Synthesis on [Topic Name]`.
    *   Meta: "Fused from 3 sources & 5 notes".
*   **Split View (对照视图)**:
    *   **Left (Sources)**: 参与总结的来源列表（可折叠）。
    *   **Right (Memory Note)**: 生成的 Markdown 内容。
        *   包含：核心概念、对比分析、结论。
*   **Anchor Interaction (锚点交互)**:
    *   笔记内容: "...Switch Transformer 引入了路由机制 `[1]`..."
    *   **交互**: 点击 `[1]`，模态窗最小化，主界面背景自动加载《Switch Transformer》并**滚动高亮**对应段落，实现“记忆回溯”。

---

## 4. 关键组件状态 (Component States)

### 4.1 暂存坞卡片 (Staging Card)
*   **Default**: 标题 + 类型图标 (RSS/PDF)。
*   **Checked**: 只有被勾选的卡片，其内容才会被送入 LLM 进行总结。
*   **Active**: 当前主视图正在显示的文章，卡片有紫色左边框指示。

### 4.2 引用胶囊 (Citation Chip)
*   在 AI 回答和 Takeaway 笔记中出现的来源标记。
*   样式: 圆角矩形，点击有反馈。
    *   `[Local]`: 文件夹图标，表示来自本地库。
    *   `[Web]`: 地球图标，表示来自网络搜索。

---

## 5. 交互动效 (Micro-Interactions)

1.  **Flow to Staging (入坞动画)**:
    *   点击 `Pin` 时，文章标题块缩小并沿贝塞尔曲线飞入左下角的 Staging 区域，伴随轻微的“吸入”效果。
2.  **Synthesis Pulse (熔炼脉冲)**:
    *   点击 `Synthesize Memory` 后，按钮进入 Loading 态，发出紫色脉冲光晕，象征 AI 正在思考和连接。
3.  **Flash Highlight (回溯闪烁)**:
    *   通过锚点跳转回原文时，目标段落背景色从高亮黄色渐变回透明，引导视觉聚焦。

---

## 6. Icon System (图标建议)

推荐使用 **Lucide React**，风格统一且现代化：

*   **Staging/Pin**: `Pin` (图钉) 或 `Archive` (归档盒)。
*   **Synthesize/AI**: `Sparkles` (火花) 或 `Zap` (闪电/能量)。
*   **Memory/Note**: `Brain` (大脑) 或 `BookOpen` (书)。
*   **Flow/RSS**: `Waves` (波浪) 或 `Rss`.
*   **Web Search**: `Globe`.

---

### 给开发者的实施建议

1.  **Layout**: 使用 CSS Grid 或 Flexbox 实现左侧栏的 `60% / 40%` 分割，确保 `Staging Dock` 在屏幕较小时也能通过滚动访问。
2.  **State Persistence**: `StagingList` 需要持久化存储（LocalStorage 或 DB），用户刷新页面或重启应用后，暂存区的内容不能丢失。
3.  **Components**: 封装一个 `CitationRenderer` 组件，专门用于解析 Markdown 中的引用标记，并处理点击跳转逻辑。