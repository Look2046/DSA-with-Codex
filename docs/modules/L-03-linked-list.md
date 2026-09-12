# L-03 链表

**模块ID**：L-03  
**路由**：`/modules/linked-list`  
**难度**：⭐⭐  
**状态**：单链表已实现；双链表、循环链表为后续扩展设计  

## 1. 模块概览

目标：可视化链表节点与指针变化，突出查找、插入、删除时的链接定位、断开、重定向和重新接入过程。

当前运行时只覆盖单链表。后续扩展应在同一路由内加入链表形态切换，而不是拆成新的独立模块：

- 单链表：当前默认形态，使用 `next` 指针连接节点。
- 双链表：在 `next` 之外增加 `prev` 指针，强调前驱/后继同时维护。
- 循环链表：尾节点 `next` 指向头节点，强调“没有自然空尾指针”的遍历终止条件。

## 2. 输入与输出

- 输入：链表形态、初始链表值序列、操作类型和操作参数。
- 输出：`AnimationStep[]`，包含节点状态、指针连线状态、临时指针动画和当前伪代码行。
- 约束：长度 `0-30`；索引和位置必须合法；循环链表遍历必须带最大步数或回到头节点的终止保护。

建议的统一配置结构：

```typescript
type LinkedListMode = 'singly' | 'doubly' | 'circular';

type LinkedListConfig = {
  mode: LinkedListMode;
  list: number[];
  operation:
    | { type: 'find'; value: number }
    | { type: 'insertAt'; index: number; value: number }
    | { type: 'deleteAt'; index: number };
};
```

建议的统一节点快照：

```typescript
type LinkedListNodeSnapshot = {
  id: string;
  value: number;
  nextId: string | null;
  prevId?: string | null;
  detached?: boolean;
};
```

## 3. 链表形态设计

### 3.1 单链表（现有基线）

单链表节点只维护 `next`。查找从 `head` 开始单向前进；插入和删除需要先定位目标位置的前驱节点。

核心教学点：

- `head` 是进入链表的唯一入口。
- 插入中间节点时先令 `new.next = prev.next`，再令 `prev.next = new`。
- 删除中间节点时令 `prev.next = target.next`，再释放或淡出 `target`。
- 头插和删头不依赖前驱节点，而是直接移动 `head`。

### 3.2 双链表（后续扩展）

双链表节点同时维护 `prev` 和 `next`。页面应把一个节点渲染成“数据区 + 前后两个指针区”，并用上下两条方向相反的连线区分 `next` 与 `prev`。

核心教学点：

- 每个非首节点满足 `node.prev.next == node`。
- 每个非尾节点满足 `node.next.prev == node`。
- 插入时需要同时接好四条关系：新节点的 `prev/next`，以及相邻节点指向新节点的反向关系。
- 删除时需要同时绕过目标节点的前驱和后继。
- 头尾边界需要单独处理：头节点 `prev = null`，尾节点 `next = null`。

建议操作仍保持首批三项：

- `find(value)`：默认从 `head` 正向查找；后续可增加“从 tail 反向查找”作为演示开关。
- `insertAt(index, value)`：支持头插、中间插入、尾插。
- `deleteAt(index)`：支持删头、删中间、删尾。

双链表插入 `prev -> next` 之间的新节点 `s` 时，建议分帧：

1. 创建游离节点 `s`。
2. 定位 `prev` 和 `next`。
3. `s.prev = prev`。
4. `s.next = next`。
5. 若 `next != null`，令 `next.prev = s`。
6. 若 `prev != null`，令 `prev.next = s`；否则令 `head = s`。
7. 插入完成，校验双向关系闭合。

双链表删除目标节点 `target` 时，建议分帧：

1. 定位 `target`，同时标出 `prev = target.prev` 与 `next = target.next`。
2. 若 `prev != null`，令 `prev.next = next`；否则令 `head = next`。
3. 若 `next != null`，令 `next.prev = prev`；否则令 `tail = prev`。
4. 断开 `target.prev` 与 `target.next`。
5. 目标节点淡出，删除完成。

### 3.3 循环链表（后续扩展）

循环链表首批建议采用单向循环链表：尾节点 `next` 指回 `head`。这样能和当前单链表实现共享大部分教学语义，并把重点放在尾指针回环、遍历终止条件和插入删除边界上。

核心教学点：

- 非空循环链表没有 `next = null` 的尾节点。
- 遍历不能用 `cursor == null` 结束，而应在访问一圈后回到 `head`。
- 单节点循环链表满足 `head.next == head`。
- 插入或删除头节点时，必须同步维护尾节点指向新头节点。
- 页面应显式标出 `head`，并在尾到头的回边上标注 `tail.next -> head`。

