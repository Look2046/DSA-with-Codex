
# API_DOCUMENTATION.md

## 📋 目录

1. [概述](#概述)
2. [基础信息](#基础信息)
3. [认证](#认证)
4. [错误处理](#错误处理)
5. [分页](#分页)
6. [速率限制](#速率限制)
7. [模块端点](#模块端点)
8. [动画端点](#动画端点)
9. [用户端点](#用户端点)
10. [进度追踪](#进度追踪)
11. [数据端点](#数据端点)
12. [Webhooks](#webhooks)
13. [SDK 文档](#sdk-文档)
14. [常见问题](#常见问题)

---

## 概述

**算法可视化系统 REST API** 提供完整的接口来管理模块、动画、用户进度和数据。

> 范围说明（与 ARCHITECTURE 对齐）：v1 默认可离线运行（无需登录，LocalStorage）；本文件定义的是 **启用后端服务后的可选 API 能力**（用户、认证、进度同步等）。

- **基础 URL**：`https://api.example.com/v1`
- **API 版本**：v1
- **响应格式**：JSON
- **认证**：Bearer Token (JWT)

### 环境

| 环境 | URL | 用途 |
|------|-----|------|
| **开发** | `http://localhost:3000/v1` | 本地开发 |
| **测试** | `https://api-staging.example.com/v1` | 测试环境 |
| **生产** | `https://api.example.com/v1` | 生产环境 |

---

## 基础信息

### HTTP 方法

| 方法 | 用途 |
|------|------|
| `GET` | 获取资源 |
| `POST` | 创建新资源 |
| `PUT` | 完全更新资源 |
| `PATCH` | 部分更新资源 |
| `DELETE` | 删除资源 |

### 请求头

```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>  // 可选，用于追踪
X-Client-Version: <version>  // 可选
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "meta": {
    "timestamp": "2026-03-02T10:30:00Z",
    "requestId": "uuid-here"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误信息",
    "details": {
      // 额外错误信息
    }
  },
  "meta": {
    "timestamp": "2026-03-02T10:30:00Z",
    "requestId": "uuid-here"
  }
}
```

---

## 认证

### 获取 Token

#### 注册

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123",
  "name": "User Name"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### 登录

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### 刷新 Token

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "new_token_here",
    "expiresIn": 86400
  }
}
```

### 使用 Token

在后续请求中添加 Authorization 头：

```http
GET /v1/modules
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 错误处理

### HTTP 状态码

| 状态码 | 含义 | 示例 |
|-------|------|------|
| `200` | OK | 请求成功 |
| `201` | Created | 资源创建成功 |
| `204` | No Content | 删除成功 |
| `400` | Bad Request | 请求参数错误 |
| `401` | Unauthorized | 未认证 |
| `403` | Forbidden | 无权限 |
| `404` | Not Found | 资源不存在 |
| `409` | Conflict | 资源冲突 |
| `429` | Too Many Requests | 请求过于频繁 |
| `500` | Internal Server Error | 服务器错误 |

### 错误代码

```
AUTH_REQUIRED         - 需要认证
INVALID_TOKEN         - Token 无效
TOKEN_EXPIRED         - Token 已过期
INVALID_CREDENTIALS   - 凭证无效
USER_NOT_FOUND        - 用户不存在
RESOURCE_NOT_FOUND    - 资源不存在
VALIDATION_ERROR      - 验证失败
RATE_LIMIT_EXCEEDED   - 超过速率限制
PERMISSION_DENIED     - 权限不足
INTERNAL_ERROR        - 内部错误
```

### 错误示例

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "email": "邮箱格式不正确",
      "password": "密码至少需要 8 个字符"
    }
  }
}
```

---

## 分页

### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `page` | integer | 1 | 页码 |
| `limit` | integer | 20 | 每页数量（最大 100） |
| `sort` | string | -createdAt | 排序字段（`-` 表示降序） |
| `search` | string | - | 搜索关键词 |

### 分页示例

```http
GET /v1/modules?page=2&limit=10&sort=-updatedAt&search=sort
```

### 分页响应

```json
{
  "success": true,
  "data": [
    { "id": "module_1", "name": "冒泡排序" },
    { "id": "module_2", "name": "快速排序" }
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## 速率限制

### 限制规则

- **未认证用户**：10 请求/分钟
- **认证用户**：100 请求/分钟
- **高级用户**：1000 请求/分钟

### 速率限制头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1646228400
```

### 超限响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试",
    "retryAfter": 60
  }
}
```

---

## 模块端点

### 获取所有模块

```http
GET /v1/modules
Authorization: Bearer <token>
```

**参数：**
- `category` (string) - 分类：sort, search, graph, tree
- `difficulty` (number) - 难度：1-5
- `page` (number) - 页码
- `limit` (number) - 每页数量

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "bubble-sort",
      "name": "冒泡排序",
      "description": "通过重复遍历数组，比较相邻元素并交换...",
      "category": "sort",
      "difficulty": 1,
      "estimatedTime": 300,
      "prerequisites": [],
      "thumbnail": "https://...",
      "tags": ["排序", "初级"],
      "rating": 4.5,
      "ratingCount": 1234,
      "views": 5678,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

### 获取模块详情

```http
GET /v1/modules/:moduleId
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "bubble-sort",
    "name": "冒泡排序",
    "description": "...",
    "category": "sort",
    "difficulty": 1,
    "content": {
      "overview": "算法概述",
      "complexity": {
        "time": "O(n²)",
        "space": "O(1)"
      },
      "pseudocode": "function bubbleSort(arr) { ... }",
      "explanation": "详细解释"
    },
    "animations": [
      {
        "id": "anim_1",
        "name": "基础演示",
        "description": "基础冒泡排序演示"
      }
    ],
    "resources": [
      {
        "type": "video",
        "url": "https://...",
        "title": "视频教程"
      }
    ],
    "relatedModules": ["quick-sort", "merge-sort"],
    "author": { /* 作者信息 */ },
    "stats": {
      "views": 5678,
      "rating": 4.5,
      "completionRate": 0.75
    }
  }
}
```

### 创建模块（管理员）

```http
POST /v1/modules
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "新算法",
  "description": "算法描述",
  "category": "sort",
  "difficulty": 2,
  "estimatedTime": 600,
  "content": {
    "overview": "...",
    "complexity": { "time": "O(n log n)", "space": "O(n)" },
    "pseudocode": "..."
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "new-algo",
    "name": "新算法",
    "createdAt": "2026-03-02T10:30:00Z"
  }
}
```

### 更新模块（管理员）

```http
PATCH /v1/modules/:moduleId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "更新后的名称",
  "difficulty": 3
}
```

### 删除模块（管理员）

```http
DELETE /v1/modules/:moduleId
Authorization: Bearer <admin_token>
```

---

## 动画端点

### 获取模块的动画列表

```http
GET /v1/modules/:moduleId/animations
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "anim_1",
      "moduleId": "bubble-sort",
      "name": "基础演示",
      "description": "5个元素的排序演示",
      "dataSize": 5,
      "totalDuration": 5000,
      "steps": 28,
      "difficulty": "beginner",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 获取特定动画

```http
GET /v1/modules/:moduleId/animations/:animationId
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "anim_1",
    "moduleId": "bubble-sort",
    "name": "基础演示",
    "description": "5个元素的排序演示",
    "dataSize": 5,
    "totalDuration": 5000,
    "steps": [
      {
        "id": "step-1",
        "name": "初始化",
        "description": "创建数组",
        "duration": 500,
        "dataState": {
          "array": [5, 3, 1, 4, 2],
          "nodes": [ /* ... */ ]
        },
        "highlights": {
          "nodes": [],
          "edges": []
        },
        "codeHighlight": {
          "language": "javascript",
          "startLine": 1,
          "endLine": 5
        },
        "stats": {
          "comparisons": 0,
          "swaps": 0
        }
      }
    ],
    "metadata": {
      "algorithm": "Bubble Sort",
      "dataSize": 5,
      "generatedAt": 1646228400000
    }
  }
}
```

### 生成新动画

```http
POST /v1/modules/:moduleId/animations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "自定义演示",
  "description": "使用自定义数据的演示",
  "data": [7, 2, 8, 1, 9],
  "options": {
    "speed": 1,
    "highlightComparisons": true,
    "showStats": true
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "anim_custom_123",
    "moduleId": "bubble-sort",
    "name": "自定义演示",
    "totalDuration": 6200,
    "steps": 32
  }
}
```

---

## 用户端点

### 获取当前用户信息

```http
GET /v1/users/me
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://...",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00Z",
    "preferences": {
      "theme": "light",
      "language": "zh",
      "fontSize": 14,
      "notificationsEnabled": true
    },
    "stats": {
      "totalModulesCompleted": 15,
      "totalTimeSpent": 3600,
      "totalAnimationsViewed": 145,
      "averageScore": 85
    }
  }
}
```

### 更新用户信息

```http
PATCH /v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

### 修改密码

```http
POST /v1/users/me/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### 获取用户排名

```http
GET /v1/users/leaderboard
Authorization: Bearer <token>
```

**参数：**
- `period` - "week", "month", "all"
- `limit` - 返回数量

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "user_abc",
      "name": "Top User",
      "score": 9500,
      "modulesCompleted": 45,
      "avatar": "https://..."
    },
    {
      "rank": 2,
      "userId": "user_123",
      "name": "Your Name",
      "score": 8200,
      "modulesCompleted": 38
    }
  ]
}
```

---

## 进度追踪

### 获取用户进度

```http
GET /v1/users/me/progress
Authorization: Bearer <token>
```

**参数：**
- `moduleId` (string) - 特定模块的进度
- `category` (string) - 特定分类

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "moduleId": "bubble-sort",
      "moduleName": "冒泡排序",
      "visited": true,
      "completed": true,
      "completionDate": "2026-03-01T15:30:00Z",
      "score": 92,
      "timeSpent": 1200,
      "lastViewedAt": "2026-03-02T10:00:00Z",
      "attempts": 3,
      "bestAttempt": {
        "score": 92,
        "timeSpent": 1200
      }
    }
  ]
}
```

### 记录模块访问

```http
POST /v1/users/me/progress/:moduleId/visit
Authorization: Bearer <token>
Content-Type: application/json

{
  "timestamp": "2026-03-02T10:30:00Z"
}
```

### 记录模块完成

```http
POST /v1/users/me/progress/:moduleId/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 92,
  "timeSpent": 1200,
  "animationId": "anim_1",
  "completionDate": "2026-03-02T10:30:00Z"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "moduleId": "bubble-sort",
    "completed": true,
    "score": 92,
    "achievements": [
      {
        "id": "first_module",
        "name": "First Steps",
        "description": "完成第一个模块"
      }
    ]
  }
}
```

### 获取统计数据

```http
GET /v1/users/me/stats
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalModules": 50,
    "completedModules": 15,
    "completionRate": 0.30,
    "totalTimeSpent": 3600,
    "averageScore": 85,
    "lastActiveAt": "2026-03-02T10:30:00Z",
    "streakDays": 7,
    "longestStreak": 14,
    "achievements": [
      {
        "id": "first_module",
        "name": "First Steps",
        "unlockedAt": "2026-01-15T00:00:00Z"
      }
    ],
    "categoryStats": {
      "sort": { "completed": 8, "total": 20, "avgScore": 87 },
      "search": { "completed": 5, "total": 15, "avgScore": 82 },
      "graph": { "completed": 2, "total": 10, "avgScore": 78 }
    }
  }
}
```

---

## 数据端点

### 导出用户数据

```http
GET /v1/users/me/export
Authorization: Bearer <token>
```

**参数：**
- `format` - "json" 或 "csv"
- `include` - 逗号分隔的包含项：progress, preferences, achievements

**响应：** 下载文件

### 删除账户

```http
DELETE /v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "不再使用",
  "feedback": "可选的反馈信息"
}
```

### 获取算法数据集

```http
GET /v1/datasets/:datasetId
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "dataset_1",
    "name": "排序算法数据集",
    "description": "用于测试排序算法的数据集",
    "cases": [
      {
        "name": "Small Array",
        "data": [5, 2, 8, 1, 9],
        "expectedOutput": [1, 2, 5, 8, 9],
        "difficulty": "easy"
      },
      {
        "name": "Large Array",
        "data": [/* 10000个元素 */],
        "expectedOutput": [/* 排序后 */],
        "difficulty": "hard"
      }
    ]
  }
}
```

---

## Webhooks

### 注册 Webhook

```http
POST /v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["module.completed", "achievement.unlocked"],
  "active": true
}
```

### Webhook 事件类型

| 事件 | 触发时机 |
|------|---------|
| `module.visited` | 用户访问模块 |
| `module.completed` | 用户完成模块 |
| `achievement.unlocked` | 用户解锁成就 |
| `user.created` | 新用户注册 |
| `user.updated` | 用户信息更新 |

### Webhook 负载示例

```json
{
  "id": "webhook_event_123",
  "event": "module.completed",
  "timestamp": "2026-03-02T10:30:00Z",
  "data": {
    "userId": "user_123",
    "moduleId": "bubble-sort",
    "score": 92,
    "completionTime": 1200
  },
  "signature": "sha256=abcdef123456"
}
```

### 验证 Webhook 签名

```typescript
// Node.js 示例
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}

