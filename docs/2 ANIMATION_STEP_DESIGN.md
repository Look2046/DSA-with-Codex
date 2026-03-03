# AnimationStep 核心设计文档 v1.2

**项目名称**：数据结构与算法可视化平台（DSA-Viz）  
**版本**：v1.2（删除合并备注，模块编码连续化）  
**最后更新**：2026-03-03

## 一、设计哲学

每一个 **AnimationStep** 是一张**"导演分镜"**，告诉渲染引擎：

- 现在数据结构是什么状态（**数据快照**）
- 哪些元素需要特殊显示（**高亮指令**）
- 有没有需要执行的位移/连线动画（**动作指令**）
- 屏幕上显示什么说明文字（**旁白**）
- 伪代码哪几行高亮（**代码同步**）

## 二、通用动画词汇表（Animation Vocabulary）

这是所有42个核心模块共用的**"颜色语义"**，全项目统一不混用：

| 类型名 | 颜色 | Hex | 含义 |
|--------|------|-----|------|
| `default` | 灰色 | `#6B7280` | 默认未操作状态 |
| `comparing` | 🟠 橙色 | `#F59E0B` | **正在被比较**的两个元素 |
| `moving` | 🔵 蓝色 | `#3B82F6` | **即将被移动**的元素（高亮标记，还未动） |
| `in-temp` | 🟡 黄色 | `#FBBF24` | **已进入 temp 暂存区**的元素 |
| `swapping` | 🔴 红色 | `#EF4444` | **正在执行位移**的元素 |
| `visiting` | 🔵 蓝色 | `#3B82F6` | 正在被访问/遍历的节点 |
| `matched` | 🟣 紫色 | `#8B5CF6` | 找到目标位置/匹配成功 |
| `sorted` | 🟢 绿色 | `#10B981` | 已归位/已完成排序 |
| `new-node` | 🟡 黄色 | `#FBBF24` | 新创建、尚未插入的游离节点 |
| `path` | 🟢 绿色 | `#10B981` | 最终路径/结果路径（图算法） |

### 颜色心理学
- **橙色** = 注意（吸引眼球）→ 用于比较
- **红色** = 行动（立即发生）→ 用于交换/移动
- **绿色** = 完成（达成目标）→ 用于排序完成/路径确定
- **蓝色** = 中立行动（过程中） → 用于访问/移动标记
- **紫色** = 特殊事件（找到/匹配）→ 用于匹配/成功
- **黄色** = 警示（临时状态）→ 用于temp区/新建节点

## 三、排序算法的 AnimationStep 设计

### 3.1 关键概念：原子性原则

每个 AnimationStep 代表**一个原子操作**，不合并多个操作：

```
❌ 错误：一步内完成比较+交换
✅ 正确：
  - 第1帧：比较
  - 第2帧：标记moving
  - 第3-5帧：分步交换
```

### 3.2 排序模块的 AnimationStep 接口

```typescript
interface SortingStep extends AnimationStep {
  // === 通用字段 ===
  description: string;           // 中文说明（≤20字）
  codeLines: number[];           // 伪代码高亮行号

  // === 排序专用字段 ===
  arrayState: (number | null)[]; // 当前数组（null表示该位置已被移走）
  highlights: {
    index: number;
    type: HighlightType;         // 使用词汇表中的类型名
  }[];

  // temp 暂存区（实现"哨兵"概念）
  temp: {
    visible: boolean;            // temp格子是否显示
    value: number | null;        // 当前值（null表示空）
    highlight: HighlightType;    // temp格子的颜色状态
  };

  // 移动动画指令（可选，有移动时才填）
  moveAnimation?: {
    from: number | 'temp';       // 从哪里移动（index 或 'temp'）
    to: number | 'temp';         // 移动到哪里
  };

  // 统计信息（实时显示在界面上）
  stats: {
    comparisons: number;         // 比较次数
    swaps: number;               // 交换次数
    arrayAccesses: number;       // 数组访问次数
  };
}
```

### 3.3 以冒泡排序为例：完整交换过程

以数组 `[5, 3, 8]`，交换 index 0（值5）和 index 1（值3）为例：

