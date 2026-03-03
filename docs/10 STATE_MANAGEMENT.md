
# STATE_MANAGEMENT.md

## 📋 目录

1. [概述](#概述)
2. [状态结构设计](#状态结构设计)
3. [Zustand Store 详解](#zustand-store-详解)
4. [全局状态](#全局状态)
5. [本地状态](#本地状态)
6. [状态同步](#状态同步)
7. [性能优化](#性能优化)
8. [调试工具](#调试工具)
9. [常见模式](#常见模式)
10. [数据持久化](#数据持久化)
11. [错误处理](#错误处理)

---

## 概述

本文档定义了整个算法可视化系统的 **状态管理架构**。采用以下原则：

- ✅ 使用 **Zustand** 作为全局状态管理库
- ✅ 最小化状态，避免冗余
- ✅ 状态尽可能接近使用它的组件（本地优先）
- ✅ 全局状态用于跨多个组件的共享数据
- ✅ 支持时间旅行调试和状态快照

**版本**：v1.0  
**最后更新**：2026-03-02  
**库**：Zustand v4+, Redux DevTools (可选)

---

## 状态结构设计

### 状态分类

```
┌─────────────────────────────────────────────┐
│          应用状态 (Application State)       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────┐  ┌────────────────┐  │
│  │  全局状态         │  │   本地状态      │  │
│  │  (Global Store)  │  │  (Local State) │  │
│  ├──────────────────┤  ├────────────────┤  │
│  │ • 当前模块        │  │ • 表单数据      │  │
│  │ • 动画步骤        │  │ • 展开/折叠     │  │
│  │ • 输入数据        │  │ • 菜单状态      │  │
│  │ • UI 设置         │  │ • 滚动位置      │  │
│  │ • 播放状态        │  │ • 输入焦点      │  │
│  │ • 题目进度        │  │ • 临时 UI 状态  │  │
│  └──────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Zustand Store 详解

### Store 目录结构

```
src/store/
├── index.ts              # 导出所有 store
├── appStore.ts           # 应用核心状态
├── uiStore.ts            # UI 相关状态
├── animationStore.ts     # 动画状态
├── dataStore.ts          # 数据相关状态
├── progressStore.ts      # 学习进度状态
└── middlewares/
    ├── persist.ts        # 持久化中间件
    ├── devtools.ts       # DevTools 中间件
    └── localStorage.ts   # LocalStorage 中间件
```

---

## 全局状态

### AppStore - 应用核心状态

存储当前模块、动画步骤、播放状态等核心状态。

```typescript
// src/store/appStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';
import { devtools, persist } from 'zustand/middleware';

// ========== 类型定义 ==========

export interface ModuleMetadata {
  id: string;
  name: string;
  category: 'linear' | 'tree' | 'graph' | 'sort' | 'search' | 'string' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  prerequisites: string[];
}

export interface AnimationStep {
  id: string;
  name: string;
  description: string;
  duration: number;          // 毫秒
  dataState: any;            // 数据快照
  highlightInfo: HighlightInfo;
  codeHighlight: {
    startLine: number;
    endLine: number;
    language: 'javascript' | 'python' | 'pseudocode';
  };
  stats?: {
    comparisons: number;
    swaps: number;
    operations: number;
  };
}

export interface HighlightInfo {
  nodes: Array<{
    id: string | number;
    type: 'comparing' | 'moving' | 'visiting' | 'matched' | 'newNode' | 'idle' | 'deleted' | 'error';
  }>;
  edges?: Array<{
    id: string;
    type: HighlightType;
  }>;
}

export interface PlaybackControl {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;           // 0-100
  speed: number;              // 0.5, 1, 1.5, 2, 4
}

// ========== Store 定义 ==========

interface AppState {
  // 状态
  currentModule: ModuleMetadata | null;
  animationSteps: AnimationStep[];
  currentStepIndex: number;
  playback: PlaybackControl;
  inputData: any[];
  
  // 动作
  setCurrentModule: (module: ModuleMetadata | null) => void;
  setAnimationSteps: (steps: AnimationStep[]) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setInputData: (data: any[]) => void;
  generateRandomData: (size: number) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // ========== 初始状态 ==========
        currentModule: null,
        animationSteps: [],
        currentStepIndex: 0,
        playback: {
          isPlaying: false,
          isPaused: false,
          currentStep: 0,
          totalSteps: 0,
          progress: 0,
          speed: 1,
        },
        inputData: [],

        // ========== 动作 ==========
        setCurrentModule: (module) => {
          set({ currentModule: module });
          // 切换模块时重置动画状态
          set({
            currentStepIndex: 0,
            animationSteps: [],
            playback: {
              isPlaying: false,
              isPaused: false,
              currentStep: 0,
              totalSteps: 0,
              progress: 0,
              speed: 1,
            },
          });
        },

        setAnimationSteps: (steps) => {
          set({
            animationSteps: steps,
            playback: {
              isPlaying: false,
              isPaused: false,
              currentStep: 0,
              totalSteps: steps.length,
              progress: 0,
              speed: 1,
            },
          });
        },

        goToStep: (index) => {
          const { animationSteps } = get();
          const boundedIndex = Math.max(0, Math.min(index, animationSteps.length - 1));
          set({
            currentStepIndex: boundedIndex,
            playback: (pb) => ({
              ...pb,
              currentStep: boundedIndex,
              progress: Math.round((boundedIndex / animationSteps.length) * 100),
            }),
          });
        },

        nextStep: () => {
          const { currentStepIndex, animationSteps } = get();
          if (currentStepIndex < animationSteps.length - 1) {
            get().goToStep(currentStepIndex + 1);
          }
        },

        prevStep: () => {
          const { currentStepIndex } = get();
          if (currentStepIndex > 0) {
            get().goToStep(currentStepIndex - 1);
          }
        },

        play: () => {
          set({
            playback: (pb) => ({
              ...pb,
              isPlaying: true,
              isPaused: false,
            }),
          });
        },

        pause: () => {
          set({
            playback: (pb) => ({
              ...pb,
              isPlaying: false,
              isPaused: true,
            }),
          });
        },

        resume: () => {
          get().play();
        },

        stop: () => {
          get().reset();
        },

        reset: () => {
          set({
            currentStepIndex: 0,
            playback: (pb) => ({
              ...pb,
              isPlaying: false,
              isPaused: false,
              currentStep: 0,
              progress: 0,
            }),
          });
        },

        setSpeed: (speed) => {
          const validSpeeds = [0.5, 1, 1.5, 2, 4];
          const clampedSpeed = validSpeeds.includes(speed) ? speed : 1;
          set({
            playback: (pb) => ({
              ...pb,
              speed: clampedSpeed,
            }),
          });
        },

        setInputData: (data) => {
          set({ inputData: data });
        },

        generateRandomData: (size) => {
          // 生成大小为 size 的随机数组
          const data = Array.from(
            { length: size },
            () => Math.floor(Math.random() * 100) + 1
          );
          set({ inputData: data });
        },
      })),
      {
        name: 'app-store',
        version: 1,
        // 只持久化必要的状态
        partialize: (state) => ({
          inputData: state.inputData,
        }),
      }
    )
  )
);

// ========== 选择器（Selectors） ==========

export const useCurrentModule = () => useAppStore((state) => state.currentModule);
export const useAnimationSteps = () => useAppStore((state) => state.animationSteps);
export const useCurrentStepIndex = () => useAppStore((state) => state.currentStepIndex);
export const usePlayback = () => useAppStore((state) => state.playback);
export const useInputData = () => useAppStore((state) => state.inputData);

export const useCurrentAnimationStep = () => {
  const steps = useAnimationSteps();
  const index = useCurrentStepIndex();
  return steps[index] || null;
};

export const useIsPlaying = () => useAppStore((state) => state.playback.isPlaying);
export const usePlaySpeed = () => useAppStore((state) => state.playback.speed);
```

---

### UIStore - UI 状态

```typescript
// src/store/uiStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';

interface UIState {
  // 主题
  isDarkMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // 面板可见性
  isDocumentPanelOpen: boolean;
  isCodePanelOpen: boolean;
  isStatsPanelOpen: boolean;
  isSidebarOpen: boolean;
  
  // 面板宽度（像素）
  documentPanelWidth: number;
  codePanelWidth: number;
  visualizerPanelWidth: number;
  
  // 编辑器设置
  showLineNumbers: boolean;
  codeLanguage: 'javascript' | 'python' | 'pseudocode';
  fontSize: number;
  
  // 可视化设置
  showGrid: boolean;
  showAnimationLabels: boolean;
  nodeSize: number;
  
  // 通知
  notifications: Notification[];
  
  // 动作
  toggleDarkMode: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  togglePanel: (panel: 'document' | 'code' | 'stats' | 'sidebar') => void;
  setDocumentPanelWidth: (width: number) => void;
  setCodePanelWidth: (width: number) => void;
  setCodeLanguage: (lang: 'javascript' | 'python' | 'pseudocode') => void;
  setFontSize: (size: number) => void;
  toggleGrid: () => void;
  showNotification: (notification: Notification) => void;
  hideNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set, get) => ({
    // ========== 初始状态 ==========
    isDarkMode: false,
    theme: 'auto',
    isDocumentPanelOpen: true,
    isCodePanelOpen: true,
    isStatsPanelOpen: true,
    isSidebarOpen: true,
    documentPanelWidth: 300,
    codePanelWidth: 350,
    visualizerPanelWidth: 0,  // 自动计算
    showLineNumbers: true,
    codeLanguage: 'javascript',
    fontSize: 14,
    showGrid: false,
    showAnimationLabels: true,
    nodeSize: 40,
    notifications: [],

    // ========== 动作 ==========
    toggleDarkMode: () => {
      set((state) => ({ isDarkMode: !state.isDarkMode }));
    },

    setTheme: (theme) => {
      set({ theme });
      // 根据主题更新 isDarkMode
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        set({ isDarkMode: prefersDark });
      } else {
        set({ isDarkMode: theme === 'dark' });
      }
    },

    togglePanel: (panel) => {
      const panelKey = `is${panel.charAt(0).toUpperCase()}${panel.slice(1)}Open`.replace(
        'Open',
        'PanelOpen'
      ) as keyof UIState;
      set((state) => ({
        [panelKey]: !state[panelKey],
      }));
    },

    setDocumentPanelWidth: (width) => {
      const clampedWidth = Math.max(200, Math.min(width, 600));
      set({ documentPanelWidth: clampedWidth });
    },

    setCodePanelWidth: (width) => {
      const clampedWidth = Math.max(250, Math.min(width, 600));
      set({ codePanelWidth: clampedWidth });
    },

    setCodeLanguage: (lang) => {
      set({ codeLanguage: lang });
    },

    setFontSize: (size) => {
      const clampedSize = Math.max(10, Math.min(size, 24));
      set({ fontSize: clampedSize });
    },

    toggleGrid: () => {
      set((state) => ({ showGrid: !state.showGrid }));
    },

    showNotification: (notification) => {
      const id = notification.id || `notif-${Date.now()}`;
      set((state) => ({
        notifications: [...state.notifications, { ...notification, id }],
      }));

      // 自动移除通知
      if (notification.duration) {
        setTimeout(() => {
          get().hideNotification(id);
        }, notification.duration);
      }
    },

    hideNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },
  }))
);

// ========== 选择器 ==========
export const useIsDarkMode = () => useUIStore((state) => state.isDarkMode);
export const useIsDocumentPanelOpen = () => useUIStore((state) => state.isDocumentPanelOpen);
export const useIsCodePanelOpen = () => useUIStore((state) => state.isCodePanelOpen);
export const useCodeLanguage = () => useUIStore((state) => state.codeLanguage);
export const useNotifications = () => useUIStore((state) => state.notifications);
```

---

### AnimationStore - 动画执行状态

```typescript
// src/store/animationStore.ts

import { create } from 'zustand';

interface AnimationFrameData {
  timestamp: number;
  frameNumber: number;
  progress: number;  // 0-1
}

interface AnimationState {
  // 动画帧数据
  animationFrames: AnimationFrameData[];
  currentFrameNumber: number;
  
  // 计时
  startTime: number | null;
  elapsedTime: number;
  duration: number;
  
  // 状态
  isRunning: boolean;
  
  // 动作
  startAnimation: (duration: number) => void;
  updateFrame: (frameNumber: number) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

export const useAnimationStore = create<AnimationState>((set, get) => ({
  animationFrames: [],
  currentFrameNumber: 0,
  startTime: null,
  elapsedTime: 0,
  duration: 0,
  isRunning: false,

  startAnimation: (duration) => {
    set({
      duration,
      startTime: Date.now(),
      isRunning: true,
      currentFrameNumber: 0,
    });
  },

  updateFrame: (frameNumber) => {
    const { startTime, duration } = get();
    if (!startTime) return;

    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    set({
      currentFrameNumber: frameNumber,
      elapsedTime: elapsed,
    });

    // 动画完成
    if (progress >= 1) {
      set({ isRunning: false });
    }
  },

  pauseAnimation: () => {
    set({ isRunning: false });
  },

  resumeAnimation: () => {
    set({ isRunning: true });
  },

  stopAnimation: () => {
    set({ isRunning: false, currentFrameNumber: 0, startTime: null });
  },

  resetAnimation: () => {
    set({
      isRunning: false,
      currentFrameNumber: 0,
      startTime: null,
      elapsedTime: 0,
      duration: 0,
    });
  },
}));
```

---

### DataStore - 数据相关状态

```typescript
// src/store/dataStore.ts

import { create } from 'zustand';

interface DataState {
  // 原始输入
  originalData: any[];
  currentData: any[];
  
  // 数据统计
  stats: {
    comparisons: number;
    swaps: number;
    reads: number;
    writes: number;
    operations: number;
  };
  
  // 动作
  setOriginalData: (data: any[]) => void;
  setCurrentData: (data: any[]) => void;
  recordComparison: () => void;
  recordSwap: () => void;
  recordRead: () => void;
  recordWrite: () => void;
  resetStats: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  originalData: [],
  currentData: [],
  stats: {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
    operations: 0,
  },

  setOriginalData: (data) => {
    set({ originalData: data, currentData: [...data] });
  },

  setCurrentData: (data) => {
    set({ currentData: data });
  },

  recordComparison: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        comparisons: state.stats.comparisons + 1,
        operations: state.stats.operations + 1,
      },
    }));
  },

  recordSwap: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        swaps: state.stats.swaps + 1,
        operations: state.stats.operations + 1,
      },
    }));
  },

  recordRead: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        reads: state.stats.reads + 1,
        operations: state.stats.operations + 1,
      },
    }));
  },

  recordWrite: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        writes: state.stats.writes + 1,
        operations: state.stats.operations + 1,
      },
    }));
  },

  resetStats: () => {
    set({
      stats: {
        comparisons: 0,
        swaps: 0,
        reads: 0,
        writes: 0,
        operations: 0,
      },
    });
  },
}));
```

---

### ProgressStore - 学习进度

```typescript
// src/store/progressStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModuleProgress {
  moduleId: string;
  visited: boolean;
  completed: boolean;
  lastVisitTime: number;
  completionTime?: number;
  score?: number;  // 0-100
}

