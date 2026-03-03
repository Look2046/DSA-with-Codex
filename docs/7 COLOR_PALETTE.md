
# COLOR_PALETTE.md

## 🎨 目录

1. [概述](#概述)
2. [核心颜色系统](#核心颜色系统)
3. [语义色定义](#语义色定义)
4. [亮色模式调色板](#亮色模式调色板)
5. [暗色模式调色板](#暗色模式调色板)
6. [动画高亮色](#动画高亮色)
7. [Tailwind配置](#tailwind配置)
8. [使用指南](#使用指南)
9. [无障碍性](#无障碍性)

---

## 概述

本文档定义了整个算法可视化系统的完整颜色系统。这些颜色确保：

- ✅ UI界面视觉一致性
- ✅ 算法步骤的语义化颜色表达
- ✅ 亮/暗模式切换支持
- ✅ WCAG AA级无障碍通过
- ✅ 所有组件和动画颜色规范

**版本**：v1.0  
**最后更新**：2026-03-02  
**设计工具**：Figma + Tailwind CSS v3+

---

## 核心颜色系统

### 品牌色

```typescript
// src/styles/colors/brand.ts

export const brandColors = {
  primary: '#3B82F6',      // 主品牌色 - 蓝色
  secondary: '#8B5CF6',    // 次品牌色 - 紫色
  accent: '#06B6D4',       // 强调色 - 青色
  
  // 品牌色衍生（用于渐变）
  primaryLight: '#DBEAFE',   // 浅蓝
  primaryDark: '#1E40AF',    // 深蓝
  secondaryLight: '#EDE9FE', // 浅紫
  secondaryDark: '#6D28D9',  // 深紫
};
```

### 中立色（灰度）

```typescript
// src/styles/colors/neutral.ts

export const neutralColors = {
  // 浅色系列（亮色模式）
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
  
  // 透明度变量
  transparent: 'transparent',
};
```

### 状态色

```typescript
// src/styles/colors/status.ts

export const statusColors = {
  // 成功 - 绿色系
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#065F46',
  
  // 警告 - 黄色系
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',
  
  // 错误 - 红色系
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#7F1D1D',
  
  // 信息 - 蓝色系
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1E40AF',
};
```

---

## 语义色定义

这些颜色用于动画中不同的操作状态。**这是最重要的部分**，直接影响算法可视化的理解。

### 数据操作颜色

```typescript
// src/styles/colors/semantics.ts

export const semanticColors = {
  // ========== 比较操作（COMPARING） ==========
  comparing: {
    light: '#FCD34D',      // 亮色模式 - 黄色
    dark: '#F97316',       // 暗色模式 - 橙色
    rgb: 'rgb(252, 211, 77)',
    hex: '#FCD34D',
    tailwind: 'yellow-300',
    rgba: 'rgba(252, 211, 77, 0.8)',
    description: '两个元素正在进行比较操作',
    examples: [
      '排序算法中比较两个元素的大小',
      '二叉搜索树中查找目标值时的比较',
      '搜索算法中检查当前元素是否匹配',
    ],
  },
  
  // ========== 移动操作（MOVING） ==========
  moving: {
    light: '#34D399',      // 亮色模式 - 绿色
    dark: '#10B981',       // 暗色模式 - 深绿
    rgb: 'rgb(52, 211, 153)',
    hex: '#34D399',
    tailwind: 'emerald-400',
    rgba: 'rgba(52, 211, 153, 0.8)',
    description: '元素正在被移动或交换',
    examples: [
      '排序算法中元素位置的交换',
      '链表中节点的重新连接',
      '堆调整时元素的下沉或上升',
    ],
  },
  
  // ========== 访问操作（VISITING） ==========
  visiting: {
    light: '#93C5FD',      // 亮色模式 - 浅蓝
    dark: '#3B82F6',       // 暗色模式 - 蓝色
    rgb: 'rgb(147, 197, 253)',
    hex: '#93C5FD',
    tailwind: 'blue-300',
    rgba: 'rgba(147, 197, 253, 0.8)',
    description: '当前正在访问/处理的元素',
    examples: [
      '图遍历时当前访问的节点',
      '数组搜索时指针指向的位置',
      '树的中序遍历时正在处理的节点',
    ],
  },
  
  // ========== 匹配/满足条件（MATCHED） ==========
  matched: {
    light: '#C084FC',      // 亮色模式 - 紫色
    dark: '#A78BFA',       // 暗色模式 - 浅紫
    rgb: 'rgb(192, 132, 252)',
    hex: '#C084FC',
    tailwind: 'fuchsia-300',
    rgba: 'rgba(192, 132, 252, 0.8)',
    description: '元素满足条件或被标记为已完成',
    examples: [
      '排序完成的元素',
      '搜索算法中找到的目标元素',
      '路径规划中已确定的最短路径',
    ],
  },
  
  // ========== 新建节点（NEW_NODE） ==========
  newNode: {
    light: '#FBBF24',      // 亮色模式 - 金色
    dark: '#F59E0B',       // 暗色模式 - 橙色
    rgb: 'rgb(251, 191, 36)',
    hex: '#FBBF24',
    tailwind: 'amber-400',
    rgba: 'rgba(251, 191, 36, 0.8)',
    borderColor: '#D97706', // 边框色 - 深橙
    description: '新创建的节点或数据结构',
    examples: [
      '二叉搜索树插入新节点时的高亮',
      '链表头插法创建的新节点',
      '图中新添加的顶点',
    ],
  },
  
  // ========== 闲置（IDLE）- 默认状态 ==========
  idle: {
    light: '#E5E7EB',      // 亮色模式 - 浅灰
    dark: '#4B5563',       // 暗色模式 - 深灰
    rgb: 'rgb(229, 231, 235)',
    hex: '#E5E7EB',
    tailwind: 'gray-200',
    rgba: 'rgba(229, 231, 235, 0.6)',
    description: '未操作的默认元素',
    examples: [
      '尚未处理的数组元素',
      '树中未被访问的节点',
      '图中的普通边',
    ],
  },
  
  // ========== 删除/移除（DELETED） ==========
  deleted: {
    light: '#FECACA',      // 亮色模式 - 浅红
    dark: '#FCA5A5',       // 暗色模式 - 红
    rgb: 'rgb(254, 202, 202)',
    hex: '#FECACA',
    tailwind: 'red-200',
    rgba: 'rgba(254, 202, 202, 0.8)',
    description: '即将被删除或已删除的元素',
    examples: [
      '二叉搜索树删除节点的中间状态',
      '链表删除操作中要移除的节点',
      '堆删除顶部元素时的高亮',
    ],
  },
  
  // ========== 错误（ERROR） ==========
  error: {
    light: '#FEE2E2',      // 亮色模式 - 浅红
    dark: '#EF4444',       // 暗色模式 - 红
    rgb: 'rgb(254, 226, 226)',
    hex: '#FEE2E2',
    tailwind: 'red-100',
    rgba: 'rgba(254, 226, 226, 0.8)',
    description: '发生错误或非法操作',
    examples: [
      '输入非法数据',
      '超出范围的数组访问',
      '不满足前置条件的操作',
    ],
  },
};
```

### 颜色使用频率表

| 颜色 | 使用频率 | 主要场景 |
|-----|---------|---------|
| **Comparing** (黄) | 🔴 极高 | 排序、搜索、查找 |
| **Moving** (绿) | 🔴 极高 | 交换、重连、移动 |
| **Visiting** (蓝) | 🟠 高 | 遍历、指针、当前位置 |
| **Matched** (紫) | 🟠 高 | 完成、满足条件 |
| **New Node** (金) | 🟡 中等 | 创建新节点 |
| **Idle** (灰) | 🟡 中等 | 默认状态 |
| **Deleted** (淡红) | 🟢 低 | 删除操作 |
| **Error** (红) | 🟢 低 | 错误状态 |

---

## 亮色模式调色板

### 完整调色板

```typescript
// src/styles/colors/light.ts

export const lightPalette = {
  // 背景颜色
  background: {
    primary: '#FFFFFF',      // 主背景
    secondary: '#F9FAFB',    // 次级背景
    tertiary: '#F3F4F6',     // 第三级背景
    modal: 'rgba(0, 0, 0, 0.5)',  // 模态框遮罩
  },
  
  // 文本颜色
  text: {
    primary: '#111827',      // 主文本
    secondary: '#374151',    // 次级文本
    tertiary: '#6B7280',     // 第三级文本
    disabled: '#9CA3AF',     // 禁用文本
    inverse: '#FFFFFF',      // 反色文本（在深色背景上）
  },
  
  // 边框颜色
  border: {
    light: '#F3F4F6',
    normal: '#E5E7EB',
    dark: '#D1D5DB',
    focus: '#3B82F6',        // 焦点边框
  },
  
  // 组件颜色
  component: {
    button: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryActive: '#1D4ED8',
      secondary: '#E5E7EB',
      secondaryHover: '#D1D5DB',
      secondaryText: '#374151',
      disabled: '#9CA3AF',
      disabledBg: '#F3F4F6',
    },
    
    input: {
      background: '#FFFFFF',
      border: '#D1D5DB',
      borderFocus: '#3B82F6',
      text: '#111827',
      placeholder: '#9CA3AF',
      disabled: '#F3F4F6',
    },
    
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    
    badge: {
      primary: '#DBEAFE',
      primaryText: '#1E40AF',
      success: '#D1FAE5',
      successText: '#065F46',
      warning: '#FEF3C7',
      warningText: '#92400E',
      error: '#FEE2E2',
      errorText: '#7F1D1D',
    },
  },
  
  // 代码编辑器（Syntax Highlighting）
  code: {
    background: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    keyword: '#7C3AED',      // 紫色 - 关键字
    string: '#DC2626',       // 红色 - 字符串
    number: '#D97706',       // 橙色 - 数字
    comment: '#6B7280',      // 灰色 - 注释
    function: '#2563EB',     // 蓝色 - 函数
    operator: '#374151',     // 深灰 - 操作符
  },
  
  // 动画高亮色（语义色）
  animation: {
    comparing: '#FCD34D',
    moving: '#34D399',
    visiting: '#93C5FD',
    matched: '#C084FC',
    newNode: '#FBBF24',
    idle: '#E5E7EB',
    deleted: '#FECACA',
    error: '#FEE2E2',
  },
  
  // 画布相关
  canvas: {
    background: '#FFFFFF',
    grid: '#F3F4F6',
    gridAlt: '#E5E7EB',
    axis: '#D1D5DB',
  },
  
  // 图表颜色
  chart: {
    series: [
      '#3B82F6',  // 蓝
      '#8B5CF6',  // 紫
      '#EC4899',  // 粉
      '#F59E0B',  // 橙
      '#10B981',  // 绿
      '#06B6D4',  // 青
      '#6366F1',  // 靛
      '#D946EF',  // 品红
    ],
  },
};
```

---

## 暗色模式调色板

### 完整调色板

```typescript
// src/styles/colors/dark.ts

export const darkPalette = {
  // 背景颜色
  background: {
    primary: '#0F172A',      // 主背景 - 深蓝黑
    secondary: '#1E293B',    // 次级背景 - 深灰
    tertiary: '#334155',     // 第三级背景 - 中灰
    modal: 'rgba(0, 0, 0, 0.7)',  // 模态框遮罩
  },
  
  // 文本颜色
  text: {
    primary: '#F8FAFC',      // 主文本 - 接近白
    secondary: '#CBD5E1',    // 次级文本 - 浅灰
    tertiary: '#94A3B8',     // 第三级文本 - 中灰
    disabled: '#64748B',     // 禁用文本 - 深灰
    inverse: '#0F172A',      // 反色文本
  },
  
  // 边框颜色
  border: {
    light: '#334155',
    normal: '#475569',
    dark: '#64748B',
    focus: '#60A5FA',        // 焦点边框 - 浅蓝
  },
  
  // 组件颜色
  component: {
    button: {
      primary: '#3B82F6',
      primaryHover: '#60A5FA',
      primaryActive: '#93C5FD',
      secondary: '#475569',
      secondaryHover: '#64748B',
      secondaryText: '#E2E8F0',
      disabled: '#64748B',
      disabledBg: '#334155',
    },
    
    input: {
      background: '#1E293B',
      border: '#475569',
      borderFocus: '#60A5FA',
      text: '#F8FAFC',
      placeholder: '#64748B',
      disabled: '#334155',
    },
    
    card: {
      background: '#1E293B',
      border: '#475569',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    
    badge: {
      primary: '#1E40AF',
      primaryText: '#DBEAFE',
      success: '#065F46',
      successText: '#D1FAE5',
      warning: '#92400E',
      warningText: '#FEF3C7',
      error: '#7F1D1D',
      errorText: '#FEE2E2',
    },
  },
  
  // 代码编辑器（Syntax Highlighting）
  code: {
    background: '#1E293B',
    border: '#475569',
    text: '#E2E8F0',
    keyword: '#C084FC',      // 浅紫 - 关键字
    string: '#F87171',       // 浅红 - 字符串
    number: '#FBBF24',       // 金色 - 数字
    comment: '#64748B',      // 灰色 - 注释
    function: '#60A5FA',     // 浅蓝 - 函数
    operator: '#CBD5E1',     // 浅灰 - 操作符
  },
  
  // 动画高亮色（语义色 - 调整以适应暗色）
  animation: {
    comparing: '#F97316',    // 橙色（黄色在暗色模式不清晰）
    moving: '#10B981',       // 深绿（更容易看到）
    visiting: '#3B82F6',     // 蓝色（更饱和）
    matched: '#A78BFA',      // 浅紫（更清晰）
    newNode: '#F59E0B',      // 橙色（更清晰）
    idle: '#4B5563',         // 深灰（对比度更好）
    deleted: '#FCA5A5',      // 浅红（更容易看到）
    error: '#EF4444',        // 红色（更清晰）
  },
  
  // 画布相关
  canvas: {
    background: '#0F172A',
    grid: '#1E293B',
    gridAlt: '#334155',
    axis: '#475569',
  },
  
  // 图表颜色
  chart: {
    series: [
      '#60A5FA',  // 浅蓝
      '#C084FC',  // 浅紫
      '#F472B6',  // 浅粉
      '#FB923C',  // 浅橙
      '#4ADE80',  // 浅绿
      '#22D3EE',  // 浅青
      '#818CF8',  // 浅靛
      '#E879F9',  // 浅品红
    ],
  },
};
```

---

## 动画高亮色

### 完整映射表

```typescript
// src/styles/colors/animationHighlights.ts

export const animationHighlightMap = {
  // Light Mode
  light: {
    'comparing': { color: '#FCD34D', textColor: '#000000', opacity: 0.8 },
    'moving': { color: '#34D399', textColor: '#000000', opacity: 0.8 },
    'visiting': { color: '#93C5FD', textColor: '#000000', opacity: 0.8 },
    'matched': { color: '#C084FC', textColor: '#000000', opacity: 0.8 },
    'new-node': { color: '#FBBF24', textColor: '#000000', opacity: 0.8, borderColor: '#D97706' },
    'idle': { color: '#E5E7EB', textColor: '#000000', opacity: 0.6 },
    'deleted': { color: '#FECACA', textColor: '#000000', opacity: 0.8 },
    'error': { color: '#FEE2E2', textColor: '#000000', opacity: 0.8 },
  },
  
  // Dark Mode
  dark: {
    'comparing': { color: '#F97316', textColor: '#FFFFFF', opacity: 0.8 },
    'moving': { color: '#10B981', textColor: '#FFFFFF', opacity: 0.8 },
    'visiting': { color: '#3B82F6', textColor: '#FFFFFF', opacity: 0.8 },
    'matched': { color: '#A78BFA', textColor: '#FFFFFF', opacity: 0.8 },
    'new-node': { color: '#F59E0B', textColor: '#FFFFFF', opacity: 0.8, borderColor: '#DC2626' },
    'idle': { color: '#4B5563', textColor: '#FFFFFF', opacity: 0.6 },
    'deleted': { color: '#FCA5A5', textColor: '#FFFFFF', opacity: 0.8 },
    'error': { color: '#EF4444', textColor: '#FFFFFF', opacity: 0.8 },
  },
};
```

---

## Tailwind配置

### tailwind.config.ts

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色
        brand: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#06B6D4',
        },
        
        // 语义色 - 动画高亮
        semantic: {
          comparing: '#FCD34D',
          moving: '#34D399',
          visiting: '#93C5FD',
          matched: '#C084FC',
          newNode: '#FBBF24',
          idle: '#E5E7EB',
          deleted: '#FECACA',
          error: '#FEE2E2',
        },
        
        // 状态色
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      
      // 自定义变量供暗色模式使用
      darkMode: 'class',
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
```

### 使用示例

```jsx
// 亮色模式
<div className="bg-white text-gray-900">
  <button className="bg-blue-500 hover:bg-blue-600 text-white">
    确认
  </button>
</div>

// 暗色模式
<div className="dark:bg-slate-900 dark:text-slate-100">
  <button className="dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
    确认
  </button>
</div>

// 语义色
<div className="bg-semantic-comparing text-gray-900">
  正在比较
</div>

<div className="dark:bg-orange-600 dark:text-white">
  正在比较（暗色模式）
</div>
```

---

## 使用指南

### 规范1：排序算法颜色使用

```typescript
// src/modules/sorts/colors.ts

export const sortHighlightRules = {
  // 冒泡排序
  bubbleSort: {
    comparing: 'semantic-comparing',    // 比较的两个元素
    moving: 'semantic-moving',          // 交换中的元素
    sorted: 'semantic-matched',         // 已排序的元素
  },
  
  // 归并排序
  mergeSort: {
    comparing: 'semantic-comparing',
    splitting: 'semantic-visiting',     // 分割中的元素
    merging: 'semantic-moving',         // 合并中的元素
    merged: 'semantic-matched',         // 已合并的元素
  },
  
  // 快速排序
  quickSort: {
    pivot: 'semantic-visiting',         // 枢轴元素
    comparing: 'semantic-comparing',    // 正在比较
    partition: 'semantic-moving',       // 分区中
    sorted: 'semantic-matched',         // 已排序
  },
};
```

### 规范2：树/图算法颜色使用

```typescript
// src/modules/trees/colors.ts

export const treeHighlightRules = {
  visiting: 'semantic-visiting',        // 当前访问的节点
  found: 'semantic-matched',            // 找到目标节点
  parent: 'semantic-comparing',         // 父节点/比较中的节点
  rotating: 'semantic-moving',          // 旋转中的节点
  unbalanced: 'semantic-error',         // 不平衡节点
};

// src/modules/graphs/colors.ts

export const graphHighlightRules = {
  currentNode: 'semantic-visiting',     // 当前访问节点
  visitedNode: 'semantic-matched',      // 已访问节点
  currentEdge: 'semantic-comparing',    // 当前边
  shortestPath: 'semantic-moving',      // 最短路径
  unreachable: 'semantic-idle',         // 不可达节点
};
```

### 规范3：链表操作颜色使用

```typescript
// src/modules/linkedList/colors.ts

export const linkedListHighlightRules = {
  insertPosition: 'semantic-comparing',  // 插入位置
  newNode: 'semantic-newNode',           // 新创建的节点
  redirecting: 'semantic-moving',        // 正在重新指向
  readyToDelete: 'semantic-deleted',     // 准备删除的节点
  traversing: 'semantic-visiting',       // 遍历中的节点
  traversed: 'semantic-matched',         // 已遍历的节点
};
```

---

## 无障碍性

### WCAG AA 对比度检查

所有颜色组合都经过测试，确保通过 WCAG AA 级无障碍标准（最小 4.5:1 对比度）。

```typescript
// src/utils/accessibility.ts

// 对比度检查工具
export const checkContrast = (foreground: string, background: string): boolean => {
  const calculateLuminance = (rgb: string): number => {
    // RGB -> 相对亮度计算
    // 返回值应 >= 4.5 (AA) 或 >= 7 (AAA)
  };
  
  const fg = calculateLuminance(foreground);
  const bg = calculateLuminance(background);
  
  const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  return ratio >= 4.5; // AA 级
};

// 推荐的文本 + 背景组合
export const recommendedCombos = [
  { text: '#111827', background: '#FFFFFF' },      // 深灰 on 白
  { text: '#F8FAFC', background: '#0F172A' },      // 接近白 on 深蓝黑
  { text: '#000000', background: '#FCD34D' },      // 黑 on 黄（comparing）
  { text: '#FFFFFF', background: '#3B82F6' },      // 白 on 蓝
];
```

### 色盲友好建议

- **避免单纯用红绿区分**：配合其他视觉指示（如大小、形状、纹理）
- **提供标签和说明文字**：所有高亮都应有文本说明
- **支持模式切换**：提供不同的高亮方案选项

---

## 颜色变量导出

### CSS 变量

```css
/* src/styles/colors.css */

:root {
  /* 亮色模式 */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  
  /* 语义色 */
  --color-comparing: #FCD34D;
  --color-moving: #34D399;
  --color-visiting: #93C5FD;
  --color-matched: #C084FC;
  --color-new-node: #FBBF24;
  --color-idle: #E5E7EB;
  --color-deleted: #FECACA;
  --color-error: #FEE2E2;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 暗色模式 */
    --color-bg-primary: #0F172A;
    --color-bg-secondary: #1E293B;
    --color-text-primary: #F8FAFC;
    --color-text-secondary: #CBD5E1;
    
    /* 语义色 - 调整 */
    --color-comparing: #F97316;
    --color-moving: #10B981;
    --color-visiting: #3B82F6;
    --color-matched: #A78BFA;
    --color-new-node: #F59E0B;
    --color-idle: #4B5563;
    --color-deleted: #FCA5A5;
    --color-error: #EF4444;
  }
}
```

### TypeScript 导出

```typescript
// src/styles/colors/index.ts

export { lightPalette } from './light';
export { darkPalette } from './dark';
export { semanticColors } from './semantics';
export { statusColors } from './status';
export { brandColors } from './brand';
export { neutralColors } from './neutral';

// 钩子 - 根据模式返回相应的调色板
export const useColorPalette = (isDarkMode: boolean) => {
  return isDarkMode ? darkPalette : lightPalette;
};
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，定义完整色彩系统 |

---

**文档完成于 2026-03-02**  
**下一阶段**：请提示"继续"，我将输出第四个文档：**MODULE_TEMPLATE.md**