```
帧1：比较阶段
  说明：比较 arr[0]=5 和 arr[1]=3，5 > 3，需要交换
  高亮：index 0、index 1 → comparing（橙色）
  temp区：{ visible: false, value: null }
  stats：{ comparisons: 1, swaps: 0 }

帧2：标记移动目标
  说明：标记 arr[0]=5 将被移走
  高亮：index 0 → moving（蓝色）
  temp区：{ visible: true, value: null, highlight: 'default' }

帧3：arr[0] → temp（第一次移动）
  说明：将 5 移入 temp 暂存区
  arrayState：[null, 3, 8]
  高亮：index 0 → default，temp → in-temp（黄色）
  temp区：{ visible: true, value: 5, highlight: 'in-temp' }
  moveAnimation：{ from: 0, to: 'temp' }
  stats：{ comparisons: 1, swaps: 1 }

帧4：arr[1] → arr[0]（第二次移动）
  说明：将 3 移入 arr[0]
  arrayState：[3, null, 8]
  高亮：index 0、index 1 → swapping（红色）
  temp区：{ visible: true, value: 5, highlight: 'in-temp' }
  moveAnimation：{ from: 1, to: 0 }
  stats：{ comparisons: 1, swaps: 2 }

帧5：temp → arr[1]（第三次移动）
  说明：将 temp(5) 移入 arr[1]，交换完成
  arrayState：[3, 5, 8]
  高亮：index 1 → swapping（红色）
  temp区：{ visible: true, value: null, highlight: 'default' }
  moveAnimation：{ from: 'temp', to: 1 }
  stats：{ comparisons: 1, swaps: 3 }

帧6：完成确认
  说明：交换完成，5 和 3 已互换位置
  arrayState：[3, 5, 8]
  高亮：index 0、index 1 → sorted（绿色）
  stats：{ comparisons: 1, swaps: 3 }
```

### 3.4 temp 暂存区的界面设计

```
┌──────────────────────────────────────────────┐
│                                              │
│  temp 暂存区                                 │
│  ┌─────┐                                     │
│  │  5  │ ← 黄色框，悬浮在数组左侧            │
│  └─────┘                                     │
│    ⌢⌢⌢ 弧线轨迹（移动动画）                │
│                                              │
│  ┌───┬───┬───┬───┬───┐                       │
│  │   │ 3 │ 8 │ 1 │ 9 │ ← index 0 暂时为空  │
│  └───┴───┴───┴───┴───┘   （虚线框）          │
│   [0]  [1] [2] [3] [4]                       │
│                                              │
└──────────────────────────────────────────────┘
```

**关键点**：
- temp 格子位置固定在数组左侧，有独立标签"temp"
- 元素移动时走**弧线轨迹**动画（非直线穿过），视觉上更清晰
- temp 区为空时显示灰色框，非不可见

### 3.5 插入排序的原子步骤

以插入排序的插入过程为例（有序区：[1,3]，待插入：5）：

```
帧1：扫描有序区
  说明：从右向左扫描有序区，找到 5 的插入位置
  高亮：有序区的两端 → visiting（蓝色）
  移动次数：0

帧2：确定位置
  说明：找到位置，3 < 5，准备插入
  高亮：位置标记 → matched（紫色）

帧3：元素右移
  说明：3 向右平移一格，给 5 腾出空间
  高亮：元素 3 → moving（蓝色）
  原位置：变为虚线空槽
  stats：{ moves: 1 }

帧4：插入
  说明：将 5 插入空位
  高亮：新位置 → swapping（红色）
  stats：{ moves: 2 }

帧5：完成
  说明：插入完成，有序区更新为 [1,3,5]
  高亮：新元素位置 → sorted（绿色）
  stats：{ moves: 3 }
```

### 3.6 归并排序的双层视图

归并排序需要**双层视图**来展示分割和合并过程：

```
上层：主数组
┌───┬───┬───┬───┬───┐
│ 5 │ 2 │ 8 │ 1 │ 9 │
└───┴───┴───┴───┴───┘

下层：辅助数组（合并时显示）
┌───┬───┬───┬───┬───┐
│   │   │   │   │   │
└───┴───┴───┴───┴───┘
  ↑ 元素复制（飞入动画）
```

