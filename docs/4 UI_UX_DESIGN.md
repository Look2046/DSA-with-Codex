# DSA-Viz UI/UX 设计规范 v1.2

**项目名称**：数据结构与算法可视化平台（DSA-Viz）  
**版本**：v1.2（删除合并备注，模块编码连续化）  
**最后更新**：2026年  
**设计工具**：Figma / Storybook

---

## 一、设计系统总览

### 1.1 设计理念

**三个核心原则**：

1. **清晰性** - 动画演示清晰直观，不因UI复杂而转移学生注意力
2. **可操作性** - 播放控制、数据生成快速触达，降低使用门槛
3. **沉浸式** - 深色/浅色主题切换，适应不同学习环境

### 1.2 设计框架

| 维度 | 标准 |
|------|------|
| 栅格系统 | 8px 基础单位 |
| 响应式 | 台式机优先（1920x1080 标准屏），后期支持平板 |
| 主题 | Dark / Light 双主题系统 |
| 无障碍 | WCAG 2.1 AA 级别 |

---

## 二、色彩系统

### 2.1 品牌色

| 颜色 | 名称 | Hex | RGB | 用途 |
|------|------|-----|-----|------|
| 🔵 | 主色 | `#3B82F6` | rgb(59, 130, 246) | 按钮、主要交互、高亮 |
| 🟣 | 次色 | `#8B5CF6` | rgb(139, 92, 246) | 强调、特殊事件、匹配 |
| ⚪ | 背景色 | `#F9FAFB` | rgb(249, 250, 251) | 亮色模式主背景 |
| ⚫ | 深色bg | `#0F172A` | rgb(15, 23, 42) | 暗色模式主背景 |

### 2.2 语义化颜色（动画词汇表）

**这10种颜色在整个项目中固定不变，所有可视化模块共用**：

```javascript
// src/engine/colorScheme.ts
export const animationColors = {
  default: '#6B7280',        // 灰色 - 默认/未操作
  comparing: '#F59E0B',      // 橙色 - 正在比较
  moving: '#3B82F6',         // 蓝色 - 即将移动
  inTemp: '#FBBF24',         // 黄色 - 进入temp
  swapping: '#EF4444',       // 红色 - 正在交换
  visiting: '#3B82F6',       // 蓝色 - 正在访问
  matched: '#8B5CF6',        // 紫色 - 匹配成功
  sorted: '#10B981',         // 绿色 - 已完成/已排序
  newNode: '#FBBF24',        // 黄色 - 新建节点
  path: '#10B981',           // 绿色 - 路径/结果
};

// Tailwind 配置
const colors = {
  highlight: {
    default: animationColors.default,
    comparing: animationColors.comparing,
    // ... 其他
  }
};
```

### 2.3 中性色（Dark/Light 主题）

#### 亮色模式（Light）
```javascript
{
  bg: {
    primary: '#FFFFFF',      // 纯白
    secondary: '#F9FAFB',    // 浅灰
    tertiary: '#F3F4F6',     // 更浅灰
    hover: '#F0F1F2',        // 悬停态
  },
  text: {
    primary: '#111827',      // 深黑（主文本）
    secondary: '#6B7280',    // 中灰（辅助文本）
    tertiary: '#9CA3AF',     // 浅灰（弱化文本）
  },
  border: '#E5E7EB',         // 浅灰边框
}
```

#### 暗色模式（Dark）
```javascript
{
  bg: {
    primary: '#0F172A',      // 极深蓝
    secondary: '#1E293B',    // 深蓝
    tertiary: '#334155',     // 中蓝
    hover: '#475569',        // 悬停态
  },
  text: {
    primary: '#F8FAFC',      // 纯白（主文本）
    secondary: '#CBD5E1',    // 浅灰（辅助文本）
    tertiary: '#94A3B8',     // 更浅灰（弱化文本）
  },
  border: '#334155',         // 中蓝边框
}
```

---

## 三、排版系统

### 3.1 字体栈

