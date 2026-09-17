# 数据结构算法可视化器（Data Structure Algorithm Visualizor）

> 面向《数据结构与算法》课程（严蔚敏《数据结构》C 语言版 第三版）的**前端算法动画教学工具**。
> 把排序、查找、线性表、树、图、哈希、串、存储结构、算法范式等知识点，做成**可单步播放、可缩放、中英文一键切换**的动画教学模块。

- 仓库：`https://github.com/Look2046/DSA-with-Codex.git`
- 当前活跃分支：`feat/p14-backlog-wave`（Windows 本地镜像另建有 `feat/p14-backlog-wave-local` 备份分支）
- 当前阶段：**P15 验收与稳定化（acceptance & stabilization，进行中）**
- 适用范围：教学演示与课程实验，非生产业务系统

---

## 1. 项目目标与定位

本项目服务于计算机类专业《数据结构与算法》课程的课堂教学与课后自学，核心目标是：

1. **把抽象的算法过程可视化**：用动画展示每一步的比较、交换、指针移动、状态变化，替代黑板静态板书。
2. **支持单步 / 连续播放**：学生可逐步观察，也可整体回放；支持调速、跳转、重置。
3. **对照伪代码**：每个模块同时呈现「中文式 / 类 C 式」双栏伪代码，并随播放高亮当前执行行。
4. **中英文双语**：界面文案、模块标题、伪代码注释均支持 zh / en 一键切换。
5. **可扩展的模块体系**：以统一的「时间线引擎 + 共享工作区外壳」承载 50+ 算法模块，新增模块遵循同一套接入规范。

---

## 2. 核心特性

| 特性 | 说明 |
|---|---|
| 单步播放 | 每个算法拆解为确定性步骤帧（timeline frames），可前进 / 后退 / 跳转 |
| 速度与时间控制 | 支持播放速度调节、暂停、重置到默认教学样例 |
| 缩放与导览 | 画布支持缩放（如 100%→110%→150%），箭头端点随缩放保持贴合 |
| 中英文切换 | 顶部一键切换 zh / en，翻译键集中管理（`src/i18n/translations.ts`） |
| 双栏伪代码 | 同一算法并列展示「中文式 / 类 C 式」伪代码，并高亮当前执行行 |
| JSON 导入导出 | 线性结构类模块（数组、链表、栈、队列）支持样例数据 JSON 导入/导出与往返校验 |
| 共享工作区外壳 | 统一的 `WorkspaceShell`：顶部命令条、`控制` / `步骤` 可折叠面板、点击舞台折叠、固定边角按钮 |
| 手绘风 SVG 渲染 | 使用 `roughjs` 绘制手绘风格节点与连线，`motion` 驱动过渡动画 |
| 浏览器端验收 | 通过 Playwright 对全部模块做冒烟与验收截图（`output/playwright/*.png`） |

---

## 3. 技术栈

| 分层 | 选型 | 版本 |
|---|---|---|
| 构建工具 | Vite | 7.x |
| 语言 | TypeScript | ~5.9 |
| UI 框架 | React | 19.x |
| 路由 | react-router-dom | 7.x |
| 状态管理 | zustand | 5.x |
| 动画 | motion | 12.x |
| 图形 | roughjs（手绘风 SVG） | 4.6 |
| 单元测试 | vitest | 4.x |
| 浏览器验收 | Playwright |（CLI `0.1.1`）|
| 代码规范 | ESLint 9 + typescript-eslint + react-hooks / react-refresh 插件 | 9.x |

> 全部依赖见 `package.json`。安装请使用 **Node 22+**（建议 Node 24 LTS）。

---

## 4. 模块覆盖（按知识分类）

当前本地实现面已超出最初 42 模块蓝图，并新增第 4 章存储结构 pilot 与图定义/存储线，本地路由总计约 **53 条**（部分待用户复核）。各分类代表模块如下：

### 4.1 排序（Sorting，11 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| S-01 | 冒泡排序 | Bubble Sort |
| S-02 | 选择排序 | Selection Sort |
| S-03 | 插入排序 | Insertion Sort |
| S-04 | 希尔排序 | Shell Sort |
| S-05 | 快速排序 | Quick Sort |
| S-06 | 归并排序 | Merge Sort |
| S-07 | 堆排序 | Heap Sort |
| S-08 | 计数排序 | Counting Sort |
| S-09 | 基数排序 | Radix Sort |
| S-10 | 桶排序 | Bucket Sort |
| S-11 | 排序竞速 | Sorting Race |

### 4.2 查找（Search，2 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| SR-01 | 顺序查找 | Linear Search |
| SR-02 | 二分查找 | Binary Search |