**关键特性**：
- **递归树缩略图**：自顶向下模式时显示当前节点橙色高亮，完成节点绿色
- **复制动画**：元素从主数组飞入辅助数组，再飞回主数组，两步可见
- **实现方式切换**：自顶向下 / 自底向上同 Tab 内切换
- **移动次数统计**：替代交换次数，统计复制到辅助数组的操作次数
- **稳定性标注**：强调 `<=` 写法是保证稳定性的关键

## 四、链表动画的 AnimationStep 设计

### 4.1 关键概念

链表动画需要表达三个维度：
1. **节点状态**（位置、高亮、值）
2. **指针变化**（创建、重定向、删除）
3. **节点位移**（floating节点移入链表）

### 4.2 链表模块的 AnimationStep 接口

```typescript
interface LinkedListNode {
  id: string;                  // 节点唯一ID（如 "node-3"）
  value: number;
  nextId: string | null;       // 指向下一个节点的ID
  prevId?: string | null;      // 双向链表用
  highlight: HighlightType;
  position: 'in-list' | 'floating' | 'removed';
  // 'floating' = 新节点还在链表外
  // 'removed'  = 已被删除，播放消失动画
}

interface LinkedListStep extends AnimationStep {
  // === 通用字段 ===
  description: string;
  codeLines: number[];

  // === 链表专用字段 ===
  nodes: LinkedListNode[];       // 所有节点的完整快照

  // 指针动画指令（链表指针变化时）
  pointerAnimations?: {
    type: 'create' | 'redirect' | 'delete';
    fromNodeId: string;          // 谁的指针在变
    oldTargetId: string | null;  // 原来指向谁
    newTargetId: string | null;  // 现在指向谁
  }[];

  // 节点位移指令（floating节点移入链表）
  nodeMovement?: {
    nodeId: string;
    fromPosition: 'floating';
    toPosition: 'in-list';
    insertAfterNodeId: string;   // 插入到谁的后面
  };
}
```

### 4.3 以链表插入为例：完整过程

在链表 `1 → 3 → 5 → 7` 中插入值 `4`：

```
帧1：创建新节点
  说明：创建新节点 [4]，尚未插入链表
  动作：新节点 [4] 出现在画布空白区（链表上方），黄色边框
  nodes：{ ..., { id: 'node-4', value: 4, position: 'floating', highlight: 'new-node' } }
  链表状态：1 → 3 → 5 → 7（不变）

帧2：从头节点开始遍历
  说明：从头节点 [1] 开始，寻找插入位置
  高亮：节点 [1] → visiting（蓝色）
  指针：current = node-1

帧3：比较，继续前进
  说明：1 < 4，且 next(3) < 4，继续向后
  高亮：节点 [1] → default，节点 [3] → visiting（蓝色）
  指针：current = node-3

帧4：找到插入位置
  说明：3 < 4 < 5，找到插入位置：[3] 和 [5] 之间
  高亮：节点 [3] → matched（紫色），节点 [5] → matched（紫色）
  新节点：高亮变为 matched（紫色）

帧5-A：修改新节点.next → [5]
  说明：新节点 [4] 的 next 指针指向 [5]
  pointerAnimations：{
    type: 'create',
    fromNodeId: 'node-4',
    oldTargetId: null,
    newTargetId: 'node-5'
  }
  动作：从 [4] 画出一条新箭头，指向 [5]（动画：箭头从无到有生长）

帧5-B：修改 [3].next → 新节点
  说明：节点 [3] 的 next 指针改指新节点 [4]
  pointerAnimations：{
    type: 'redirect',
    fromNodeId: 'node-3',
    oldTargetId: 'node-5',
    newTargetId: 'node-4'
  }
  动作：[3] 的箭头从 [5] 转向 [4]（动画：箭头偏转）
  nodeMovement：{
    nodeId: 'node-4',
    fromPosition: 'floating',
    toPosition: 'in-list',
    insertAfterNodeId: 'node-3'
  }
  [4] 从链表上方平滑移动到 [3] 和 [5] 之间的位置

帧6：插入完成
  说明：插入完成，链表为 1 → 3 → 4 → 5 → 7
  高亮：全部恢复 default
  新节点 [4] 变绿色短暂闪烁后恢复
```

