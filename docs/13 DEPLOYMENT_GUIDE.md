
# DEPLOYMENT_GUIDE.md

## 📋 目录

1. [概述](#概述)
2. [本地开发环境](#本地开发环境)
3. [构建流程](#构建流程)
4. [部署策略](#部署策略)
5. [云平台部署](#云平台部署)
6. [数据库和存储](#数据库和存储)
7. [API 集成](#api-集成)
8. [性能优化](#性能优化)
9. [监控和日志](#监控和日志)
10. [灾难恢复](#灾难恢复)
11. [安全加固](#安全加固)
12. [故障排除](#故障排除)

---

## 概述

本文档定义了算法可视化系统的 **完整部署指南**。包含：

- ✅ 本地开发环境搭建
- ✅ 多环境构建配置
- ✅ 云平台部署方案
- ✅ CI/CD 自动化流程
- ✅ 监控和日志体系
- ✅ 灾难恢复方案

> 范围说明（与 ARCHITECTURE 对齐）：v1 推荐先走纯前端静态部署（无需后端与登录）；数据库、认证与 `/api` 相关章节为可选增强方案。

**版本**：v1.0  
**最后更新**：2026-03-02  
**支持平台**：Vercel, Netlify, AWS, Docker

---

## 本地开发环境

### 环境要求

```bash
# 系统要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 3.0.0
- Git >= 2.30.0
- Docker (可选)

# 推荐开发工具
- VS Code + ESLint + Prettier 插件
- GitHub Desktop 或 Git CLI
- Postman 或 Insomnia (API 测试)
```

### 项目初始化

```bash
# 1. 克隆仓库
git clone https://github.com/Look2046/DSA-with-Codex.git
cd DSA-with-Codex

# 2. 安装依赖
npm install
# 或
yarn install

# 3. 设置环境变量
cp .env.example .env.local

# 4. 验证环境
npm run check-env

# 5. 启动开发服务器
npm run dev

# 6. 打开浏览器
# http://localhost:5173
```

### .env.local 配置

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DARK_MODE=true
VITE_MAX_ARRAY_SIZE=10000

# 调试
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# 第三方服务
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

### Docker 本地开发

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动开发服务器
CMD ["npm", "run", "dev"]
```

```bash
# 构建开发镜像
docker build -f Dockerfile.dev -t algorithm-viz:dev .

# 运行容器
docker run -p 5173:5173 -v $(pwd):/app algorithm-viz:dev

# 或使用 docker-compose
docker-compose -f docker-compose.dev.yml up
```

---

## 构建流程

### 项目构建配置

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
      },
    }),
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  preview: {
    port: 4173,
  },

  build: {
    target: 'ES2020',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'zustand',
            'react-router-dom',
          ],
          utils: [
            'src/utils',
          ],
          visualizers: [
            'src/components/visualizers',
          ],
        },
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `images/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
      },
    },

    // 性能优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### 构建脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "check-env": "node scripts/checkEnv.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test"
  }
}
```

### 构建分析

```typescript
// vite.config.analyze.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      plugins: [visualizer()],
    },
  },
});
```

```bash
# 分析构建包体积
npm run build:analyze
```

---

## 部署策略

### 部署环境配置

```typescript
// config/deployment.ts

export const deploymentConfig = {
  development: {
    apiUrl: 'http://localhost:3000',
    enableAnalytics: false,
    enableErrorTracking: false,
    logLevel: 'debug',
    cacheDuration: 0,
  },

  staging: {
    apiUrl: 'https://api-staging.example.com',
    enableAnalytics: true,
    enableErrorTracking: true,
    logLevel: 'info',
    cacheDuration: 3600,
    sentryDsn: process.env.SENTRY_DSN_STAGING,
  },

  production: {
    apiUrl: 'https://api.example.com',
    enableAnalytics: true,
    enableErrorTracking: true,
    logLevel: 'warn',
    cacheDuration: 86400,
    sentryDsn: process.env.SENTRY_DSN_PRODUCTION,
    cspEnabled: true,
    httsOnly: true,
  },
};

export const getDeploymentConfig = (env: string = process.env.NODE_ENV) => {
  return deploymentConfig[env as keyof typeof deploymentConfig] || deploymentConfig.development;
};
```

### 多环境部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=$1
VERSION=$(npm pkg get version | tr -d '"')

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [development|staging|production]"
  exit 1
fi

echo "🚀 开始部署到 $ENVIRONMENT 环境"
echo "📦 版本: $VERSION"

# 1. 环境检查
echo "✓ 检查环境..."
if [ ! -f ".env.$ENVIRONMENT" ]; then
  echo "❌ 缺少 .env.$ENVIRONMENT 文件"
  exit 1
fi

# 2. 安装依赖
echo "✓ 安装依赖..."
npm ci

# 3. 代码检查
echo "✓ 运行 ESLint..."
npm run lint

# 4. 类型检查
echo "✓ 类型检查..."
npm run type-check

# 5. 运行测试
echo "✓ 运行测试..."
npm run test -- --run
npm run test:coverage

# 6. 构建
echo "✓ 构建应用..."
NODE_ENV=$ENVIRONMENT npm run build

# 7. 部署
echo "✓ 上传到 $ENVIRONMENT..."
case $ENVIRONMENT in
  development)
    npm run deploy:dev
    ;;
  staging)
    npm run deploy:staging
    ;;
  production)
    npm run deploy:prod
    ;;
esac

# 8. 验证部署
echo "✓ 验证部署..."
./scripts/verify-deployment.sh $ENVIRONMENT

echo "✅ 部署完成！"
```

---

## 云平台部署

### Vercel 部署

```json
// vercel.json

{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "vite",
  
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_ENABLE_ANALYTICS": "@enable_analytics"
  },
  
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/modules/:path*",
      "destination": "https://api.example.com/modules/:path*"
    }
  ]
}
```

```bash
# 部署到 Vercel
npm i -g vercel
vercel

# 或使用 GitHub 集成（推荐）
# 在 Vercel 仪表板关联 GitHub 仓库
# 每次推送到 main 分支自动部署
```

### Netlify 部署

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"
  functions = "functions"

[dev]
  command = "npm run dev"
  port = 5173

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

```bash
# 部署到 Netlify
npm i -g netlify-cli
netlify deploy
```

### Docker 容器部署

```dockerfile
# Dockerfile.prod

# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 构建应用
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 安装 serve 来提供静态文件
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
# 构建镜像
docker build -f Dockerfile.prod -t algorithm-viz:latest .

# 运行容器
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=https://api.example.com \
  algorithm-viz:latest
```

### Kubernetes 部署

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: algorithm-visualizer
  labels:
    app: algorithm-visualizer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: algorithm-visualizer
  template:
    metadata:
      labels:
        app: algorithm-visualizer
    spec:
      containers:
      - name: algorithm-visualizer
        image: algorithm-viz:latest
        imagePullPolicy: IfNotPresent
        
        ports:
        - containerPort: 3000
          name: http
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: VITE_API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api-url
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

```yaml
# k8s/service.yaml

apiVersion: v1
kind: Service
metadata:
  name: algorithm-visualizer-service
spec:
  selector:
    app: algorithm-visualizer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

```bash
# 部署到 Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 检查部署状态
kubectl get deployments
kubectl get pods
kubectl get services
```

---

## 数据库和存储

### 本地存储配置

```typescript
// src/services/storage.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AppDB extends DBSchema {
  userProgress: {
    key: string;
    value: {
      moduleId: string;
      visited: boolean;
      completed: boolean;
      completionTime?: number;
      score?: number;
    };
  };
  userPreferences: {
    key: string;
    value: {
      theme: 'light' | 'dark';
      language: string;
      fontSize: number;
    };
  };
  cachedData: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
}

let db: IDBPDatabase<AppDB>;

export const initDB = async () => {
  db = await openDB<AppDB>('algorithm-viz', 1, {
    upgrade(db) {
      // 用户进度存储
      if (!db.objectStoreNames.contains('userProgress')) {
        db.createObjectStore('userProgress', { keyPath: 'moduleId' });
      }

      // 用户偏好设置
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'key' });
      }

      // 缓存数据
      if (!db.objectStoreNames.contains('cachedData')) {
        db.createObjectStore('cachedData', { keyPath: 'key' });
      }
    },
  });
};

