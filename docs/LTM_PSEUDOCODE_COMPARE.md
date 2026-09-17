# L / T / M 模块伪代码对照稿

更新时间：2026-08-22

目的：
- 先把当前仓库里 `L-01~L-05`、`T-01~T-07`、`M-01~M-07` 的伪代码现状统一摊开。
- 不改现有页面，只做“当前中文式表达”和“建议类 C 式表达”的并排对照。
- 对于当前页面还没有独立伪代码块的模块，明确标注“现状无独立伪代码”，并给出建议稿，便于后续统一风格。

说明：
- “当前中文式”优先按页面里现在真实显示的伪代码整理。
- “建议类 C 式”不是最终定稿，只是第一版对照稿，便于先看整体风格。
- `T-01`、`T-04`、`L-01`、`L-03`、`L-04` 属于一页多模式/多操作模块，因此分开列。

---

## L 线性结构

### L-01 数组

#### 当前中文式：插入
```text
1. 校验插入索引范围
2. 从尾到索引依次右移元素
3. arr[index] = value
4. 结束
```

#### 建议类 C 式：插入
```c
if (index < 0 || index > length) return ERROR;
for (int i = length; i > index; --i)
    arr[i] = arr[i - 1];
arr[index] = value;
length++;
```

#### 当前中文式：删除
```text
1. 校验删除索引范围
2. 定位待删除元素
3. 后续元素依次前移
4. 结束
```

#### 建议类 C 式：删除
```c
if (index < 0 || index >= length) return ERROR;
for (int i = index; i < length - 1; ++i)
    arr[i] = arr[i + 1];
length--;
```

### L-02 动态数组

#### 当前中文式
```text
1. 校验输入、长度与容量
2. 若 size < capacity，直接追加
3. 若 size == capacity，触发扩容
4. 将旧数据复制到新缓冲区
5. 切换到新容量
6. 在尾部写入新值
7. 结束
```

#### 建议类 C 式
```c
if (size < capacity) {
    data[size++] = value;
} else {
    newCapacity = capacity * 2;
    newData = malloc(newCapacity * sizeof(int));
    for (int i = 0; i < size; ++i)
        newData[i] = data[i];
    free(data);
    data = newData;
    capacity = newCapacity;
    data[size++] = value;
}
```

### L-03 链表

#### 当前中文式：查找
```text
1. node = head
2. 逐个访问节点
3. 若 node.value == target: 命中
4. 若到达 null: 未找到
5. 结束
```

#### 建议类 C 式：查找
```c
Node *p = head;
while (p != NULL) {
    if (p->data == target) return p;
    p = p->next;
}
return NULL;
```

#### 当前中文式：按索引插入
```text
1. 校验索引范围
2. 遍历到插入位置
3. new.next = prev.next
4. 将原指针根部移动到 new.next
5. 生成 prev -> new
6. prev.next = new（或移动 head）
7. 后移节点
8. 结束
```

#### 建议类 C 式：按索引插入
```c
if (index < 1 || index > length + 1) return ERROR;
Node *prev = locatePrev(head, index);
Node *s = createNode(value);
s->next = prev->next;
prev->next = s;
return OK;
```

#### 当前中文式：按索引删除
```text
1. 校验索引范围
2. 遍历到删除位置
3. target = prev.next（或 head）
4. prev.next = target.next（或移动 head）
5. 结束
```

#### 建议类 C 式：按索引删除
```c
if (index < 1 || index > length) return ERROR;
Node *prev = locatePrev(head, index);
Node *target = prev->next;
prev->next = target->next;
free(target);
return OK;
```

### L-04 栈

#### 当前中文式：顺序栈
```text
1. 校验输入并定位 top
2. 若操作为 push
3. 若 top == MAX，则报告满栈
4. 把值写入 data[top]，然后令 top = top + 1
5. 若操作为 pop，则令 top = top - 1，并移除 data[top]
6. 若操作为 peek，则读取 data[top - 1]
```

#### 建议类 C 式：顺序栈
```c
if (op == PUSH) {
    if (top == MAX) return OVERFLOW;
    data[top++] = value;
} else if (op == POP) {
    if (top == 0) return UNDERFLOW;
    --top;
    return data[top];
} else if (op == PEEK) {
    if (top == 0) return UNDERFLOW;
    return data[top - 1];
}
```

#### 当前中文式：链栈
```text
1. 校验输入并定位 top
2. 若操作为 push
3. 创建新节点 s
4. 令 s.next = top
5. 更新 top = s
6. 若操作为 pop，则令 top = top.next
7. 若操作为 peek，则读取 top.data
```

