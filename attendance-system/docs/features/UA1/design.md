# Design: UA1 用户管理与认证

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 用户账号管理 | API: GET/POST/PUT/DELETE /api/v1/users, 组件: UserList, UserModal |
| Story 2: 用户登录 | API: POST /api/v1/auth/login, 组件: LoginForm, AuthContext |
| Story 3: 接口安全认证 | Middleware: authMiddleware, Interceptor: axios.interceptors |

## 数据模型

> 现有 `prisma/schema.prisma` 已包含 `User` 模型，本次无需修改 Schema。

```prisma
// 引用现有模型 (只读)
model User {
  id           Int        @id @default(autoincrement())
  username     String     @unique @db.VarChar(50)
  passwordHash String     @map("password_hash") @db.VarChar(255)
  employeeId   Int?       @unique @map("employee_id")
  role         UserRole   @default(user)
  status       UserStatus @default(active)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  // ... relations
}

enum UserRole {
  admin
  user
}

enum UserStatus {
  active
  inactive
}
```

## API定义

### 1. Auth 模块

#### POST /api/v1/auth/login

用户登录获取 Token。

**Request:**
```typescript
interface LoginDto {
  username: string
  password: string // 明文，后端验证
}
```

**Response:**
```typescript
interface LoginVo {
  token: string
  user: {
    id: number
    username: string
    role: 'admin' | 'user'
    name?: string // 关联的 employee name (如果有)
  }
}
```

#### GET /api/v1/auth/me

获取当前用户信息（验证 Token）。

**Response:**
```typescript
interface MeVo {
  id: number
  username: string
  role: 'admin' | 'user'
  permissions: string[]
}
```

### 2. User 模块

#### GET /api/v1/users

获取用户列表。

**Request (Query):**
```typescript
interface GetUsersDto {
  page?: number
  pageSize?: number
  keyword?: string // 搜索 username 或 employee.name
  status?: 'active' | 'inactive'
}
```

**Response:**
```typescript
interface UserListVo {
  items: Array<{
    id: number
    username: string
    role: 'admin' | 'user'
    status: 'active' | 'inactive'
    employeeName?: string
    createdAt: string
  }>
  total: number
}
```

#### POST /api/v1/users

创建用户。

**Request:**
```typescript
interface CreateUserDto {
  username: string
  password?: string // 可选，默认 123456
  role: 'admin' | 'user'
  employeeId?: number // 关联员工
}
```

#### PUT /api/v1/users/:id

更新用户。

**Request:**
```typescript
interface UpdateUserDto {
  role?: 'admin' | 'user'
  status?: 'active' | 'inactive'
  password?: string // 重置密码时传
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| **Server** | | |
| `packages/server/src/modules/auth/auth.dto.ts` | 新增 | LoginDto 定义 |
| `packages/server/src/modules/auth/auth.service.ts` | 新增 | 登录、Token 生成逻辑 |
| `packages/server/src/modules/auth/auth.controller.ts` | 新增 | Auth 接口处理 |
| `packages/server/src/common/middleware/auth.ts` | 新增 | JWT 验证中间件 |
| `packages/server/src/modules/user/user.dto.ts` | 新增 | User CRUD DTO |
| `packages/server/src/modules/user/user.service.ts` | 新增 | User CRUD 逻辑 |
| `packages/server/src/modules/user/user.controller.ts` | 新增 | User 接口处理 |
| `packages/server/src/modules/user/user.routes.ts` | 新增 | User 路由定义 |
| `packages/server/src/index.ts` | 修改 | 注册路由 |
| **Shared** | | |
| `packages/shared/src/types/user.ts` | 新增 | User 相关类型定义 |
| **Web** | | |
| `packages/web/src/pages/login/index.tsx` | 新增 | 登录页面 |
| `packages/web/src/pages/user/index.tsx` | 新增 | 用户列表页面 |
| `packages/web/src/pages/user/components/UserModal.tsx` | 新增 | 用户编辑弹窗 |
| `packages/web/src/utils/auth.ts` | 新增 | Token 存储与 Axios 拦截器 |
| **App** | | |
| `packages/app/src/screens/auth/LoginScreen.tsx` | 新增 | App 登录页面 |
| `packages/app/src/utils/auth.ts` | 新增 | SecureStore Token 存储 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| **密码哈希** | `bcryptjs` | 标准、安全、Node.js 兼容性好 |
| **Token** | `jsonwebtoken` (JWT) | 无状态认证，适合多端 |
| **Token 存储 (Web)** | `localStorage` | 实现简单，配合 HTTPS 使用 |
| **Token 存储 (App)** | `expo-secure-store` | 安全存储敏感信息 |
| **默认密码** | `123456` | 简化初始创建流程，后续强制修改 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 默认密码安全性 | 容易被猜解 | 创建后提示用户尽快修改密码 |
| Token 泄露 | 可冒充用户 | Token 有效期设为 7 天，敏感操作需二次验证 |

## 需要你决策
- [ ] 默认密码策略是否接受 `123456`？
- [ ] 是否需要 refresh token 机制？(当前设计仅使用 access token，过期需重新登录，简化实现)
