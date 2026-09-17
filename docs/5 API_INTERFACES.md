
# API_INTERFACES.md

## 📋 目录

1. [概述](#概述)
2. [核心接口](#核心接口)
3. [动画接口](#动画接口)
4. [状态管理接口](#状态管理接口)
5. [数据结构接口](#数据结构接口)
6. [可视化接口](#可视化接口)
7. [枚举与类型别名](#枚举与类型别名)
8. [工具接口](#工具接口)

---

## 概述

本文档定义了整个算法可视化系统的所有 TypeScript 接口。这些接口确保：

- ✅ 类型安全与 IDE 自动补全
- ✅ 前后端数据结构一致性
- ✅ 模块之间的通信规范
- ✅ 动画系统的统一标准

**版本**：v1.0  
**最后更新**：2026-03-02

---

## 核心接口

### ModuleMetadata

定义每个模块（算法）的元数据。

```typescript
interface ModuleMetadata {
  // 必填字段
  id: string;                    // 模块唯一标识，格式：L-01, S-01, T-01, G-01等
  name: string;                  // 中文名称，如"单向链表"、"冒泡排序"
  category: 'linear' | 'tree' | 'graph' | 'sort' | 'string' | 'other';  // 模块分类
  route: string;                 // 路由路径，格式：/modules/linked-list
  
  // 难度与学习信息
  difficulty: 1 | 2 | 3 | 4 | 5;  // 难度等级（1=简单，5=困难）
  timeComplexity?: {             // 时间复杂度
    best: string;      // 最优情况，如"O(1)"、"O(n log n)"
    average: string;   // 平均情况
    worst: string;     // 最坏情况
  };
  spaceComplexity?: string;      // 空间复杂度，如"O(n)"
  
  // 功能描述
  description: string;           // 简短描述，<200字
  prerequisites?: string[];      // 前置知识，如["数组","链表"]
  relatedModules?: string[];     // 相关模块ID列表
  
  // 可选功能
  hasManualMode?: boolean;       // 是否支持手动构建模式
  hasGenerateData?: boolean;     // 是否支持随机生成数据
  hasCustomInput?: boolean;      // 是否支持自定义输入
  
  // UI显示
  icon?: string;                 // 模块图标（可选SVG名称）
  color?: string;                // 主题色（Tailwind色值）
  tags?: string[];               // 标签，如["线性结构","基础"]
}
```

**使用示例**：
```typescript
const linkedListModule: ModuleMetadata = {
  id: 'L-03',
  name: '链表',
  category: 'linear',
  route: '/modules/linked-list',
  difficulty: 2,
  timeComplexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)'
  },
  description: '学习单向、双向和循环链表的基本操作',
  prerequisites: ['数组', '指针概念'],
  hasManualMode: true,
  hasGenerateData: true
};
```

---

### PlaybackControl

定义动画播放控制的接口。

```typescript
interface PlaybackControl {
  // 播放状态
  isPlaying: boolean;            // 是否正在播放
  isPaused: boolean;             // 是否暂停中
  currentStep: number;           // 当前步骤索引（0-based）
  totalSteps: number;            // 总步骤数
  progress: number;              // 进度百分比（0-100）
  
  // 播放速度控制
  speed: number;                 // 播放速度倍数（0.5, 1, 1.5, 2, 4）
  isPaused: boolean;             // 是否暂停
  
  // 方法
  play(): void;                  // 开始或继续播放
  pause(): void;                 // 暂停播放
  reset(): void;                 // 重置到初始状态
  nextStep(): void;              // 前进一步
  prevStep(): void;              // 后退一步
  seek(stepIndex: number): void; // 跳转到指定步骤
  setSpeed(speed: number): void; // 设置播放速度
}
```

---

### AlgorithmState

定义算法执行状态。

```typescript
interface AlgorithmState {
  // 执行阶段
  phase: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  
  // 当前数据
  currentData: any[];            // 当前正在处理的数据数组
  originalData: any[];           // 原始数据备份
  
  // 执行统计
  comparisons: number;           // 比较次数
  swaps: number;                 // 交换次数
  operations: number;            // 总操作数
  
  // 时间信息
  elapsedTime: number;           // 已用时间（毫秒）
  estimatedTime?: number;        // 预计总时间（毫秒，可选）
  
  // 高亮信息
  highlightedIndices?: number[]; // 当前高亮的数据元素索引
  activeNode?: string;           // 当前活跃节点ID（树/图用）
  
  // 错误处理
  error?: string;                // 错误信息
}
```

---

## 动画接口

### AnimationStep

定义单个动画步骤的完整信息。**这是整个系统的核心接口**。

```typescript
interface AnimationStep {
  // 基础信息
  id: string;                    // 步骤唯一ID，格式："step-0", "step-1"
  name: string;                  // 步骤名称，如"找到插入位置"、"比较元素"
  description: string;           // 详细描述（支持Markdown）
  
  // 数据状态
  dataState: {
    array?: number[];            // 数组当前状态（排序/搜索用）
    nodes?: VisualizationNode[]; // 节点当前状态（树/链表用）
    edges?: VisualizationEdge[]; // 边当前状态（图用）
  };
  
  // 高亮与动画
  highlights: {
    nodeIds?: string[];          // 高亮的节点ID
    indices?: number[];          // 高亮的数组元素索引
    edgeIds?: string[];          // 高亮的边ID
    type?: 'comparing' | 'moving' | 'matched' | 'new-node' | 'visiting';
  };
  
  // 指针与引用动画
  pointerAnimations?: PointerAnimation[];  // 指针变化列表
  nodeMovement?: NodeMovement;             // 节点移动信息
  
  // 统计更新
  stats?: {
    comparisons?: number;
    swaps?: number;
    operations?: number;
  };
  
  // 时间配置
  duration: number;              // 该步骤的动画时长（毫秒）
  delay?: number;                // 延迟开始时间（毫秒，默认0）
  easing?: EasingType;           // 缓动函数类型
  
  // 回调
  onStart?: () => void;          // 步骤开始时回调
  onComplete?: () => void;       // 步骤完成时回调
  
  // 代码同步
  codeHighlight?: {
    lineStart: number;           // 代码高亮起始行
    lineEnd: number;             // 代码高亮结束行
    language?: 'javascript' | 'python' | 'pseudocode';
  };
}
```

**使用示例（链表插入）**：
```typescript
const insertStep: AnimationStep = {
  id: 'step-5',
  name: '修改指针连接',
  description: '将新节点的next指针指向后继节点，将前驱节点的next改指新节点',
  dataState: {
    nodes: [
      { id: 'node-3', value: 3, position: { x: 100, y: 100 } },
      { id: 'node-4', value: 4, position: { x: 200, y: 100 }, highlight: 'matched' },
      { id: 'node-5', value: 5, position: { x: 300, y: 100 }, highlight: 'matched' }
    ]
  },
  highlights: {
    nodeIds: ['node-3', 'node-4', 'node-5'],
    type: 'moving'
  },
  pointerAnimations: [
    {
      type: 'create',
      fromNodeId: 'node-4',
      newTargetId: 'node-5'
    },
    {
      type: 'redirect',
      fromNodeId: 'node-3',
      oldTargetId: 'node-5',
      newTargetId: 'node-4'
    }
  ],
  duration: 600,
  easing: 'ease-out',
  codeHighlight: { lineStart: 5, lineEnd: 7 }
};
```

---

### PointerAnimation

指针（箭头）的动画信息。

```typescript
interface PointerAnimation {
  type: 'create' | 'remove' | 'redirect' | 'update';  // 指针操作类型
  fromNodeId: string;            // 指针源节点ID
  oldTargetId?: string;          // 原目标节点ID（用于redirect）
  newTargetId?: string;          // 新目标节点ID（用于create/redirect）
  label?: string;                // 指针标签（权值等）
  color?: string;                // 指针颜色（可选）
  animationDuration?: number;    // 该指针动画的时长（毫秒）
}
```

---

### NodeMovement

节点移动的动画信息。

```typescript
interface NodeMovement {
  nodeId: string;                // 要移动的节点ID
  fromPosition?: { x: number; y: number };  // 起始位置（可选，默认使用当前位置）
  toPosition: { x: number; y: number };     // 目标位置
  insertAfterNodeId?: string;    // 在某个节点后插入（链表用）
  duration?: number;             // 移动时长（毫秒）
  easing?: EasingType;           // 缓动函数
}
```

---

## 状态管理接口

### AppStore

全局应用状态（使用Zustand）。

```typescript
interface AppStore {
  // 当前模块
  currentModule: ModuleMetadata | null;
  setCurrentModule(module: ModuleMetadata): void;
  
  // 动画相关
  animationSteps: AnimationStep[];
  currentStepIndex: number;
  setAnimationSteps(steps: AnimationStep[]): void;
  goToStep(index: number): void;
  
  // 播放控制
  playback: PlaybackControl;
  play(): void;
  pause(): void;
  reset(): void;
  setSpeed(speed: number): void;
  
  // 数据管理
  inputData: any[];
  setInputData(data: any[]): void;
  generateRandomData(size: number): void;
  
  // UI状态
  showCode: boolean;
  showStats: boolean;
  toggleCode(): void;
  toggleStats(): void;
}
```

---

### UIStore

UI相关状态。

```typescript
interface UIStore {
  // 主题
  isDarkMode: boolean;
  toggleDarkMode(): void;
  
  // 布局
  codePanel: {
    isVisible: boolean;
    width: number;  // 像素
    language: 'javascript' | 'python' | 'pseudocode';
  };
  setCodePanelWidth(width: number): void;
  
  // 视图配置
  animationSpeed: 0.5 | 1 | 1.5 | 2 | 4;  // 倍速
  showGrid: boolean;         // 显示网格（图算法）
  showLabels: boolean;       // 显示标签
  
  // 通知
  notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    visible: boolean;
  };
  showNotification(type: string, message: string): void;
  hideNotification(): void;
}
```

---

## 数据结构接口

### VisualizationNode

可视化节点。

```typescript
interface VisualizationNode {
  id: string;                    // 节点唯一ID
  value: any;                    // 节点值（可以是数字、字符串等）
  position: {
    x: number;
    y: number;
  };
  
  // 样式
  highlight?: 'default' | 'visiting' | 'matched' | 'new-node' | 'comparing' | 'moving';
  color?: string;                // 自定义颜色（RGB或Tailwind）
  size?: number;                 // 节点大小（像素）
  shape?: 'circle' | 'square' | 'rectangle';
  
  // 链表/树特殊字段
  children?: string[];           // 子节点ID列表（树用）
  next?: string;                 // 下一个节点ID（链表用）
  prev?: string;                 // 前一个节点ID（双向链表用）
  
  // 可视化标志
  isSelected?: boolean;
  isAnimating?: boolean;
  metadata?: Record<string, any>;  // 自定义元数据
}
```

---

### VisualizationEdge

可视化边。

```typescript
interface VisualizationEdge {
  id: string;                    // 边唯一ID
  source: string;                // 源节点ID
  target: string;                // 目标节点ID
  weight?: number;               // 权值（图算法用）
  
  // 样式
  highlight?: 'default' | 'active' | 'selected' | 'rejected';
  color?: string;
  width?: number;                // 线宽（像素）
  style?: 'solid' | 'dashed';    // 实线或虚线
  
  // 标签
  label?: string;                // 边的标签（如权值）
  labelPosition?: 'top' | 'middle' | 'bottom';
  
  // 方向
  isDirected?: boolean;          // 是否有向
  isBidirectional?: boolean;     // 是否双向
}
```

---

## 可视化接口

### Canvas配置

```typescript
interface CanvasConfig {
  width: number;                 // 画布宽度
  height: number;                // 画布高度
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // D3配置
  d3: {
    nodeRadius: number;          // 节点半径
    edgeLength: number;          // 边的基础长度
    chargeStrength: number;      // 节点排斥力
    linkDistance: number;        // 链接距离
  };
  
  // 颜色配置
  colors: {
    background: string;
    grid: string;
    node: {
      default: string;
      visiting: string;
      matched: string;
      newNode: string;
    };
    edge: {
      default: string;
      active: string;
    };
  };
}
```

---

## 枚举与类型别名

### EasingType

```typescript
type EasingType =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier';
```

---

### HighlightType

```typescript
type HighlightType =
  | 'default'           // 默认状态
  | 'visiting'          // 正在访问（浅蓝色）
  | 'matched'           // 匹配/满足条件（紫色）
  | 'comparing'         // 正在比较（黄色）
  | 'moving'            // 正在移动（绿色）
  | 'new-node'          // 新创建节点（黄色边框）
  | 'selected';         // 已选择（深蓝色）
```

---

### DifficultyLevel

```typescript
enum DifficultyLevel {
  VeryEasy = 1,   // 1⭐
  Easy = 2,       // 2⭐
  Medium = 3,     // 3⭐
  Hard = 4,       // 4⭐
  VeryHard = 5    // 5⭐
}
```

---

### ModuleCategory

```typescript
enum ModuleCategory {
  Linear = 'linear',      // 线性结构
  Tree = 'tree',          // 树
  Graph = 'graph',        // 图
  Sort = 'sort',          // 排序
  String = 'string',      // 字符串
  Other = 'other'         // 其他
}
```

---

## 工具接口

### DataGenerator

随机数据生成器。

```typescript
interface DataGenerator {
  // 基本生成
  generateArray(size: number, max?: number): number[];
  generateSortedArray(size: number, max?: number): number[];
  generateReverseSortedArray(size: number, max?: number): number[];
  generateRandomPermutation(size: number): number[];
  
  // 特殊用途
  generateLinkedList(values: any[]): VisualizationNode[];
  generateBinaryTree(values: any[]): VisualizationNode[];
  generateGraph(nodeCount: number, edgeCount: number): {
    nodes: VisualizationNode[];
    edges: VisualizationEdge[];
  };
}
```

---

### AnimationRecorder

记录和回放动画。

```typescript
interface AnimationRecorder {
  startRecording(): void;
  stopRecording(): AnimationStep[];
  clear(): void;
  addStep(step: AnimationStep): void;
  getSteps(): AnimationStep[];
  exportAsJSON(): string;
  importFromJSON(json: string): void;
}
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，定义核心接口 |

---

**文档完成于 2026-03-02**  