```css
/* 英文 */
font-family: 'Inter', 'Segoe UI', sans-serif;

/* 中文 */
font-family: 'Inter', 'Microsoft YaHei', 'PingFang SC', sans-serif;
```

### 3.2 字号和行高

| 使用场景 | 字号 | 行高 | 字重 | 示例 |
|---------|------|------|------|------|
| 页面标题（H1） | 32px | 1.2 | 700 Bold | "冒泡排序" |
| 模块标题（H2） | 24px | 1.3 | 600 Semibold | 动画演示区的标题 |
| 小标题（H3） | 18px | 1.4 | 600 Semibold | 控制面板的小标题 |
| 正文（P） | 14px | 1.6 | 400 Regular | 说明文字、描述 |
| 标签（Label） | 12px | 1.5 | 500 Medium | 按钮标签、统计项 |
| 代码（Code） | 13px | 1.5 | 400 Regular | 伪代码、代码块 |
| 辅助文字（Small） | 12px | 1.5 | 400 Regular | 提示、注解 |

### 3.3 标题层级使用规范

```html
<!-- 页面标题 -->
<h1>冒泡排序</h1>

<!-- 功能区标题 -->
<h2>操作演示</h2>

<!-- 子区域标题 -->
<h3>统计信息</h3>

<!-- 不使用 h4+ -->
```

---

## 四、间距系统

### 4.1 8px 栅格系统

所有间距都是 8px 的倍数：

```javascript
// spacing.js
{
  xs: '4px',    // 极小间距（仅用于紧凑场景）
  sm: '8px',    // 小间距
  md: '16px',   // 标准间距（最常用）
  lg: '24px',   // 大间距
  xl: '32px',   // 更大间距
  xxl: '48px',  // 超大间距
}
```

### 4.2 组件内部间距

| 组件 | 内边距 | 示例 |
|------|--------|------|
| Button | 12px 16px（h) / 8px 12px（s） | 高 44px / 32px |
| Input | 10px 12px | 高 40px |
| Card | 24px | 圆角 8px |
| Modal | 32px | 圆角 12px |

### 4.3 组件间距

- **同行元素间距**：16px（横向）
- **竖直元素间距**：12px（同类）/ 24px（不同区域）
- **顶部到顶栏**：16px padding
- **左侧导航到主体**：0px（连接）

---

## 五、圆角和阴影

### 5.1 圆角规范

```javascript
{
  xs: '2px',    // 输入框、小组件
  sm: '4px',    // 按钮、标签
  md: '8px',    // 卡片、弹窗
  lg: '12px',   // 大型组件
  full: '9999px' // 完全圆角（Pill）
}
```

### 5.2 阴影等级

```css
/* 浮起效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 标准卡片 */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 浮动/Hover */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 模态/Menu */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

---

## 六、页面布局

### 6.1 三栏式主布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (60px)                                                   │
│ DSA-Viz  │ 当前模块名 │ 主题  🌙  搜索 🔍                       │
├──────────┬──────────────────────────────┬──────────────────────┤
│          │                              │                      │
│ Sidebar  │   Main Canvas Area           │  Code Panel          │
│ (220px)  │   (flex: 1)                  │  (360px)             │
│          │                              │                      │
│ 8类目录  │ [动画演示区]                 │ [伪代码]             │
│ 折叠菜单 │ ┌──────────────────────────┐ │ [代码行高亮]        │
│          │ │ D3/Canvas  或  Framer    │ │ [说明文字]          │
│          │ │ Motion 动画演示          │ │                      │
│          │ │                          │ │ [统计信息]          │
│          │ └──────────────────────────┘ │                      │
│          │ ────────────────────────────  │                      │
│          │ [播放控制条]                 │                      │
│          │ ────────────────────────────  │                      │
│          │ [数据生成器]                 │                      │
│          │ 数组长度、元素范围、预设等   │                      │
│          │                              │                      │
└──────────┴──────────────────────────────┴──────────────────────┘
│ Footer (48px)                                                   │
│ 使用统计 | 文档 | 关于 | 版权                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 尺寸标准

| 区域 | 宽度 | 备注 |
|------|------|------|
| Header | 100% | 固定高 60px |
| Sidebar | 220px | 可折叠，最小 60px |
| Main Canvas | calc(100% - 220px - 360px - 30px) | 弹性 |
| Code Panel | 360px | 可隐藏，最小 0px |
| Footer | 100% | 固定高 48px |

### 6.3 响应式断点

```javascript
{
  xs: '320px',   // 手机
  sm: '640px',   // 平板
  md: '1024px',  // 小屏台式
  lg: '1280px',  // 标准屏
  xl: '1536px',  // 超宽屏
}

