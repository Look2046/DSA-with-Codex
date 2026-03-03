# 数据结构与算法可视化平台 - 完整规划文档 v1.2

**项目名称**：数据结构与算法可视化平台  
**简称**：DSA-Viz  
**最终模块数**：39 个核心可视化模块 + 2 个附属页面  
**版本**：v1.2（删除合并备注，模块编码连续化）  
**技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + D3.js + Framer Motion + Zustand

## 一、项目定位

| 项目 | 说明 |
|------|------|
| 项目名称 | 数据结构与算法可视化平台 |
| 简称 | DSA-Viz |
| 目标用户 | 大学本科生，数据结构与算法课程学习者 |
| 核心价值 | 通过**动画演示**帮助学生建立**直觉认知** |
| 部署方式 | 静态网页（可本地打开 / 部署至校内服务器） |
| 用户数据 | 无需登录，仅记录各模块使用次数与时长（LocalStorage + 可选轻量后端） |
| 技术栈 | **React 18 + TypeScript + Vite + Tailwind CSS + D3.js + Framer Motion + Zustand** |

## 二、最终模块清单（39个核心 + 2个附属）

### 线性结构（5个）
- **L-01** 数组 | `/modules/array`
- **L-02** 动态数组 | `/modules/dynamic-array`
- **L-03** 链表（含单向/双向/循环三个tab） | `/modules/linked-list`
- **L-04** 栈 | `/modules/stack`
- **L-05** 队列（含普通/循环/双端三个tab） | `/modules/queue`

### 树形结构（6个）
- **T-01** 二叉树遍历 | `/modules/binary-tree`
- **T-02** 二叉搜索树（BST） | `/modules/bst`
- **T-03** AVL树 | `/modules/avl-tree`
- **T-04** 堆 | `/modules/heap`
- **T-05** B树 / B+树 | `/modules/btree`
- **T-06** 字典树（Trie） | `/modules/trie`

### 哈希（2个）
- **H-01** 哈希表 - 链地址法 | `/modules/hash-chaining`
- **H-02** 哈希表 - 开放寻址法 | `/modules/hash-open-addressing`

### 图（9个）
- **G-01** 图的表示 | `/modules/graph-representation`
- **G-02** DFS | `/modules/dfs`
- **G-03** BFS | `/modules/bfs`
- **G-04** Dijkstra最短路 | `/modules/dijkstra`
- **G-05** Bellman-Ford | `/modules/bellman-ford`
- **G-06** Floyd-Warshall | `/modules/floyd-warshall`
- **G-07** Kruskal最小生成树 | `/modules/kruskal`
- **G-08** Prim最小生成树 | `/modules/prim`
- **G-09** 拓扑排序 | `/modules/topological-sort`

### 排序算法（11个）
- **S-01** 冒泡排序 | `/modules/bubble-sort`
- **S-02** 选择排序 | `/modules/selection-sort`
- **S-03** 插入排序 | `/modules/insertion-sort`
- **S-04** 希尔排序 | `/modules/shell-sort`
- **S-05** 归并排序 | `/modules/merge-sort`
- **S-06** 快速排序 | `/modules/quick-sort`
- **S-07** 堆排序 | `/modules/heap-sort`
- **S-08** 计数排序 | `/modules/counting-sort`
- **S-09** 基数排序 | `/modules/radix-sort`
- **S-10** 桶排序 | `/modules/bucket-sort`
- **S-11** 排序算法竞速 | `/modules/sorting-race`

### 查找算法（2个）
- **SR-01** 顺序查找 | `/modules/linear-search`
- **SR-02** 二分查找 | `/modules/binary-search`

### 字符串算法（2个）
- **ST-01** KMP算法 | `/modules/kmp`
- **ST-02** Rabin-Karp | `/modules/rabin-karp`

### 经典算法思想（5个）
- **P-01** 分治法 | `/modules/divide-conquer`
- **P-02** 动态规划 | `/modules/dynamic-programming`
- **P-03** 贪心算法（活动选择问题） | `/modules/greedy`
- **P-04** 回溯算法（八皇后） | `/modules/backtracking`
- **P-05** 并查集 | `/modules/union-find`

### 附属页面（2个）
- **首页** | `/`
- **排序模块首页** | `/modules/sorting`（复杂度对比表）

