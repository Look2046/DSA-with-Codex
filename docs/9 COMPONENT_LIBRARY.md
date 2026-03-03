
# COMPONENT_LIBRARY.md

## 📋 目录

1. [概述](#概述)
2. [组件分类](#组件分类)
3. [原子组件](#原子组件)
4. [分子组件](#分子组件)
5. [生物组件](#生物组件)
6. [可视化器组件](#可视化器组件)
7. [页面级组件](#页面级组件)
8. [布局组件](#布局组件)
9. [Hook 函数](#hook-函数)
10. [工具函数](#工具函数)
11. [组件通信](#组件通信)
12. [样式系统](#样式系统)

---

## 概述

本文档是整个算法可视化系统的 **React 组件库完整目录**。包含：

- ✅ 所有组件的定义、Props、用法
- ✅ 组件之间的依赖关系
- ✅ 最佳实践和注意事项
- ✅ 类型定义和接口
- ✅ 访问性和无障碍考虑

**版本**：v1.0  
**最后更新**：2026-03-02  
**技术栈**：React 18+, TypeScript, Tailwind CSS, Zustand

---

## 组件分类

### 原子设计系统

本项目采用 **原子设计（Atomic Design）** 系统：

```
原子 (Atoms)
  ↓ 组合成
分子 (Molecules)
  ↓ 组合成
生物 (Organisms)
  ↓ 组合成
页面 (Pages)
```

| 层级 | 说明 | 示例 |
|-----|------|------|
| **原子** | 最基础的单一功能组件 | Button、Input、Badge |
| **分子** | 多个原子组合的简单组件 | SearchBar、Tabs、Card |
| **生物** | 更复杂的功能组件 | Header、Sidebar、Panel |
| **页面** | 完整的页面结构 | HomePage、ModulePage |

---

## 原子组件

原子组件是最基础的 UI 单元，不依赖其他组件。

### Button

基础按钮组件。

```typescript
// src/components/atoms/Button.tsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  children,
  ...props
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Button variant="primary" size="md">
  开始
</Button>

<Button variant="danger" icon={<TrashIcon />}>
  删除
</Button>

<Button isLoading={true}>
  加载中...
</Button>
```

**Props 说明**：
| Prop | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| variant | string | 'primary' | 按钮风格 |
| size | string | 'md' | 按钮大小 |
| isLoading | boolean | false | 加载状态 |
| icon | ReactNode | - | 图标元素 |
| disabled | boolean | false | 禁用状态 |

---

### Input

基础输入框组件。

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'text' | 'number' | 'password';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  variant = 'text',
  ...props
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Input
  label="输入数据"
  type="text"
  placeholder="例如: 3,1,4,1,5"
  error={error}
  helperText="多个数字用逗号分隔"
/>
```

---

### Badge

徽章/标签组件。

```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClose?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  onClose,
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Badge variant="success">已完成</Badge>
<Badge variant="warning" onClose={() => {}}>标签</Badge>
```

---

### Text

文本组件，支持不同层级和样式。

```typescript
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  weight?: 'normal' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
  truncate?: boolean;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  truncate = false,
  children,
}) => {
  // 实现
};
```

---

### Icon

图标组件，支持多个图标库。

```typescript
interface IconProps extends React.SVGAttributes<SVGElement> {
  name: string;  // 图标名称
  size?: 'sm' | 'md' | 'lg' | number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  ...props
}) => {
  // 从图标库中选择图标
};
```

**支持的图标**：
- play, pause, stop, reset
- step-forward, step-backward
- speed, settings, theme
- plus, minus, delete, edit
- check, close, warning, info
- 等等...

---

### Spinner

加载动画组件。

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
  speed = 'normal',
}) => {
  // 实现
};
```

---

## 分子组件

分子组件由多个原子组件组成，实现更复杂的功能。

### SearchBar

搜索栏组件。

```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  value?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  onSearch,
  onClear,
  debounceMs = 300,
  value,
}) => {
  // 实现，包含防抖
};
```

**使用示例**：
```jsx
<SearchBar
  placeholder="搜索模块..."
  onSearch={(query) => handleSearch(query)}
  debounceMs={500}
/>
```

---

### Tabs

标签页组件。

```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'card' | 'button';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  variant = 'line',
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Tabs
  items={[
    { id: 'tab1', label: '单向链表' },
    { id: 'tab2', label: '双向链表' },
    { id: 'tab3', label: '循环链表' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="line"
/>
```

---

### Card

卡片容器组件。

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  header,
  footer,
  hoverable = false,
  onClick,
  children,
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Card
  title="冒泡排序"
  subtitle="1⭐ | 排序算法"
  hoverable
  onClick={() => navigate('/modules/bubble-sort')}
>
  <p>最经典的排序算法，通过相邻元素比较和交换...</p>
</Card>
```

---

### CodeBlock

代码块组件，支持语法高亮。

```typescript
interface CodeBlockProps {
  code: string;
  language?: 'javascript' | 'python' | 'pseudocode' | 'json';
  showLineNumbers?: boolean;
  highlightLines?: number[];
  copyable?: boolean;
  theme?: 'light' | 'dark';
  onLineClick?: (lineNumber: number) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
  highlightLines = [],
  copyable = true,
  theme = 'light',
  onLineClick,
}) => {
  // 实现，集成 Prism 或 Highlight.js
};
```

**使用示例**：
```jsx
<CodeBlock
  code={`function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`}
  language="javascript"
  highlightLines={[3, 4, 5]}
  copyable
/>
```

---

### Slider

滑块组件。

```typescript
interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  marks?: Array<{ value: number; label: string }>;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  marks,
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<Slider
  min={0.5}
  max={4}
  step={0.5}
  value={playSpeed}
  onChange={setPlaySpeed}
  label="播放速度"
  marks={[
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ]}
/>
```

---

### Select

下拉选择组件。

```typescript
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '选择...',
  searchable = false,
  disabled = false,
}) => {
  // 实现
};
```

---

### Modal

模态框组件。

```typescript
interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  size = 'md',
  closeButton = true,
  children,
  footer,
}) => {
  // 实现，使用 Portal
};
```

---

## 生物组件

生物组件是功能完整的复杂组件，由多个分子组件组成。

### Header

页面顶部导航栏组件。

```typescript
interface HeaderProps {
  showLogo?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  showThemeToggle?: boolean;
  onThemeChange?: (isDark: boolean) => void;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  showLogo = true,
  showSearch = true,
  onSearch,
  showThemeToggle = true,
  onThemeChange,
  rightContent,
}) => {
  // 实现
  // 包含：logo、搜索栏、主题切换、用户菜单等
};
```

---

### Sidebar

侧边栏组件，显示模块列表。

```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  onClick?: () => void;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  collapsible = true,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // 实现
  // 支持树形结构、折叠、高亮活跃项
};
```

---

### PlaybackControls

动画播放控制面板。

```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (step: number) => void;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  speedOptions?: number[];
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrev,
  onSeek,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
  speedOptions = [0.5, 1, 1.5, 2, 4],
}) => {
  // 实现
  // 包含：播放/暂停、前进/后退、重置、速度调节、进度条
};
```

---

### VisualizerContainer

可视化容器组件，包含画布和辅助信息。

```typescript
interface VisualizerContainerProps {
  width: number;
  height: number;
  showGrid?: boolean;
  children: React.ReactNode;  // SVG 画布
  stats?: {
    comparisons: number;
    swaps: number;
    operations: number;
  };
  title?: string;
}

