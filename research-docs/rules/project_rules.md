# 项目规则

这是考勤系统项目的全局规则，所有开发活动必须遵守。

---

## 技术栈

| 类型 | 技术 | 说明 |
|------|------|------|
| 后端运行时 | Node.js | LTS版本 |
| 后端框架 | Express | 轻量级，生态成熟 |
| 语言 | TypeScript | 严格模式 |
| ORM | Prisma | 类型安全 |
| 数据库 | MySQL | 腾讯云托管 |
| 缓存 | Redis | 腾讯云托管 |
| 消息队列 | BullMQ | 基于Redis |
| 前端Web | React | 生态最大 |
| 前端App | React Native | 跨平台 |
| 反向代理 | Nginx | 生产环境 |

---

## 代码规范

### TypeScript

```typescript
// tsconfig.json 必须启用严格模式
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

| 规则 | 说明 |
|------|------|
| 禁止 `any` | 使用 `unknown` 或具体类型 |
| 必须有返回类型 | 所有函数显式声明返回类型 |
| 禁止 `!` 断言 | 使用类型守卫或可选链 |

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getUserById` |
| 类/接口/类型 | PascalCase | `UserService` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件名 | kebab-case | `user-service.ts` |
| 目录名 | kebab-case | `user-management` |

### 文件组织

```
packages/
├── server/                 # 后端
│   └── src/
│       ├── modules/        # 业务模块
│       │   └── {module}/
│       │       ├── {module}.controller.ts
│       │       ├── {module}.service.ts
│       │       ├── {module}.dto.ts
│       │       └── {module}.test.ts
│       ├── common/         # 公共代码
│       └── config/         # 配置
├── web/                    # Web前端
│   └── src/
│       ├── pages/          # 页面
│       ├── components/     # 组件
│       └── hooks/          # Hooks
├── app/                    # App前端
│   └── src/
│       ├── screens/        # 页面
│       ├── components/     # 组件
│       └── hooks/          # Hooks
└── shared/                 # 共享代码
    └── src/
        ├── types/          # 类型定义
        └── utils/          # 工具函数
```

---

## API规范

### 路径格式

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 查询 | `GET /api/v1/users` |
| POST | 创建 | `POST /api/v1/users` |
| PUT | 全量更新 | `PUT /api/v1/users/1` |
| PATCH | 部分更新 | `PATCH /api/v1/users/1` |
| DELETE | 删除 | `DELETE /api/v1/users/1` |

### 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true
  data: T
}

// 错误响应
interface ErrorResponse {
  success: false
  error: {
    code: string      // ERR_{MODULE}_{TYPE}
    message: string   // 用户可读的错误信息
  }
}

// 分页响应
interface PageResponse<T> {
  success: true
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
}
```

### 错误码格式

```
ERR_{MODULE}_{TYPE}

示例：
- ERR_USER_NOT_FOUND
- ERR_AUTH_INVALID_TOKEN
- ERR_ATTENDANCE_DUPLICATE
```

### HTTP状态码

| 状态码 | 用途 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 安全规范

| 规则 | 说明 |
|------|------|
| 禁止硬编码密钥 | 使用环境变量 |
| 输入验证 | 所有用户输入必须验证 |
| SQL注入防护 | 使用Prisma参数化查询 |
| XSS防护 | 输出转义 |
| CSRF防护 | 使用Token |
| 敏感操作日志 | 登录、权限变更等必须记录 |
| 密码存储 | bcrypt加密，禁止明文 |
| Token | JWT，设置过期时间 |

---

## 日志规范

### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| ERROR | 错误，需要关注 | 数据库连接失败 |
| WARN | 警告，可能有问题 | 重试次数过多 |
| INFO | 重要信息 | 用户登录、打卡 |
| DEBUG | 调试信息 | 函数参数、中间状态 |

### 日志格式

```
[时间] [级别] [模块] [用户ID] 消息 {上下文}
```

示例：
```
[2026-01-29 10:30:00] [INFO] [attendance] [user_123] 用户打卡成功 {"type":"check_in","location":"办公室"}
[2026-01-29 10:30:01] [ERROR] [attendance] [user_456] 打卡失败 {"error":"GPS_UNAVAILABLE"}
```

### 禁止记录

- 密码
- Token
- 身份证号
- 银行卡号
- 其他敏感信息

---

## Git规范

### 提交格式

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

### 提交类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复bug |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具变更 |

### 示例

```
feat(attendance): 添加GPS打卡功能

- 实现AttendanceService.checkIn方法
- 添加GPS位置验证
- 添加打卡记录存储

Closes #123
```

### 分支策略

| 分支 | 用途 |
|------|------|
| main | 稳定版本，可部署 |
| feature/* | 功能开发 |
| fix/* | 问题修复 |

---

## 公共代码规则

### 公共代码定义

以下文件属于公共代码：
- `packages/shared/src/types/common.ts`
- `packages/shared/src/utils/common.ts`
- `packages/server/src/common/**/*`

### 修改规则

| 规则 | 说明 |
|------|------|
| 禁止AI自行修改 | AI不得自行修改公共代码 |
| 修改前必须沟通 | 需要修改时，先告知用户 |
| 获得确认后修改 | 用户确认后才能修改 |
| 修改后通知 | 修改后通知所有相关人员 |

### AI遇到需要修改公共代码时

```
⚠️ 需要修改公共代码

我需要修改 `packages/shared/src/types/common.ts`，原因是：
{原因}

修改内容：
{具体修改}

这会影响：
{影响范围}

请确认是否允许修改。
```

---

## 测试规范

### 测试类型

| 类型 | 位置 | 命名 |
|------|------|------|
| 单元测试 | 同目录 | `*.test.ts` |
| 集成测试 | `__tests__/` | `*.integration.test.ts` |
| E2E测试 | `e2e/` | `*.e2e.test.ts` |

### 测试覆盖要求

| 模块 | 最低覆盖率 |
|------|-----------|
| 核心业务逻辑 | 80% |
| 工具函数 | 90% |
| API接口 | 70% |

---

## 环境配置

### 环境变量

```bash
# .env.example
NODE_ENV=development
PORT=3000

# 数据库
DATABASE_URL=mysql://user:pass@host:3306/db

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 日志
LOG_LEVEL=info
```

### 环境区分

| 环境 | 用途 |
|------|------|
| development | 本地开发 |
| test | 测试 |
| production | 生产 |
