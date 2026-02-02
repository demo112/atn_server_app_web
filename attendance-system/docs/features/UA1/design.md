# 设计文档：UA1 用户与权限

## 数据模型 (Prisma)

基于 `packages/server/prisma/schema.prisma` 现有定义：

```prisma
// 用户账号 - 负责登录与权限
model User {
  id           Int        @id @default(autoincrement())
  username     String     @unique @db.VarChar(50)
  passwordHash String     @map("password_hash") @db.VarChar(255)
  employeeId   Int?       @unique @map("employee_id")
  role         UserRole   @default(user) // admin, user
  status       UserStatus @default(active) // active, inactive
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  employee     Employee?  @relation(fields: [employeeId], references: [id])

  @@map("users")
}

// 员工档案 - 负责业务关联 (在 UA2 中详细管理)
model Employee {
  id         Int      @id @default(autoincrement())
  // ... 略
}
```

## API 设计

### Auth
- POST /api/v1/auth/login
  - Req: `LoginDto { username, password }`
  - Res: `{ token, user: { id, username, role } }`
- POST /api/v1/auth/register (可选，初期仅管理员创建)

### User (管理员)
- GET /api/v1/users
  - Query: `page, limit, keyword`
- POST /api/v1/users
  - Req: `CreateUserDto { username, password, role, employeeId? }`
- GET /api/v1/users/:id
- PATCH /api/v1/users/:id
  - Req: `UpdateUserDto`
- DELETE /api/v1/users/:id

## 模块结构
packages/server/src/modules/user/
├── auth.controller.ts
├── auth.service.ts
├── user.controller.ts
├── user.service.ts
└── user.dto.ts
