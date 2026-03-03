
# GOVERNANCE_STANDARDS.md

## 📋 目录

1. [概述](#概述)
2. [项目治理结构](#项目治理结构)
3. [代码规范](#代码规范)
4. [贡献指南](#贡献指南)
5. [提交规范](#提交规范)
6. [代码审查流程](#代码审查流程)
7. [版本管理](#版本管理)
8. [发布流程](#发布流程)
9. [质量标准](#质量标准)
10. [文档标准](#文档标准)
11. [安全政策](#安全政策)
12. [行为准则](#行为准则)

---

## 概述

本文档定义了算法可视化系统的 **治理结构、编码标准和贡献流程**。确保项目的质量、安全和可持续发展。

- **版本**：v1.0
- **最后更新**：2026-03-02
- **适用范围**：所有贡献者、维护者和利益相关者

---

## 项目治理结构

### 角色定义

#### 1. 项目维护者 (Project Maintainers)

**职责：**
- 管理项目方向和路线图
- 审查和合并重大 PR
- 发布新版本
- 管理社区讨论

**权限：**
- 合并 PR
- 管理 Issues
- 发布版本
- 管理 GitHub Pages

**任期：** 1 年（可续期）

#### 2. 核心贡献者 (Core Contributors)

**职责：**
- 代码审查
- 问题分类
- 文档维护
- 新特性开发

**权限：**
- 审查和建议 PR
- 标记和关闭 Issues
- 创建代码审查

**要求：**
- 至少 10 个已合并 PR
- 3 个月的活跃贡献
- 通过投票成为正式成员

#### 3. 贡献者 (Contributors)

**职责：**
- 贡献代码、文档或 bug 修复
- 参与讨论
- 报告问题

**权限：**
- 创建 Issues
- 提交 PR
- 参与讨论

#### 4. 社区成员 (Community Members)

**职责：**
- 使用项目
- 报告 bug
- 提供反馈

**权限：**
- 使用和分发软件
- 创建 Issues
- 提交 PR

### 决策流程

```
社区提案
    ↓
讨论（Issue 或 Discussion）
    ↓
核心贡献者投票
    ↓
维护者最终决定
    ↓
实施
```

### 争议解决

1. **非正式讨论**（1-2 周）- GitHub Issue 讨论
2. **正式投票**（1-2 周）- 核心贡献者投票
3. **维护者决定** - 最终决定权

---

## 代码规范

### TypeScript 规范

#### 1. 文件组织

```typescript
// src/components/Button.tsx

// 1. 导入
import React, { ReactNode, CSSProperties } from 'react';
import { useCallback } from 'react';

// 2. 类型定义
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

// 3. 常量定义
const VARIANTS = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
  danger: 'bg-red-500',
} as const;

// 4. 组件定义
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button
      className={`${VARIANTS[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// 5. 导出
Button.displayName = 'Button';
```

#### 2. 命名规范

```typescript
// ✅ 好的命名

// 常量 - 大写下划线分隔
const MAX_ARRAY_SIZE = 10000;
const DEFAULT_ANIMATION_SPEED = 1;

// 类 - PascalCase
class AnimationEngine { }
class DataVisualizer { }

// 函数 - camelCase，动词开头
function generateAnimation() { }
function parseUserInput() { }
function validateDataStructure() { }

// 布尔值 - is/has 前缀
const isAnimating = true;
const hasErrors = false;
const canDelete = true;

// 数组 - 复数形式
const modules: Module[] = [];
const items: Item[] = [];
const children: ReactNode[] = [];

// ❌ 不好的命名
const data = 'wrong'; // 太通用
const x = 100; // 单字母
const handleButtonOnClick = () => { }; // 冗长
const Module = []; // 常量用 PascalCase
```

#### 3. 类型定义

```typescript
// 使用 interface 定义对象
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// 使用 type 定义联合类型和复杂类型
type UserRole = 'admin' | 'user' | 'guest';
type Callback = (data: any) => void;

// 函数类型
type AnimationGenerator = (data: number[]) => AnimationStep[];

// 避免 any
function processData(data: unknown): void {
  if (typeof data === 'object' && data !== null) {
    // 处理数据
  }
}

// 使用泛型
function createStore<T>(initialState: T) {
  return {
    state: initialState,
    setState: (newState: T) => { /* ... */ },
  };
}
```

#### 4. 错误处理

```typescript
// ✅ 好的错误处理

// 自定义错误类
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`Validation error on ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

// 使用 try-catch
async function fetchModuleData(moduleId: string): Promise<Module> {
  try {
    const response = await fetch(`/api/modules/${moduleId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch module: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// 结果类型处理
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function handleResult<T>(result: Result<T>) {
  if (result.ok) {
    console.log('Success:', result.value);
  } else {
    console.error('Error:', result.error);
  }
}
```

### React 组件规范

#### 1. 函数式组件

```typescript
// ✅ 推荐的组件结构

import React, { useState, useCallback, useMemo } from 'react';

interface ArrayVisualizerProps {
  data: number[];
  onItemClick?: (index: number) => void;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  data,
  onItemClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const items = useMemo(
    () => data.map((value, index) => (
      <div
        key={index}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onItemClick?.(index)}
      >
        {value}
      </div>
    )),
    [data, handleMouseEnter, handleMouseLeave, onItemClick]
  );

  return <div className="array-visualizer">{items}</div>;
};

ArrayVisualizer.displayName = 'ArrayVisualizer';
```

#### 2. 自定义 Hooks

```typescript
// ✅ 自定义 Hook 规范

export function useAnimation(duration: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // 动画逻辑
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      if (p < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, duration]);

  return { isPlaying, progress, play, pause, reset };
}
```

#### 3. 性能优化

```typescript
// ✅ 性能优化模式

// 使用 React.memo 避免不必要的重新渲染
export const MemoizedNode = React.memo(
  function Node({ value, isHighlighted }: NodeProps) {
    return <div className={isHighlighted ? 'highlight' : ''}>{value}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value &&
           prevProps.isHighlighted === nextProps.isHighlighted;
  }
);

// 使用 useCallback 稳定函数引用
const handleClick = useCallback(() => {
  onItemClick?.(index);
}, [index, onItemClick]);

// 使用 useMemo 避免昂贵的计算
const sortedData = useMemo(
  () => [...data].sort((a, b) => a - b),
  [data]
);

// 虚拟化长列表
import { FixedSizeList } from 'react-window';

function LargeList({ items }: { items: Item[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### CSS/Tailwind 规范

```typescript
// ✅ Tailwind 使用规范

// 1. 在组件中使用 className
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
  Click me
</button>

// 2. 提取复杂的样式到组件
const buttonClasses = {
  primary: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600',
  secondary: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300',
  danger: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600',
} as const;

// 3. 使用 CSS modules 处理复杂样式
// styles/Visualizer.module.css
.container {
  @apply grid grid-cols-10 gap-2;
}

.item {
  @apply aspect-square bg-blue-500 rounded-lg;
}

.item.highlight {
  @apply bg-red-500 scale-110;
}

// 在组件中使用
import styles from './Visualizer.module.css';

<div className={styles.container}>
  {items.map((item) => (
    <div 
      key={item.id} 
      className={`${styles.item} ${highlighted ? styles.highlight : ''}`}
    />
  ))}
</div>
```

---

## 贡献指南

### 开发流程

#### 1. 设置开发环境

```bash
# 克隆仓库
git clone https://github.com/Look2046/DSA-with-Codex.git
cd DSA-with-Codex

# 创建特性分支
git checkout -b feature/your-feature-name

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 运行 linter
npm run lint
```

#### 2. 代码贡献流程

```
1. 创建 Issue 或讨论
   ↓
2. 分支开发 (feature/* 或 bugfix/*)
   ↓
3. 本地测试和验证
   ↓
4. 提交 PR（遵循提交规范）
   ↓
5. 代码审查
   ↓
6. 合并到 develop 分支
   ↓
7. 发布到 main
```

#### 3. 分支策略

```
main (生产分支)
 ↑
develop (开发主分支)
 ↑
feature/* (功能分支)
bugfix/* (bug 修复)
hotfix/* (紧急修复)
docs/* (文档更新)
```

**分支命名规范：**
- `feature/module-name` - 新功能
- `bugfix/issue-description` - bug 修复
- `hotfix/critical-issue` - 紧急修复
- `docs/documentation-type` - 文档
- `test/test-description` - 测试

### 贡献流程详解

#### Issue 管理

```markdown
# 创建 Issue 时的模板

## Bug 报告
- 描述 bug
- 复现步骤
- 期望行为 vs 实际行为
- 环境信息（Node 版本、浏览器等）

## 功能请求
- 描述所需功能
- 使用场景
- 建议的实现
- 备选方案

## 改进建议
- 改进什么
- 为什么改进
- 建议方案
```

#### Pull Request 流程

```markdown
# PR 标题格式
[TYPE] 简要描述

# PR 描述模板
## 描述
清晰简要的描述改动内容

## 相关 Issue
Closes #123

## 变化类型
- [ ] Bug 修复（不破坏功能的修复）
- [ ] 新功能（不破坏功能的新增功能）
- [ ] 破坏性变更（会影响现有功能）
- [ ] 文档更新

## 测试
- [ ] 已添加测试
- [ ] 所有测试通过
- [ ] 覆盖率 >= 80%

## 清单
- [ ] 代码遵循项目风格
- [ ] 自审了自己的代码
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 未添加新的警告信息
```

---

## 提交规范

### Conventional Commits

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- **feat** - 新功能
- **fix** - bug 修复
- **docs** - 文档
- **style** - 格式（不影响代码运行）
- **refactor** - 重构
- **perf** - 性能优化
- **test** - 测试
- **chore** - 构建过程或依赖

#### Scope

- `animation` - 动画相关
- `ui` - UI 组件
- `store` - 状态管理
- `api` - API 集成
- `docs` - 文档
- `deps` - 依赖更新

#### 提交示例

```bash
# 新功能
git commit -m "feat(animation): add playback speed control"

# bug 修复
git commit -m "fix(ui): correct button alignment in controls"

# 文档更新
git commit -m "docs(readme): update installation instructions"

# 性能优化
git commit -m "perf(visualizer): optimize large array rendering"

# 带详情的提交
git commit -m "feat(animation): add playback speed control

- Add speed selector (0.5x, 1x, 2x)
- Update animation timing calculations
- Add keyboard shortcuts (+ and - keys)

Closes #456"
```

### Commitizen 工具

使用 Commitizen 辅助提交：

```bash
# 全局安装
npm install -g commitizen cz-conventional-changelog

# 项目中使用
npm install --save-dev commitizen cz-conventional-changelog

# 生成提交消息
git cz

# 或
npm run commit
```

---

## 代码审查流程

### 审查原则

1. **代码质量**
   - 遵循编码标准
   - 测试覆盖率 >= 80%
   - 没有代码异味

2. **功能正确性**
   - 实现符合需求
   - 边界情况已处理
   - 错误处理完整

3. **性能**
   - 没有性能回退
   - 算法复杂度合理
   - 内存使用正常

4. **安全性**
   - 没有安全漏洞
   - 输入验证完整
   - 敏感数据处理正确

### 审查清单

```markdown
## 代码审查清单

### 代码质量
- [ ] 代码易读易理解
- [ ] 变量名有意义
- [ ] 函数功能单一
- [ ] 注释清晰必要
- [ ] 没有重复代码

### 测试
- [ ] 添加了新测试
- [ ] 测试覆盖率充分
- [ ] 所有测试通过
- [ ] 边界情况已测试

### 性能
- [ ] 没有 O(n²) 或更差的算法
- [ ] 不必要的渲染已优化
- [ ] 内存泄漏已排除

### 安全
- [ ] 没有 SQL 注入
- [ ] 输入已验证
- [ ] 敏感数据已保护

### 文档
- [ ] 注释清晰
- [ ] README 已更新
- [ ] API 文档已更新
- [ ] 破坏性变更已说明

### 其他
- [ ] 提交消息清晰
- [ ] 分支已更新到最新
- [ ] 冲突已解决
```

### 审查反馈

**好的反馈：**
```
This function could be simplified using Array.map() instead of a for loop.

Suggested:
```typescript
const results = data.map(item => processItem(item));
```
```

**不好的反馈：**
```
This is wrong.
```

---

## 版本管理

### 语义版本控制 (SemVer)

遵循 MAJOR.MINOR.PATCH 格式：

```
1.2.3
↑ ↑ ↑
│ │ └─ PATCH: bug 修复，向后兼容
│ └─── MINOR: 新功能，向后兼容
└───── MAJOR: 破坏性变更
```

#### 版本规则

```
0.0.1 - 0.0.x  初始开发，不稳定
0.1.0 - 0.x.x  公开测试版
1.0.0           第一个稳定版本
1.1.0           新功能添加
1.1.1           bug 修复
2.0.0           主版本更新，可能破坏兼容性
```

### 版本号管理

```bash
# 查看当前版本
npm version

# 发布补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 发布次版本 (1.0.0 -> 1.1.0)
npm version minor

# 发布主版本 (1.0.0 -> 2.0.0)
npm version major

# 发布预发布版本 (1.0.0 -> 1.0.1-alpha.0)
npm version prerelease --preid=alpha
```

---

## 发布流程

### Pre-release 流程

```bash
# 1. 创建预发布分支
git checkout -b release/1.1.0-beta.1

# 2. 更新版本号
npm version prerelease --preid=beta

# 3. 更新 CHANGELOG
# 编辑 CHANGELOG.md

# 4. 提交更改
git add .
git commit -m "chore(release): prepare 1.1.0-beta.1"

# 5. 创建 tag
git tag -a v1.1.0-beta.1 -m "Release 1.1.0-beta.1"

# 6. 推送到远程
git push origin release/1.1.0-beta.1
git push origin v1.1.0-beta.1

# 7. 发布到 npm
npm publish --tag beta
```

### 生产发布流程

```bash
# 1. 创建发布分支
git checkout -b release/1.1.0
git pull origin develop

# 2. 更新版本
npm version minor

# 3. 更新 CHANGELOG.md
cat > CHANGELOG.md << 'EOF'
# Version 1.1.0 (2026-03-02)

## Features
- Add playback speed control
- Add keyboard shortcuts

## Bug Fixes
- Fix animation timing issue
- Fix memory leak in visualizer

## Breaking Changes
None
EOF

# 4. 提交
git add .
git commit -m "chore(release): 1.1.0"
git tag -a v1.1.0 -m "Release version 1.1.0"

# 5. 合并到 main
git checkout main
git pull origin main
git merge --no-ff release/1.1.0

# 6. 合并回 develop
git checkout develop
git pull origin develop
git merge --no-ff release/1.1.0

# 7. 推送
git push origin main develop v1.1.0

# 8. 发布
npm publish

# 9. 创建 GitHub Release
# 在 GitHub 网站上创建 Release，添加 CHANGELOG 内容

# 10. 清理
git branch -d release/1.1.0
```

### 紧急修复 (Hotfix)

```bash
# 1. 从 main 创建 hotfix 分支
git checkout -b hotfix/1.1.1
git checkout main
git pull origin main

# 2. 修复问题并提交
# ... 修复代码 ...
git add .
git commit -m "fix: critical issue in animation engine"

# 3. 更新版本
npm version patch

# 4. 创建 tag
git tag -a v1.1.1 -m "Release 1.1.1"

# 5. 合并到 main
git checkout main
git merge --no-ff hotfix/1.1.1

# 6. 合并到 develop
git checkout develop
git merge --no-ff hotfix/1.1.1

# 7. 推送并发布
git push origin main develop v1.1.1
npm publish
```

---

## 质量标准

### 代码质量目标

| 指标 | 目标 | 工具 |
|------|------|------|
| 测试覆盖率 | >= 80% | Jest/Vitest |
| ESLint 错误 | 0 | ESLint |
| 类型检查 | 100% | TypeScript |
| 复杂度 | <= 10 | ESLint-complexity |
| 代码重复 | < 5% | SonarQube |
| 安全漏洞 | 0 关键 | npm audit |

### 质量门槛

PR 必须满足以下条件才能合并：

```
✓ CI/CD 通过
  ├─ ESLint 无错误
  ├─ TypeScript 编译通过
  ├─ 单元测试通过 (coverage >= 80%)
  ├─ 集成测试通过
  ├─ E2E 测试通过
  └─ 构建成功

✓ 代码审查通过
  ├─ 至少 1 个核心贡献者审查
  ├─ 无 "请求更改" 评论
  └─ 所有评论已解决

✓ 自动检查通过
  ├─ 依赖安全扫描通过
  ├─ 代码克隆检测 < 5%
  ├─ 复杂度检查通过
  └─ 性能检查通过

✓ 文档完整
  ├─ 提交消息符合规范
  ├─ PR 描述完整
  ├─ 代码注释清晰
  └─ 相关文档已更新
```

---

## 文档标准

### 文档类型

#### 1. README

```markdown
# 项目名称

简短描述

## 快速开始

安装和基础使用说明

## 功能

主要功能列表

## 技术栈

使用的技术

## 贡献

贡献指南链接

## 许可证

许可证信息
```

#### 2. 内联代码注释

```typescript
// ✅ 好的注释

/**
 * 生成冒泡排序的动画步骤
 * @param data - 待排序数组
 * @param speed - 动画速度倍数 (默认 1)
 * @returns 动画步骤数组
 * @throws ValidationError 如果数据无效
 * @example
 * const steps = generateBubbleSortAnimation([3, 1, 2]);
 */
function generateBubbleSortAnimation(
  data: number[],
  speed: number = 1
): AnimationStep[] {
  // 输入验证
  if (!Array.isArray(data) || data.length === 0) {
    throw new ValidationError('data', 'Array must not be empty');
  }

  // 初始化步骤数组
  const steps: AnimationStep[] = [];
  
  // 主排序逻辑
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length - i - 1; j++) {
      // 比较相邻元素
      if (data[j] > data[j + 1]) {
        // 交换
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
      }
    }
  }

  return steps;
}

// ❌ 不好的注释

// 循环数组
for (let i = 0; i < arr.length; i++) { } // 显而易见

// x = y + 1 为什么？// 需要说明原因，不仅是"做什么"
```

#### 3. 更新日志 (CHANGELOG)

```markdown
# Changelog

所有对本项目的重要更改都在本文件中记录。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
本项目遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-03-02

### Added
- 播放速度控制功能
- 键盘快捷键 (+ 和 -)

### Changed
- 改进动画性能
- 重构可视化组件

### Fixed
- 修复动画计时问题
- 修复内存泄漏

### Security
- 更新依赖以修复安全漏洞

## [1.0.0] - 2026-02-01

### Added
- 初始发布
```

### 文档审查

所有文档 PR 必须通过以下检查：

- [ ] 拼写和语法正确
- [ ] 代码示例可运行
- [ ] 链接有效
- [ ] 格式一致
- [ ] 信息准确完整

---

## 安全政策

### 报告安全漏洞

**不要**在 public issues 中报告安全漏洞。

请通过以下方式报告：
- 邮件：security@example.com
- 使用 GitHub 安全公告：https://github.com/Look2046/DSA-with-Codex/security/advisories

**您会在 30 天内收到回复。**

### 安全更新流程

```
1. 收到安全报告
   ↓
2. 确认和评估
   ↓
3. 开发修复
   ↓
4. 内部测试
   ↓
5. 发布安全更新
   ↓
6. 公开披露
```

### 依赖安全

```bash
# 定期检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# 使用 Snyk 进行深层检查
npm install -g snyk
snyk test

# 在 CI/CD 中集成
# .github/workflows/security.yml
```

### 代码安全检查

```bash
# ESLint 安全规则
npm run lint -- --rule=security

# 依赖许可证检查
npm install -g license-check-and-gather
license-check-and-gather --production

# 敏感信息扫描
npm install -g git-secrets
git secrets --install
```

---

## 行为准则

### 我们的承诺

我们致力于提供一个欢迎、包容和安全的社区环境。

### 期望的行为

- 使用欢迎和包容的语言
- 尊重不同的观点和经历
- 接受建设性批评
- 专注于对社区最有益的事情
- 对其他社区成员表现出同情

### 不可接受的行为

- 骚扰、歧视或骚扰他人
- 发布他人的私人信息
- 其他可能被合理认为不适合职业环境的行为

### 执行

违反本行为准则的行为可能会导致：
1. 警告
2. 暂时禁言
3. 永久禁言

### 报告问题

如果您遇到不可接受的行为，请报告给：
- conduct@example.com
- 项目维护者

---

## 常见问题

### Q: 如何成为核心贡献者？

A: 
1. 至少提交 10 个已合并的 PR
2. 保持 3 个月的活跃贡献
3. 参加社区讨论
4. 向维护者申请
5. 通过核心贡献者投票（需要 2/3 同意）

### Q: PR 多久会被审查？

A: 通常在 3-5 个工作日内。关键修复优先处理。

### Q: 如何处理合并冲突？

A:
```bash
# 更新本地分支
git fetch origin
git rebase origin/develop

# 解决冲突
# 编辑冲突文件

# 标记为已解决
git add .
git rebase --continue

# 强制推送（谨慎！）
git push --force-with-lease
```

### Q: 我的 PR 被拒绝了怎么办？

A: 这是正常的！请：
1. 仔细阅读反馈
2. 讨论改进方案
3. 进行必要的修改
4. 重新提交

### Q: 如何报告安全漏洞？

A: 请发送邮件到 security@example.com，**不要**在 public issues 中讨论。

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，完整治理规范 |

---

**文档完成于 2026-03-02**  
**下一阶段**：请提示"继续"，我将输出第十二个也是最后一个文档：**PROJECT_ROADMAP.md**