### 4.4 链表的三种模式（L-03）

通过 Tab 切换：

**Tab 1：单向链表**
- 标准链表插入/删除/遍历
- 操作：插入 / 删除 / 反转 / 搜索

**Tab 2：双向链表**
- 双指针 prev/next
- 双向遍历演示
- 删除时需要同时更新两个指针

**Tab 3：循环链表**
- 最后一个节点的 next 指向头节点
- 约瑟夫问题演示（高级/可选）
- 强调"无尾部"概念

## 五、队列的 AnimationStep 设计（L-05）

### 5.1 队列的三种实现模式（Tab 切换）

**Tab 1：普通队列**
- 基本入队/出队
- 头尾指针移动

**Tab 2：循环队列**
- 重点演示"假溢出"问题
- 头尾指针环绕
- 队满判断：`(rear + 1) % MAX_SIZE == front`

**Tab 3：双端队列（Deque）**
- 两端都能入队/出队
- 两端操作指针动画

### 5.2 循环队列的核心步骤

```
初始状态（MAX_SIZE=5）：
┌───┬───┬───┬───┬───┐
│   │   │   │   │   │
└───┴───┴───┴───┴───┘
 F=0 R=0

经过多次出队后出现"假溢出"：
┌───┬───┬───┬───┬───┐
│   │   │ 3 │ 4 │ 5 │
└───┴───┴───┴───┴───┘
 F=2 R=4

此时无法入队（R+1=5=MAX_SIZE），但实际队列未满
解决：循环队列让 R 环绕回 0
```

## 六、栈的 AnimationStep 设计（L-04）

### 6.1 栈的核心操作可视化

```
初始：空栈
┌───┐
│   │
└───┘

压栈 5：
┌───┐
│ 5 │← 高亮 swapping（红色）
└───┘
 top=0

压栈 3：
┌───┐
│ 3 │← 新栈顶
├───┤
│ 5 │
└───┘
 top=1

弹栈：
┌───┐
│   │
├───┤
│ 5 │← 返回值 3
└───┘
 top=0
```

### 6.2 栈的两种实现方式

**模式1：移位法（默认）**
- 元素向右平移一格
- 目标位置显示虚线空槽
- 有序区颜色：蓝色（非绿色），完成后统一扫绿

**模式2：交换法**
- 使用 temp 暂存区
- 与排序中的交换逻辑相同

**关键特性**：
- 有序区颜色标注为蓝色（表示"进行中"）
- 完成后统一变为绿色
- 越界防护：伪代码和步骤说明均强调 `j >= 0` 判断

## 七、树与图的 AnimationStep 设计

### 7.1 树的步骤接口

```typescript
interface TreeNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
  highlight: HighlightType;
  // AVL树额外字段
  height?: number;
  balanceFactor?: number;
}

interface TreeStep extends AnimationStep {
  description: string;
  codeLines: number[];
  nodes: TreeNode[];             // 完整树快照（D3自动计算布局）

  // 旋转动画指令（AVL专用）
  rotationAnimation?: {
    type: 'LL' | 'RR' | 'LR' | 'RL';
    pivotNodeId: string;         // 旋转中心节点
  };
}
```

### 7.2 图的步骤接口

```typescript
interface GraphStep extends AnimationStep {
  description: string;
  codeLines: number[];

  // 节点状态
  nodeStates: {
    [nodeId: string]: {
      highlight: HighlightType;
      label?: string;            // 额外标注（如Dijkstra的距离值）
    }
  };

  // 边状态
  edgeStates: {
    [edgeId: string]: {         // edgeId 格式："A-B"
      highlight: HighlightType;
      animated: boolean;        // 是否显示流动动画（数据流向）
    }
  };

  // 算法附属数据（如距离表、访问栈）
  auxiliary?: Record<string, any>;
}
```