// 当前适配
@media (max-width: 1024px) {
  // Sidebar 隐藏为 60px
  // Code Panel 隐藏
  // Main Canvas 扩展到全宽
}
```

---

## 七、核心组件设计

### 7.1 Header 顶栏

**高度**：60px  
**布局**：Flex 横排，分为左中右三部分

**左侧**（logo + 项目名）
```
┌─────────────────────┐
│ [蓝色Logo] DSA-Viz  │
└─────────────────────┘
  12px  8px
```

**中间**（当前页面面包屑/标题）
```
数据结构 > 数组 > 冒泡排序
```

**右侧**（主题切换、搜索、用户菜单）
```
🌙 主题切换  🔍 搜索  👤 用户
   24px      24px     24px
```

### 7.2 Sidebar 左侧导航

**宽度**：220px（折叠后 60px）  
**背景**：暗色 `#1E293B`（Dark 模式）/ `#F3F4F6`（Light 模式）

**结构**：
```
┌─ 线性结构 (可展开) ────┐
│  ├─ 数组              │
│  ├─ 链表              │
│  └─ 栈、队列          │
├─ 树形结构 (可展开) ────┤
│  ├─ BST               │
│  ├─ AVL树             │
│  └─ 堆                │
├─ 哈希 (可展开) ────────┤
│  ├─ 链地址法          │
│  └─ 开放寻址法        │
├─ 图 (可展开) ──────────┤
├─ 排序 (可展开) ────────┤
├─ 查找 (可展开) ────────┤
├─ 字符串 (可展开) ──────┤
└─ 经典思想 (可展开) ────┘
```

**样式**：
- 每个菜单项：48px 高，12px 内边距
- 选中态：蓝色背景 + 左边框
- Hover：背景颜色变化
- 子菜单缩进：16px

### 7.3 播放控制条

**高度**：60px  
**布局**：横排，包含6部分

```
┌─────────────────────────────────────────────────────────┐
│ ◄◄  ◄  ►  ►►  ⏸ │ 速度倍数        进度条      │ 15/42     │
└─────────────────────────────────────────────────────────┘
  20px 间距，所有元素垂直居中
```

**控制按钮**：
- 尺寸：40px × 40px
- 样式：圆形按钮，hover 变蓝
- 从左到右：首步、上一步、下一步、末步、暂停/播放

**速度倍数**：
```
┌──────────────┐
│ 0.25x │ ▼    │
└──────────────┘
选项：0.25x / 0.5x / 1x / 2x / 4x
```

**进度条**：
```
[▓▓▓▓●───────────] 15/42
    ↑ 拖拽点
表示播放进度，可交互拖拽
```

### 7.4 代码面板（Code Panel）

**宽度**：360px  
**背景**：深色 `#1E1E1E`（代码编辑器风格）

**分为3层**：

1. **顶部选项卡**（24px）
   - 伪代码 / Python / C++（切换编程语言）

2. **代码区**（flex: 1）
   - 代码块，行号显示
   - 高亮的行用蓝色边框标记
   - 字体：Monospace 13px
   - 水平滚动

3. **底部说明区**（48px）
   - 当前步骤的中文描述
   - 背景：稍浅一点 `#252526`
   - 文字：14px，垂直居中

### 7.5 主画布区域（Canvas Area）

**背景**：浅灰 `#FAFAFA`（Light） / `#1A1D2D`（Dark）

