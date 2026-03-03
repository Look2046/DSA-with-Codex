# 数据结构与算法可视化平台 - 最终模块清单 v1.2

**项目名称**：数据结构与算法可视化平台  
**最终模块数**：42 个核心可视化模块 + 2 个附属页面  
**版本**：v1.2（删除合并备注，模块编码连续化）  
**技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + D3.js + Framer Motion + Zustand

## 📊 完整模块表

### 第1类：线性结构（5个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| L-01 | 数组 | 随机访问、顺序查找、插入删除移位 | `/modules/array` | ⭐ |
| L-02 | 动态数组 | 扩容过程、2倍扩容 | `/modules/dynamic-array` | ⭐⭐ |
| L-03 | 链表 | 单向/双向/循环（三个tab） | `/modules/linked-list` | ⭐⭐ |
| L-04 | 栈 | 压栈、弹栈、括号匹配应用 | `/modules/stack` | ⭐⭐ |
| L-05 | 队列 | 普通/循环/双端（三个tab） | `/modules/queue` | ⭐⭐ |

### 第2类：树形结构（6个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| T-01 | 二叉树遍历 | 先序/中序/后序/层序遍历 | `/modules/binary-tree` | ⭐ |
| T-02 | 二叉搜索树（BST） | 插入、删除、查找 | `/modules/bst` | ⭐⭐ |
| T-03 | AVL树 | 4种旋转（LL/RR/LR/RL） | `/modules/avl-tree` | ⭐⭐⭐ |
| T-04 | 堆 | 建堆、插入、删除、heapify | `/modules/heap` | ⭐⭐⭐ |
| T-05 | B树 / B+树 | 节点分裂、合并、查找 | `/modules/btree` | ⭐⭐⭐ |
| T-06 | 字典树（Trie） | 插入单词、前缀搜索、删除 | `/modules/trie` | ⭐⭐ |

### 第3类：哈希（2个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| H-01 | 哈希表 - 链地址法 | 冲突解决、链表追加 | `/modules/hash-chaining` | ⭐ |
| H-02 | 哈希表 - 开放寻址法 | 线性探测、二次探测、双哈希 | `/modules/hash-open-addressing` | ⭐⭐ |

### 第4类：图（9个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| G-01 | 图的表示 | 邻接矩阵 vs 邻接表对比 | `/modules/graph-representation` | ⭐ |
| G-02 | DFS | 节点遍历、回溯路径 | `/modules/dfs` | ⭐⭐ |
| G-03 | BFS | 队列展开、层级访问 | `/modules/bfs` | ⭐⭐ |
| G-04 | Dijkstra最短路 | 距离表更新、节点松弛 | `/modules/dijkstra` | ⭐⭐⭐ |
| G-05 | Bellman-Ford | 边的松弛迭代、负权检测 | `/modules/bellman-ford` | ⭐⭐⭐ |
| G-06 | Floyd-Warshall | 所有最短路、矩阵更新 | `/modules/floyd-warshall` | ⭐⭐⭐ |
| G-07 | Kruskal最小生成树 | 边排序、并查集合并 | `/modules/kruskal` | ⭐⭐⭐ |
| G-08 | Prim最小生成树 | 贪心扩展、边权选择 | `/modules/prim` | ⭐⭐⭐ |
| G-09 | 拓扑排序 | Kahn算法、入度队列 | `/modules/topological-sort` | ⭐⭐ |

### 第5类：排序算法（11个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| S-01 | 冒泡排序 | 相邻比较交换 | `/modules/bubble-sort` | ⭐ |
| S-02 | 选择排序 | 最小值选取 | `/modules/selection-sort` | ⭐ |
| S-03 | 插入排序 | 有序区扩展、哨兵 | `/modules/insertion-sort` | ⭐ |
| S-04 | 希尔排序 | 间隔分组插入 | `/modules/shell-sort` | ⭐⭐ |
| S-05 | 归并排序 | 分治树形展开、归并过程 | `/modules/merge-sort` | ⭐⭐ |
| S-06 | 快速排序 | Partition、pivot策略 | `/modules/quick-sort` | ⭐⭐ |
| S-07 | 堆排序 | 建堆、逐步提取 | `/modules/heap-sort` | ⭐⭐ |
| S-08 | 计数排序 | 频率数组、线性时间 | `/modules/counting-sort` | ⭐⭐ |
| S-09 | 基数排序 | 多轮桶分配、稳定排序 | `/modules/radix-sort` | ⭐⭐ |
| S-10 | 桶排序 | 分桶、局部排序 | `/modules/bucket-sort` | ⭐⭐ |
| S-11 | 排序算法竞速 | 多算法同屏对比 | `/modules/sorting-race` | ⭐⭐⭐ |

### 第6类：查找算法（2个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| SR-01 | 顺序查找 | 逐一比对高亮 | `/modules/linear-search` | ⭐ |
| SR-02 | 二分查找 | 区间缩小动画 | `/modules/binary-search` | ⭐ |