## 八、统一的顶层类型

```typescript
// 所有高亮类型（统一枚举）
type HighlightType =
  | 'default'
  | 'comparing'
  | 'moving'
  | 'in-temp'
  | 'swapping'
  | 'visiting'
  | 'matched'
  | 'sorted'
  | 'new-node'
  | 'path';

// 基础AnimationStep接口
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
    moves?: number;
  };
}

// 各类型步骤的联合类型
type ConcreteAnimationStep =
  | SortingStep
  | LinkedListStep
  | StackStep
  | QueueStep
  | TreeStep
  | GraphStep;

// 所有算法函数的统一签名
type AlgorithmFunction<TInput, TStep extends AnimationStep> =
  (input: TInput) => TStep[];
```

## 九、最佳实践

### 原子性原则

✅ **每帧 = 一个原子操作**
- 一次比较
- 一次交换（拆分成3帧）
- 一个节点的访问
- 一条边的标记

❌ **禁止在一帧内合并多个操作**

### 中文说明文字

✅ **好的例子**：
- "比较 5 和 3，5 > 3 需要交换"
- "从头节点开始寻找插入位置"
- "当前处理节点距离更新为 8"

❌ **不好的例子**：
- "执行冒泡排序第i轮第j轮迭代，触发swap操作"
- "节点访问，邻接表扫描"
- "dp[i][j] 状态转移"

### 颜色对应规则

- **颜色必须严格遵循词汇表**，不能自定义
- 同一含义在全项目统一（比如"正在比较"永远是橙色）
- 颜色过渡应平滑（200-300ms），不应闪烁跳变

### 统计计数器

每个步骤应包含实时的操作计数：
- 排序：比较次数、交换次数、数组访问次数
- 链表：插入次数、删除次数
- 图：节点访问次数、边遍历次数
- 字符串：模式匹配次数

## 十、Cursor 开发时的关键 Prompt

```
请参考 ANIMATION_STEP_DESIGN.md v1.2 中的接口定义，
实现 [算法名] 的步骤生成函数，类型为 [对应Step类型]。

要求：
- 每次比较生成一帧 comparing 步骤
- 每次移动/交换生成独立帧（拆分为原子操作）
- 包含 stats 计数器实时更新
- 说明文字使用中文，表达准确但简洁（不超过20字）
- 高亮类型必须从词汇表中选取，不能自定义
- 参考本文档中的完整过程示例（如冒泡排序、链表插入）
```

## 十一、模块动画设计清单

| 模块 | 类型 | 难点 | 特殊处理 |
|------|------|------|---------|
| L-01 数组 | 基础 | 索引查找 | 无 |
| L-02 动态数组 | 基础 | 扩容动画 | 两层展示（元素移动） |
| L-03 链表 | 中等 | 指针变化 | 三个tab（单/双/循环） |
| L-04 栈 | 中等 | LIFO演示 | 两种实现方式 |
| L-05 队列 | 中等 | 假溢出 | 三个tab，循环队列重点 |
| T-01 二叉树遍历 | 中等 | 递归树展示 | 四种遍历tab |
| T-02 BST | 中等 | 树形旋转 | 旋转动画 |
| T-03 AVL树 | 高等 | 4种旋转 | LL/RR/LR/RL分别演示 |
| T-04 堆 | 中等 | heapify | 自顶向下/自底向上 |
| G-02 DFS | 中等 | 栈驱动 | 回溯路径显示 |
| G-03 BFS | 中等 | 队列驱动 | 层级展示 |
| G-04 Dijkstra | 高等 | 距离表 | 距离表动态更新 |
| S-01~S-10 排序 | 基础 | temp区管理 | 统一使用temp暂存区 |
| S-05 归并排序 | 中等 | 双层视图 | 递归树+主辅数组 |
| S-11 排序竞速 | 中等 | 多算法同步 | 多条赛道并行播放 |
| P-02 动态规划 | 高等 | 状态表格 | 表格逐格填写 |
| P-04 回溯 | 高等 | 解空间树 | 棋盘+树形展示 |