## 三、技术选型

### 核心技术栈

```json
{
  "前端框架": "React 18.2+",
  "编程语言": "TypeScript 5.0+",
  "构建工具": "Vite 5.0+",
  "样式方案": "Tailwind CSS 3.0+ + shadcn/ui",
  
  "动画引擎": {
    "D3.js": "7.0+（图/树的拓扑布局、力导向图）",
    "Framer Motion": "10.0+（UI过渡、柱子交换、节点移动）",
    "CSS Animation": "基础动画定义"
  },
  
  "路由": "React Router v6.0+",
  "状态管理": "Zustand 4.0+（轻量级状态机）",
  "代码高亮": "Shiki 或 Prism.js（伪代码同步高亮）",
  "图表": "recharts（排序复杂度对比）",
  "图标": "Lucide React",
  "数据存储": "LocalStorage（离线统计） + 可选Express后端"
}
```

### 为什么选这个技术栈？

| 技术 | 选择原因 |
|------|---------|
| **React 18** | 声明式UI、Hooks支持、Server Components为将来铺路 |
| **TypeScript** | 严格类型检查，算法步骤数据结构必须准确 |
| **Vite** | 极快的冷启动和HMR，开发体验最佳 |
| **Tailwind CSS** | 原子化类名，快速UI原型，配合自定义颜色词汇表 |
| **D3.js** | 图/树的专业布局算法（力导向图、树形布局），无替代品 |
| **Framer Motion** | 声明式动画API，与React融合度最高 |
| **Zustand** | 轻量级，API简洁，不过度设计，适合教学项目 |

## 四、项目目录结构