### 第7类：字符串算法（2个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| ST-01 | KMP算法 | 失配函数、模式滑动 | `/modules/kmp` | ⭐⭐⭐ |
| ST-02 | Rabin-Karp | 哈希窗口、冲突处理 | `/modules/rabin-karp` | ⭐⭐ |

### 第8类：经典算法思想（5个）

| ID | 模块名 | 简介 | 路由 | 难度 |
|----|--------|------|------|------|
| P-01 | 分治法 | 递归调用树、归并快排 | `/modules/divide-conquer` | ⭐⭐ |
| P-02 | 动态规划 | 状态表格、斐波那契/背包/LCS | `/modules/dynamic-programming` | ⭐⭐⭐ |
| P-03 | 贪心算法 | 聚焦活动选择问题 | `/modules/greedy` | ⭐⭐ |
| P-04 | 回溯算法 | 八皇后、解空间树 | `/modules/backtracking` | ⭐⭐⭐ |
| P-05 | 并查集 | 路径压缩、按秩合并 | `/modules/union-find` | ⭐⭐⭐ |

## 📌 附属页面（2个）

| 页面 | 路由 | 说明 |
|------|------|------|
| 排序模块首页 | `/modules/sorting` | 所有排序算法的复杂度对比表 |
| 首页 | `/` | 项目介绍、快速开始、学习路径推荐 |

## 📈 统计总览

| 类别 | 模块数 |
|------|--------|
| 线性结构 | 5 |
| 树形结构 | 6 |
| 哈希 | 2 |
| 图 | 9 |
| 排序 | 11 |
| 查找 | 2 |
| 字符串 | 2 |
| 经典思想 | 5 |
| **合计页面** | **42** |
| **附属页面** | **2** |

## 🎯 按难度分类

### ⭐ 初级（10个）
L-01, L-02, T-01, H-01, G-01, SR-01, SR-02, S-01, S-02, S-03

### ⭐⭐ 中级（18个）
L-03, L-04, L-05, T-02, T-06, H-02, G-02, G-03, G-09,  
S-04, S-05, S-06, S-07, S-08, S-09, S-10, ST-02, P-01, P-03

### ⭐⭐⭐ 高级（11个）
T-03, T-04, T-05, G-04, G-05, G-06, G-07, G-08,  
ST-01, P-02, P-04, P-05

## 🗺️ 路由导航结构

```
/                                    首页

/modules                             模块导航页
├── ?category=linear                 线性结构筛选
├── ?category=tree                   树形结构筛选
├── ?category=hash                   哈希筛选
├── ?category=graph                  图论筛选
├── ?category=sorting                排序筛选（包含复杂度对比表）
├── ?category=search                 查找筛选
├── ?category=string                 字符串筛选
└── ?category=paradigms              经典思想筛选

/modules/array                       具体模块页面
/modules/linked-list                 链表（单向/双向/循环三个tab）
/modules/queue                       队列（普通/循环/双端三个tab）
/modules/sorting-race                排序竞速
... （其他37个模块）

/stats                               使用统计
/docs                                文档中心
```

## 📝 模块 UI 设计细节

### L-03 链表

```
页面：/modules/linked-list

顶部 Tab 栏：
┌─────────────────────────────────┐
│ [ 单向链表 ] [ 双向链表 ] [ 循环链表 ]│
└─────────────────────────────────┘

操作选择：[ 插入 ] [ 删除 ] [ 反转 ] [ 搜索 ]

[动画演示区 - 根据选中的链表类型实时渲染]

[代码面板 - 伪代码根据链表类型和操作动态更新]
```

**实现建议**：
- 三个链表共用 LinkedListVisualizer 组件，通过 props 传递类型
- 伪代码和数据结构在 Tab 切换时更新
- 循环链表的约瑟夫问题作为高级示例（可选）

### L-05 队列

```
页面：/modules/queue

顶部 Tab 栏：
┌──────────────────────────────────┐
│ [ 普通队列 ] [ 循环队列 ] [ 双端队列 ]│
└──────────────────────────────────┘

操作选择：[ 入队 ] [ 出队 ] [ 查看假溢出 ]

[动画演示区 - 根据选中的队列类型实时渲染]

[代码面板]
```

**实现建议**：
- 循环队列的"假溢出"问题是核心亮点，需要重点演示
- 双端队列显示两端操作指针
- 共用 QueueVisualizer 组件，通过 props 区分

## ✅ 最终确认清单

- [x] 42 个核心模块编码连续确定
- [x] 2 个附属页面确定（首页 + 排序首页）
- [x] 每个模块的路由确定
- [x] 每个模块的难度评级确定
- [x] 导航结构确定
- [x] 所有合并备注已删除

## 📚 关键文档引用

- **AnimationStep 设计**：见 `2 ANIMATION_STEP_DESIGN.md`
- **完整规划**：见 `1 ARCHITECTURE.md`
- **模块详情**：各模块的 markdown 说明
- **UI/UX 设计**：见 `4 UI_UX_DESIGN.md`