export const VisualizerContainer: React.FC<VisualizerContainerProps> = ({
  width,
  height,
  showGrid = true,
  children,
  stats,
  title,
}) => {
  // 实现
};
```

---

### DataInputPanel

数据输入面板。

```typescript
interface DataInputPanelProps {
  initialData?: any[];
  onDataChange: (data: any[]) => void;
  onGenerate: (size: 'small' | 'medium' | 'large') => void;
  onClear: () => void;
  maxSize?: number;
  placeholder?: string;
  error?: string;
}

export const DataInputPanel: React.FC<DataInputPanelProps> = ({
  initialData,
  onDataChange,
  onGenerate,
  onClear,
  maxSize = 100,
  placeholder = '输入逗号分隔的数字',
  error,
}) => {
  // 实现
  // 包含：手动输入、生成随机数、清空、验证
};
```

---

### StatsPanel

统计信息面板。

```typescript
interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface StatsPanelProps {
  stats: StatItem[];
  title?: string;
  layout?: 'row' | 'column';
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  title = '算法统计',
  layout = 'row',
}) => {
  // 实现
};
```

**使用示例**：
```jsx
<StatsPanel
  stats={[
    { label: '比较次数', value: 45, icon: <CompareIcon /> },
    { label: '交换次数', value: 12, icon: <SwapIcon /> },
    { label: '总操作数', value: 57, icon: <OperationIcon /> },
  ]}