```
dsa-viz/
├── public/
│   └── assets/
│       ├── logo.svg
│       └── icons/
│
├── src/
│   ├── main.tsx                          # Vite 入口
│   ├── App.tsx                           # 路由根组件
│   ├── index.css                         # 全局样式
│   │
│   ├── pages/                            # 📄 页面组件（路由对应）
│   │   ├── Home.tsx                      # 首页
│   │   ├── ModulesPage.tsx               # 模块导航页
│   │   ├── ModuleDetail.tsx              # 通用模块详情页
│   │   ├── StatsPage.tsx                 # 统计页面
│   │   └── NotFound.tsx                  # 404
│   │
│   ├── components/                       # 🧩 可复用UI组件
│   │   ├── layout/
│   │   │   ├── Header.tsx                # 顶栏（logo、导航、主题切换）
│   │   │   ├── Sidebar.tsx               # 左侧导航树（折叠式菜单）
│   │   │   └── Layout.tsx                # 三栏布局容器
│   │   │
│   │   ├── controls/
│   │   │   ├── PlaybackControls.tsx      # 播放控制条（播放/暂停/速度）
│   │   │   ├── DataGenerator.tsx         # 数据生成表单
│   │   │   ├── CodePanel.tsx             # 伪代码面板（左/右侧栏）
│   │   │   └── StatsDisplay.tsx          # 操作计数器显示
│   │   │
│   │   ├── visualizers/                  # 📊 算法可视化组件
│   │   │   ├── linear/
│   │   │   │   ├── ArrayVisualizer.tsx   # 数组/动态数组通用
│   │   │   │   ├── LinkedListVisualizer.tsx
│   │   │   │   ├── StackVisualizer.tsx
│   │   │   │   └── QueueVisualizer.tsx
│   │   │   │
│   │   │   ├── tree/
│   │   │   │   ├── TreeVisualizer.tsx    # D3树画布（通用）
│   │   │   │   ├── BSTVisualizer.tsx
│   │   │   │   ├── AVLVisualizer.tsx
│   │   │   │   ├── HeapVisualizer.tsx
│   │   │   │   ├── BTreeVisualizer.tsx
│   │   │   │   └── TrieVisualizer.tsx
│   │   │   │
│   │   │   ├── graph/
│   │   │   │   ├── GraphVisualizer.tsx   # D3力导向图（通用）
│   │   │   │   ├── DFSVisualizer.tsx
│   │   │   │   ├── BFSVisualizer.tsx
│   │   │   │   ├── DijkstraVisualizer.tsx
│   │   │   │   ├── BellmanFordVisualizer.tsx
│   │   │   │   ├── FloydWarshallVisualizer.tsx
│   │   │   │   ├── KruskalVisualizer.tsx
│   │   │   │   ├── PrimVisualizer.tsx
│   │   │   │   └── TopoSortVisualizer.tsx
│   │   │   │
│   │   │   ├── sorting/
│   │   │   │   ├── SortingVisualizer.tsx # 柱状图通用（Framer Motion）
│   │   │   │   ├── SortingRace.tsx       # 多算法对比赛道
│   │   │   │   └── algorithms/           # 步骤生成函数
│   │   │   │       ├── bubbleSort.ts
│   │   │   │       ├── quickSort.ts
│   │   │   │       └── ... (其他排序)
│   │   │   │
│   │   │   ├── searching/
│   │   │   │   ├── LinearSearchVisualizer.tsx
│   │   │   │   └── BinarySearchVisualizer.tsx
│   │   │   │
│   │   │   ├── hashing/
│   │   │   │   ├── HashChainingVisualizer.tsx
│   │   │   │   └── HashOpenAddressingVisualizer.tsx
│   │   │   │
│   │   │   ├── string/
│   │   │   │   ├── KMPVisualizer.tsx
│   │   │   │   └── RabinKarpVisualizer.tsx
│   │   │   │
│   │   │   └── paradigms/
│   │   │       ├── DivideConquerVisualizer.tsx
│   │   │       ├── DPVisualizer.tsx
│   │   │       ├── GreedyVisualizer.tsx
│   │   │       ├── BacktrackingVisualizer.tsx
│   │   │       └── UnionFindVisualizer.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   └── charts/
│   │       ├── ComplexityChart.tsx
│   │       └── ComparisonChart.tsx
│   │
│   ├── engine/                           # 💎 动画引擎核心
│   │   ├── types.ts                      # AnimationStep 类型定义
│   │   ├── AnimationEngine.ts            # 帧调度、速度控制逻辑
│   │   ├── StepRecorder.ts               # 步骤录制辅助类
│   │   ├── colorScheme.ts                # 颜色词汇表（语义化颜色）
│   │   └── stats.ts                      # 统计计数器（比较、交换、访问）
│   │
│   ├── algorithms/                       # 📚 所有算法实现（纯TS）
│   │   ├── sorting/
│   │   │   ├── bubbleSort.ts
│   │   │   ├── quickSort.ts
│   │   │   └── ... (其他排序)
│   │   ├── searching/
│   │   │   ├── linearSearch.ts
│   │   │   └── binarySearch.ts
│   │   ├── linear/
│   │   │   ├── linkedList.ts
│   │   │   ├── stack.ts
│   │   │   └── queue.ts
│   │   ├── tree/
│   │   │   ├── bst.ts
│   │   │   ├── avlTree.ts
│   │   │   ├── heap.ts
│   │   │   ├── btree.ts
│   │   │   └── trie.ts
│   │   ├── graph/
│   │   │   ├── dfs.ts
│   │   │   ├── bfs.ts
│   │   │   ├── dijkstra.ts
│   │   │   └── ... (其他图算法)
│   │   ├── string/
│   │   │   ├── kmp.ts
│   │   │   └── rabinKarp.ts
│   │   ├── hashing/
│   │   │   ├── hashChaining.ts
│   │   │   └── hashOpenAddressing.ts
│   │   └── paradigms/
│   │       ├── dynamicProgramming.ts
│   │       ├── backtracking.ts
│   │       ├── greedy.ts
│   │       ├── divideConquer.ts
│   │       └── unionFind.ts
│   │
│   ├── hooks/                            # 🪝 React自定义Hooks
│   │   ├── useAnimationPlayer.ts         # 播放控制（核心）
│   │   ├── useDataGenerator.ts           # 数据生成逻辑
│   │   ├── useUsageStats.ts              # 统计数据管理
│   │   ├── useD3Layout.ts                # D3布局计算
│   │   └── useLocalStorage.ts            # LocalStorage封装
│   │
│   ├── stores/                           # 🏪 Zustand全局状态
│   │   ├── appStore.ts                   # 应用全局状态
│   │   ├── uiStore.ts                    # UI状态（主题、折叠等）
│   │   └── statsStore.ts                 # 统计数据持久化
│   │
│   ├── utils/                            # 🔧 工具函数库
│   │   ├── formatters.ts                 # 格式化函数（数字、时间）
│   │   ├── validators.ts                 # 输入验证
│   │   ├── dataGenerators.ts             # 随机数据生成
│   │   ├── colorUtils.ts                 # 颜色处理
│   │   └── storageUtils.ts               # LocalStorage增强封装
│   │
│   ├── data/                             # 📊 静态数据与配置
│   │   ├── moduleRegistry.ts             # 39个模块元数据（名称、难度、描述）
│   │   ├── learningPaths.ts              # 推荐学习路径
│   │   └── pseudocode/
│   │       ├── sortingPseudocode.ts
│   │       ├── treePseudocode.ts
│   │       ├── graphPseudocode.ts
│   │       └── ... (其他伪代码)
│   │
│   └── styles/
│       ├── globals.css                   # 全局样式（Tailwind @apply）
│       ├── animations.css                # 自定义动画定义
│       └── d3.css                        # D3相关样式
│
├── docs/                                 # 📖 项目文档
│   ├── ARCHITECTURE.md                   # 本规划文档
│   ├── ANIMATION_STEP_DESIGN.md          # AnimationStep接口设计
│   ├── MODULES_FINAL_LIST.md             # 最终模块清单
│   ├── UI_UX_DESIGN.md                   # UI/UX设计规范
│   ├── CURSOR_HANDBOOK.md                # Cursor使用手册
│   └── DEVELOPMENT.md                    # 开发快速开始
│
├── .cursorrules                          # 🤖 Cursor AI规则
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 五、核心架构设计

### 5.1 数据流分离原则

**关键思想**：算法执行与动画渲染完全分离

```
┌─────────────────┐
│  用户操作      │  选择算法、输入数据
└────────┬────────┘
         ↓
