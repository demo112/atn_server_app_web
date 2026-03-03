# Design: 手机号登录

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: Web 端手机号登录 | API: 修改 `POST /api/v1/auth/login` 支持手机号查找<br>组件: `LoginForm` 修改提示文案 |
| Story 2: App 端手机号登录 | API: 同上<br>组件: `LoginScreen` 修改提示文案 |

## 数据模型

无变更。沿用现有 `User` 和 `Employee` 模型。

```prisma
// 引用现有模型 (只读)
model User {
  id           Int        @id @default(autoincrement())
  username     String     @unique
  passwordHash String
  employeeId   Int?       @unique
  employee     Employee?  @relation(fields: [employeeId], references: [id])
}

model Employee {
  id    Int     @id @default(autoincrement())
  phone String? // 用于查找
  user  User?
}
```

## API定义

### POST /api/v1/auth/login

修改现有登录接口逻辑，无需修改接口定义。

**Request:**
```typescript
interface LoginDto {
  username: string // 这里输入 用户名 或 手机号
  password: string
}
```

**逻辑变更:**
1.  优先按 `username` 精确查找用户。
2.  若未找到，按 `employee.phone` 查找关联用户。
    *   若找到 **1 个** 用户 -> 继续验证密码。
    *   若找到 **0 个** 用户 -> 报错"Invalid credentials"。
    *   若找到 **>1 个** 用户 -> 报错"Invalid credentials" (记录 WARN 日志：手机号重复)。

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/server/src/modules/auth/auth.service.ts | 修改 | `login` 方法增加手机号查找逻辑 |
| packages/web/src/pages/auth/LoginForm.tsx | 修改 | 输入框 placeholder 改为 "用户名 / 手机号" |
| packages/app/src/screens/auth/LoginScreen.tsx | 修改 | 输入框 placeholder 改为 "用户名 / 手机号" |

## 引用的已有代码

- `packages/server/src/common/db/prisma.ts`
- `packages/server/src/common/errors/app-error.ts`

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 用户名登录 | 逻辑变更，增加了一次数据库查询（当用户名未命中时） | 低 |
| 登录性能 | 正常用户无影响，错误用户可能会多一次查询 | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 查找策略 | 先查 username，再查 phone | 保持现有行为优先，避免手机号与用户名冲突时的歧义（虽然概率极低） |
| 手机号重复处理 | 拒绝登录 | 保证安全，防止登录到错误账号。重复手机号应视为数据异常。 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 手机号非唯一 | 多个员工使用同一手机号将无法通过手机号登录 | 在需求文档中已明确，日志记录异常，需人工清洗数据 |

## 需要人决策

- [x] 是否允许重复手机号登录？ -> 否，拒绝登录。
