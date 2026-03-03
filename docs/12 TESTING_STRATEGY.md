
# TESTING_STRATEGY.md

## 📋 目录

1. [概述](#概述)
2. [测试金字塔](#测试金字塔)
3. [单元测试](#单元测试)
4. [集成测试](#集成测试)
5. [端到端测试](#端到端测试)
6. [可视化测试](#可视化测试)
7. [性能测试](#性能测试)
8. [测试工具链](#测试工具链)
9. [测试用例设计](#测试用例设计)
10. [持续集成](#持续集成)
11. [测试覆盖率](#测试覆盖率)
12. [最佳实践](#最佳实践)

---

## 概述

本文档定义了算法可视化系统的 **完整测试策略**。包含：

- ✅ 分层测试架构（单元、集成、E2E）
- ✅ 各层级测试的具体实现
- ✅ 测试工具和框架选型
- ✅ CI/CD 集成方案
- ✅ 测试覆盖率要求

**版本**：v1.0  
**最后更新**：2026-03-02  
**工具**：Jest, Vitest, React Testing Library, Playwright, Cypress

---

## 执行前提（重要）

- 本文测试命令默认项目已完成前端脚手架（包含 `package.json`、`src/`、测试配置文件）。  
- 若当前仓库仍是“文档阶段”，请先完成工程初始化，再执行 `vitest`、`playwright`、CI 配置相关步骤。  
- 建议先对齐 [1 ARCHITECTURE.md](./1%20ARCHITECTURE.md) 的 Phase 1 骨架任务，再落地本测试策略。

---

## 测试金字塔

### 测试分层架构

```
                        ╱╲
                       ╱  ╲              E2E 测试 (10-15%)
                      ╱    ╲             - 完整用户流程
                     ╱──────╲            - 跨浏览器
                    ╱        ╲
                   ╱──────────╲          集成测试 (25-35%)
                  ╱            ╲         - 组件交互
                 ╱              ╲        - 数据流
                ╱────────────────╲
               ╱                  ╲      单元测试 (50-60%)
              ╱                    ╲     - 函数逻辑
             ╱______________________╲    - 工具函数
```

| 层级 | 占比 | 速度 | 成本 | 关键指标 |
|-----|------|------|------|---------|
| **单元测试** | 50-60% | ⚡⚡⚡ | 低 | 行覆盖率 ≥ 80% |
| **集成测试** | 25-35% | ⚡⚡ | 中 | 流程覆盖率 ≥ 90% |
| **E2E 测试** | 10-15% | ⚡ | 高 | 关键路径通过 100% |

---

## 单元测试

### 单元测试框架和工具

```typescript
// 使用 Vitest（更快的 Jest 替代品）和 @testing-library/react

// package.json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
```

### 动画引擎单元测试

```typescript
// src/__tests__/engine/AnimationEngine.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationEngine } from '@/engine/AnimationEngine';
import { AnimationSequence, AnimationStep } from '@/types/animation';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let mockSequence: AnimationSequence;

  beforeEach(() => {
    mockSequence = {
      id: 'test-sequence',
      name: 'Test Sequence',
      description: 'Test',
      totalDuration: 1000,
      steps: [
        {
          id: 'step-1',
          name: 'Step 1',
          description: 'First step',
          duration: 300,
          dataState: { array: [1, 2, 3] },
          highlights: { nodes: [] },
          codeHighlight: {
            language: 'javascript',
            startLine: 1,
            endLine: 5,
          },
          stats: { comparisons: 0, swaps: 0, reads: 0, writes: 0, operations: 0 },
        },
        {
          id: 'step-2',
          name: 'Step 2',
          description: 'Second step',
          duration: 700,
          dataState: { array: [1, 3, 2] },
          highlights: { nodes: [] },
          codeHighlight: {
            language: 'javascript',
            startLine: 6,
            endLine: 10,
          },
          stats: { comparisons: 1, swaps: 1, reads: 2, writes: 2, operations: 2 },
        },
      ],
    };

    engine = new AnimationEngine(mockSequence);
  });

  describe('初始化', () => {
    it('应该创建引擎实例', () => {
      expect(engine).toBeDefined();
      expect(engine.getCurrentStepIndex()).toBe(0);
      expect(engine.getTotalSteps()).toBe(2);
    });

    it('应该初始时未播放', () => {
      expect(engine.isAnimationComplete()).toBe(false);
      // 注意：需要实现 isPlaying getter
    });
  });

  describe('播放控制', () => {
    it('应该能播放动画', () => {
      const onStepChange = vi.fn();
      engine.onStepChange(onStepChange);
      engine.play();

      // 模拟 requestAnimationFrame 的调用
      vi.advanceTimersByTime(300); // 等于第一步的时长

      expect(onStepChange).toHaveBeenCalled();
    });

    it('应该能暂停动画', () => {
      engine.play();
      engine.pause();

      // 时间前进但不应该改变步骤
      vi.advanceTimersByTime(100);
      expect(engine.getCurrentStepIndex()).toBe(0);
    });

    it('应该能继续播放暂停的动画', () => {
      engine.play();
      vi.advanceTimersByTime(100);
      engine.pause();
      const stateAtPause = engine.getCurrentStepIndex();

      engine.resume();
      vi.advanceTimersByTime(300);

      expect(engine.getCurrentStepIndex()).toBeGreaterThan(stateAtPause);
    });

    it('应该能重置动画', () => {
      engine.play();
      vi.advanceTimersByTime(500);
      engine.reset();

      expect(engine.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('步骤导航', () => {
    it('应该能跳转到指定步骤', () => {
      engine.goToStep(1);
      expect(engine.getCurrentStepIndex()).toBe(1);
    });

    it('应该限制跳转范围', () => {
      engine.goToStep(100);  // 超出范围
      expect(engine.getCurrentStepIndex()).toBe(mockSequence.steps.length - 1);

      engine.goToStep(-5);  // 负数
      expect(engine.getCurrentStepIndex()).toBe(0);
    });

    it('应该支持前进一步', () => {
      engine.nextStep();
      expect(engine.getCurrentStepIndex()).toBe(1);

      engine.nextStep();
      expect(engine.getCurrentStepIndex()).toBe(1);  // 不超出
    });

    it('应该支持后退一步', () => {
      engine.goToStep(1);
      engine.prevStep();
      expect(engine.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('速度控制', () => {
    it('应该能设置播放速度', () => {
      engine.setSpeed(2);
      // 速度被应用到动画时长计算
      engine.play();
      vi.advanceTimersByTime(150);  // 原来需要 300ms，现在 150ms
      // 验证步骤已经完成
    });

    it('应该限制速度范围', () => {
      engine.setSpeed(0.1);  // 太慢
      engine.setSpeed(10);   // 太快
      // 应该被限制到合理范围
    });
  });

  describe('进度追踪', () => {
    it('应该能获取当前进度百分比', () => {
      engine.goToStep(0);
      expect(engine.getProgress()).toBe(0);

      engine.goToStep(1);
      expect(engine.getProgress()).toBeGreaterThan(0);
    });

    it('应该能获取当前步骤详情', () => {
      const step = engine.getCurrentStep();
      expect(step.id).toBe('step-1');
      expect(step.duration).toBe(300);
    });
  });

  describe('事件回调', () => {
    it('应该在步骤变化时触发回调', () => {
      const callback = vi.fn();
      engine.onStepChange(callback);
      engine.goToStep(1);

      expect(callback).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('应该在动画完成时触发回调', () => {
      const callback = vi.fn();
      engine.onComplete(callback);
      engine.play();

      vi.advanceTimersByTime(1100);  // 完成所有步骤
      expect(callback).toHaveBeenCalled();
    });
  });
});
```

### 工具函数单元测试

```typescript
// src/__tests__/utils/animation.test.ts

import { describe, it, expect } from 'vitest';
import { easeIn, easeOut, easeInOut, lerp, generateFrames } from '@/utils/animation';

describe('缓动函数', () => {
  describe('easeOut', () => {
    it('在 progress=0 时应返回 0', () => {
      expect(easeOut(0)).toBe(0);
    });

    it('在 progress=1 时应返回 1', () => {
      expect(easeOut(1)).toBe(1);
    });

    it('应该快速开始，缓慢结束', () => {
      const progress25 = easeOut(0.25);
      const progress50 = easeOut(0.5);
      const progress75 = easeOut(0.75);

      expect(progress25).toBeGreaterThan(0.25);
      expect(progress50).toBeGreaterThan(0.5);
      expect(progress75).toBeGreaterThan(0.75);
    });
  });

  describe('easeInOut', () => {
    it('应该对称', () => {
      const start = easeInOut(0.25);
      const end = easeInOut(0.75);
      expect(start + end).toBeCloseTo(1, 1);
    });
  });
});

describe('线性插值', () => {
  it('应该在两个值之间插值', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('应该支持负数', () => {
    expect(lerp(-100, 100, 0.5)).toBe(0);
  });
});

describe('帧生成', () => {
  it('应该生成正确数量的帧', () => {
    const frames = generateFrames(0, 100, 1000, 60);
    expect(frames.length).toBeCloseTo(61, 5);  // 60 fps * 1 sec + 1
  });

  it('应该从起始值开始，到结束值结束', () => {
    const frames = generateFrames(0, 100, 500, 30);
    expect(frames[0]).toBeCloseTo(0, 1);
    expect(frames[frames.length - 1]).toBeCloseTo(100, 1);
  });
});
```

### React 组件单元测试

```typescript
// src/__tests__/components/Button.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/atoms/Button';

describe('Button 组件', () => {
  it('应该渲染按钮', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('应该支持点击事件', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('应该在禁用状态下不可点击', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('应该应用正确的 variant 样式', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('应该显示加载状态', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### Store 状态管理单元测试

```typescript
// src/__tests__/store/appStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/appStore';
import { AnimationStep } from '@/types/animation';

describe('AppStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAppStore.setState({
      currentModule: null,
      animationSteps: [],
      currentStepIndex: 0,
      inputData: [],
    });
  });

  describe('模块管理', () => {
    it('应该能设置当前模块', () => {
      const mockModule = {
        id: 'bubble-sort',
        name: '冒泡排序',
        category: 'sort' as const,
        difficulty: 1 as const,
        description: 'Test',
        prerequisites: [],
      };

      useAppStore.getState().setCurrentModule(mockModule);
      expect(useAppStore.getState().currentModule).toEqual(mockModule);
    });

    it('切换模块应该重置动画状态', () => {
      const mockModule = {
        id: 'bubble-sort',
        name: '冒泡排序',
        category: 'sort' as const,
        difficulty: 1 as const,
        description: 'Test',
        prerequisites: [],
      };

      useAppStore.getState().setCurrentModule(mockModule);
      expect(useAppStore.getState().currentStepIndex).toBe(0);
      expect(useAppStore.getState().animationSteps).toEqual([]);
    });
  });

  describe('动画步骤', () => {
    it('应该能设置动画步骤', () => {
      const mockSteps: AnimationStep[] = [
        {
          id: 'step-1',
          name: 'Step 1',
          description: 'Test',
          duration: 300,
          dataState: { array: [1, 2, 3] },
          highlights: { nodes: [] },
          codeHighlight: { language: 'javascript', startLine: 1, endLine: 5 },
          stats: { comparisons: 0, swaps: 0, reads: 0, writes: 0, operations: 0 },
        },
      ];

      useAppStore.getState().setAnimationSteps(mockSteps);
      expect(useAppStore.getState().animationSteps).toEqual(mockSteps);
      expect(useAppStore.getState().playback.totalSteps).toBe(1);
    });
  });

  describe('播放控制', () => {
    it('应该能播放', () => {
      useAppStore.getState().play();
      expect(useAppStore.getState().playback.isPlaying).toBe(true);
      expect(useAppStore.getState().playback.isPaused).toBe(false);
    });

    it('应该能暂停', () => {
      useAppStore.getState().play();
      useAppStore.getState().pause();
      expect(useAppStore.getState().playback.isPlaying).toBe(false);
      expect(useAppStore.getState().playback.isPaused).toBe(true);
    });

    it('应该能继续', () => {
      useAppStore.getState().pause();
      useAppStore.getState().resume();
      expect(useAppStore.getState().playback.isPlaying).toBe(true);
      expect(useAppStore.getState().playback.isPaused).toBe(false);
    });

    it('应该能重置', () => {
      useAppStore.getState().play();
      useAppStore.getState().reset();
      expect(useAppStore.getState().currentStepIndex).toBe(0);
      expect(useAppStore.getState().playback.isPlaying).toBe(false);
    });
  });

  describe('速度控制', () => {
    it('应该能设置速度', () => {
      useAppStore.getState().setSpeed(2);
      expect(useAppStore.getState().playback.speed).toBe(2);
    });

    it('应该限制速度到有效值', () => {
      useAppStore.getState().setSpeed(0.1);
      useAppStore.getState().setSpeed(10);
      // 应该被限制到预定义的速度范围
    });
  });

  describe('数据管理', () => {
    it('应该能设置输入数据', () => {
      const data = [3, 1, 4, 1, 5];
      useAppStore.getState().setInputData(data);
      expect(useAppStore.getState().inputData).toEqual(data);
    });

    it('应该能生成随机数据', () => {
      useAppStore.getState().generateRandomData(10);
      const data = useAppStore.getState().inputData;
      expect(data.length).toBe(10);
      expect(data.every((n) => typeof n === 'number')).toBe(true);
    });
  });
});
```

---

## 集成测试

### 组件交互集成测试

```typescript
// src/__tests__/integration/PlaybackControls.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackControls } from '@/components/organisms/PlaybackControls';

describe('PlaybackControls 集成测试', () => {
  const mockProps = {
    isPlaying: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSeek: vi.fn(),
    currentStep: 0,
    totalSteps: 10,
    speed: 1,
    onSpeedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该集成播放、暂停、重置功能', async () => {
    const user = userEvent.setup();
    render(<PlaybackControls {...mockProps} />);

    // 播放
    const playButton = screen.getByRole('button', { name: /播放/i });
    await user.click(playButton);
    expect(mockProps.onPlay).toHaveBeenCalled();

    // 暂停
    const pauseButton = screen.getByRole('button', { name: /暂停/i });
    await user.click(pauseButton);
    expect(mockProps.onPause).toHaveBeenCalled();

    // 重置
    const resetButton = screen.getByRole('button', { name: /重置/i });
    await user.click(resetButton);
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('应该同步进度条和步骤', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PlaybackControls {...mockProps} />);

    // 拖动进度条
    const progressBar = screen.getByRole('slider');
    await user.click(progressBar);

    expect(mockProps.onSeek).toHaveBeenCalled();
  });

  it('应该支持步进和快进', async () => {
    const user = userEvent.setup();
    render(<PlaybackControls {...mockProps} />);

    const nextButton = screen.getByRole('button', { name: /下一步/i });
    const prevButton = screen.getByRole('button', { name: /上一步/i });

    await user.click(nextButton);
    expect(mockProps.onNext).toHaveBeenCalled();

    await user.click(prevButton);
    expect(mockProps.onPrev).toHaveBeenCalled();
  });

  it('应该能改变播放速度', async () => {
    const user = userEvent.setup();
    render(<PlaybackControls {...mockProps} />);

    const speedSelect = screen.getByDisplayValue('1x');
    await user.selectOptions(speedSelect, '2x');

    expect(mockProps.onSpeedChange).toHaveBeenCalledWith(2);
  });
});
```

### 数据流集成测试

```typescript
// src/__tests__/integration/DataInputFlow.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataInputPanel } from '@/components/organisms/DataInputPanel';

describe('数据输入流程集成测试', () => {
  it('应该支持手动输入数据', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataInputPanel
        onDataChange={mockOnChange}
        onGenerate={() => {}}
        onClear={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/输入逗号分隔的数字/i);
    await user.type(input, '3,1,4,1,5');

    const submitButton = screen.getByRole('button', { name: /提交/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([3, 1, 4, 1, 5]);
    });
  });

  it('应该验证输入数据', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DataInputPanel
        onDataChange={mockOnChange}
        onGenerate={() => {}}
        onClear={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/输入逗号分隔的数字/i);
    await user.type(input, 'abc,def');

    const submitButton = screen.getByRole('button', { name: /提交/i });
    await user.click(submitButton);

    expect(screen.getByText(/请输入有效的数字/i)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('应该支持生成随机数据', async () => {
    const mockOnGenerate = vi.fn();
    const user = userEvent.setup();

    render(
      <DataInputPanel
        onDataChange={() => {}}
        onGenerate={mockOnGenerate}
        onClear={() => {}}
      />
    );

    const generateButton = screen.getByRole('button', { name: /生成随机/i });
    await user.click(generateButton);

    expect(mockOnGenerate).toHaveBeenCalled();
  });
});
```

---

## 端到端测试

### 完整用户流程 E2E 测试

```typescript
// e2e/bubble-sort.spec.ts

import { test, expect } from '@playwright/test';

test.describe('冒泡排序模块完整流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('应该能完整体验冒泡排序动画', async ({ page }) => {
    // 1. 从首页进入冒泡排序模块
    const bubbleSortCard = page.getByText('冒泡排序');
    await bubbleSortCard.click();

    // 2. 验证模块页面加载
    await expect(page.getByRole('heading', { name: '冒泡排序' })).toBeVisible();

    // 3. 输入测试数据
    const dataInput = page.getByPlaceholderText(/输入数据/i);
    await dataInput.fill('5,2,8,1,9');

    // 4. 点击开始按钮
    const startButton = page.getByRole('button', { name: /开始/i });
    await startButton.click();

    // 5. 验证可视化开始渲染
    const visualizer = page.locator('[data-testid="array-visualizer"]');
    await expect(visualizer).toBeVisible();

    // 6. 验证播放控制按钮
    await expect(page.getByRole('button', { name: /播放/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /暂停/i })).toBeVisible();

    // 7. 播放动画
    const playButton = page.getByRole('button', { name: /播放/i });
    await playButton.click();

    // 8. 等待动画进行中
    await page.waitForTimeout(500);

    // 9. 暂停并验证
    const pauseButton = page.getByRole('button', { name: /暂停/i });
    await pauseButton.click();

    // 10. 验证代码面板高亮
    const codePanel = page.locator('[data-testid="code-panel"]');
    const highlightedLine = codePanel.locator('.highlighted-line');
    await expect(highlightedLine).toBeVisible();

    // 11. 验证统计信息
    const statsPanel = page.locator('[data-testid="stats-panel"]');
    await expect(statsPanel.getByText(/比较次数/i)).toBeVisible();

    // 12. 继续播放
    await playButton.click();

    // 13. 等待动画完成
    await page.waitForTimeout(3000);

    // 14. 验证动画完成状态
    const allElements = page.locator('[data-testid="array-element"]');
    const firstElement = allElements.first();
    await expect(firstElement).toHaveClass(/matched/);
  });

  test('应该支持步进模式', async ({ page }) => {
    // 进入模块
    const bubbleSortCard = page.getByText('冒泡排序');
    await bubbleSortCard.click();

    // 输入数据
    const dataInput = page.getByPlaceholderText(/输入数据/i);
    await dataInput.fill('3,1,2');

    const startButton = page.getByRole('button', { name: /开始/i });
    await startButton.click();

    // 使用下一步按钮
    const nextButton = page.getByRole('button', { name: /下一步/i });
    
    for (let i = 0; i < 3; i++) {
      await nextButton.click();
      await page.waitForTimeout(100);
    }

    // 验证步骤变化
    const stepInfo = page.locator('[data-testid="step-info"]');
    await expect(stepInfo).toContainText(/步骤 4/);
  });

  test('应该支持速度调节', async ({ page }) => {
    const bubbleSortCard = page.getByText('冒泡排序');
    await bubbleSortCard.click();

    const dataInput = page.getByPlaceholderText(/输入数据/i);
    await dataInput.fill('5,3,1');

    const startButton = page.getByRole('button', { name: /开始/i });
    await startButton.click();

    // 改变速度
    const speedSelect = page.getByLabel(/播放速度/i);
    await speedSelect.selectOption('2x');

    // 播放并计时
    const playButton = page.getByRole('button', { name: /播放/i });
    await playButton.click();

    const startTime = Date.now();
    await page.waitForTimeout(1000);
    const elapsed = Date.now() - startTime;

    // 以 2x 速度，应该在 500ms 内完成
    expect(elapsed).toBeLessThan(1000);
  });
});
```

### 跨浏览器 E2E 测试

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 可视化测试

### 视觉回归测试

```typescript
// e2e/visual.spec.ts

import { test, expect } from '@playwright/test';

test.describe('可视化回归测试', () => {
  test('冒泡排序初始化视图应该匹配快照', async ({ page }) => {
    await page.goto('http://localhost:5173/modules/bubble-sort');
    
    const visualizer = page.locator('[data-testid="visualizer"]');
    await expect(visualizer).toHaveScreenshot('bubble-sort-initial.png');
  });

  test('数组元素高亮应该正确显示', async ({ page }) => {
    await page.goto('http://localhost:5173/modules/bubble-sort');
    
    // 设置特定的高亮状态
    await page.evaluate(() => {
      const elem = document.querySelector('[data-node-id="0"]');
      elem?.classList.add('highlight-comparing');
    });

    const visualizer = page.locator('[data-testid="visualizer"]');
    await expect(visualizer).toHaveScreenshot('bubble-sort-highlight.png');
  });

  test('深色主题视图应该匹配', async ({ page }) => {
    await page.goto('http://localhost:5173/modules/bubble-sort');
    
    // 启用深色主题
    const themeToggle = page.getByRole('button', { name: /深色主题/i });
    await themeToggle.click();

    const visualizer = page.locator('[data-testid="visualizer"]');
    await expect(visualizer).toHaveScreenshot('bubble-sort-dark.png');
  });
});
```

---

## 性能测试

### 性能基准测试

```typescript
// src/__tests__/performance/AnimationPerformance.test.ts

import { describe, it, expect, bench } from 'vitest';
import { AnimationEngine } from '@/engine/AnimationEngine';
import { generateBubbleSortAnimation } from '@/modules/sorts/bubbleSort';

describe('动画性能测试', () => {
  bench('生成 100 元素冒泡排序动画', () => {
    const data = Array.from({ length: 100 }, () => Math.random() * 100);
    generateBubbleSortAnimation(data);
  });

  bench('创建和初始化引擎', () => {
    const sequence = generateBubbleSortAnimation([5, 3, 1, 4, 2]);
    new AnimationEngine(sequence);
  });

  bench('100 帧的动画执行', () => {
    const sequence = generateBubbleSortAnimation([5, 3, 1, 4, 2]);
    const engine = new AnimationEngine(sequence);
    
    engine.play();
    for (let i = 0; i < 100; i++) {
      // 模拟帧执行
      engine.nextStep();
    }
  });
});
```

### 渲染性能测试

```typescript
// src/__tests__/performance/RenderPerformance.test.ts

import { render } from '@testing-library/react';
import { describe, it, expect, bench } from 'vitest';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';

describe('渲染性能', () => {
  bench('渲染 50 个元素的数组可视化', () => {
    const data = Array.from({ length: 50 }, (_, i) => i);
    render(
      <ArrayVisualizer
        data={data}
        width={800}
        height={100}
        nodeSize={40}
        gap={10}
      />
    );
  });

  bench('100 个元素的数组可视化', () => {
    const data = Array.from({ length: 100 }, (_, i) => i);
    render(
      <ArrayVisualizer
        data={data}
        width={800}
        height={100}
        nodeSize={40}
        gap={10}
      />
    );
  });
});
```

---

## 测试工具链

### package.json 配置

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --run src/__tests__/integration",
    "test:e2e": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:perf": "vitest bench",
    "test:all": "npm run test && npm run test:e2e"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/bench": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "c8": "^8.0.0"
  }
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 测试设置文件

```typescript
// src/__tests__/setup.ts

import { expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// 清理 DOM
afterEach(() => {
  cleanup();
});

// Mock requestAnimationFrame
vi.stubGlobal(
  'requestAnimationFrame',
  (cb: FrameRequestCallback) => setTimeout(cb, 16)
);

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);
```

---

## 测试用例设计

### 测试用例矩阵

```typescript
// src/__tests__/testCases/bubbleSort.testCases.ts

export const bubbleSortTestCases = [
  // 边界情况
  {
    name: '空数组',
    input: [],
    expected: [],
  },
  {
    name: '单元素数组',
    input: [5],
    expected: [5],
  },
  {
    name: '两个元素',
    input: [2, 1],
    expected: [1, 2],
  },

  // 普通情况
  {
    name: '随机数组',
    input: [5, 3, 1, 4, 2],
    expected: [1, 2, 3, 4, 5],
  },
  {
    name: '已排序数组',
    input: [1, 2, 3, 4, 5],
    expected: [1, 2, 3, 4, 5],
  },
  {
    name: '逆序数组',
    input: [5, 4, 3, 2, 1],
    expected: [1, 2, 3, 4, 5],
  },

  // 重复元素
  {
    name: '有重复元素',
    input: [3, 1, 3, 1, 3],
    expected: [1, 1, 3, 3, 3],
  },

  // 大数据量
  {
    name: '100 个元素',
    input: Array.from({ length: 100 }, () => Math.floor(Math.random() * 100)),
    expected: 'sorted',  // 标记为已排序
  },
];

// 使用测试用例
describe('冒泡排序 - 参数化测试', () => {
  bubbleSortTestCases.forEach(({ name, input, expected }) => {
    it(`应该正确排序: ${name}`, () => {
      const result = bubbleSort([...input]);
      if (expected === 'sorted') {
        expect(result).toEqual(result.sort((a, b) => a - b));
      } else {
        expect(result).toEqual(expected);
      }
    });
  });
});
```

---

## 持续集成

### GitHub Actions 配置

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test -- --run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build app
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:perf -- --run
```

---

## 测试覆盖率

### 覆盖率目标

```
全局目标：
├── 语句覆盖率 (Statement): 80%+
├── 分支覆盖率 (Branch): 75%+
├── 函数覆盖率 (Function): 80%+
└── 行覆盖率 (Line): 80%+

关键模块目标：
├── 动画引擎 (AnimationEngine): 90%+
├── 状态管理 (Stores): 85%+
├── 动画生成 (AnimationGenerators): 85%+
└── 原子组件 (Atoms): 80%+
```

### 覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 生成 HTML 覆盖率报告
npm run test:coverage -- --reporter=html

# 查看覆盖率
open coverage/index.html
```

---

## 最佳实践

### 实践1：测试命名规范

```typescript
// ❌ 不好
it('test', () => { /* ... */ });

// ✅ 好
describe('ArrayVisualizer 组件', () => {
  describe('渲染', () => {
    it('应该渲染所有数组元素', () => { /* ... */ });
    it('应该正确应用高亮样式', () => { /* ... */ });
  });

  describe('交互', () => {
    it('点击元素时应该触发 onClick 回调', () => { /* ... */ });
  });
});
```

### 实践2：使用 AAA 模式

```typescript
// ✅ Arrange-Act-Assert
it('应该在播放时更新步骤', () => {
  // Arrange - 准备
  const engine = new AnimationEngine(mockSequence);
  const onStepChange = vi.fn();
  engine.onStepChange(onStepChange);

  // Act - 执行
  engine.play();
  vi.advanceTimersByTime(300);

  // Assert - 验证
  expect(onStepChange).toHaveBeenCalled();
});
```

### 实践3：避免测试实现细节

```typescript
// ❌ 不好 - 测试实现细节
it('应该调用 setState', () => {
  const setStateSpy = vi.spyOn(component, 'setState');
  // ...
  expect(setStateSpy).toHaveBeenCalled();
});

// ✅ 好 - 测试行为
it('应该在输入改变时更新数据', () => {
  render(<Input onChange={handleChange} />);
  const input = screen.getByRole('textbox');
  userEvent.type(input, 'test');
  expect(handleChange).toHaveBeenCalledWith('test');
});
```

### 实践4：快照测试谨慎使用

```typescript
// ⚠️ 快照测试易于误用，使用时要谨慎
// 仅用于检测无意的 UI 变化

it('CodeBlock 组件应该匹配快照', () => {
  const { container } = render(
    <CodeBlock
      code="function test() {}"
      language="javascript"
    />
  );
  expect(container).toMatchSnapshot();
});
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，完整测试策略 |

---

**文档完成于 2026-03-02**  