┌─────────────────────────────────────────┐
│  纯TypeScript算法函数                   │  返回 AnimationStep[]
│  (src/algorithms/...)                   │  完全不知道如何渲染
└────────┬────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  AnimationEngine                        │  管理步骤、速度、进度
│  + useAnimationPlayer Hook              │
└────────┬────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  React可视化组件                        │  根据currentStep渲染
│  (src/components/visualizers/...)       │  D3、Framer Motion、Canvas
└─────────────────────────────────────────┘
```

### 5.2 AnimationStep 统一接口

```typescript
// 在 src/engine/types.ts 中定义

type HighlightType =
  | 'default'    // 灰色，默认
  | 'comparing'  // 橙色，正在比较
  | 'moving'     // 蓝色，即将移动
  | 'in-temp'    // 黄色，已进入temp
  | 'swapping'   // 红色，正在交换
  | 'visiting'   // 蓝色，正在访问
  | 'matched'    // 紫色，找到/匹配
  | 'sorted'     // 绿色，已完成
  | 'new-node'   // 黄色，新创建节点
  | 'path';      // 绿色，最终路径

interface AnimationStep {
  id: number;
  description: string;           // 中文说明（≤20字）
  codeLines: number[];           // 伪代码高亮行号
  state: Record<string, any>;    // 数据结构当前状态快照
  highlights: {
    type: HighlightType;
    targets: string[];           // 元素ID数组
  }[];
  stats?: {
    comparisons?: number;
    swaps?: number;
    arrayAccesses?: number;
  };
}
```

### 5.3 播放控制器设计

```
┌────────────────────────────────────────────────────┐
│  ◄◄  ◄  ►  ►►  | ⏸ | 0.25x  0.5x  1x  2x  4x      │
│  [─────●────────]  15/42 步                        │
└────────────────────────────────────────────────────┘

controls = {
  play(),              // 开始播放
  pause(),             // 暂停
  nextStep(),          // 下一步
  prevStep(),          // 上一步
  jumpToStart(),       // 回到开始
  jumpToEnd(),         // 跳到末尾
  seek(index),         // 跳转到指定步
  setSpeed(0.25-4),    // 设置播放速度
}