interface ProgressState {
  // 模块进度
  moduleProgress: Record<string, ModuleProgress>;
  
  // 统计
  totalModulesVisited: number;
  totalModulesCompleted: number;
  totalLearningTime: number;
  
  // 动作
  markModuleVisited: (moduleId: string) => void;
  markModuleCompleted: (moduleId: string, score?: number) => void;
  getModuleProgress: (moduleId: string) => ModuleProgress | null;
  getProgressStats: () => {
    visited: number;
    completed: number;
    totalTime: number;
  };
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      moduleProgress: {},
      totalModulesVisited: 0,
      totalModulesCompleted: 0,
      totalLearningTime: 0,

      markModuleVisited: (moduleId) => {
        set((state) => {
          const existing = state.moduleProgress[moduleId];
          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                moduleId,
                visited: true,
                completed: existing?.completed || false,
                lastVisitTime: Date.now(),
                completionTime: existing?.completionTime,
                score: existing?.score,
              },
            },
          };
        });
      },

      markModuleCompleted: (moduleId, score) => {
        set((state) => ({
          moduleProgress: {
            ...state.moduleProgress,
            [moduleId]: {
              moduleId,
              visited: true,
              completed: true,
              lastVisitTime: Date.now(),
              completionTime: Date.now(),
              score,
            },
          },
        }));
      },

      getModuleProgress: (moduleId) => {
        return get().moduleProgress[moduleId] || null;
      },

      getProgressStats: () => {
        const progress = get().moduleProgress;
        const visited = Object.values(progress).filter((p) => p.visited).length;
        const completed = Object.values(progress).filter((p) => p.completed).length;
        return {
          visited,
          completed,
          totalTime: get().totalLearningTime,
        };
      },

      resetProgress: () => {
        set({
          moduleProgress: {},
          totalModulesVisited: 0,
          totalModulesCompleted: 0,
          totalLearningTime: 0,
        });
      },
    }),
    {
      name: 'progress-store',
      version: 1,
    }
  )
);
```

---

## 本地状态

### React useState 使用指南

用于单个组件内的临时状态。

```typescript
// 表单状态
const [formData, setFormData] = useState({
  input: '',
  error: '',
});