/>
```

---

### CodePanel

代码显示面板，与动画同步。

```typescript
interface CodePanelProps {
  code: string;
  language?: 'javascript' | 'python' | 'pseudocode';
  currentLine?: number;
  onLineClick?: (lineNumber: number) => void;
  width?: string | number;
  height?: string | number;
  resizable?: boolean;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  language = 'javascript',
  currentLine,
  onLineClick,
  width = '100%',
  height = '400px',
  resizable = true,
}) => {
  // 实现
  // 包含：代码高亮、行号、当前行高亮、行点击
};
```

---

## 可视化器组件

专用于数据结构和算法可视化的组件。

### ArrayVisualizer

数组可视化组件。

```typescript
interface ArrayVisualizerProps {
  data: number[];
  highlightIndices?: {
    indices: number[];
    type: 'comparing' | 'moving' | 'matched' | 'visiting' | 'idle';
  }[];
  width?: number;
  height?: number;
  nodeSize?: number;
  gap?: number;
  onNodeClick?: (index: number) => void;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  data,
  highlightIndices,
  width = 800,
  height = 100,
  nodeSize = 40,
  gap = 10,
  onNodeClick,
}) => {
  // 实现，使用 SVG 或 Canvas
};
```

---

### LinkedListVisualizer

链表可视化组件。

```typescript
interface LinkedListVisualizerProps {
  nodes: VisualizationNode[];
  pointers?: VisualizationEdge[];
  highlightNodes?: {
    nodeIds: string[];
    type: HighlightType;
  };
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  nodes,
  pointers,
  highlightNodes,
  width = 800,
  height = 300,
  onNodeClick,
}) => {
  // 实现，使用 SVG + D3
};
```

---

### TreeVisualizer

树结构可视化组件。

```typescript
interface TreeVisualizerProps {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  highlightNodes?: {
    nodeIds: string[];
    type: HighlightType;
  };
  width?: number;
  height?: number;
  layout?: 'hierarchical' | 'radial' | 'circular';
  onNodeClick?: (nodeId: string) => void;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  nodes,
  edges,
  highlightNodes,
  width = 800,
  height = 500,
  layout = 'hierarchical',
  onNodeClick,
}) => {
  // 实现，使用 SVG + D3 力导向图
};
```

---

### GraphVisualizer

图结构可视化组件。

```typescript
interface GraphVisualizerProps {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  highlightNodes?: {
    nodeIds: string[];
    type: HighlightType;
  };
  highlightEdges?: {
    edgeIds: string[];
    type: HighlightType;
  };
  width?: number;
  height?: number;
  directed?: boolean;
  showWeights?: boolean;
  showGrid?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  nodes,
  edges,
  highlightNodes,
  highlightEdges,
  width = 800,
  height = 500,
  directed = false,
  showWeights = true,
  showGrid = true,
  onNodeClick,
}) => {
  // 实现，使用 SVG + D3 力导向图
};
```

---

## 页面级组件

### HomePage

首页，显示所有模块的卡片网格。

```typescript
interface HomePageProps {
  // 无 props，通过 zustand store 获取数据
}

export const HomePage: React.FC<HomePageProps> = () => {
  // 实现
  // 功能：
  // - 显示模块卡片网格
  // - 分类过滤（线性结构、树、图等）
  // - 难度筛选（1-5⭐）
  // - 搜索功能
  // - 点击进入模块
};
```

---

### ModulePage

模块详情页。

```typescript
interface ModulePageProps {
  moduleId: string;  // 从 URL 参数获取
}

export const ModulePage: React.FC<ModulePageProps> = ({ moduleId }) => {
  // 实现
  // 功能：
  // - 左侧：模块 MD 文档
  // - 中间：可视化画布
  // - 右侧：代码面板 + 统计信息
  // - 底部：播放控制
  // - 支持响应式布局
};
```

---

### AboutPage

关于页面。

```typescript
interface AboutPageProps {}