#### 建议类 C 式：链栈
```c
if (op == PUSH) {
    Node *s = createNode(value);
    s->next = top;
    top = s;
} else if (op == POP) {
    if (top == NULL) return UNDERFLOW;
    Node *p = top;
    top = top->next;
    free(p);
} else if (op == PEEK) {
    if (top == NULL) return UNDERFLOW;
    return top->data;
}
```

### L-05 队列

#### 当前中文式
```text
1. 校验输入与操作合法性
2. 若操作为 enqueue
3. 将值追加到队尾
4. 若操作为 dequeue
5. 移除并返回队头
6. 若操作为 front，则读取队头
```

#### 建议类 C 式：顺序队列 / 循环队列统一写法
```c
if (op == ENQUEUE) {
    if (isFull(Q)) return OVERFLOW;
    Q.data[Q.rear] = value;
    Q.rear = (Q.rear + 1) % MAXSIZE;
} else if (op == DEQUEUE) {
    if (isEmpty(Q)) return UNDERFLOW;
    x = Q.data[Q.front];
    Q.front = (Q.front + 1) % MAXSIZE;
    return x;
} else if (op == FRONT) {
    if (isEmpty(Q)) return UNDERFLOW;
    return Q.data[Q.front];
}
```

---

## T 树结构

### T-01 二叉树遍历

#### 当前中文式：先序递归
```text
1. traverse(node):
2. if node == null: return
3. visit(node)
4. traverse(node.left)
5. traverse(node.right)
6. return
```

#### 建议类 C 式：先序递归
```c
void PreOrder(BiTree node) {
    if (node == NULL) return;
    visit(node);
    PreOrder(node->lchild);
    PreOrder(node->rchild);
}
```

#### 当前中文式：中序递归
```text
1. traverse(node):
2. if node == null: return
3. traverse(node.left)
4. visit(node)
5. traverse(node.right)
6. return
```

#### 建议类 C 式：中序递归
```c
void InOrder(BiTree node) {
    if (node == NULL) return;
    InOrder(node->lchild);
    visit(node);
    InOrder(node->rchild);
}
```

#### 当前中文式：后序递归
```text
1. traverse(node):
2. if node == null: return
3. traverse(node.left)
4. traverse(node.right)
5. visit(node)
6. return
```

#### 建议类 C 式：后序递归
```c
void PostOrder(BiTree node) {
    if (node == NULL) return;
    PostOrder(node->lchild);
    PostOrder(node->rchild);
    visit(node);
}
```

#### 当前中文式：层序
```text
1. if root == null: return
2. queue = [root]
3. while queue is not empty
4. node = queue.pop_front()
5. visit(node)
6. if node.left != null: queue.push(node.left)
7. if node.right != null: queue.push(node.right)
8. queue empty -> traversal complete
```

#### 建议类 C 式：层序
```c
if (root == NULL) return;
InitQueue(&Q);
EnQueue(&Q, root);
while (!QueueEmpty(Q)) {
    DeQueue(&Q, &p);
    visit(p);
    if (p->lchild) EnQueue(&Q, p->lchild);
    if (p->rchild) EnQueue(&Q, p->rchild);
}
```

### T-02 二叉排序树 BST

#### 当前中文式
```text
1. build BST from input sequence
2. if operation == search: walk left/right by compare
3. visit current node on search path
4. if value matches: found
5. if search reaches null: not found
6. if operation == insert: walk to insertion point
7. attach new node (or keep if duplicate)
8. if operation == delete: locate target node
9. if target missing: not found
10. classify delete case: leaf / one-child / two-children
11. leaf or one-child: relink parent-child
12. two-children: find inorder successor
13. replace target with successor and remove successor
14. emit final tree snapshot
```

#### 建议类 C 式
```c
if (op == SEARCH) return SearchBST(root, key);
if (op == INSERT) return InsertBST(&root, key);
if (op == DELETE) {
    p = SearchBST(root, key);
    if (p == NULL) return NOT_FOUND;
    if (p has two children) {
        s = FindSuccessor(p);
        p->data = s->data;
        DeleteSuccessorNode(p, s);
    } else {
        RelinkParentChild(p);
    }
}
```

### T-03 AVL 树

#### 当前中文式
```text
1. 根据初始插入序列构建 AVL
2. 像 BST 一样走到插入位置
3. 若为重复值：保持树不变
4. 访问当前节点并比较插入值
5. 检测到重复值后停止
6. 挂接新的叶子节点
7. 向上回溯：更新高度和平衡因子
8. 若 |balance| > 1：判定 LL / LR / RR / RL
9. 执行对应旋转
10. 子树恢复平衡
11. 输出最终 AVL 状态
```