// 展开/折叠状态
const [isExpanded, setIsExpanded] = useState(false);

// 模态框状态
const [isModalOpen, setIsModalOpen] = useState(false);

// 页面滚动状态
const [scrollPosition, setScrollPosition] = useState(0);
```

---

### useReducer 用于复杂逻辑

```typescript
// src/hooks/useComplexState.ts

interface StateData {
  value: number;
  history: number[];
  error: string | null;
}

type Action =
  | { type: 'SET'; payload: number }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'ERROR'; payload: string };

const initialState: StateData = {
  value: 0,
  history: [],
  error: null,
};

const reducer = (state: StateData, action: Action): StateData => {
  switch (action.type) {
    case 'SET':
      return {
        ...state,
        value: action.payload,
        history: [...state.history, state.value],
        error: null,
      };
    case 'UNDO':
      if (state.history.length === 0) return state;
      return {
        ...state,
        value: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
      };
    case 'RESET':
      return initialState;
    case 'ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const useComplexState = () => {
  return useReducer(reducer, initialState);
};
```

---

## 状态同步

### 跨 Store 同步

```typescript
// src/store/sync.ts

import { useAppStore } from './appStore';
import { useDataStore } from './dataStore';

// 当切换模块时同步数据
export const useSyncStores = () => {
  const currentModule = useAppStore((state) => state.currentModule);
  const setOriginalData = useDataStore((state) => state.setOriginalData);

  useEffect(() => {
    if (currentModule) {
      // 初始化模块的数据
      setOriginalData([]);
    }
  }, [currentModule, setOriginalData]);
};

// 使用
export const App = () => {
  useSyncStores();
  return <>{/* ... */}</>;
};
```

### URL 与状态同步

```typescript
// src/utils/urlSync.ts

import { useAppStore } from '@/store/appStore';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export const useURLSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentModule = useAppStore((state) => state.currentModule);
  const currentStep = useAppStore((state) => state.currentStepIndex);

  // 状态变化时更新 URL
  useEffect(() => {
    if (currentModule) {
      setSearchParams({
        module: currentModule.id,
        step: currentStep.toString(),
      });
    }
  }, [currentModule, currentStep, setSearchParams]);

  // URL 变化时更新状态
  useEffect(() => {
    const moduleId = searchParams.get('module');
    const step = searchParams.get('step');

    if (moduleId && step) {
      // 加载对应模块和步骤
      // const module = findModule(moduleId);
      // useAppStore.setState({ currentModule: module, currentStepIndex: parseInt(step) });
    }
  }, [searchParams]);
};
```

---

## 性能优化

### 选择器优化

```typescript
// ❌ 不好：每次都创建新对象
const Component = () => {
  const state = useAppStore(); // 订阅整个 store，任何变化都重新渲染
  return <div>{state.currentModule?.name}</div>;
};

