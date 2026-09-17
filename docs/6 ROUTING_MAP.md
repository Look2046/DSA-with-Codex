# ROUTING_MAP.md

## 概述

本文档定义 DSA 可视化项目的路由基线，统一为：
- 42 个核心可视化模块
- 2 个附属页面（排序总览、关于页）
- 基础系统页面（首页、模块导航页、404）

**版本**：v1.2  
**最后更新**：2026-03-03  
**前端框架**：React Router v6+

---

## 全局路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 项目首页 |
| `/modules` | ModulesPage | 模块导航页（分类、搜索、筛选） |
| `/modules/sorting` | SortingOverviewPage | 排序算法复杂度总览（附属页面） |
| `/about` | AboutPage | 项目介绍（附属页面） |
| `*` | NotFoundPage | 404 页面 |

---

## 核心模块路由（42）

### 线性结构（5）

| ID | 名称 | 路径 |
|----|------|------|
| L-01 | 数组 | `/modules/array` |
| L-02 | 动态数组 | `/modules/dynamic-array` |
| L-03 | 链表 | `/modules/linked-list` |
| L-04 | 栈 | `/modules/stack` |
| L-05 | 队列 | `/modules/queue` |

### 树结构（6）

| ID | 名称 | 路径 |
|----|------|------|
| T-01 | 二叉树遍历 | `/modules/binary-tree` |
| T-02 | 二叉搜索树（BST） | `/modules/bst` |
| T-03 | AVL 树 | `/modules/avl-tree` |
| T-04 | 堆 | `/modules/heap` |
| T-05 | B 树 / B+ 树 | `/modules/btree` |
| T-06 | 字典树（Trie） | `/modules/trie` |

### 哈希结构（2）

| ID | 名称 | 路径 |
|----|------|------|
| H-01 | 哈希表（链地址法） | `/modules/hash-chaining` |
| H-02 | 哈希表（开放寻址法） | `/modules/hash-open-addressing` |

### 图算法（9）

| ID | 名称 | 路径 |
|----|------|------|
| G-01 | 图的表示 | `/modules/graph-representation` |
| G-02 | DFS | `/modules/dfs` |
| G-03 | BFS | `/modules/bfs` |
| G-04 | Dijkstra | `/modules/dijkstra` |
| G-05 | Bellman-Ford | `/modules/bellman-ford` |
| G-06 | Floyd-Warshall | `/modules/floyd-warshall` |
| G-07 | Kruskal | `/modules/kruskal` |
| G-08 | Prim | `/modules/prim` |
| G-09 | 拓扑排序 | `/modules/topological-sort` |

### 排序算法（11）

| ID | 名称 | 路径 |
|----|------|------|
| S-01 | 冒泡排序 | `/modules/bubble-sort` |
| S-02 | 选择排序 | `/modules/selection-sort` |
| S-03 | 插入排序 | `/modules/insertion-sort` |
| S-04 | 希尔排序 | `/modules/shell-sort` |
| S-05 | 归并排序 | `/modules/merge-sort` |
| S-06 | 快速排序 | `/modules/quick-sort` |
| S-07 | 堆排序 | `/modules/heap-sort` |
| S-08 | 计数排序 | `/modules/counting-sort` |
| S-09 | 基数排序 | `/modules/radix-sort` |
| S-10 | 桶排序 | `/modules/bucket-sort` |
| S-11 | 排序算法竞速 | `/modules/sorting-race` |

### 查找算法（2）

| ID | 名称 | 路径 |
|----|------|------|
| SR-01 | 顺序查找 | `/modules/linear-search` |
| SR-02 | 二分查找 | `/modules/binary-search` |

### 字符串算法（2）

| ID | 名称 | 路径 |
|----|------|------|
| ST-01 | KMP 算法 | `/modules/kmp` |
| ST-02 | Rabin-Karp | `/modules/rabin-karp` |

### 算法思想（5）

| ID | 名称 | 路径 |
|----|------|------|
| P-01 | 分治法 | `/modules/divide-conquer` |
| P-02 | 动态规划 | `/modules/dynamic-programming` |
| P-03 | 贪心算法 | `/modules/greedy` |
| P-04 | 回溯算法 | `/modules/backtracking` |
| P-05 | 并查集 | `/modules/union-find` |

---

## React Router 建议结构

```typescript
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/modules', element: <ModulesPage /> },
  { path: '/modules/sorting', element: <SortingOverviewPage /> },
  { path: '/about', element: <AboutPage /> },

  // 42 个核心模块页
  { path: '/modules/array', element: <ArrayPage /> },
  { path: '/modules/linked-list', element: <LinkedListPage /> },
  { path: '/modules/bubble-sort', element: <BubbleSortPage /> },
  // ... 其余模块同模式注册

  { path: '*', element: <NotFoundPage /> },
]);
```

---

## 导航工具函数示例

```typescript
const moduleRouteMap: Record<string, string> = {
  'L-01': '/modules/array',
  'L-02': '/modules/dynamic-array',
  'L-03': '/modules/linked-list',
  'L-04': '/modules/stack',
  'L-05': '/modules/queue',
  'T-01': '/modules/binary-tree',
  'T-02': '/modules/bst',
  'H-01': '/modules/hash-chaining',
  'G-02': '/modules/dfs',
  'S-01': '/modules/bubble-sort',
  'SR-02': '/modules/binary-search',
  'ST-01': '/modules/kmp',
  'P-05': '/modules/union-find',
};

export function getRouteByModuleId(moduleId: string): string {
  return moduleRouteMap[moduleId] ?? '/modules';
}
```

---

## 路由计数校验

| 类型 | 数量 |
|------|------|
| 核心模块路由 | 42 |
| 附属页面路由 | 2 |
| 基础系统路由（`/`, `/modules`, `*`） | 3 |
| 合计 | 47 |

---

## 版本历史

| 版本 | 日期 | 变化 |
|------|------|------|
| v1.2 | 2026-03-03 | 统一为 42 核心模块 + 2 附属页面，移除旧版合并页与失效 ID |
| v1.1 | 2026-03-03 | 第一轮口径统一修复 |
| v1.0 | 2026-03-02 | 初始版本 |