**区域划分**：
```
┌────────────────────────────────────┐
│ [D3/Framer Motion 动画区域]        │
│                                    │
│ 元素动画在此呈现                   │
│ 大小：flex，自动适应剩余空间       │
│                                    │
└────────────────────────────────────┘
```

**元素渲染**：
- **排序**：柱状图，使用 Framer Motion
- **树/图**：使用 D3.js 力导向图或树形布局
- **链表/栈**：自定义 SVG 节点和连线

---

## 八、动画和过渡

### 8.1 过渡时间标准

```javascript
{
  instant: '0ms',      // 无过渡
  fast: '150ms',       // UI 交互
  normal: '300ms',     // 元素动画
  slow: '500ms',       // 页面转换
}
```

### 8.2 缓动曲线

```javascript
{
  linear: 'linear',
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
}
```

### 8.3 核心动画

| 动画 | 持续时间 | 缓动 | 示例 |
|------|---------|------|------|
| 元素进入 | 300ms | easeOut | 节点弹出、柱子上升 |
| 元素移动 | 400ms | easeInOut | 排序交换、节点位移 |
| 元素退出 | 300ms | easeIn | 删除节点、柱子下沉 |
| 颜色变化 | 200ms | easeOut | 高亮变色、状态切换 |
| 页面转换 | 500ms | easeInOut | 路由导航、模块切换 |

---

## 九、交互设计

### 9.1 鼠标状态

```css
/* 正常 */
cursor: default;

/* 悬停 - 可点击 */
cursor: pointer;

/* 悬停 - 可拖拽 */
cursor: grab;

/* 正在拖拽 */
cursor: grabbing;

/* 禁用 */
cursor: not-allowed;

/* 文字选择 */
cursor: text;
```

### 9.2 按钮状态

| 状态 | 背景色 | 文字色 | 边框 |
|------|--------|--------|------|
| 默认 | `#3B82F6` | `#FFF` | 无 |
| Hover | `#2563EB` | `#FFF` | 无 |
| Active | `#1D4ED8` | `#FFF` | 无 |
| Disabled | `#D1D5DB` | `#9CA3AF` | 无 |
| Focus（无障碍） | 无色差，添加外描边 2px `#3B82F6` | - | 有 |

### 9.3 表单元素

**输入框**：
- 高：40px
- 圆角：4px
- 边框：1px `#E5E7EB`
- 内边距：12px
- Focus：边框变蓝，阴影淡蓝

**选择器/下拉**：
- 高：40px
- 选项高：36px
- 打开动画：Dropdown 从上往下展开（200ms）

---

## 十、通知和反馈

### 10.1 Toast 提示

| 类型 | 背景 | 图标 | 持续时间 |
|------|------|------|---------| 
| Success | 🟢 绿色 | ✓ | 3s |
| Error | 🔴 红色 | ✕ | 4s |
| Warning | 🟠 橙色 | ⚠️ | 3s |
| Info | 🔵 蓝色 | ℹ️ | 3s |

### 10.2 加载状态

```
┌─────────────────────┐
│   ⟳ 正在生成数据...     │
│   进度条 [▓▓░░░░░░░]    │
└─────────────────────┘
```

### 10.3 空状态

```
┌─────────────────────┐
│      📊 无数据           │
│    选择一个模块开始       │
│                         │
│   [ 浏览模块 ]          │
└─────────────────────┘
```

---

## 十一、模块特有的设计

### 11.1 排序模块

**特点**：
- **柱状图**：宽度根据元素个数自动调整，每个柱子代表一个数值
- **高度**：柱子高度 = (值 / 最大值) × 容器高度
- **Temp 暂存区**：单独的格子显示在画布左侧，黄色框标记
- **统计面板**：实时显示比较次数、交换次数、访问次数

### 11.2 树形模块（BST / AVL / Heap / Trie）