// ✅ 好：精确订阅需要的状态
const Component = () => {
  const moduleName = useAppStore((state) => state.currentModule?.name);
  return <div>{moduleName}</div>;
};

// ✅ 更好：提前定义选择器
export const useModuleName = () =>
  useAppStore((state) => state.currentModule?.name);

const Component = () => {
  const moduleName = useModuleName();
  return <div>{moduleName}</div>;
};
```

### 浅比较

```typescript
// src/store/utils.ts

import shallow from 'zustand/react/shallow';

// 比较对象是否浅相等
export const usePlayback = () =>
  useAppStore((state) => state.playback, shallow);

// 这样即使 playback 中的某个属性变化，整个对象引用不变，不会重新渲染
```

### 批量更新

```typescript
// ❌ 不好：多次更新，多次渲染
const handleStart = () => {
  setCurrentModule(module);  // 渲染 1
  setAnimationSteps(steps);  // 渲染 2
  play();                    // 渲染 3
};

// ✅ 好：批量更新，一次渲染
const handleStart = () => {
  useAppStore.setState({
    currentModule: module,
    animationSteps: steps,
    playback: { ...playback, isPlaying: true },
  });
};
```

---

## 调试工具

### Redux DevTools 集成

```typescript
// src/store/devtools.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 在 store 创建时添加 devtools 中间件
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // store 定义...
    }),
    {
      name: 'AppStore',
      version: 1,
    }
  )
);