// 使用
const isValid = verifyWebhookSignature(
  JSON.stringify(webhookPayload),
  'sha256=abcdef123456',
  'your_webhook_secret'
);
```

---

## SDK 文档

### JavaScript/TypeScript SDK

#### 安装

```bash
npm install @algorithm-viz/sdk
```

#### 初始化

```typescript
import { AlgorithmVizSDK } from '@algorithm-viz/sdk';

const client = new AlgorithmVizSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.example.com/v1',
  timeout: 30000,
});
```

#### 使用示例

```typescript
// 获取所有模块
const modules = await client.modules.list({
  category: 'sort',
  difficulty: 1,
  page: 1,
  limit: 10,
});

// 获取特定模块
const module = await client.modules.get('bubble-sort');

// 生成动画
const animation = await client.animations.create('bubble-sort', {
  data: [5, 3, 1, 4, 2],
  options: { speed: 1 },
});

// 获取用户进度
const progress = await client.users.getProgress();

// 记录模块完成
await client.users.completeModule('bubble-sort', {
  score: 92,
  timeSpent: 1200,
});

// 获取排行榜
const leaderboard = await client.users.getLeaderboard({
  period: 'month',
  limit: 10,
});
```

### Python SDK

#### 安装

```bash
pip install algorithm-viz
```

#### 使用示例

```python
from algorithm_viz import AlgorithmVizClient