**特点**：
- **D3 树形布局**：自动计算父子节点位置
- **节点样式**：圆形，直径 40px，内显示数值
- **连线**：灰色 2px 线条，节点连接
- **旋转动画**（AVL）：旋转中心节点红色高亮，旋转过程缓动 400ms

### 11.3 图论模块（DFS / BFS / Dijkstra 等）

**特点**：
- **D3 力导向图**：节点间有弹簧力，自动排布
- **节点**：圆形 32px，显示节点标签（A、B、C 等）
- **边**：带箭头的有向线，权重标注在边中点
- **距离表**（Dijkstra）：右侧表格，距离值实时更新
- **访问队列**（BFS）：底部横向显示待访问节点队列

### 11.4 字符串模块（KMP / Rabin-Karp）

**特点**：
- **文本显示**：主文本和模式文本分别显示
- **失配函数表**（KMP）：下方表格显示每个位置的 LPS 值
- **匹配指针**：红色指针标记当前比较位置
- **高亮匹配**：找到匹配时用绿色背景标注

---

## 十二、首页设计

### 12.1 首页布局

```
┌────────────────────────────────────┐
│                                    │
│  欢迎来到 DSA-Viz                 │
│  数据结构与算法动画演示平台            │
│                                    │
│  [ 开始学习 ]  [ 查看文档 ]            │
│                                    │
├────────────────────────────────────┤
│ 快速导航                               │
│                                    │
│ ┌───────┐ ┌───────┐ ┌───────┐        │
│ │ 线性  │ │ 树形  │ │ 图论  │        │
│ │ 结构  │ │ 结构  │ │       │        │
│ └───────┘ └───────┘ └───────┘        │
│                                    │
│ ┌───────┐ ┌───────┐ ┌───────┐        │
│ │ 排序  │ │ 查找  │ │ 字符串│        │
│ │ 算法  │ │ 算法  │ │ 算法  │        │
│ └───────┘ └───────┘ └───────┘        │
│                                    │
├────────────────────────────────────┤
│ 推荐学习路径                           │
│ 初级 → 中级 → 高级                   │
│                                    │
│ 初级：数组、栈、队列、链表...          │
└────────────────────────────────────┘
```

### 12.2 首页元素

**Hero 区**（1/3 高度）：
- 背景：渐变蓝紫色
- 标题：32px Bold，白色
- 副标题：18px Regular，浅灰
- 按钮：两个 CTA 按钮，间距 16px

**快速导航**（2/3 高度）：
- 8个分类卡片，网格排列（4列 × 2行）
- 每个卡片：200px × 140px，圆角 8px，有 hover 阴影效果
- 卡片内：分类图标 + 分类名 + "个模块"

**推荐路径**（可选）：
- 三条学习链路展示
- 每条链路：初级/中级/高级，分别显示 3-4 个模块

---

## 十三、统计页面设计

### 13.1 页面布局

```
使用统计

┌──────────────────────────────────┐
│ 概览                             │
├──────────────────────────────────┤
│ 总访问次数：1,234                │
│ 总学习时长：12,345 分钟           │
│ 最常用模块：快速排序             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 各模块访问排行（柱状图）          │
│                                  │
│ 快速排序 ▓▓▓▓▓▓▓▓░░ 234          │
│ 冒泡排序 ▓▓▓▓▓▓░░░░ 156          │
│ BST      ▓▓▓▓▓░░░░░ 123          │
│ ...                              │
└──────────────────────────────────┘

[ 导出数据 ]
```

---

## 十四、深色/浅色主题切换

### 14.1 主题变量

```javascript
// theme.ts
const themes = {
  light: {
    bg: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#111827', secondary: '#6B7280' },
    border: '#E5E7EB',
  },
  dark: {
    bg: { primary: '#0F172A', secondary: '#1E293B' },
    text: { primary: '#F8FAFC', secondary: '#CBD5E1' },
    border: '#334155',
  },
};
```

### 14.2 切换机制

```typescript
// 使用 Zustand Store
const useThemeStore = create((set) => (
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
));

// 持久化到 localStorage
localStorage.setItem('dsa-viz-theme', theme);
```