// 在浏览器中安装 Redux DevTools 扩展，可以：
// 1. 查看所有状态变化
// 2. 时间旅行调试
// 3. 导出/导入状态快照
// 4. 查看性能指标
```

### 日志中间件

```typescript
// src/store/middleware/logger.ts

export const logger = (config) => (set, get, api) => {
  return config(
    (...args) => {
      console.log('  applying', args);
      set(...args);
      console.log('  new state', get());
    },
    get,
    api
  );
};

// 使用
export const useAppStore = create<AppState>()(
  logger((set, get) => ({
    // ...
  }))
);
```

---

## 常见模式

### 模式1：条件更新

```typescript
// 只在满足条件时才更新
const updateIfValid = (newValue: any) => {
  set((state) => {
    if (isValid(newValue)) {
      return { value: newValue };
    }
    return state;  // 不更新
  });
};
```

### 模式2：衍生状态

```typescript
// 不在 store 中存储衍生状态，而是在选择器中计算
export const useProgress = () => {
  const currentStep = useAppStore((state) => state.currentStepIndex);
  const totalSteps = useAppStore((state) => state.animationSteps.length);
  return totalSteps === 0 ? 0 : (currentStep / totalSteps) * 100;
};
```

### 模式3：异步更新

```typescript
// 使用中间件处理异步操作
const asyncMiddleware = (config) => (set, get, api) => {
  return config(
    (action) => {
      if (typeof action === 'function') {
        action(set, get, api);
      } else {
        set(action);
      }
    },
    get,
    api
  );
};

