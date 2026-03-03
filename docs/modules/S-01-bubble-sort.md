# S-01 冒泡排序

**模块ID**：S-01  
**路由**：`/modules/bubble-sort`  
**难度**：⭐  
**状态**：P0

## 1. 模块概览

目标：用逐帧动画展示冒泡排序中“比较、交换、已归位”的过程。

## 2. 输入与输出

- 输入：`number[]`（长度 2-50，整数）
- 输出：`AnimationStep[]`
- 错误输入：空数组、非数字、长度超限时给出 UI 错误提示并禁止播放

## 3. 可视化语义

- `comparing`：当前比较的两个索引
- `swapping`：正在交换的元素
- `sorted`：本轮结束后已归位元素

## 4. 核心交互

- 播放控制：`play / pause / next / prev / reset`
- 速度控制：`0.5x / 1x / 2x`
- 数据输入：随机生成、手动输入

## 5. 步骤定义（最小集）

每个 step 至少包含：
- `arrayState: number[]`
- `highlights: { index: number; type: 'comparing' | 'swapping' | 'sorted' }[]`
- `description: string`
- `codeLines: number[]`

## 6. 验收标准（DoD）

- [ ] 对固定输入（如 `[5,1,4,2,8]`）生成确定性步骤序列
- [ ] 步骤总数 > 0 且最终 `arrayState` 有序
- [ ] 播放与单步前进结果一致
- [ ] 重置后回到初始数组与第 0 步