建议操作仍保持首批三项：

- `find(value)`：从 `head` 开始，最多检查 `length` 次；回到 `head` 后判定未命中。
- `insertAt(index, value)`：支持 `0..length`，其中 `index == length` 表示尾后插入并接回 `head`。
- `deleteAt(index)`：支持删头、删中间、删尾；长度为 `1` 时删除后变为空表。

循环链表插入建议分帧：

1. 创建游离节点 `s`。
2. 如果链表为空，令 `s.next = s`，再令 `head = s`。
3. 如果插入头部，先定位尾节点 `tail`。
4. 令 `s.next = head`。
5. 令 `tail.next = s`，再令 `head = s`。
6. 如果插入中间或尾后，定位 `prev`，令 `s.next = prev.next`，再令 `prev.next = s`。
7. 插入完成，回边仍指向 `head`。

循环链表删除建议分帧：

1. 若为空表，显示空表提示并结束。
2. 若只有一个节点，断开自环并令 `head = null`。
3. 若删除头节点，定位尾节点 `tail` 和旧头 `target`。
4. 令 `head = target.next`，再令 `tail.next = head`。
5. 若删除中间或尾节点，定位 `prev` 和 `target`，令 `prev.next = target.next`。
6. 断开 `target.next`，目标节点淡出，删除完成。

## 4. 可视化语义

通用高亮：

- `visiting`：遍历到的节点。
- `new-node`：新建但未挂接节点。
- `swapping`：链接调整中的关键节点。
- `matched`：命中节点。

双链表新增视觉约定：

- `next` 指针使用上方或主路径箭头，从左到右。
- `prev` 指针使用下方回箭头，从右到左。
- 当前正在修改的指针端口需要高亮到具体端口，而不是只高亮整个节点。
- `head` 和 `tail` 都应作为独立指针标记展示。

循环链表新增视觉约定：

- 尾到头回边应画成独立弧线，避免和普通 `next` 边混在一条水平线上。
- 遍历一圈时，回到 `head` 的步骤要单独提示“已回到起点”。
- 单节点自环用小弧线展示，并标注 `next -> self`。
- 空表状态显示 `head = null`，不要保留虚假的回边。

## 5. 伪代码范围

页面右侧 Step 面板应根据“链表形态 + 操作类型”切换伪代码，避免把单链表、双链表、循环链表代码混在一个块里。

建议至少准备以下组合：

- 单链表：查找、按位插入、按位删除。
- 双链表：查找、按位插入、按位删除。
- 循环链表：查找、按位插入、按位删除。

示例：双链表插入核心伪代码：

```text
s = new Node(value)
prev = locatePrev(head, index)
next = prev == null ? head : prev.next
s.prev = prev
s.next = next
if next != null: next.prev = s
if prev != null: prev.next = s
else: head = s
```

示例：循环链表查找核心伪代码：

```text
if head == null: return not found
cursor = head
do:
  if cursor.value == value: return cursor
  cursor = cursor.next
while cursor != head
return not found
```

## 6. 验收标准（DoD）

单链表现有基线：

- [ ] 查找、插入、删除都能生成步骤。
- [ ] 每一步连线关系合法，无断链。
- [ ] 删除头、尾、中间节点都可正确回放。
- [ ] 非法位置输入被拦截并提示。

双链表扩展：

- [ ] 页面能切换到双链表形态，节点同时显示 `prev` 和 `next`。
- [ ] 插入头、中间、尾时，四类相关指针更新顺序清晰可见。
- [ ] 删除头、中间、尾时，前驱和后继能正确绕过目标节点。
- [ ] 每一帧都满足双向一致性：`next.prev` 与 `prev.next` 不冲突。
- [ ] `head` / `tail` 指针在边界变化时同步移动。

循环链表扩展：

- [ ] 页面能切换到循环链表形态，尾到头回边始终可见。
- [ ] 查找未命中时能明确展示“回到 head 后停止”。
- [ ] 空表、单节点自环、多节点回环三种状态都能正确渲染。
- [ ] 插入头节点和删除头节点时，尾节点回边同步更新。
- [ ] 所有遍历步骤都有防止无限循环的帧数边界。

## 7. 分阶段建议

- 阶段 A：在当前 `L-03` 文档和 UI 中只增加形态切换设计，不改变运行时代码。
- 阶段 B：先落双链表，因为它复用当前线性布局，只新增反向指针和 `tail`。
- 阶段 C：再落循环链表，因为它需要额外处理环形/回边布局和遍历终止解释。
- 阶段 D：若课堂需要，再把循环链表扩展到约瑟夫问题；该内容不应阻塞基础循环链表验收。