export const AboutPage: React.FC<AboutPageProps> = () => {
  // 实现
  // 包含：项目简介、技术栈、贡献者、许可证等
};
```

---

### NotFoundPage

404 页面。

```typescript
interface NotFoundPageProps {}

export const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  // 实现
};
```

---

## 布局组件

### Layout

主布局组件，包含 Header 和 Sidebar。

```typescript
interface LayoutProps {
  showHeader?: boolean;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  showHeader = true,
  showSidebar = true,
  sidebarCollapsed = false,
  children,
}) => {
  // 实现
};
```

---

### ModuleLayout

模块页面专用布局，支持多栏布局。

```typescript
interface ModuleLayoutProps {
  documentPanel: React.ReactNode;
  visualizerPanel: React.ReactNode;
  codePanel?: React.ReactNode;
  statsPanel?: React.ReactNode;
  controlsPanel: React.ReactNode;
  layout?: 'two-column' | 'three-column';
  documentWidth?: string;  // 例如：'25%'
  codeWidth?: string;      // 例如：'25%'
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  documentPanel,
  visualizerPanel,
  codePanel,
  statsPanel,
  controlsPanel,
  layout = 'three-column',
  documentWidth = '25%',
  codeWidth = '25%',
}) => {
  // 实现
  // 支持：
  // - 栏目拖动调整宽度
  // - 响应式布局
  // - 全屏模式
};
```

---

## Hook 函数

### useAppStore

全局应用状态 Hook。

```typescript
export const useAppStore = () => {
  return useShallow((state) => ({
    currentModule: state.currentModule,
    animationSteps: state.animationSteps,
    currentStepIndex: state.currentStepIndex,
    playback: state.playback,
    inputData: state.inputData,
    setCurrentModule: state.setCurrentModule,
    setAnimationSteps: state.setAnimationSteps,
    goToStep: state.goToStep,
    play: state.play,
    pause: state.pause,
    reset: state.reset,
    setSpeed: state.setSpeed,
    setInputData: state.setInputData,
    generateRandomData: state.generateRandomData,
  }));
};

// 使用
const { currentModule, animationSteps, play, pause } = useAppStore();
```

---

### useUIStore

UI 状态 Hook。

```typescript
export const useUIStore = () => {
  return useShallow((state) => ({
    isDarkMode: state.isDarkMode,
    codePanel: state.codePanel,
    animationSpeed: state.animationSpeed,
    showGrid: state.showGrid,
    toggleDarkMode: state.toggleDarkMode,
    setCodePanelWidth: state.setCodePanelWidth,
    showNotification: state.showNotification,
    hideNotification: state.hideNotification,
  }));
};
```

---

### useAnimation

动画执行 Hook，处理动画步骤的播放、暂停等逻辑。

```typescript
interface UseAnimationOptions {
  steps: AnimationStep[];
  autoPlay?: boolean;
  speed?: number;
}

interface UseAnimationReturn {
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  seek: (step: number) => void;
  setSpeed: (speed: number) => void;
}

export const useAnimation = (options: UseAnimationOptions): UseAnimationReturn => {
  // 实现
  // - 使用 requestAnimationFrame 处理动画
  // - 支持暂停/继续
  // - 支持跳转步骤
  // - 支持调速
};

// 使用
const {
  currentStep,
  isPlaying,
  play,
  pause,
  nextStep,
  seek,
} = useAnimation({ steps: animationSteps, speed: 1 });
```

---

### useLocalStorage

本地存储 Hook。

```typescript
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  // 实现
};

// 使用
const [savedData, setSavedData] = useLocalStorage('moduleData', []);
```

---

### useDebounce

防抖 Hook。

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  // 实现
};

// 使用
const debouncedSearchQuery = useDebounce(searchQuery, 500);
```

---

### useTheme

主题切换 Hook。

```typescript
interface UseThemeReturn {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useTheme = (): UseThemeReturn => {
  // 实现
  // - 读取系统主题偏好
  // - 持久化主题设置
  // - 与 CSS 变量同步
};

// 使用
const { isDarkMode, toggleTheme } = useTheme();
```

---

## 工具函数

### 动画工具