state = {
  currentStep,         // 当前步骤对象
  currentIndex,        // 当前步索引
  isPlaying,           // 是否正在播放
  speed,               // 当前速度倍数
  progress,            // 0-100进度百分比
}
```

## 六、UI/UX 设计规范

### 6.1 页面布局（三栏式）

```
┌────────────────────────────────────────────────────────┐
│ DSA-Viz  | 📊 数据结构    🔍 搜索    🌙 主题           │
├──────────┬────────────────────────────┬────────────────┤
│          │                            │                │
│ 左侧导航 │    主画布区域              │   代码面板     │
│ 8类菜单  │  （D3或Framer动画）       │  （伪代码）   │
│ 折叠菜单 │                            │   高亮行号    │
│          │  ────────────────────      │   说明文字    │
│ ├ 线性   │  [播放控制条]              │                │
│ ├ 树     │  [数据生成器]              │                │
│ ├ 图     │  [统计计数器]              │                │
│ ├ 排序   │                            │                │
│ ├ ...    │                            │                │
│          │                            │                │
└──────────┴────────────────────────────┴────────────────┘
│ 底部：使用统计 | 文档链接 | 关于                       │
└────────────────────────────────────────────────────────┘
```

### 6.2 配色系统

**品牌色**
- 主色：蓝色 `#3B82F6`
- 次色：紫色 `#8B5CF6`

**语义化颜色（动画词汇表）**
| 含义 | 颜色 | Hex |
|------|------|-----|
| 默认 | 灰色 | `#6B7280` |
| 比较 | 橙色 | `#F59E0B` |
| 移动 | 蓝色 | `#3B82F6` |
| 交换 | 红色 | `#EF4444` |
| 完成 | 绿色 | `#10B981` |
| 访问 | 蓝色 | `#3B82F6` |
| 匹配 | 紫色 | `#8B5CF6` |
| 新建 | 黄色 | `#FBBF24` |

## 七、分期开发计划

### Phase 1（骨架 + 高频模块）~2-3周

- [ ] 项目初始化（Vite + React + Tailwind）
- [ ] 路由框架、三栏布局、导航菜单
- [ ] 动画引擎（AnimationEngine + useAnimationPlayer）
- [ ] 排序模块：冒泡 → 快速 → 归并 → 竞速
- [ ] 线性结构：栈 → 队列
- [ ] 搜索算法：二分查找

### Phase 2（树 + 图）~2-3周

- [ ] 链表（单向/双向/循环）
- [ ] 二叉搜索树（BST）
- [ ] 堆、字典树（Trie）
- [ ] 图的表示、DFS、BFS
- [ ] Dijkstra、Kruskal、拓扑排序

### Phase 3（补全 + 优化）~1-2周

- [ ] AVL树、B树、哈希表
- [ ] 字符串算法（KMP、Rabin-Karp）
- [ ] DP、贪心、回溯、并查集
- [ ] 统计模块、响应式适配
- [ ] 性能优化、代码审计

## 八、Cursor 开发准备

### 必须准备的内容

#### 1. 本规划文档

```
docs/ARCHITECTURE.md  ← 本文档
```

#### 2. 核心类型定义

```
src/engine/types.ts   ← AnimationStep 接口定义
```

#### 3. 配色方案

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    colors: {
      // 自定义语义化颜色
      highlight: {
        default: '#6B7280',
        comparing: '#F59E0B',
        moving: '#3B82F6',
        swapping: '#EF4444',
        visited: '#3B82F6',
        matched: '#8B5CF6',
        sorted: '#10B981',
        newNode: '#FBBF24',
        path: '#10B981',
      }
    }
  }
}
```

#### 4. 模块元数据

```
src/data/moduleRegistry.ts  ← 39个模块的名称、难度、描述、路由
```

#### 5. 伪代码库

```
src/data/pseudocode/
├── sortingPseudocode.ts
├── treePseudocode.ts
├── graphPseudocode.ts
└── ...
```

### Cursor Rules（`.cursorrules`）

```text
你是数据结构与算法可视化教学平台的资深前端工程师。

项目名称：数据结构与算法可视化平台（DSA-Viz）
技术栈：React 18 + TypeScript + Vite + Tailwind CSS + D3.js + Framer Motion + Zustand

核心原则：

1. 【数据流分离】
   - 所有算法实现为纯TypeScript函数，位于 src/algorithms/
   - 算法函数返回 AnimationStep[] 数组
   - React组件完全不含算法逻辑

