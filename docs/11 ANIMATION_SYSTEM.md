
# ANIMATION_SYSTEM.md

## 📋 目录

1. [概述](#概述)
2. [动画架构](#动画架构)
3. [动画步骤定义](#动画步骤定义)
4. [动画执行引擎](#动画执行引擎)
5. [插值系统](#插值系统)
6. [缓动函数](#缓动函数)
7. [节点动画](#节点动画)
8. [边动画](#边动画)
9. [同步与协调](#同步与协调)
10. [性能优化](#性能优化)
11. [调试工具](#调试工具)
12. [最佳实践](#最佳实践)

---

## 概述

本文档定义了整个算法可视化系统的 **动画系统架构**。包含：

- ✅ 动画基础架构和数据结构
- ✅ 动画步骤的定义和生成
- ✅ 高性能动画执行引擎
- ✅ 灵活的插值和缓动系统
- ✅ 节点、边、文本的动画支持
- ✅ 动画同步和协调机制

**版本**：v1.0  
**最后更新**：2026-03-02  
**技术**：requestAnimationFrame, Canvas/SVG, 帧插值

---

## 动画架构

### 核心概念

```
┌─────────────────────────────────────────────────────┐
│           动画系统架构 (Animation System)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌──────────────┐             │
│  │ 动画步骤      │      │ 动画执行引擎  │             │
│  │ Animation    │  →   │ Animation    │             │
│  │ Step         │      │ Engine       │             │
│  └──────────────┘      └──────────────┘             │
│         ↓                      ↓                    │
│  ┌──────────────────────────────────────┐           │
│  │    插值系统 (Interpolation)           │           │
│  │    缓动函数 (Easing Functions)       │           │
│  └──────────────────────────────────────┘           │
│         ↓                                           │
│  ┌──────────────────────────────────────┐           │
│  │  渲染系统 (Canvas/SVG Rendering)      │           │
│  └──────────────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 动画类型

| 类型 | 用途 | 示例 |
|-----|------|------|
| **位置动画** | 节点/元素移动 | 排序时元素交换位置 |
| **颜色动画** | 节点颜色变化 | 比较→移动→完成 |
| **缩放动画** | 节点大小变化 | 强调特定元素 |
| **旋转动画** | 元素旋转 | 树旋转（AVL树） |
| **透明度动画** | 淡入/淡出 | 节点删除/新建 |
| **文本动画** | 文本内容变化 | 数值更新 |
| **路径动画** | 沿路径移动 | 图遍历 |

---

## 动画步骤定义

### AnimationStep 类型定义

```typescript
// src/types/animation.ts

/**
 * 高亮类型 - 对应 COLOR_PALETTE.md 中的语义色
 */
export type HighlightType =
  | 'comparing'    // 黄色 - 正在比较
  | 'moving'       // 绿色 - 正在移动
  | 'visiting'     // 蓝色 - 当前访问
  | 'matched'      // 紫色 - 已匹配/完成
  | 'newNode'      // 金色 - 新建节点
  | 'idle'         // 灰色 - 默认状态
  | 'deleted'      // 淡红 - 已删除
  | 'error';       // 红色 - 错误

/**
 * 节点高亮信息
 */
export interface NodeHighlight {
  nodeId: string | number;
  type: HighlightType;
  label?: string;  // 额外的标签显示
  intensity?: number;  // 0-1，强度（用于闪烁效果）
}

/**
 * 边高亮信息
 */
export interface EdgeHighlight {
  edgeId: string;
  type: HighlightType;
  animated?: boolean;  // 是否显示动画流（箭头移动）
  flowDirection?: 'forward' | 'backward';
}

/**
 * 代码高亮信息
 */
export interface CodeHighlight {
  language: 'javascript' | 'python' | 'pseudocode';
  startLine: number;
  endLine: number;
  description?: string;  // 解释这段代码的作用
}

/**
 * 统计信息
 */
export interface AnimationStats {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  operations: number;
  [key: string]: number;
}

/**
 * 单个动画步骤
 */
export interface AnimationStep {
  // 基础信息
  id: string;  // 唯一标识，格式：step-1-initial, step-2-compare
  name: string;  // 显示给用户的名称，例如"初始化"
  description: string;  // 详细描述，例如"创建包含5个元素的数组"
  
  // 动画参数
  duration: number;  // 毫秒，动画时长
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  delay?: number;  // 毫秒，延迟时间
  
  // 数据状态 - 这一步之后的数据状态快照
  dataState: {
    nodes: VisualizationNode[];
    edges?: VisualizationEdge[];
    array?: any[];  // 对于数组可视化
    [key: string]: any;
  };
  
  // 高亮信息
  highlights: {
    nodes: NodeHighlight[];
    edges?: EdgeHighlight[];
  };
  
  // 代码同步
  codeHighlight: CodeHighlight;
  
  // 统计信息
  stats: AnimationStats;
  
  // 可选的自定义回调
  onStart?: () => void;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;  // 0-1
}

/**
 * 完整的动画序列
 */
export interface AnimationSequence {
  id: string;  // 模块ID
  name: string;  // 模块名称
  description: string;
  totalDuration: number;  // 总时长（毫秒）
  steps: AnimationStep[];
  metadata?: {
    algorithm: string;
    dataSize: number;
    generatedAt: number;
  };
}

/**
 * 可视化节点
 */
export interface VisualizationNode {
  id: string | number;
  value: any;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  color?: string;  // 节点颜色
  label?: string;  // 显示的标签
  metadata?: Record<string, any>;
}

/**
 * 可视化边
 */
export interface VisualizationEdge {
  id: string;
  from: string | number;
  to: string | number;
  weight?: number;
  color?: string;
  animated?: boolean;
  metadata?: Record<string, any>;
}
```

### 动画步骤生成示例

```typescript
// src/modules/sorts/bubbleSort.ts

import { AnimationStep, AnimationSequence } from '@/types/animation';

/**
 * 生成冒泡排序的动画步骤
 */
export function generateBubbleSortAnimation(
  data: number[]
): AnimationSequence {
  const steps: AnimationStep[] = [];
  const n = data.length;
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  // Step 1: 初始化
  steps.push({
    id: `step-${stepId++}-initial`,
    name: '初始化',
    description: `创建包含 ${n} 个元素的数组：[${data.join(', ')}]`,
    duration: 500,
    easing: 'easeOut',
    dataState: {
      array: [...data],
      nodes: data.map((val, idx) => ({
        id: idx,
        value: val,
        position: { x: 100 + idx * 60, y: 200 },
        size: { width: 50, height: 50 },
      })),
    },
    highlights: {
      nodes: [],  // 无高亮
      edges: [],
    },
    codeHighlight: {
      language: 'javascript',
      startLine: 1,
      endLine: 3,
      description: '初始化数组和指针',
    },
    stats: {
      comparisons: 0,
      swaps: 0,
      reads: n,
      writes: 0,
      operations: n,
    },
  });

  // Step 2-N: 比较和交换
  let arr = [...data];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // 步骤：准备比较
      steps.push({
        id: `step-${stepId++}-compare-${i}-${j}`,
        name: `比较第 ${j} 和 ${j + 1} 个元素`,
        description: `比较 ${arr[j]} 和 ${arr[j + 1]}`,
        duration: 300,
        easing: 'linear',
        dataState: {
          array: [...arr],
          nodes: arr.map((val, idx) => ({
            id: idx,
            value: val,
            position: { x: 100 + idx * 60, y: 200 },
            size: { width: 50, height: 50 },
          })),
        },
        highlights: {
          nodes: [
            { nodeId: j, type: 'comparing' },
            { nodeId: j + 1, type: 'comparing' },
          ],
        },
        codeHighlight: {
          language: 'javascript',
          startLine: 5,
          endLine: 6,
          description: '比较相邻两个元素',
        },
        stats: {
          comparisons: ++comparisons,
          swaps,
          reads: 2,
          writes: 0,
          operations: comparisons + swaps,
        },
      });

      // 如果需要交换
      if (arr[j] > arr[j + 1]) {
        // 步骤：执行交换
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        steps.push({
          id: `step-${stepId++}-swap-${i}-${j}`,
          name: `交换第 ${j} 和 ${j + 1} 个元素`,
          description: `交换 ${arr[j + 1]} 和 ${arr[j]}`,
          duration: 400,
          easing: 'easeInOut',
          dataState: {
            array: [...arr],
            nodes: arr.map((val, idx) => ({
              id: idx,
              value: val,
              position: { x: 100 + idx * 60, y: 200 },
              size: { width: 50, height: 50 },
            })),
          },
          highlights: {
            nodes: [
              { nodeId: j, type: 'moving' },
              { nodeId: j + 1, type: 'moving' },
            ],
          },
          codeHighlight: {
            language: 'javascript',
            startLine: 7,
            endLine: 9,
            description: '交换两个元素',
          },
          stats: {
            comparisons,
            swaps: ++swaps,
            reads: 2,
            writes: 2,
            operations: comparisons + swaps,
          },
        });
      }
    }

    // 步骤：标记已排序
    steps.push({
      id: `step-${stepId++}-mark-sorted-${i}`,
      name: `第 ${i + 1} 遍完成`,
      description: `第 ${i + 1} 大的元素已到位置`,
      duration: 200,
      easing: 'easeOut',
      dataState: {
        array: [...arr],
        nodes: arr.map((val, idx) => ({
          id: idx,
          value: val,
          position: { x: 100 + idx * 60, y: 200 },
          size: { width: 50, height: 50 },
        })),
      },
      highlights: {
        nodes: Array.from({ length: n - i }, (_, k) => ({
          nodeId: n - 1 - k,
          type: 'matched' as HighlightType,
        })),
      },
      codeHighlight: {
        language: 'javascript',
        startLine: 2,
        endLine: 3,
        description: '外层循环继续',
      },
      stats: {
        comparisons,
        swaps,
        reads: 0,
        writes: 0,
        operations: comparisons + swaps,
      },
    });
  }

  // 最后一步：完成
  steps.push({
    id: `step-${stepId++}-complete`,
    name: '排序完成',
    description: `数组已按升序排序：[${arr.join(', ')}]`,
    duration: 300,
    easing: 'easeOut',
    dataState: {
      array: [...arr],
      nodes: arr.map((val, idx) => ({
        id: idx,
        value: val,
        position: { x: 100 + idx * 60, y: 200 },
        size: { width: 50, height: 50 },
      })),
    },
    highlights: {
      nodes: arr.map((_, idx) => ({
        nodeId: idx,
        type: 'matched' as HighlightType,
      })),
    },
    codeHighlight: {
      language: 'javascript',
      startLine: 11,
      endLine: 12,
      description: '返回排序结果',
    },
    stats: {
      comparisons,
      swaps,
      reads: n,
      writes: swaps,
      operations: comparisons + swaps,
    },
  });

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  return {
    id: 'bubble-sort-demo',
    name: '冒泡排序',
    description: '通过重复遍历数组，比较相邻元素并交换，逐步排序',
    totalDuration,
    steps,
    metadata: {
      algorithm: 'Bubble Sort',
      dataSize: n,
      generatedAt: Date.now(),
    },
  };
}
```

---

## 动画执行引擎

### 核心引擎

```typescript
// src/engine/AnimationEngine.ts

import { AnimationSequence, AnimationStep } from '@/types/animation';

/**
 * 动画执行引擎
 * 负责：
 * 1. 管理动画播放状态
 * 2. 处理逐帧更新
 * 3. 同步代码高亮和数据状态
 * 4. 支持暂停/继续/跳转
 */
export class AnimationEngine {
  private sequence: AnimationSequence;
  private currentStepIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private speed: number = 1;
  
  private frameId: number | null = null;
  private currentStepStartTime: number = 0;
  private pausedTime: number = 0;
  
  private onStepChange?: (stepIndex: number, step: AnimationStep) => void;
  private onProgressUpdate?: (progress: number) => void;
  private onComplete?: () => void;

  constructor(sequence: AnimationSequence) {
    this.sequence = sequence;
  }

  /**
   * 播放动画
   */
  play(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.currentStepStartTime = performance.now();
    this.pausedTime = 0;

    this.animate();
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isPaused = true;
    this.pausedTime = performance.now();
  }

  /**
   * 继续播放
   */
  resume(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    // 调整开始时间，补偿暂停的时间
    const pauseDuration = performance.now() - this.pausedTime;
    this.currentStepStartTime += pauseDuration;

    this.animate();
  }

  /**
   * 停止并重置
   */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStepIndex = 0;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.updateStep(0);
  }

  /**
   * 跳转到指定步骤
   */
  goToStep(stepIndex: number): void {
    const boundedIndex = Math.max(0, Math.min(stepIndex, this.sequence.steps.length - 1));
    this.currentStepIndex = boundedIndex;
    this.currentStepStartTime = performance.now();
    this.updateStep(boundedIndex);
  }

  /**
   * 下一步
   */
  nextStep(): void {
    if (this.currentStepIndex < this.sequence.steps.length - 1) {
      this.goToStep(this.currentStepIndex + 1);
    }
  }

  /**
   * 上一步
   */
  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex - 1);
    }
  }

  /**
   * 设置播放速度
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * 核心动画循环
   */
  private animate(): void {
    if (!this.isPlaying || this.isPaused) return;

    const now = performance.now();
    const currentStep = this.sequence.steps[this.currentStepIndex];
    
    // 计算当前步骤的进度（0-1）
    const elapsedTime = now - this.currentStepStartTime;
    const adjustedDuration = currentStep.duration / this.speed;
    const progress = Math.min(elapsedTime / adjustedDuration, 1);

    // 更新进度
    this.onProgressUpdate?.(progress);

    // 步骤完成，移动到下一步
    if (progress >= 1) {
      this.currentStepIndex++;

      if (this.currentStepIndex >= this.sequence.steps.length) {
        // 动画序列完成
        this.isPlaying = false;
        this.onComplete?.();
        return;
      }

      // 移动到下一步
      this.currentStepStartTime = now;
      this.updateStep(this.currentStepIndex);
      this.frameId = requestAnimationFrame(() => this.animate());
    } else {
      this.frameId = requestAnimationFrame(() => this.animate());
    }
  }

  /**
   * 更新当前步骤
   */
  private updateStep(stepIndex: number): void {
    if (stepIndex >= this.sequence.steps.length) return;

    const step = this.sequence.steps[stepIndex];
    this.onStepChange?.(stepIndex, step);
  }

  /**
   * 注册回调
   */
  onStepChange(callback: (stepIndex: number, step: AnimationStep) => void): void {
    this.onStepChange = callback;
  }

  onProgressUpdate(callback: (progress: number) => void): void {
    this.onProgressUpdate = callback;
  }

  onComplete(callback: () => void): void {
    this.onComplete = callback;
  }

  /**
   * 获取当前状态
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  getCurrentStep(): AnimationStep {
    return this.sequence.steps[this.currentStepIndex];
  }

  getTotalSteps(): number {
    return this.sequence.steps.length;
  }

  getProgress(): number {
    return (this.currentStepIndex / this.sequence.steps.length) * 100;
  }

  isAnimationComplete(): boolean {
    return this.currentStepIndex >= this.sequence.steps.length - 1 && !this.isPlaying;
  }
}
```

### React Hook 集成

```typescript
// src/hooks/useAnimationEngine.ts

import { useEffect, useRef, useCallback, useState } from 'react';
import { AnimationEngine } from '@/engine/AnimationEngine';
import { AnimationSequence, AnimationStep } from '@/types/animation';

interface UseAnimationEngineReturn {
  currentStep: AnimationStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSpeed: (speed: number) => void;
}

export const useAnimationEngine = (
  sequence: AnimationSequence | null
): UseAnimationEngineReturn => {
  const engineRef = useRef<AnimationEngine | null>(null);
  const [currentStep, setCurrentStep] = useState<AnimationStep | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // 创建或更新引擎
  useEffect(() => {
    if (!sequence) {
      engineRef.current = null;
      return;
    }

    const engine = new AnimationEngine(sequence);

    engine.onStepChange((stepIndex, step) => {
      setCurrentStepIndex(stepIndex);
      setCurrentStep(step);
      setProgress((stepIndex / sequence.steps.length) * 100);
    });

    engine.onProgressUpdate((prog) => {
      // 可选：更新帧级别的进度
    });

    engine.onComplete(() => {
      setIsPlaying(false);
      setProgress(100);
    });

    engineRef.current = engine;
    setTotalSteps(sequence.steps.length);
    setCurrentStep(sequence.steps[0]);

    return () => {
      engine.stop();
    };
  }, [sequence]);

  const play = useCallback(() => {
    engineRef.current?.play();
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setProgress(0);
  }, []);

  const goToStep = useCallback((index: number) => {
    engineRef.current?.goToStep(index);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const nextStep = useCallback(() => {
    engineRef.current?.nextStep();
    setIsPlaying(false);
  }, []);

  const prevStep = useCallback(() => {
    engineRef.current?.prevStep();
    setIsPlaying(false);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    engineRef.current?.setSpeed(speed);
  }, []);

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isPaused,
    progress,
    play,
    pause,
    resume,
    stop,
    goToStep,
    nextStep,
    prevStep,
    setSpeed,
  };
};

// 使用示例
const Component = () => {
  const sequence = useAppStore((state) => state.animationSteps);
  const { currentStep, isPlaying, play, pause } = useAnimationEngine(sequence);

  return (
    <div>
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? '暂停' : '播放'}
      </button>
      {currentStep && <p>{currentStep.name}</p>}
    </div>
  );
};
```

---

## 插值系统

### 动画数值插值

```typescript
// src/engine/interpolation.ts

/**
 * 插值器基类
 */
abstract class Interpolator<T> {
  abstract interpolate(from: T, to: T, progress: number): T;
}

/**
 * 数值插值
 */
export class NumberInterpolator extends Interpolator<number> {
  interpolate(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }
}

/**
 * 点坐标插值（用于位置动画）
 */
export class PointInterpolator extends Interpolator<{ x: number; y: number }> {
  interpolate(
    from: { x: number; y: number },
    to: { x: number; y: number },
    progress: number
  ): { x: number; y: number } {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }
}

/**
 * 颜色插值（RGB格式）
 */
export class ColorInterpolator extends Interpolator<string> {
  // 将十六进制颜色转换为RGB
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }

  // 将RGB转换为十六进制
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  interpolate(from: string, to: string, progress: number): string {
    const [r1, g1, b1] = this.hexToRgb(from);
    const [r2, g2, b2] = this.hexToRgb(to);

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return this.rgbToHex(r, g, b);
  }
}

/**
 * 对象插值（用于复杂对象）
 */
export class ObjectInterpolator<T extends Record<string, any>> extends Interpolator<T> {
  private interpolators: Map<string, Interpolator<any>> = new Map();

  registerInterpolator<K extends keyof T>(key: K, interpolator: Interpolator<T[K]>): void {
    this.interpolators.set(String(key), interpolator);
  }

  interpolate(from: T, to: T, progress: number): T {
    const result = {} as T;

    for (const key in from) {
      const interpolator = this.interpolators.get(key);

      if (interpolator) {
        result[key] = interpolator.interpolate(from[key], to[key], progress);
      } else if (typeof from[key] === 'number') {
        result[key] = from[key] + (to[key] - from[key]) * progress as any;
      } else {
        result[key] = from[key];
      }
    }

    return result;
  }
}

/**
 * 补间动画工具函数
 */
export const tween = {
  /**
   * 数值补间
   */
  number: (from: number, to: number, progress: number): number => {
    return new NumberInterpolator().interpolate(from, to, progress);
  },

  /**
   * 点坐标补间
   */
  point: (
    from: { x: number; y: number },
    to: { x: number; y: number },
    progress: number
  ) => {
    return new PointInterpolator().interpolate(from, to, progress);
  },

  /**
   * 颜色补间
   */
  color: (from: string, to: string, progress: number): string => {
    return new ColorInterpolator().interpolate(from, to, progress);
  },
};
```

---

## 缓动函数

### 标准缓动函数库

```typescript
// src/engine/easing.ts

/**
 * 缓动函数
 * 输入：progress (0-1)
 * 输出：缓动后的 progress (0-1)
 */

export const easingFunctions = {
  /**
   * 线性
   */
  linear: (t: number): number => t,

  /**
   * 平方缓入
   */
  easeInQuad: (t: number): number => t * t,

  /**
   * 平方缓出
   */
  easeOutQuad: (t: number): number => t * (2 - t),

  /**
   * 平方缓入缓出
   */
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * 立方缓入
   */
  easeInCubic: (t: number): number => t * t * t,

  /**
   * 立方缓出
   */
  easeOutCubic: (t: number): number => {
    const f = t - 1;
    return f * f * f + 1;
  },

  /**
   * 立方缓入缓出
   */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,

  /**
   * 弹性缓出（反弹效果）
   */
  easeOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  },

  /**
   * 回弹缓出
   */
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  /**
   * 加速度缓入
   */
  easeInQuart: (t: number): number => t * t * t * t,

  /**
   * 加速度缓出
   */
  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
};

export type EasingFunctionName = keyof typeof easingFunctions;

/**
 * 获取缓动函数
 */
export const getEasingFunction = (name: string): ((t: number) => number) => {
  return easingFunctions[name as EasingFunctionName] || easingFunctions.linear;
};
```

---

## 节点动画

### 节点位置、颜色、大小动画

```typescript
// src/engine/nodeAnimation.ts

import { VisualizationNode } from '@/types/animation';
import { tween } from './interpolation';
import { getEasingFunction } from './easing';

export interface NodeAnimationFrame {
  position: { x: number; y: number };
  color: string;
  size: { width: number; height: number };
  opacity: number;
  scale: number;
  rotation: number;
}

/**
 * 计算节点在指定进度下的动画帧数据
 */
export const computeNodeAnimationFrame = (
  fromNode: VisualizationNode & { color?: string; opacity?: number; scale?: number },
  toNode: VisualizationNode & { color?: string; opacity?: number; scale?: number },
  progress: number,
  easing: string = 'easeInOutCubic'
): NodeAnimationFrame => {
  const easingFunc = getEasingFunction(easing);
  const easedProgress = easingFunc(progress);

  const fromPosition = fromNode.position || { x: 0, y: 0 };
  const toPosition = toNode.position || { x: 0, y: 0 };

  const fromSize = fromNode.size || { width: 40, height: 40 };
  const toSize = toNode.size || { width: 40, height: 40 };

  const fromColor = fromNode.color || '#3B82F6';
  const toColor = toNode.color || '#3B82F6';

  const fromOpacity = fromNode.opacity ?? 1;
  const toOpacity = toNode.opacity ?? 1;

  const fromScale = fromNode.scale ?? 1;
  const toScale = toNode.scale ?? 1;

  return {
    position: tween.point(fromPosition, toPosition, easedProgress),
    color: tween.color(fromColor, toColor, easedProgress),
    size: {
      width: tween.number(fromSize.width, toSize.width, easedProgress),
      height: tween.number(fromSize.height, toSize.height, easedProgress),
    },
    opacity: tween.number(fromOpacity, toOpacity, easedProgress),
    scale: tween.number(fromScale, toScale, easedProgress),
    rotation: 0,  // 可扩展为旋转动画
  };
};
```

---

## 边动画

### 边流动、颜色变化动画

```typescript
// src/engine/edgeAnimation.ts

export interface EdgeAnimationFrame {
  color: string;
  opacity: number;
  strokeWidth: number;
  dashOffset: number;  // 用于虚线流动效果
}

/**
 * 计算边在指定进度下的动画帧数据
 */
export const computeEdgeAnimationFrame = (
  fromColor: string,
  toColor: string,
  progress: number,
  animated: boolean = false
): EdgeAnimationFrame => {
  const dashOffset = animated ? progress * 10 : 0;

  return {
    color: tween.color(fromColor, toColor, progress),
    opacity: 1,
    strokeWidth: 2,
    dashOffset,
  };
};
```

---

## 同步与协调

### 多动画协调

```typescript
// src/engine/coordinator.ts

/**
 * 动画协调器
 * 协调多个子动画同时进行
 */
export class AnimationCoordinator {
  private animations: Map<string, Animation> = new Map();
  private frameId: number | null = null;
  private startTime: number = 0;
  private totalDuration: number = 0;

  addAnimation(id: string, animation: Animation, delay: number = 0): void {
    this.animations.set(id, { ...animation, delay });
    this.totalDuration = Math.max(this.totalDuration, delay + animation.duration);
  }

  play(): void {
    this.startTime = performance.now();
    this.animate();
  }

  private animate(): void {
    const now = performance.now();
    const elapsed = now - this.startTime;
    const totalProgress = Math.min(elapsed / this.totalDuration, 1);

    // 更新所有动画
    for (const [id, animation] of this.animations) {
      const animationElapsed = elapsed - animation.delay;
      if (animationElapsed >= 0 && animationElapsed <= animation.duration) {
        const progress = animationElapsed / animation.duration;
        animation.onUpdate?.(progress);
      } else if (animationElapsed > animation.duration) {
        animation.onComplete?.();
      }
    }

    if (totalProgress < 1) {
      this.frameId = requestAnimationFrame(() => this.animate());
    }
  }

  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

interface Animation {
  duration: number;
  delay: number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}
```

---

## 性能优化

### 渲染优化

```typescript
// src/engine/renderOptimization.ts

/**
 * 只重绘改变的节点
 */
export const getDirtyNodes = (
  prevNodes: VisualizationNode[],
  currentNodes: VisualizationNode[]
): Set<string | number> => {
  const dirtyNodeIds = new Set<string | number>();

  for (let i = 0; i < currentNodes.length; i++) {
    const prev = prevNodes[i];
    const current = currentNodes[i];

    if (!prev || nodesChanged(prev, current)) {
      dirtyNodeIds.add(current.id);
    }
  }

  return dirtyNodeIds;
};

const nodesChanged = (a: VisualizationNode, b: VisualizationNode): boolean => {
  return (
    a.position.x !== b.position.x ||
    a.position.y !== b.position.y ||
    a.value !== b.value ||
    a.label !== b.label
  );
};

/**
 * 使用 OffscreenCanvas 进行离屏渲染
 */
export const createOffscreenCanvas = (
  width: number,
  height: number
): OffscreenCanvas => {
  return new OffscreenCanvas(width, height);
};

/**
 * Canvas 双缓冲
 */
export class DoubleBufferedCanvas {
  private frontBuffer: HTMLCanvasElement;
  private backBuffer: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.frontBuffer = document.createElement('canvas');
    this.backBuffer = document.createElement('canvas');

    this.frontBuffer.width = width;
    this.frontBuffer.height = height;
    this.backBuffer.width = width;
    this.backBuffer.height = height;

    this.ctx = this.backBuffer.getContext('2d')!;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  swap(): void {
    [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer];
  }

  getFrontBuffer(): HTMLCanvasElement {
    return this.frontBuffer;
  }
}
```

---

## 调试工具

### 动画帧检查工具

```typescript
// src/debug/animationDebugger.ts

/**
 * 动画调试器
 */
export class AnimationDebugger {
  private frameTimings: number[] = [];
  private lastFrameTime: number = 0;

  recordFrame(): void {
    const now = performance.now();
    if (this.lastFrameTime) {
      const frameTime = now - this.lastFrameTime;
      this.frameTimings.push(frameTime);
    }
    this.lastFrameTime = now;
  }

  getAverageFPS(): number {
    if (this.frameTimings.length === 0) return 0;
    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;
    return 1000 / avgFrameTime;
  }

  getFrameStats() {
    const min = Math.min(...this.frameTimings);
    const max = Math.max(...this.frameTimings);
    const avg = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;

    return {
      fps: this.getAverageFPS(),
      minFrameTime: min,
      maxFrameTime: max,
      avgFrameTime: avg,
      totalFrames: this.frameTimings.length,
    };
  }

  reset(): void {
    this.frameTimings = [];
    this.lastFrameTime = 0;
  }
}
```

---

## 最佳实践

### 实践1：减少状态变化频率

```typescript
// ❌ 不好：每帧更新整个数组
const updateNodes = () => {
  setNodes([...nodes.map(n => updateNode(n))]);  // 创建新数组，所有组件重新渲染
};

// ✅ 好：使用变更检测
const updateNodes = () => {
  const newNodes = nodes.map(n => updateNode(n));
  const dirtyNodeIds = getDirtyNodes(nodes, newNodes);
  
  if (dirtyNodeIds.size > 0) {
    setNodes(newNodes);
    // 通知渲染器只重绘脏节点
    renderer.redrawNodes(dirtyNodeIds);
  }
};
```

### 实践2：使用动画帧而不是setTimeout

```typescript
// ❌ 不好
setInterval(() => {
  updateAnimation();
  render();
}, 16);

// ✅ 好
const animate = () => {
  updateAnimation();
  render();
  frameId = requestAnimationFrame(animate);
};
frameId = requestAnimationFrame(animate);
```

### 实践3：动画和渲染分离

```typescript
// ✅ 最佳实践
class AnimationSystem {
  private animationState: AnimationState;
  private renderer: Renderer;

  update(): void {
    // 更新动画逻辑
    this.animationState.update();
  }

  render(): void {
    // 根据动画状态渲染
    this.renderer.render(this.animationState);
  }

  frame(): void {
    this.update();
    this.render();
    requestAnimationFrame(() => this.frame());
  }
}
```

### 实践4：预计算和缓存

```typescript
// ✅ 预计算动画路径
const precomputeNodePaths = (steps: AnimationStep[]): Map<string, Point[]> => {
  const paths = new Map();

  for (const step of steps) {
    const nodes = step.dataState.nodes;
    for (const node of nodes) {
      if (!paths.has(node.id)) {
        paths.set(node.id, []);
      }
      paths.get(node.id)!.push(node.position);
    }
  }

  return paths;
};
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，完整动画系统架构 |

---

**文档完成于 2026-03-02**  