```typescript
// src/utils/animation.ts

// 计算缓动函数
export const easeOut = (progress: number): number => {
  return 1 - Math.pow(1 - progress, 3);
};

export const easeIn = (progress: number): number => {
  return Math.pow(progress, 3);
};

export const easeInOut = (progress: number): number => {
  return progress < 0.5
    ? 2 * Math.pow(progress, 2)
    : -1 + (4 - 2 * progress) * progress;
};

// 线性插值
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

// 生成动画帧
export const generateFrames = (
  startValue: number,
  endValue: number,
  duration: number,
  fps: number = 60,
  easing: (t: number) => number = easeInOut
): number[] => {
  const frames: number[] = [];
  const frameCount = Math.round((duration / 1000) * fps);
  
  for (let i = 0; i <= frameCount; i++) {
    const progress = i / frameCount;
    const easedProgress = easing(progress);
    frames.push(lerp(startValue, endValue, easedProgress));
  }
  
  return frames;
};
```

---

### 数据工具

```typescript
// src/utils/data.ts

// 生成随机数组
export const generateRandomArray = (size: number, max: number = 100): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
};

// 验证输入数据
export const validateNumberArray = (str: string): number[] | null => {
  try {
    const numbers = str.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => parseInt(s, 10));
    
    if (numbers.some(n => isNaN(n))) return null;
    return numbers;
  } catch {
    return null;
  }
};

// 深拷贝数组
export const deepCopyArray = (arr: any[]): any[] => {
  return JSON.parse(JSON.stringify(arr));
};
```

---

### 格式化工具

```typescript
// src/utils/format.ts

// 格式化大数字
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// 格式化时间
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  return `${seconds}s ${milliseconds}ms`;
};

// 复杂度字符串
export const formatComplexity = (complexity: string): string => {
  return complexity.replace(/n/g, 'n').replace(/log/g, 'log₂');
};
```

---

## 组件通信

### 通过 Zustand 状态管理

```typescript
// src/store/appStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';

interface AppStore {
  // 状态
  currentModule: ModuleMetadata | null;
  animationSteps: AnimationStep[];
  currentStepIndex: number;
  playback: PlaybackControl;
  inputData: any[];
  
  // 方法
  setCurrentModule: (module: ModuleMetadata) => void;
  setAnimationSteps: (steps: AnimationStep[]) => void;
  goToStep: (index: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setInputData: (data: any[]) => void;
  generateRandomData: (size: number) => void;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    currentModule: null,
    animationSteps: [],
    currentStepIndex: 0,
    playback: {
      isPlaying: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: 0,
      progress: 0,
      speed: 1,
      play: () => {},
      pause: () => {},
      reset: () => {},
      nextStep: () => {},
      prevStep: () => {},
      seek: () => {},
      setSpeed: () => {},
    },
    inputData: [],
    
    setCurrentModule: (module) => set({ currentModule: module }),
    setAnimationSteps: (steps) => set({ animationSteps: steps }),
    goToStep: (index) => set({ currentStepIndex: index }),
    play: () => set((state) => ({
      playback: { ...state.playback, isPlaying: true, isPaused: false },
    })),
    pause: () => set((state) => ({
      playback: { ...state.playback, isPlaying: false, isPaused: true },
    })),
    reset: () => set((state) => ({
      currentStepIndex: 0,
      playback: { ...state.playback, isPlaying: false, currentStep: 0 },
    })),
    setSpeed: (speed) => set((state) => ({
      playback: { ...state.playback, speed },
    })),
    setInputData: (data) => set({ inputData: data }),
    generateRandomData: (size) => {
      const data = generateRandomArray(size);
      set({ inputData: data });
    },
  }))
);
```

---

## 样式系统

### CSS 变量

所有组件都使用 CSS 变量定义样式，支持动态主题切换。

```css
/* src/styles/variables.css */

:root {
  /* 颜色 */
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #111827;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 边框半径 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* 过渡 */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0F172A;
    --color-text-primary: #F8FAFC;
  }
}
```

---

### Tailwind 集成

所有组件优先使用 Tailwind CSS，辅以 CSS 变量。

```jsx
// 组件示例
const Button = ({ variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  return (
    <button
      className={`
        px-4 py-2 rounded-md transition-colors
        ${variantClasses[variant]}
        dark:bg-slate-700 dark:text-slate-100
      `}
    >
      {/* 内容 */}
    </button>
  );
};
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，定义完整组件库 |

---

**文档完成于 2026-03-02**  
**下一阶段**：请提示"继续"，我将输出第六个文档：**STATE_MANAGEMENT.md**