// 使用
useAppStore((set) => ({
  // ...
  fetchModule: async (moduleId) => {
    const module = await api.getModule(moduleId);
    set({ currentModule: module });
  },
}));
```

### 模式4：预防无限循环

```typescript
// 当订阅状态变化时
useEffect(() => {
  const unsubscribe = useAppStore.subscribe(
    (state) => state.currentStepIndex,
    (index) => {
      console.log('Step changed:', index);
      // 响应状态变化
    }
  );

  return () => unsubscribe();
}, []);
```

---

## 数据持久化

### LocalStorage 持久化

```typescript
// src/store/middleware/persist.ts

import { persist, PersistStorage } from 'zustand/middleware';

// 自定义存储实现
const customStorage: PersistStorage = {
  getItem: async (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: async (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    localStorage.removeItem(name);
  },
};

// 在 store 中使用
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ...
    }),
    {
      name: 'app-store',
      storage: customStorage,
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 版本迁移逻辑
        if (version === 0) {
          // 从版本 0 迁移到版本 1
          return {
            ...persistedState,
            // 新字段的默认值
          };
        }
        return persistedState;
      },
    }
  )
);
```

### IndexedDB 存储

```typescript
// src/store/middleware/indexedDB.ts

const indexedDBStorage: PersistStorage = {
  getItem: async (name: string) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('algorithmViz');
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['store']);
        const objectStore = transaction.objectStore('store');
        const getRequest = objectStore.get(name);
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.value || null);
        };
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      };
    });
  },
  setItem: async (name: string, value: any) => {
    // 实现...
  },
  removeItem: async (name: string) => {
    // 实现...
  },
};
```

---

## 错误处理

### 错误状态管理

```typescript
// src/store/errorStore.ts

interface ErrorState {
  errors: Error[];
  addError: (error: Error) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  
  addError: (error) => {
    const id = `error-${Date.now()}`;
    set((state) => ({
      errors: [...state.errors, { id, ...error }],
    }));
    
    // 5秒后自动移除
    setTimeout(() => {
      set((state) => ({
        errors: state.errors.filter((e) => e.id !== id),
      }));
    }, 5000);
  },
  
  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    }));
  },
  
  clearErrors: () => {
    set({ errors: [] });
  },
}));
```

### 错误边界

```typescript
// src/components/ErrorBoundary.tsx

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    useErrorStore.getState().addError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>出错了</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，完整状态管理系统 |

---

**文档完成于 2026-03-02**  
**下一阶段**：请提示"继续"，我将输出第七个文档：**ANIMATION_SYSTEM.md**