export const saveProgress = async (moduleId: string, progress: any) => {
  await db.put('userProgress', { moduleId, ...progress });
};

export const getProgress = async (moduleId: string) => {
  return db.get('userProgress', moduleId);
};

export const savePreferences = async (preferences: any) => {
  await db.put('userPreferences', { key: 'app', ...preferences });
};

export const getPreferences = async () => {
  return db.get('userPreferences', 'app');
};

export const cacheData = async (key: string, data: any, ttl: number = 3600000) => {
  await db.put('cachedData', {
    key,
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const getCachedData = async (key: string) => {
  const item = await db.get('cachedData', key);
  if (!item) return null;

  // 检查是否过期
  const now = Date.now();
  if (now - item.timestamp > item.ttl) {
    await db.delete('cachedData', key);
    return null;
  }

  return item.data;
};
```

### 远程数据库集成

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios';
import { getDeploymentConfig } from '@/config/deployment';

class APIClient {
  private instance: AxiosInstance;

  constructor() {
    const config = getDeploymentConfig();
    
    this.instance = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // 处理认证失败
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getUserProgress(userId: string) {
    return this.instance.get(`/users/${userId}/progress`);
  }

  async saveUserProgress(userId: string, moduleId: string, progress: any) {
    return this.instance.post(`/users/${userId}/progress`, {
      moduleId,
      ...progress,
    });
  }

  async getModuleData(moduleId: string) {
    return this.instance.get(`/modules/${moduleId}`);
  }

  async getLeaderboard() {
    return this.instance.get('/leaderboard');
  }
}

export const apiClient = new APIClient();
```

---

## API 集成

### 后端服务（示例）

```typescript
// 后端 Node.js/Express

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制 100 个请求
});
app.use('/api/', limiter);

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 路由
app.get('/api/modules', (req, res) => {
  // 返回所有模块列表
  res.json({
    modules: [
      {
        id: 'bubble-sort',
        name: '冒泡排序',
        description: '...',
      },
    ],
  });
});

app.get('/api/modules/:id', (req, res) => {
  // 返回特定模块数据
  const { id } = req.params;
  res.json({
    id,
    name: 'Module Name',
    // ...
  });
});

app.post('/api/users/:userId/progress', (req, res) => {
  // 保存用户进度
  const { userId } = req.params;
  const { moduleId, completed } = req.body;

  // 保存到数据库
  res.json({ success: true });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 性能优化

### CDN 配置

```typescript
// 使用 CloudFlare 或类似 CDN

// 在 Vercel/Netlify 中自动使用 CDN
// 也可手动配置 CloudFlare

// cloudflare.conf 示例
{
  "zones": [
    {
      "name": "example.com",
      "plan": "pro",
      "caching": {
        "browser_cache_ttl": 14400,
        "cache_level": "cache_everything"
      },
      "minify": {
        "css": true,
        "html": true,
        "js": true
      }
    }
  ]
}
```

### 资源优化

```bash
# 1. 图片优化
npm install -D vite-plugin-imagemin

# 2. 代码分割自动优化
# 已在 vite.config.ts 中配置

# 3. Gzip 压缩
# 已在 vite.config.ts 中使用 vite-plugin-compression

# 4. 预加载关键资源
<!-- index.html -->
<link rel="preload" href="/assets/vendor.js" as="script" />
<link rel="prefetch" href="/modules/bubble-sort.js" />
```

### 缓存策略

```typescript
// src/utils/cache.ts

export class CacheManager {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  set(key: string, value: any, ttl: number = 3600000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// 定期清理过期缓存
setInterval(() => {
  cacheManager.clearExpired();
}, 3600000); // 每小时清理一次
```

---

## 监控和日志

### 错误追踪集成

```typescript
// src/utils/errorTracking.ts

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { getDeploymentConfig } from '@/config/deployment';

export const initErrorTracking = () => {
  const config = getDeploymentConfig();

  if (!config.enableErrorTracking) {
    return;
  }

  Sentry.init({
    dsn: config.sentryDsn,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUser = (userId: string, userData?: Record<string, any>) => {
  Sentry.setUser({ id: userId, ...userData });
};
```

### 日志系统

```typescript
// src/utils/logger.ts

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private minLevel: LogLevel;
  private isDev: boolean;

  constructor() {
    this.minLevel = this.getLogLevel();
    this.isDev = process.env.NODE_ENV === 'development';
  }

  private getLogLevel(): LogLevel {
    const level = process.env.VITE_LOG_LEVEL?.toUpperCase();
    return (level as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data), data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, data), data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data), data);
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, error), error);
      
      // 发送到错误追踪服务
      if (error instanceof Error) {
        captureException(error, { message });
      }
    }
  }
}

export const logger = new Logger();
```

### 分析追踪

```typescript
// src/utils/analytics.ts

import { getDeploymentConfig } from '@/config/deployment';

export class Analytics {
  private enabled: boolean;
  private userId?: string;

  constructor() {
    const config = getDeploymentConfig();
    this.enabled = config.enableAnalytics;

    if (this.enabled && window.gtag) {
      window.gtag('config', config.gaId || '');
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    if (this.enabled && window.gtag) {
      window.gtag('config', { user_id: userId });
    }
  }

  trackEvent(name: string, parameters?: Record<string, any>): void {
    if (this.enabled && window.gtag) {
      window.gtag('event', name, parameters);
    }
  }

  trackPageView(path: string): void {
    if (this.enabled && window.gtag) {
      window.gtag('config', { page_path: path });
    }
  }

  trackModuleVisit(moduleId: string): void {
    this.trackEvent('module_visit', { module_id: moduleId });
  }

  trackAnimationPlay(moduleId: string): void {
    this.trackEvent('animation_play', { module_id: moduleId });
  }

  trackModuleComplete(moduleId: string, score: number): void {
    this.trackEvent('module_complete', {
      module_id: moduleId,
      score: score,
    });
  }
}

export const analytics = new Analytics();

// 在 App.tsx 中初始化
declare global {
  interface Window {
    gtag: Function;
  }
}
```

---

## 灾难恢复

### 备份策略

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
if [ -n "$DB_CONNECTION_STRING" ]; then
  echo "备份数据库..."
  # 备份命令取决于数据库类型
  # 示例：mongodump, pg_dump, mysqldump 等
fi

# 备份文件存储
if [ -d "uploads" ]; then
  echo "备份上传的文件..."
  tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz uploads/
fi

# 备份环境配置
echo "备份配置文件..."
tar -czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz .env*

echo "✓ 备份完成: $BACKUP_DIR"
```

### 恢复流程

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <backup_file>"
  exit 1
fi

echo "⚠️  警告：恢复操作不可逆！"
read -p "确认恢复？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  exit 0
fi

# 恢复文件
echo "恢复文件..."
tar -xzf $BACKUP_FILE

# 重启服务
echo "重启服务..."
systemctl restart algorithm-viz

echo "✓ 恢复完成"
```

### 故障转移配置

```typescript
// 自动故障转移配置示例

const primaryServer = 'https://api.example.com';
const backupServer = 'https://api-backup.example.com';

export const apiClient = axios.create({
  baseURL: primaryServer,
});

// 添加故障转移逻辑
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status >= 500) {
      console.warn('Primary server failed, switching to backup');
      
      // 创建新实例使用备份服务器
      const backupClient = axios.create({
        baseURL: backupServer,
      });

      try {
        return await backupClient(error.config);
      } catch (backupError) {
        return Promise.reject(backupError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 安全加固

### HTTPS 和 HSTS

```nginx
# nginx.conf 配置示例

server {
  listen 443 ssl http2;
  server_name example.com;

  # SSL 证书
  ssl_certificate /etc/ssl/certs/cert.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;

  # SSL 安全配置
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # CSP
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

  # X-Frame-Options
  add_header X-Frame-Options "SAMEORIGIN" always;

  # X-Content-Type-Options
  add_header X-Content-Type-Options "nosniff" always;

  # 根路径
  root /var/www/html;

  # SPA 路由配置
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location /api/ {
    proxy_pass https://api.example.com;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# 重定向 HTTP 到 HTTPS
server {
  listen 80;
  server_name example.com;
  return 301 https://$server_name$request_uri;
}
```

### 环境变量安全

```bash
# .env.example - 不包含敏感信息
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true

# .env.production - 仅本地，不提交到 Git
VITE_API_BASE_URL=https://api.example.com
SENTRY_DSN=https://...@sentry.io/...

# .gitignore
.env
.env.local
.env.production.local
.env.*.local
```

### 依赖安全扫描

```bash
# 检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# 使用 Snyk 进行深层扫描
npx snyk test

# GitHub 依赖性警报
# 在 GitHub 仓库设置中启用
```

---

## 故障排除

### 常见问题排查

```bash
# 问题 1: 构建失败
症状：npm run build 报错
解决：
  1. 清除 node_modules: rm -rf node_modules
  2. 清除缓存: npm cache clean --force
  3. 重新安装: npm install
  4. 检查 Node 版本: node --version (需要 >= 18.0.0)

# 问题 2: 运行时崩溃
症状：页面加载白屏或抛出错误
解决：
  1. 打开浏览器开发者工具，查看控制台错误
  2. 检查网络标签，验证 API 调用是否成功
  3. 查看应用日志: tail -f logs/app.log
  4. 尝试清除浏览器缓存和 LocalStorage

# 问题 3: 性能下降
症状：动画卡顿、响应缓慢
解决：
  1. 使用 Chrome DevTools Performance 标签分析
  2. 检查内存泄漏: window.performance.memory
  3. 减少动画元素数量
  4. 启用 GPU 加速: will-change: transform

# 问题 4: CORS 错误
症状：API 请求失败，CORS 错误
解决：
  1. 检查后端 CORS 配置
  2. 验证请求头是否正确
  3. 检查预检请求 (OPTIONS)
  4. 使用代理 (在开发环境)
```

### 日志分析

```typescript
// 分析日志脚本
// scripts/analyze-logs.js

const fs = require('fs');
const path = require('path');

function analyzeErrors(logFile) {
  const logs = fs.readFileSync(logFile, 'utf8').split('\n');
  
  const errors = logs.filter(line => 
    line.includes('[ERROR]') || line.includes('error')
  );

  const errorTypes = {};
  errors.forEach(error => {
    const type = error.match(/Error: (.*)/)?.[1] || 'Unknown';
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });

  console.log('错误统计：');
  console.table(errorTypes);
}

analyzeErrors('logs/app.log');
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1.0 | 2026-03-02 | 初始版本，完整部署指南 |

---

**文档完成于 2026-03-02**  