#### 建议类 C 式
```c
InsertAVL(&root, key) {
    if (root == NULL) create node;
    else if (key < root->data) insert left;
    else if (key > root->data) insert right;
    else return DUPLICATE;
    UpdateHeight(root);
    balance = GetBalance(root);
    if (balance > 1 || balance < -1)
        RotateByCase(root, key);
}
```

### T-04 堆

#### 当前中文式：建堆
```text
1. 把初始序列放入完全二叉树数组
2. 从最后一个父节点开始
3. 选出当前父节点下方更大的子节点
4. 若子节点更大：继续向下筛
5. 交换父节点与该子节点
6. 输出最终最大堆
```

#### 建议类 C 式：建堆
```c
for (int i = n / 2 - 1; i >= 0; --i)
    SiftDown(heap, i, n);
```

#### 当前中文式：插入
```text
1. 从当前最大堆开始
2. 把新值追加到尾部
3. 比较新节点与其父节点
4. 若新节点更大：向上交换
5. 输出最终最大堆
```

#### 建议类 C 式：插入
```c
heap[++n] = x;
int i = n;
while (i > 1 && heap[i] > heap[i / 2]) {
    swap(heap[i], heap[i / 2]);
    i /= 2;
}
```

#### 当前中文式：取根
```text
1. 从当前最大堆开始
2. 记录根节点作为取出值
3. 把最后一个元素移到根位置
4. 移除旧尾部槽位
5. 比较根节点与更大的子节点
6. 若子节点更大：向下交换
7. 输出取根后的堆
```

#### 建议类 C 式：取根
```c
x = heap[1];
heap[1] = heap[n--];
SiftDown(heap, 1, n);
return x;
```

### T-05 B-Tree / B+ Tree

#### 当前中文式
```text
1. 从一棵已经合法的多路平衡树开始
2. 从根节点向目标叶子下降
3. 根据分隔键选择目标子区间
4. 把目标键按序插入目标叶子
5. 若叶子溢出：分裂叶子并保留右半部分
6. 把分隔键提升到父结点
7. 对于 B+ Tree，数据留在叶子里并维护叶链
8. 若父结点也溢出：继续向上分裂直到根稳定
9. 输出最终的 B-Tree 与 B+ Tree 快照
```

#### 建议类 C 式
```c
p = root;
while (p is not leaf)
    p = SelectChildByKey(p, key);
InsertKeyIntoLeaf(p, key);
while (p overflows) {
    SplitNode(p, &upKey, &rightNode);
    if (isBPlus) UpdateLeafChain(p, rightNode);
    p = PromoteToParent(p, upKey, rightNode);
}
```

### T-06 Trie

#### 当前中文式
```text
1. 从初始单词构建出的 Trie 开始
2. 对每个插入字符：若边存在则沿已有边前进
3. 当前缀已存在时，直接复用结点
4. 否则为该字符创建新的子结点
5. 把最终插入结点标记为单词终止
6. 从根重新开始处理搜索单词
7. 对每个搜索字符：移动到匹配子结点
8. 若最终结点是终止结点：单词存在
9. 若边缺失或只停在前缀上：单词不存在
10. 输出最终 Trie 快照
```

#### 建议类 C 式
```c
TrieNode *p = root;
for each ch in insertWord {
    if (p->child[ch] == NULL)
        p->child[ch] = CreateTrieNode();
    p = p->child[ch];
}
p->isEnd = true;

p = root;
for each ch in queryWord {
    if (p->child[ch] == NULL) return false;
    p = p->child[ch];
}
return p->isEnd;
```

### T-07 Huffman 树

#### 当前中文式
```text
1. 为每个带权标签创建单结点树
2. 当森林中的根数大于 1 时循环
3. 选出权值最小的两个根
4. 创建权值为二者之和的父结点
5. 将较小根接到左侧，另一个接到右侧
6. 把新父结点放回森林
7. 左边分配 0，右边分配 1
```

#### 建议类 C 式
```c
InitForest(F, weights);
while (RootCount(F) > 1) {
    SelectTwoMin(F, &s1, &s2);
    p = CreateNode(s1->weight + s2->weight);
    p->left = s1;
    p->right = s2;
    InsertForest(F, p);
}
AssignCode(root, 0, 1);
```

---

## M 存储与广义表

### M-01 二维数组顺序存储

#### 当前中文式：行优先
```text
1. 确定目标坐标 (i, j)
2. 在原矩阵中定位 a[i][j]
3. 按行优先逐个累计前置元素
4. 计算 k = i * cols + j
5. 在线性表中读取 linear[k]
6. 完成存储映射
```

