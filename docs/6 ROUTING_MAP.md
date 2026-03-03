
# ROUTING_MAP.md

## 📍 目录

1. [概述](#概述)
2. [核心路由](#核心路由)
3. [线性结构模块](#线性结构模块)
4. [树结构模块](#树结构模块)
5. [图结构模块](#图结构模块)
6. [排序算法模块](#排序算法模块)
7. [查找算法模块](#查找算法模块)
8. [字符串算法模块](#字符串算法模块)
9. [其他模块](#其他模块)
10. [路由嵌套结构](#路由嵌套结构)
11. [动态路由参数](#动态路由参数)
12. [错误处理](#错误处理)

---

## 概述

本文档定义了整个算法可视化系统的所有路由路径。这些路由确保：

- ✅ 页面导航结构清晰
- ✅ 42个核心模块都有唯一的路由标识
- ✅ 用户可以直接通过URL访问任意模块
- ✅ 浏览器后退/前进正常工作
- ✅ 书签和分享功能正常

**版本**：v1.0  
**最后更新**：2026-03-02  
**前端框架**：React Router v6+

---

## 核心路由

### 首页与导航

```typescript
const coreRoutes = {
  root: '/',                        // 首页 - 模块选择
  home: '/',                        // 同首页
  notFound: '*',                    // 404页面
  about: '/about',                  // 关于（可选）
};
```

**路由详情表**：

| 路径 | 名称 | 组件 | 功能 |
|------|------|------|------|
| `/` | 首页 | HomePage | 显示所有42个核心模块的卡片网格，支持分类过滤、搜索、难度筛选 |
| `/about` | 关于 | AboutPage | 项目简介、技术栈、贡献者等 |
| `*` | 404 | NotFoundPage | 404错误页面 |

---

## 线性结构模块

### 概述

线性结构包括数组、链表等。共5个模块分为2个物理页面。

```typescript
const linearRoutes = {
  // 数组家族：L-01 + L-02
  arrayFamily: '/modules/array-family',
  
  // 链表家族：L-03 + L-04 + L-05（合并为一个物理页面）
  linkedListFamily: '/modules/linked-list',
  
  // 栈：L-06（独立页面）
  stack: '/modules/stack',
  
  // 队列：L-07 + L-08（合并为一个物理页面）
  queue: '/modules/queue',
};
```

### 详细路由表

| ID | 路径 | 名称 | 物理页面 | Tab | 难度 | 前置知识 |
|:---|------|------|---------|-----|------|---------|
| L-01 | `/modules/array-family?tab=array` | 数组 | 数组家族 | 1/2 | 1⭐ | 无 |
| L-02 | `/modules/array-family?tab=dynamic-array` | 动态数组 | 数组家族 | 2/2 | 2⭐ | 数组 |
| L-03 | `/modules/linked-list?tab=singly` | 单向链表 | 链表家族 | 1/3 | 2⭐ | 数组、指针 |
| L-04 | `/modules/linked-list?tab=doubly` | 双向链表 | 链表家族 | 2/3 | 2⭐ | 单向链表 |
| L-05 | `/modules/linked-list?tab=circular` | 循环链表 | 链表家族 | 3/3 | 3⭐ | 单向链表 |
| L-06 | `/modules/stack` | 栈 | 栈 | 无 | 1⭐ | 数组或链表 |
| L-07 | `/modules/queue?tab=simple` | 普通队列 | 队列 | 1/3 | 1⭐ | 栈、数组 |
| L-08 | `/modules/queue?tab=circular` | 循环队列 | 队列 | 2/3 | 2⭐ | 普通队列 |
| L-09 | `/modules/queue?tab=deque` | 双端队列 | 队列 | 3/3 | 2⭐ | 普通队列 |

### 合并页面路由

```typescript
// 数组家族 - /modules/array-family
interface ArrayFamilyParams {
  tab?: 'array' | 'dynamic-array';  // 默认：'array'
}

// 链表家族 - /modules/linked-list
interface LinkedListParams {
  tab?: 'singly' | 'doubly' | 'circular';  // 默认：'singly'
}

// 队列家族 - /modules/queue
interface QueueParams {
  tab?: 'simple' | 'circular' | 'deque';  // 默认：'simple'
}
```

---

## 树结构模块

### 概述

树结构包括二叉搜索树、AVL树等。共8个模块。

```typescript
const treeRoutes = {
  binaryTree: '/modules/binary-tree',
  binarySearchTree: '/modules/binary-search-tree',
  avlTree: '/modules/avl-tree',
  redBlackTree: '/modules/red-black-tree',
  heapAndPriority: '/modules/heap',
  trieTree: '/modules/trie',
  segmentTree: '/modules/segment-tree',           // 附加内容
  bTree: '/modules/b-tree',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 前置知识 |
|:---|------|------|------|---------|
| T-01 | `/modules/binary-tree` | 二叉树基础 | 2⭐ | 树的概念 |
| T-02 | `/modules/binary-search-tree` | 二叉搜索树 | 3⭐ | 二叉树 |
| T-03 | `/modules/avl-tree` | AVL树 | 4⭐ | 二叉搜索树 |
| T-04 | `/modules/red-black-tree` | 红黑树性质展示 | 4⭐ | AVL树 |
| T-05 | `/modules/heap` | 堆与优先队列 | 3⭐ | 完全二叉树 |
| T-06 | `/modules/trie` | 字典树（Trie） | 3⭐ | 树、字符串 |
| T-07 | `/modules/segment-tree` | 线段树（附加） | 4⭐ | 二叉树、递归 |
| T-08 | `/modules/b-tree` | B树 | 4⭐ | 二叉搜索树 |

---

## 图结构模块

### 概述

图结构包括DFS、BFS、最短路径等。共6个模块。

```typescript
const graphRoutes = {
  graphRepresentation: '/modules/graph',
  bfs: '/modules/bfs',
  dfs: '/modules/dfs',
  dijkstra: '/modules/dijkstra',
  bellmanFord: '/modules/bellman-ford',
  kruskal: '/modules/kruskal',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 前置知识 |
|:---|------|------|------|---------|
| G-01 | `/modules/graph` | 图的两种表示 | 2⭐ | 图的基本概念 |
| G-02 | `/modules/bfs` | 宽度优先搜索 | 2⭐ | 图、队列 |
| G-03 | `/modules/dfs` | 深度优先搜索 | 2⭐ | 图、栈 |
| G-04 | `/modules/dijkstra` | Dijkstra最短路径 | 4⭐ | 图、优先队列 |
| G-05 | `/modules/bellman-ford` | Bellman-Ford算法 | 4⭐ | 图、DFS |
| G-06 | `/modules/kruskal` | Kruskal最小生成树 | 3⭐ | 图、并查集 |

---

## 排序算法模块

### 概述

排序算法是学生最常学的内容。共10个模块。

```typescript
const sortRoutes = {
  bubbleSort: '/modules/bubble-sort',
  selectionSort: '/modules/selection-sort',
  insertionSort: '/modules/insertion-sort',
  shellSort: '/modules/shell-sort',
  mergeSort: '/modules/merge-sort',
  quickSort: '/modules/quick-sort',
  heapSort: '/modules/heap-sort',
  countingSort: '/modules/counting-sort',
  radixSort: '/modules/radix-sort',
  bucketSort: '/modules/bucket-sort',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 稳定性 | 时间复杂度 |
|:---|------|------|------|--------|-----------|
| S-01 | `/modules/bubble-sort` | 冒泡排序 | 1⭐ | 稳定 | O(n²) |
| S-02 | `/modules/selection-sort` | 选择排序 | 1⭐ | 不稳定 | O(n²) |
| S-03 | `/modules/insertion-sort` | 插入排序 | 2⭐ | 稳定 | O(n²) |
| S-04 | `/modules/shell-sort` | 希尔排序 | 3⭐ | 不稳定 | O(n^1.3) |
| S-05 | `/modules/merge-sort` | 归并排序 | 3⭐ | 稳定 | O(n log n) |
| S-06 | `/modules/quick-sort` | 快速排序 | 3⭐ | 不稳定 | O(n log n) |
| S-07 | `/modules/heap-sort` | 堆排序 | 3⭐ | 不稳定 | O(n log n) |
| S-08 | `/modules/counting-sort` | 计数排序 | 2⭐ | 稳定 | O(n+k) |
| S-09 | `/modules/radix-sort` | 基数排序 | 3⭐ | 稳定 | O(d·n) |
| S-10 | `/modules/bucket-sort` | 桶排序 | 3⭐ | 稳定 | O(n+k) |

---

## 查找算法模块

### 概述

查找算法包括线性查找、二分查找等。共3个模块。

```typescript
const searchRoutes = {
  linearSearch: '/modules/linear-search',
  binarySearch: '/modules/binary-search',
  hashTable: '/modules/hash-table',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 前置知识 |
|:---|------|------|------|---------|
| SR-01 | `/modules/linear-search` | 顺序查找 | 1⭐ | 数组 |
| SR-02 | `/modules/binary-search` | 二分查找 | 2⭐ | 有序数组 |
| SR-03 | `/modules/hash-table` | 哈希表 | 3⭐ | 哈希函数 |

---

## 字符串算法模块

### 概述

字符串算法包括模式匹配等。共4个模块。

```typescript
const stringRoutes = {
  stringMatching: '/modules/string-matching',
  kmp: '/modules/kmp',
  ac: '/modules/aho-corasick',
  manacher: '/modules/manacher',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 前置知识 |
|:---|------|------|------|---------|
| ST-01 | `/modules/string-matching` | 字符串基础匹配 | 2⭐ | 字符串、循环 |
| ST-02 | `/modules/kmp` | KMP算法 | 4⭐ | 字符串匹配 |
| ST-03 | `/modules/aho-corasick` | AC自动机 | 5⭐ | KMP、Trie |
| ST-04 | `/modules/manacher` | 回文检测（Manacher） | 4⭐ | 字符串 |

---

## 其他模块

### 概述

其他算法包括动态规划、贪心算法等。共3个模块。

```typescript
const otherRoutes = {
  dynamicProgramming: '/modules/dynamic-programming',
  greedyAlgorithm: '/modules/greedy-algorithm',
  backtracking: '/modules/backtracking',
};
```

### 详细路由表

| ID | 路径 | 名称 | 难度 | 前置知识 |
|:---|------|------|------|---------|
| O-01 | `/modules/dynamic-programming` | 动态规划基础 | 4⭐ | 递归、分治 |
| O-02 | `/modules/greedy-algorithm` | 贪心算法 | 3⭐ | 数据结构基础 |
| O-03 | `/modules/backtracking` | 回溯算法 | 3⭐ | 递归、树 |

---

## 路由嵌套结构

### React Router 配置示例

```typescript
// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import HomePage from '@/pages/HomePage';
import ModuleLayout from '@/layout/ModuleLayout';
import LinkedListPage from '@/pages/modules/LinkedListPage';
import StackPage from '@/pages/modules/StackPage';
import ArrayFamilyPage from '@/pages/modules/ArrayFamilyPage';
// ... 其他模块导入

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/modules',
    element: <ModuleLayout />,  // 包含导航栏、侧边栏等公共布局
    children: [
      // 线性结构
      {
        path: 'array-family',
        element: <ArrayFamilyPage />,
      },
      {
        path: 'linked-list',
        element: <LinkedListPage />,
      },
      {
        path: 'stack',
        element: <StackPage />,
      },
      {
        path: 'queue',
        element: <QueuePage />,
      },
      
      // 树结构
      {
        path: 'binary-tree',
        element: <BinaryTreePage />,
      },
      {
        path: 'binary-search-tree',
        element: <BSTPage />,
      },
      // ... 其他模块
      
      // 排序算法
      {
        path: 'bubble-sort',
        element: <BubbleSortPage />,
      },
      {
        path: 'selection-sort',
        element: <SelectionSortPage />,
      },
      // ... 其他排序算法
      
      // 查找算法
      {
        path: 'linear-search',
        element: <LinearSearchPage />,
      },
      // ... 其他查找算法
      
      // 字符串算法
      {
        path: 'string-matching',
        element: <StringMatchingPage />,
      },
      // ... 其他字符串算法
      
      // 其他算法
      {
        path: 'dynamic-programming',
        element: <DPPage />,
      },
      // ... 其他算法
    ],
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
```

---

## 动态路由参数

### Query Parameters

所有模块页面都支持以下查询参数：

```typescript
interface ModuleQueryParams {
  // 标签页选择（有Tab的模块）
  tab?: string;
  
  // 播放速度：0.5, 1, 1.5, 2, 4
  speed?: string;
  
  // 数据大小：small (10), medium (50), large (100)
  dataSize?: 'small' | 'medium' | 'large';
  
  // 是否自动播放
  autoPlay?: boolean;
  
  // 初始数据（JSON字符串）
  initialData?: string;
  
  // 操作类型（针对某些模块）
  operation?: string;
}
```

### 使用示例

```
/modules/linked-list?tab=doubly&speed=2&autoPlay=true
/modules/bubble-sort?dataSize=large&operation=swap
/modules/binary-tree?initialData=[1,2,3,4,5]
```

---

## 错误处理

### 404 路由

```typescript
// 404页面
interface NotFoundPageProps {
  previousPath?: string;  // 上一个页面的路径
}

// 使用
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <p>无法找到路径：{location.pathname}</p>
      <button onClick={() => navigate(-1)}>返回上一页</button>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
};
```

### 路由验证

```typescript
// src/utils/routeValidator.ts

export const isValidModuleRoute = (route: string): boolean => {
  const validRoutes = [
    '/modules/array-family',
    '/modules/linked-list',
    '/modules/stack',
    '/modules/queue',
    '/modules/binary-tree',
    '/modules/binary-search-tree',
    // ... 完整列表
  ];
  return validRoutes.includes(route);
};

export const isValidTabParam = (modulePath: string, tab: string): boolean => {
  const validTabs: Record<string, string[]> = {
    '/modules/array-family': ['array', 'dynamic-array'],
    '/modules/linked-list': ['singly', 'doubly', 'circular'],
    '/modules/queue': ['simple', 'circular', 'deque'],
  };
  
  return validTabs[modulePath]?.includes(tab) ?? false;
};
```

---

## 路由导航工具函数

### 导航辅助函数

```typescript
// src/utils/navigation.ts

export const navigateToModule = (
  navigate: NavigateFunction,
  moduleId: string,
  tabName?: string,
  queryParams?: Record<string, any>
) => {
  const moduleRouteMap: Record<string, string> = {
    'L-01': '/modules/array-family',
    'L-02': '/modules/array-family',
    'L-03': '/modules/linked-list',
    'L-04': '/modules/linked-list',
    'L-05': '/modules/linked-list',
    'L-06': '/modules/stack',
    'L-07': '/modules/queue',
    'L-08': '/modules/queue',
    'L-09': '/modules/queue',
    'T-01': '/modules/binary-tree',
    'T-02': '/modules/binary-search-tree',
    // ... 完整映射
  };
  
  const basePath = moduleRouteMap[moduleId];
  const query = new URLSearchParams(queryParams || {});
  
  if (tabName) {
    query.set('tab', tabName);
  }
  
  const path = query.toString() ? `${basePath}?${query}` : basePath;
  navigate(path);
};

export const getModuleByRoute = (route: string): ModuleMetadata | null => {
  // 根据路由查找模块元数据
  const routeToModuleMap = {
    '/modules/array-family': ['L-01', 'L-02'],
    '/modules/linked-list': ['L-03'],
    '/modules/stack': ['L-04'],
    '/modules/queue': ['L-05'],
    // ... 完整映射
  };
  
  return moduleRegistry.findByIds(routeToModuleMap[route])?.[0] || null;
};
```

---

## 总结表

### 完整模块路由计数

| 分类 | 物理页面数 | 逻辑子场景数（含tab/变体） | 示例 |
|------|----------|-----------------------------|------|
| 线性结构 | 4 | 9 | `/modules/linked-list` 包含单向/双向/循环链表 |
| 树结构 | 8 | 8 | `/modules/binary-tree` 对应 T-01 |
| 图结构 | 6 | 6 | `/modules/bfs` 对应 G-02 |
| 排序算法 | 10 | 10 | `/modules/bubble-sort` 对应 S-01 |
| 查找算法 | 3 | 3 | `/modules/linear-search` 对应 SR-01 |
| 字符串算法 | 4 | 4 | `/modules/kmp` 对应 ST-01 |
| 其他算法 | 3 | 3 | `/modules/dynamic-programming` 对应 O-01 |
| **总计** | **38** | **43** | 含首页、404 与可选 about 路由 |

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.1 | 2026-03-03 | 统一为42个核心模块口径，修复示例ID映射冲突 |
| v1.0 | 2026-03-02 | 初始版本，定义路由结构 |

---

**文档完成于 2026-03-02**  
**下一阶段**：请提示"继续"，我将输出第三个文档：**COLOR_PALETTE.md**