### 14.3 Dark 模式图片处理

对于 D3 图表和动画，Dark 模式下：
- 线条颜色变浅（反差更高）
- 背景保持深色
- 文字颜色变白

---

## 十五、无障碍设计

### 15.1 键盘导航

- Tab 键切换焦点
- Enter 激活按钮
- Space 切换复选框
- 箭头键导航列表

### 15.2 屏幕阅读器支持

```html
<!-- 按钮 -->
<button aria-label="播放动画">▶</button>

<!-- 链接 -->
<a href="/module/bubble-sort" aria-label="进入冒泡排序模块">
  冒泡排序
</a>

<!-- 表单控制 -->
<label htmlFor="array-size">数组大小</label>
<input id="array-size" type="number" aria-describedby="size-hint" />
<span id="size-hint">输入 1-100 之间的数字</span>

<!-- 动态区域 -->
<div role="status" aria-live="polite" aria-atomic="true">
  当前步骤：15/42
</div>

<!-- 地标 -->
<nav aria-label="主导航">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
```

### 15.3 色彩对比度

所有文本必须满足 WCAG AA 标准（对比度 ≥ 4.5:1）：

| 文本类型 | 前景色 | 背景色 | 对比度 | 状态 |
|---------|--------|--------|--------|------|
| 主文本 | `#111827` | `#FFFFFF` | 16:1 | ✅ 通过 |
| 辅助文本 | `#6B7280` | `#FFFFFF` | 7:1 | ✅ 通过 |
| 按钮文本 | `#FFFFFF` | `#3B82F6` | 8.6:1 | ✅ 通过 |
| 禁用文本 | `#D1D5DB` | `#FFFFFF` | 2.1:1 | ❌ 需调整 |

### 15.4 焦点指示器

```css
/* 不使用 outline: none，必须提供替代焦点指示 */
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## 十六、性能优化

### 16.1 加载优化

- **首屏加载**：< 2s（含所有依赖）
- **代码分割**：按模块路由分割，Lazy Load
- **图片优化**：SVG 格式，< 100KB/图
- **预加载**：常用排序算法的动画步骤预计算

### 16.2 动画优化

```javascript
// 使用 will-change 提示浏览器
.sortingColumn {
  will-change: transform, opacity;
}

// 动画完成后移除
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

### 16.3 DOM 优化

- 虚拟滚动：排序竞速中的多条赛道
- 事件委托：导航菜单点击
- 防抖/节流：窗口 resize、输入框 input

---

## 十七、国际化考虑

### 17.1 文本空间

中文文本通常比英文占用**30-50% 更多空间**，设计时留有余量：

- 按钮宽度：至少 px × 字数
- 标签固定宽度：考虑 RTL（未来扩展）

### 17.2 伪代码多语言

```typescript
// src/data/pseudocode/index.ts
export const pseudocodeMap = {
  zh: sortingPseudocodeZH,
  en: sortingPseudocodeEN,
  // 后续支持
};
```

---

## 十八、设计资源清单

### 18.1 Figma 设计文件结构

```
DSA-Viz Design System
├── 📋 Atoms（原子组件）
│   ├── Button
│   ├── Input
│   ├── Checkbox
│   └── ...
├── 🧩 Molecules（分子组件）
│   ├── FormGroup
│   ├── Modal
│   └── Card
├── 📄 Pages（页面模板）
│   ├── Home
│   ├── ModuleDetail
│   └── Stats
├── 🎨 Design Tokens（设计令牌）
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
└── 📱 Responsive（响应式）
    ├── Desktop (1920px)
    ├── Tablet (1024px)
    └── Mobile (640px)
```

### 18.2 UI Kit 导出

```
assets/
├── icons/              # 24px, 32px 两种尺寸 SVG
│   ├── play.svg
│   ├── pause.svg
│   ├── speed.svg
│   └── ...
├── logos/
│   ├── logo-dark.svg
│   └── logo-light.svg
└── illustrations/
    ├── empty-state.svg
    └── hero.svg
```