#### 建议类 C 式：行优先
```c
Locate(i, j);
k = i * cols + j;
return linear[k];
```

#### 当前中文式：列优先
```text
1. 确定目标坐标 (i, j)
2. 在原矩阵中定位 a[i][j]
3. 按列优先逐个累计前置元素
4. 计算 k = j * rows + i
5. 在线性表中读取 linear[k]
6. 完成存储映射
```

#### 建议类 C 式：列优先
```c
Locate(i, j);
k = j * rows + i;
return linear[k];
```

### M-02 对称矩阵压缩存储

#### 现状
当前页面没有独立伪代码块，主要是：
- 上三角 / 下三角选择
- 对称镜像复用说明
- `k` 的计数思路与公式展开

#### 建议类 C 式
```c
if (storeUpper) {
    if (i <= j) k = i * n - i * (i - 1) / 2 + (j - i);
    else        k = j * n - j * (j - 1) / 2 + (i - j);
} else {
    if (i >= j) k = i * (i + 1) / 2 + j;
    else        k = j * (j + 1) / 2 + i;
}
return sa[k];
```

### M-03 上三角矩阵压缩存储

#### 现状
当前页面没有独立伪代码块，主要是：
- `i <= j` 时按上三角公式定位
- `i > j` 时统一映射到共享常量单元 `c`

#### 建议类 C 式
```c
if (i <= j)
    k = i * n - i * (i - 1) / 2 + (j - i);
else
    k = n * (n + 1) / 2;
return sa[k];
```

### M-04 下三角矩阵压缩存储

#### 现状
当前页面没有独立伪代码块，主要是：
- `i >= j` 时按下三角公式定位
- `i < j` 时统一映射到共享常量单元 `c`

#### 建议类 C 式
```c
if (i >= j)
    k = i * (i + 1) / 2 + j;
else
    k = n * (n + 1) / 2;
return sa[k];
```

### M-05 稀疏矩阵三元组存储

#### 现状
当前页面没有独立伪代码块，主要是：
- 只有非零元素进入三元组表
- 三元组按行优先、同行按列序记录

#### 建议类 C 式
```c
t = 0;
for (int i = 0; i < rows; ++i)
    for (int j = 0; j < cols; ++j)
        if (A[i][j] != 0) {
            T[t].i = i;
            T[t].j = j;
            T[t].e = A[i][j];
            ++t;
        }
```

### M-06 稀疏矩阵链式存储

#### 现状
当前页面没有独立伪代码块，主要是：
- 每一行一个行头指针
- 本行非零元素按列递增串成单链表

#### 建议类 C 式
```c
for (int i = 0; i < rows; ++i) {
    rowHead[i] = NULL;
    tail = NULL;
    for (int j = 0; j < cols; ++j) {
        if (A[i][j] != 0) {
            p = CreateNode(i, j, A[i][j]);
            if (rowHead[i] == NULL) rowHead[i] = p;
            else tail->next = p;
            tail = p;
        }
    }
}
```

### M-07 广义表表头表尾

#### 现状
当前页面没有独立“伪代码块”，主要是：
- `head(非空表)`：取当前表第一个元素
- `tail(非空表)`：去掉头元素后，把剩余所有内容重新放回最外层表括号
- 每一步只化简当前最内层合法 `head(...)` / `tail(...)`

#### 建议类 C 式
```c
Elem Head(GList L) {
    if (L == NULL) return ERROR;
    return FirstElement(L);
}

GList Tail(GList L) {
    if (L == NULL) return ERROR;
    return MakeList(RemoveFirstElement(L));
}

Expr Reduce(Expr e) {
    while (HasInnerReducibleOp(e))
        e = ReduceInnermost(e);
    return e;
}
```

---

## 初步结论

### 1. 目前最接近“类 C 伪代码”的模块
- `L-01`
- `L-02`
- `L-04`
- `L-05`
- `T-06`
- `T-07`

这些模块只需要把个别“中文解释性句子”再收紧一点，就很容易统一成课程里常见的类 C 风格。

### 2. 目前最偏“教学说明语句”的模块
- `T-02`
- `T-03`
- `T-04`
- `T-05`
- `M-02 ~ M-07`

这些模块现在更像“动画讲解步骤”，而不是教材风格的标准算法伪代码。

### 3. 如果下一步要统一风格，建议顺序
1. 先统一 `L-01 ~ L-05`
2. 再统一 `T-02 ~ T-07`
3. 最后决定 `M-02 ~ M-07` 是补真正伪代码，还是继续保留“规则说明 + 公式说明”的教学风格