client = AlgorithmVizClient(
    api_key='your-api-key',
    base_url='https://api.example.com/v1'
)

# 获取模块
modules = client.modules.list(category='sort', difficulty=1)

# 获取用户进度
progress = client.users.get_progress()

# 完成模块
client.users.complete_module('bubble-sort', score=92, time_spent=1200)
```

---

## 常见问题

### Q1: 如何处理 Token 过期？

**A:** 监听 401 错误，使用 `refresh_token` 获取新 token：

```typescript
if (error.status === 401) {
  const newToken = await client.auth.refresh(refreshToken);
  localStorage.setItem('token', newToken);
  // 重试原请求
}
```

### Q2: 如何优化 API 调用性能？

**A:** 
1. 使用缓存策略
2. 批量请求而非单个请求
3. 使用分页处理大数据集
4. 启用 Gzip 压缩

```typescript
// 缓存示例
const cache = new Map();

async function getModuleWithCache(moduleId) {
  if (cache.has(moduleId)) {
    return cache.get(moduleId);
  }
  
  const module = await client.modules.get(moduleId);
  cache.set(moduleId, module);
  return module;
}
```

### Q3: 如何处理大量数据导出？

**A:** 使用分页和流式处理：

```typescript
async function* exportAllProgress() {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const result = await client.users.getProgress({
      page: page,
      limit: 100,
    });
    
    yield result.data;
    
    hasMore = result.pagination.hasNextPage;
    page++;
  }
}