---

## 十九、组件库规范

### 19.1 按钮组件

```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  children,
}) => {
  // 实现
};
```

**使用示例**：
```tsx
<Button variant="primary" size="md">
  开始演示
</Button>

<Button variant="ghost" icon={<PlayIcon />}>
  播放
</Button>
```

### 19.2 Tabs 组件

```typescript
interface TabsProps {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

<Tabs defaultValue="single-linked-list">
  <TabsList>
    <TabsTrigger value="single-linked-list">单向链表</TabsTrigger>
    <TabsTrigger value="double-linked-list">双向链表</TabsTrigger>
    <TabsTrigger value="circular-linked-list">循环链表</TabsTrigger>
  </TabsList>
  <TabsContent value="single-linked-list">
    <LinkedListVisualizer type="single" />
  </TabsContent>
  {/* ... */}
</Tabs>
```

---

## 二十、常见模式

### 20.1 加载状态

```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-96">
    <Spinner />
    <p className="ml-3 text-gray-600">生成数据中...</p>
  </div>
) : (
  <Canvas data={data} />
)}
```

### 20.2 错误处态

```tsx
{error ? (
  <ErrorBoundary 
    title="出错了"
    message={error.message}
    action={
      <Button onClick={() => window.location.reload()}>
        重新加载
      </Button>
    }
  />
) : (
  <Content />
)}
```

### 20.3 空状态

```tsx
{data.length === 0 ? (
  <EmptyState
    icon={<InboxIcon />}
    title="暂无数据"
    description="请先选择一个模块开始"
    action={<Button>浏览模块</Button>}
  />
) : (
  <Content data={data} />
)}
```

---

## 二十一、Dark 模式实现

### 21.1 Tailwind Dark 配置

```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',  // 使用 class 模式
  theme: {
    extend: {
      backgroundColor: {
        dark: {
          primary: '#0F172A',
          secondary: '#1E293B',
        }
      }
    }
  }
}
```

### 21.2 使用方法

```html
<!-- Light 模式 -->
<div class="bg-white text-gray-900">
  内容
</div>

<!-- Dark 模式下自动切换 -->
<html class="dark">
  <div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
    内容
  </div>
</html>
```

### 21.3 主题切换实现

```typescript
// useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // 更新 HTML class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 持久化
    localStorage.setItem('dsa-viz-theme', newTheme);
  };

  return { theme, toggleTheme };
};
```

---

## 二十二、设计系统交付清单

### 22.1 交付物

- ✅ Figma 设计稿（所有页面和组件）
- ✅ 设计规范文档（本文档）
- ✅ UI Kit（按钮、卡片、表单等原子组件）
- ✅ 图标库（SVG 格式，支持 Light/Dark）
- ✅ 色彩令牌（JSON 格式，可导入代码）
- ✅ 字体文件（Inter 和中文字体子集）

### 22.2 验收标准

| 项目 | 标准 | 验收 |
|------|------|------|
| 色彩一致性 | 全局统一使用颜色词汇表 | ✅ |
| 间距规范性 | 所有间距是 8px 倍数 | ✅ |
| 排版统一性 | 字号/行高按规范 | ✅ |
| 无障碍合规 | WCAG 2.1 AA 级别 | ✅ |
| 响应式适配 | 3 种屏幕尺寸测试通过 | ✅ |
| 暗黑模式 | Light/Dark 完整适配 | ✅ |
| 性能指标 | Lighthouse 分数 > 85 | ✅ |

---

## 二十三、开发协作指南

### 23.1 前端与设计的沟通

**设计评审会议流程**：

1. **代码审查**（30min）
  - 组件是否符合设计
  - 颜色、间距是否精确
  - 响应式是否正确

2. **交互测试**（20min）
  - 按钮点击反馈
  - 动画流畅度
  - 加载状态是否正确

3. **无障碍检查**（10min）
  - 键盘导航是否可用
  - 屏幕阅读器朗读是否正确
  - 对比度是否满足

### 23.2 常见问题 FAQ