2. 【AnimationStep接口】
   - 所有步骤必须符合 src/engine/types.ts 中的接口定义
   - 每一帧必须包含：description、codeLines、state、highlights
   - 不允许自定义高亮类型，必须使用颜色词汇表

3. 【语义化颜色】
   - 使用tailwind.config.ts中定义的highlight.{type}颜色变量
   - comparing(橙)→moving(蓝)→swapping(红)→sorted(绿)
   - 严禁自定义颜色或使用原始hex值

4. 【中文说明文字】
   - description 必须是中文，≤20字
   - 使用"我们"视角，避免技术术语堆砌
   - 示例：❌"执行swap操作" ✅"交换这两个元素"

5. 【模块注册】
   - 新增可视化页面后，必须在 src/data/moduleRegistry.ts 中注册
   - 包含：id、name、category、difficulty、description、route

6. 【TypeScript严格模式】
   - 禁用 any 类型，所有变量必须有明确类型
   - 使用 type 定义数据结构，使用 interface 定义组件props

7. 【性能考虑】
   - D3图布局计算使用 useD3Layout Hook
   - 排序柱子交换使用 Framer Motion 独立animation
   - 避免每帧重新计算整个DOM

8. 【可访问性】
   - 所有交互元素有适当的 aria-label
   - 颜色对比度符合WCAG AA标准
   - 支持键盘导航
```

## 九、核心 Prompt 模板

### Prompt-01：项目初始化

```
请根据 ARCHITECTURE.md 初始化 DSA-Viz 项目：

1. 创建完整的目录结构（见ARCHITECTURE.md第四部分）
2. 配置 vite.config.ts、tailwind.config.ts（含highlight颜色变量）、tsconfig.json
3. 创建并实现以下核心文件：
   - src/engine/types.ts（AnimationStep接口）
   - src/data/moduleRegistry.ts（39个模块元数据）
   - src/components/layout/Layout.tsx（三栏布局）
   - src/hooks/useAnimationPlayer.ts（播放控制Hook）
4. 设置路由框架（React Router v6）
5. npm run dev 应直接运行，首页显示项目名称和模块导航

要求：
- 使用TypeScript严格类型
- 中文注释和代码
- Tailwind CSS样式
- 无TypeScript错误
```

### Prompt-02：动画引擎

```
实现 src/engine/AnimationEngine.ts 和完善 src/hooks/useAnimationPlayer.ts：

功能需求：
- 支持播放、暂停、上一步、下一步、跳转
- 速度范围：0.25x / 0.5x / 1x / 2x / 4x
- 暴露接口：{ currentStep, currentIndex, isPlaying, speed, controls }
- 播放完成后停留在最后一步

实现细节：
- 使用 setInterval 驱动帧循环
- 根据 speed 计算每帧的延迟时间
- AnimationStep[] 作为输入
- 返回当前步骤和控制方法

参考：ANIMATION_STEP_DESIGN.md
```

### Prompt-03：排序可视化（以冒泡排序为例）

```
实现冒泡排序的完整可视化，包括三个部分：

1. src/algorithms/sorting/bubbleSort.ts
   - 函数签名：bubbleSort(arr: number[]): AnimationStep[]
   - 每次比较生成一个 comparing 步骤
   - 每次交换拆分为：moving → swapping → sorted
   - 每个步骤包含：description、codeLines、state、highlights、stats

2. src/components/visualizers/sorting/SortingVisualizer.tsx
   - 使用 Framer Motion 呈现柱子交换动画
   - 根据 highlight.type 应用对应的颜色
   - 展示 temp 暂存区
   - 显示实时计数器（比较、交换）

3. src/data/pseudocode/sortingPseudocode.ts
   - 冒泡排序的伪代码（10-15行）

参考：ANIMATION_STEP_DESIGN.md 中的排序部分
要求：npm run dev 后能看到动画演示
```

## 十、后续扩展方向

1. **用户系统**：登录、收藏模块、自定义数据保存
2. **教师管理后台**：班级、作业、学生统计
3. **移动端**：响应式设计或原生小程序
4. **多语言**：英文、日文支持
5. **高级内容**：红黑树详解、线段树、网络流等选修模块

## 十一、项目配置文件模板

### package.json 关键依赖

```json
{
  "name": "dsa-viz",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "d3": "^7.8.5",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.292.0",
    "shiki": "^0.14.5"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```
</artifact>