### 4.3 线性结构（Linear）
| 编号 | 模块 | 说明 |
|---|---|---|
| L-01 | 数组 | 插入、移位步骤动画、JSON 导入导出 |
| L-02 | 动态数组 | 扩容（resize）演示 |
| L-03 | 链表 | 单链表 / 双链表 / 循环链表三种模式 |
| L-04 | 栈 | 顺序栈、链栈对照，满栈分叉演示 |
| L-05 | 队列 | 顺序队列、链队列、循环队列 |

> 栈 / 队列的变体已从「控制面板切换」拆分为独立路由：
> `sequential-stack` / `linked-stack`、`sequential-queue` / `linked-queue` / `circular-queue`；
> 旧的 `/modules/stack`、`/modules/queue` 作为顺序栈 / 顺序队列的兼容别名保留。

### 4.4 树（Tree，7 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| T-01 | 二叉树遍历 | Binary Tree Traversal（前/中/后/层序） |
| T-02 | 二叉搜索树 | BST（查找 / 插入 / 删除，含三种删除分支） |
| T-03 | AVL 树 | AVL Tree（LL/LR/RR/RL 旋转） |
| T-04 | 堆 | Heap（建堆 / 插入 / 取根，树视图与数组视图同步） |
| T-05 | B 树 / B+ 树 | B-Tree / B+Tree（并排对照插入） |
| T-06 | 字典树 | Trie |
| T-07 | 哈夫曼树 | Huffman Tree（扩展模块，森林合并 + 前缀码生成） |

### 4.5 图（Graph）
- **表示 / 存储线**：G-01 图表示、G-02 邻接矩阵、G-03 邻接表（本地已实现，待复核）。
- **算法线**：深度优先搜索（DFS）、广度优先搜索（BFS）、Dijkstra、Bellman-Ford、Floyd-Warshall、Kruskal、Prim、拓扑排序。

> 图相关路由在本地已重编号（去掉临时 A/B 后缀）：图表示、邻接矩阵、邻接表为定义/存储页；DFS/BFS/最短路径/最小生成树/拓扑排序为算法页。

### 4.6 哈希（Hash，2 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| H-01 | 链地址法 | Hash Table - Chaining |
| H-02 | 开放定址法 | Hash Table - Open Addressing（线性探测 + 墓碑标记） |

### 4.7 串（String，2 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| ST-01 | KMP 算法 | KMP（前缀表 / 回退 / 对齐） |
| ST-02 | Rabin-Karp | Rabin-Karp（滚动哈希） |

### 4.8 算法范式（Paradigm，5 个）
| 编号 | 模块 | 英文 |
|---|---|---|
| P-01 | 分治法 | Divide & Conquer |
| P-02 | 动态规划 | Dynamic Programming |
| P-03 | 贪心 | Greedy |
| P-04 | 回溯 | Backtracking |
| P-05 | 并查集 | Union-Find |

### 4.9 存储结构（Storage，第 4 章 pilot，7 个）
| 编号 | 模块 | 说明 |
|---|---|---|
| M-01 | 二维数组 | 行/列优先映射 |
| M-02 | 对称矩阵 | 压缩存储 |
| M-03 | 上三角矩阵 | 压缩存储 |
| M-04 | 下三角矩阵 | 压缩存储 |
| M-05 | 稀疏矩阵（三元组） | Triple 顺序存储 |
| M-06 | 稀疏矩阵（十字链表） | 行/列链表 |
| M-07 | 广义表 | 头尾链式表示 |

---

## 5. 目录结构

