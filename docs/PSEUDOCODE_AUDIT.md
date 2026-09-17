# Pseudocode Audit

## 2026-09-14 全量伪代码复审

### Scope

- 在上一轮双栏审计基础上，继续覆盖实际页面展示的单栏伪代码：
  - 排序：冒泡、选择、插入、希尔、快速、归并、堆、计数、基数、桶、排序竞速
  - 查找与字符串：线性查找、二分查找、KMP、Rabin-Karp
  - 树：二叉树遍历、BST、AVL、堆、B-Tree/B+Tree、Trie、Huffman
  - 图：图表示、DFS、BFS、Dijkstra、Bellman-Ford、Floyd、Kruskal、Prim、拓扑排序
  - 范式：分治、动态规划、贪心、回溯、并查集
  - 线性结构双栏页：链表、栈、队列再次复核
- 检查目标：
  - 伪代码顺序是否符合教材常规算法
  - 动画 `codeLines` 是否能高亮到实际展示的行
  - 是否存在遗漏关键赋值/指针/计数步骤
  - 是否存在单栏伪代码“死行”或复用错误行

### Fixed

- 冒泡排序补回“本轮无交换则提前结束”的伪代码展示行，并把无交换归位帧映射到该行。
- 顺序队列、链式队列、循环队列伪代码再次细化：
  - 链式队列独立展示 `front/rear` 结点指针写法
  - 循环队列统一为“牺牲一个空槽”的 `front == rear` 判空、`(rear + 1) % MAXSIZE == front` 判满模型
  - 去掉和 `size` 模型混用的空队修复描述
- 循环链表伪代码改为显式定位 `tail` 和 `prev`，头插/头删不再暗含一个永久 `tail` 变量。
- 分治伪代码把基本情况判断移到拆分之前，和递归求最大值的实际流程一致。
- 回溯伪代码把“撤销皇后并尝试下一列”拆成独立行，避免回退步骤高亮到“放置并递归”。
- 计数排序稳定回填补齐 `count[key] -= 1`，避免学生只看到写入而漏掉前缀计数回退。
- B-Tree/B+Tree 下降步骤同时高亮“向叶子下降”和“选择目标子区间”，并把溢出/提升行改成更符合当前 B-Tree/B+Tree 对照动画的描述。

### Verified

- Targeted tests passed:
  - `npm test -- src/modules/sorting/bubbleSort.test.ts src/modules/sorting/countingSort.test.ts src/modules/paradigm/divideConquer.test.ts src/modules/paradigm/backtracking.test.ts src/modules/tree/btreeComparison.test.ts src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts src/modules/linear/queueOps.test.ts src/pages/modules/queuePageUtils.test.ts`
  - `9` files / `51` tests passed.
- `npm run build` passed.
- `git diff --check` passed.
- `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `327` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`.

### Remaining Risk

- 本轮主要校正伪代码内容和高亮映射，没有逐页做浏览器视觉回放。
- 部分概念型伪代码仍然是教学摘要而非完整可编译 C/TS 实现；当前按“页面演示应让学生学到正确步骤”作为验收边界。

## 2026-09-14 双栏伪代码审计

### Scope

- 覆盖实际以“中文式 / 类 C 式”双栏展示的模块页：
  - `L-01 /modules/array`
  - `L-02 /modules/dynamic-array`
  - `L-03 /modules/linked-list`
  - `L-03B /modules/doubly-linked-list`
  - `L-03C /modules/circular-linked-list`
  - `L-04 /modules/stack`
  - `L-05 /modules/queue`
  - `T-07 /modules/huffman-tree`
- 检查目标：
  - 中文式与类 C 式是否表达同一操作顺序
  - 类 C 式是否仍残留说明性占位句
  - 下标基准是否与页面输入和运行逻辑一致
  - 高亮行号是否仍能落在对应伪代码行
  - 边界条件是否会误导学生

### Fixed

- 链表类 C 式统一为 0 基下标，和页面输入转换及运行逻辑一致。
- 单链表插入/删除补齐头插、头删分支，不再使用旧的 1 基 `locatePrev` 写法。
- 双链表插入按 `prev / next / new.prev / new.next / next.prev / prev.next(or head)` 顺序表达，删除补齐 `free(target)`。
- 循环链表插入修正 `index == 1` 移动头指针的错误，改为 0 基 `index == 0`，并补齐空表与单节点删除分支。
- 动态数组类 C 式补上输入状态校验，并明确直接追加与扩容后追加的返回路径。
- 栈类 C 式从说明句改为具体条件判断、写入、移动 `top`、返回/释放节点语句。
- 队列类 C 式从说明句改为普通队列和循环队列的具体满/空判断、front/rear 移动和返回语句。
- Huffman 类 C 式修正 `Haffman` 拼写，显式传入 `n`，初始化最小值下标，并补齐编码/WPL 细节中的完成判断和 WPL 初值。

### Verified

- `npm test -- src/modules/linear/arrayInsert.test.ts src/modules/linear/dynamicArrayOps.test.ts src/modules/linear/linkedListOps.test.ts src/modules/linear/queueOps.test.ts src/modules/linear/stackOps.test.ts src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
- `npm run build`
- `npm run check` was attempted; docs check and all tests passed, then lint stopped on existing React-rule issues outside the pseudocode content changes.

### Known Follow-Up

- 单栏伪代码仍应继续做第二轮内容审计，尤其是排序、查找、图、树和范式模块的单栏伪代码与 `codeLines` 高亮映射。
- `npx eslint` 在本轮触达页面上仍会遇到既有 React 规则问题；这些问题不是伪代码文案引入，但会阻断完整 lint 绿灯。