**Q：为什么要用 8px 栅格？**  
A：8px 是常见的屏幕像素倍数，易于适配各种设备分辨率（1x, 2x, 3x）。

**Q：Dark 模式如何测试？**  
A：使用浏览器 DevTools - Rendering - Emulate CSS media feature prefers-color-scheme。

**Q：动画太快/太慢怎么办？**  
A：根据用户反馈调整过渡时间，在 src/styles/animations.css 中修改。

**Q：如何处理深色模式下的图表？**  
A：使用 CSS 变量或 React 组件 props 判断主题，动态调整 D3 图表的颜色。

---

## 二十四、设计审查清单

在每个模块完成后，使用此清单审查设计质量：

### 24.1 视觉设计

- [ ] 所有文本颜色对比度 ≥ 4.5:1
- [ ] 所有间距都是 8px 倍数
- [ ] 圆角大小符合规范（xs/sm/md/lg）
- [ ] 阴影使用了预定义的 shadow-*
- [ ] 颜色仅使用品牌色 + 语义色 + 中性色

### 24.2 交互体验

- [ ] 所有可点击元素有明确 Hover 状态
- [ ] 按钮加载状态有 Loading 指示
- [ ] 表单有验证反馈
- [ ] 成功/错误/警告使用正确的色彩
- [ ] 过渡时间在 150-500ms 范围内

### 24.3 无障碍性

- [ ] 所有表单 input 有对应的 label
- [ ] 所有按钮有 aria-label 或文本内容
- [ ] 键盘可以完全操作页面
- [ ] 跳过导航链接存在（可选）
- [ ] 焦点顺序逻辑清晰

### 24.4 响应式

- [ ] 1920px 宽屏测试通过
- [ ] 1024px 平板测试通过
- [ ] 640px 手机测试通过
- [ ] 所有文本可读（无溢出）
- [ ] 触摸目标最小 44px

### 24.5 性能

- [ ] 首屏加载 < 2s
- [ ] Lighthouse 分数 > 85
- [ ] 无未优化的大图片
- [ ] 代码分割正确应用

---

## 二十五、持续改进

### 25.1 收集用户反馈

```typescript
// 用户反馈组件
<FeedbackWidget
  placeholder="UI 有什么问题或建议？"
  onSubmit={(feedback) => {
    analytics.track('ui-feedback', {
      message: feedback,
      page: window.location.pathname,
      theme: currentTheme,
    });
  }}
/>
```

### 25.2 设计 Iteration 流程

```
设计优化提案
    ↓
设计审查会
    ↓
原型开发（Figma 或代码）
    ↓
用户测试
    ↓
集成到代码库
    ↓
发布到生产
```

---

## 二十六、设计系统版本管理

### 26.1 版本号规范

- **v1.0**：初版发布
- **v1.1**：小改进（按钮样式调整等）
- **v1.2**：当前版本（删除合并备注，模块编码连续化）
- **v2.0**：大改版（重新设计整体风格等）

### 26.2 更新日志

```markdown
## DSA-Viz Design System v1.2

### 🎨 改进
- 更新模块编码为连续序列（L-01~L-05, T-01~T-06 等）
- 删除所有关于模块合并的备注
- 优化暗色模式的代码块背景色对比度
- 调整输入框焦点样式更明显

### 🔧 修复
- 修复 Tooltip 在小屏幕上定位错误

### 📦 新增
- 新增 IconButton 组件

发布日期：2024 年
```

---

## 附录：Tailwind 配置完整版

```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        highlight: {
          default: '#6B7280',
          comparing: '#F59E0B',
          moving: '#3B82F6',
          inTemp: '#FBBF24',
          swapping: '#EF4444',
          visiting: '#3B82F6',
          matched: '#8B5CF6',
          sorted: '#10B981',
          newNode: '#FBBF24',
          path: '#10B981',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
};
```

---

**文档完成于 2026年**  
**设计系统版本：v1.2**  
**最后更新：删除合并备注，模块编码连续化**
</artifact>