```
data-structure-algorithm-visualizor/
├── docs/                  # 项目文档体系（见第 9 节）
│   ├── SESSION_BRIEF.md   # 会话速览（每次新会话先读）
│   ├── HANDOFF.md         # 交接记录（里程碑状态）
│   ├── DECISIONS.md       # 架构/流程决策清单
│   ├── TODO.md            # 当前待办
│   ├── IMPLEMENTATION_PLAN_P*.md  # 各阶段实施方案
│   ├── PSEUDOCODE_AUDIT.md        # 伪代码审计
│   └── modules/           # 单模块设计说明与规则
├── src/
│   ├── app/
│   │   ├── layout/Layout.tsx     # 顶层布局 + 页面标题机制
│   │   └── router.tsx            # 路由注册
│   ├── components/
│   │   └── WorkspaceShell.tsx    # 共享工作区外壳（命令条 + 可折叠面板）
│   ├── hooks/
│   │   ├── useTimelinePlayer*     # 时间线播放引擎（reducer 驱动）
│   │   └── useStageAnchorPanel.ts # 舞台锚点同步
│   ├── i18n/
│   │   ├── translations.ts       # 中英文案（集中管理）
│   │   ├── useI18n.ts            # 取词 hook
│   │   └── LanguageContext.tsx   # 语言上下文
│   ├── modules/                  # 纯算法逻辑 + 单测（与 UI 解耦）
│   │   ├── sorting/  search/  linear/  tree/  graph/
│   │   ├── hash/  string/  paradigm/  storage/
│   ├── pages/modules/            # 各模块的 React 页面（*.tsx）
│   ├── data/moduleRegistry.ts    # 模块注册表（卡片/路由/状态）
│   └── index.css
├── scripts/
│   ├── check-doc-links.mjs       # 文档链接检查（替代原 .sh）
│   └── playwright-cli.sh         # Playwright CLI 封装
├── output/playwright/           # 浏览器验收截图与报告
├── public/  index.html
├── package.json  vite.config.ts  tsconfig*.json  eslint.config.js
├── README.md  AGENTS.md  TODO.md  CHANGELOG.md  CONTRIBUTING.md
└── .github/workflows/ci.yml     # CI 工作流
```

> 架构要点：算法逻辑（`src/modules/**`）与页面（`src/pages/modules/**`）解耦；页面通过**时间线引擎**播放由逻辑层生成的确定性步骤帧，保证单测可独立验证算法正确性。

---

## 6. 快速开始

> 前置：Node 22+（建议 Node 24 LTS）、已安装 git。

```bash
# 1. 克隆仓库
git clone https://github.com/Look2046/DSA-with-Codex.git
cd DSA-with-Codex

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 4. 构建生产包
npm run build

# 5. 预览构建产物
npm run preview
```

---

## 7. 常用脚本（`package.json`）

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | `tsc -b` 类型检查 + `vite build` 生产构建 |
| `npm run lint` | ESLint 全量检查（`eslint .`） |
| `npm test` | vitest 运行全部单元测试（`vitest run`） |
| `npm run check:docs` | 校验 `docs/` 下的本地 Markdown 链接（`node ./scripts/check-doc-links.mjs`） |
| `npm run check` | **统一质量门禁** = `check:docs` → `test` → `lint` → `build` 依次执行 |
| `npm run preview` | 本地预览构建产物 |
| `npm run pw:cli` / `pw:open` | 运行 / 打开 Playwright CLI（浏览器验收） |

### 质量门禁约定
- **有代码改动**时：先跑 `npm run check`（文档链接 + 单测 + lint + 构建全绿）。
- **仅改文档**时：跑 `npm run check:docs` 即可。
- 实测中，`npm run check` 的 `check:docs` 与 `test` 已稳定通过；`lint` 中个别 React 规则阻断项已通过针对性 `eslint-disable-next-line`（带意图注释）方式标注为有意写法，不弱化全局规则。

---

## 8. Git 工作流与分支约定

本项目遵循 AGENTS.md 定义的**分支 + 变更纪律**：

1. **按范围建分支**：文档类用 `docs/*`，功能类用 `feat/*`（如 `feat/p14-backlog-wave`、`docs/p15-acceptance`）。
2. **每个分支聚焦一个里程碑**，不跨范围改无关文件。
3. **提交信息带范围前缀**：`docs: ...` / `feat: ...`。
4. 评审通过后合并回 `main`。
5. 不擅自使用破坏性 git 命令（如 `reset --hard`、`push --force`），除非明确被要求。

### 提交 / 同步
```bash
# 查看变更集
git status
git diff

# 建分支
git switch -c <docs-or-feat>/<topic>

# 暂存并提交
git add docs
git commit -m "docs: <变更摘要>"

# 拉取 / 推送
git fetch
git pull
git push -u origin <branch>
```

> **网络提示**：本项目走 GitHub。若所在网络需借代理出网，请确保本机代理客户端（如 Clash / V2Ray 等）已启动，并让 git 走正确的代理端口（Windows 系统代理通常在 `127.0.0.1:7897`）。本仓库已在**仓库级** `git config` 中设置 `http.proxy` / `https.proxy` 指向该端口，正常情况无需额外配置即可推拉。

---

## 9. 文档体系（`docs/`）