// 使用
for await (const batch of exportAllProgress()) {
  // 处理每一批数据
  await saveToDB(batch);
}
```

### Q4: API 支持哪些排序字段？

**A:** 支持的排序字段：
- `createdAt` - 创建时间
- `updatedAt` - 更新时间
- `name` - 名称
- `rating` - 评分
- `views` - 浏览数
- `difficulty` - 难度

使用 `-` 前缀表示降序：`sort=-createdAt`

### Q5: 如何实现离线支持？

**A:** 使用 Service Worker 和本地存储：

```typescript
import { openDB } from 'idb';

const db = await openDB('algorithm-viz-cache', 1, {
  upgrade(db) {
    db.createObjectStore('modules');
    db.createObjectStore('animations');
  },
});

// 缓存 API 响应
async function cacheModule(moduleId, data) {
  await db.put('modules', { id: moduleId, ...data });
}

// 离线获取
async function getModuleOffline(moduleId) {
  try {
    return await client.modules.get(moduleId);
  } catch (error) {
    return await db.get('modules', moduleId);
  }
}
```

### Q6: 如何进行 API 测试？

**A:** 使用 Postman 集合或 curl：

```bash
# 登录
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# 保存 token
TOKEN="returned_token_here"

# 获取模块
curl -X GET https://api.example.com/v1/modules \
  -H "Authorization: Bearer $TOKEN"

# 记录完成
curl -X POST https://api.example.com/v1/users/me/progress/bubble-sort/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score":92,"timeSpent":1200}'
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|-----|------|---------|
| v1 | 2026-03-02 | 初始版本 |

---

## 支持

- **文档**：https://docs.example.com
- **状态页**：https://status.example.com
- **问题报告**：support@example.com
- **Slack 社区**：https://slack.example.com

**文档完成于 2026-03-02**  