| 文件 | 作用 |
|---|---|
| `SESSION_BRIEF.md` | **新会话第一读本**。当前快照、已完成项、下一步优先级、质量门禁。 |
| `HANDOFF.md` | 里程碑交接记录，记录每次本地验收的证据（构建/单测/Playwright 截图）。 |
| `DECISIONS.md` | 架构与流程决策清单（DEC-xxxx），记录关键取舍。 |
| `TODO.md` | 当前待办与活跃优先级。 |
| `IMPLEMENTATION_PLAN_P*.md` | 各阶段（P0–P15）实施方案。 |
| `PSEUDOCODE_AUDIT.md` | 面向用户的伪代码审计与修订记录。 |
| `modules/*.md` | 单模块设计说明（如 `T-01-preorder-trace-rules.md`）。 |

> 约定：**`docs/` 为文档真源**，`SESSION_BRIEF.md` 是每次新会话最先阅读的文件。任何阶段/分支/优先级/质量门禁命令的变更，都应及时回写 `SESSION_BRIEF.md`。

---

## 10. 开发状态与里程碑

本项目以 **P0–P15 + 可选 P9** 的阶段化方式推进：

- **P0–P14**：脚手架、线性表、排序（11）、查找、树（7）、图（定义/存储 + 9 类算法）、哈希（2）、串（KMP + Rabin-Karp）、算法范式（5）、存储扩展均已落地；原始 42 模块蓝图已在 P14-M5 全部闭合，外加 T-07 哈夫曼树扩展，运行时注册表达到 43 模块。
- **Post-P14 扩展**：用户于 2026-08-21 批准第 4 章存储结构 pilot（M-01~M-07），并对图定义/存储线重编号（G-01 图表示、G-02 邻接矩阵、G-03 邻接表），外加一个暂停的 `T-00A` 树定义概念先行页。本地实现面合计约 53 条路由，**待用户复核**。
- **当前阶段 P15（验收与稳定化，进行中）**：聚焦首批线性模块（L-01~L-05）的界面基线打磨、跨模块一致性、以及浏览器验收闭环。

> 详细验收证据（每个里程碑的构建/单测/Playwright 截图）见 `docs/HANDOFF.md` 与 `output/playwright/`。

---

## 11. 架构与关键设计

1. **时间线引擎（Timeline Engine）**
   算法逻辑层生成**确定性步骤帧**；`useTimelinePlayer` 以 reducer 驱动播放 tick 循环，支持前进/后退/跳转/调速/重置。模块页面不直接依赖播放 store，统一走引擎路径。

2. **共享工作区外壳（WorkspaceShell）**
   统一的交互契约：顶部命令条、`控制` 与 `步骤` 两个可折叠面板、点击舞台折叠、固定边角按钮、自适应视口。各模块页面（排序、线性、树、图、哈希等）均已迁移到该外壳，保证体验一致。

3. **国际化（i18n）**
   文案集中在 `src/i18n/translations.ts`（zh / en 双语），通过 `useI18n` 取词；运行时 `document.title` 由路由路径经翻译键映射生成。

4. **手绘风渲染**
   节点与连线使用 `roughjs` 绘制手绘风格 SVG，`motion` 负责过渡动画，使算法过程更直观、亲和。

5. **模块注册表（moduleRegistry）**
   模块卡片、路由、就绪状态（ready / pending）由 `src/data/moduleRegistry.ts` 集中管理；`/modules` 发现页按分类（排序/查找/线性/树/图/哈希/串/范式/存储）展示与过滤。

---

## 12. 注意事项 / 已知项

- **构建产物 `dist-vm/`**：其中 `index.html` 的标题仍残留早期占位 `m0-scaffold-tmp`，属过时产物；源码层标题机制已正常，重建 `dist-vm` 目标即可刷新（重构需独立一轮，未在本 README 维护范围内）。
- **Firefox 路由告警风暴（P15-M3）**：早期审计曾报告模块加载警告（经 `src/app/router.tsx`，堆排序路由 57 条）。**2026-09-17 已实测关闭**：在 Firefox 下重新审计 10 条代表路由（含 `/modules/heap-sort`），并注入自检标记确认抓取有效，控制台 warning/error 总数 = **0**。根因属于升级前的 `react-router-dom` v6 / React 18 栈，当前 `react-router-dom 7.9.6 + React 19 + Vite 7` 无此现象，无需改代码。
- **离线导出**：独立的离线/单机导出工作默认不进入主线 backlog，除非明确被要求。
- **阶段纪律**：在 P15 验收/稳定化作为活跃波次期间，除非用户明确覆盖优先级，否则不开启新的功能范围。

---

## 13. 许可与署名

教学用途的内部项目。如需对外分享或二次分发，请先与项目维护者（成都文理学院 计算机系 陈浩宇）确认。

---

*文档最后更新：2026-09-17（中文版，基于项目真实状态整理）*
