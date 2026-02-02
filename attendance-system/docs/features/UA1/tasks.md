# 任务拆分：UA1 用户与权限

## Task 1: 验证数据模型 (Server)
- **文件**: `packages/server/prisma/schema.prisma`
- **内容**: 确认 User 模型符合设计（已存在，无需创建）
- **验证**: `npx prisma validate`
- **依赖**: 无

## Task 2: 认证服务 (Server)
- **文件**: `packages/server/src/modules/user/auth.service.ts`
- **内容**: 
  - 实现 `validateUser(username, pass)`
  - 实现 `login(user)` 生成 JWT
  - 使用 `bcryptjs` 比较密码
- **验证**: 单元测试覆盖
- **依赖**: Task 1

## Task 3: 认证接口 (Server)
- **文件**: 
  - `packages/server/src/modules/user/auth.controller.ts`
  - `packages/server/src/modules/user/user.dto.ts`
- **内容**: 实现登录接口，DTO 验证
- **验证**: 集成测试 / Postman
- **依赖**: Task 2

## Task 4: 鉴权中间件 (Common)
- **文件**: `packages/server/src/common/middleware/auth.ts` (或类似)
- **内容**: JWT 解析与验证，注入 `req.user`
- **验证**: 测试受保护路由
- **依赖**: Task 2

## Task 5: 用户管理 CRUD (Server)
- **文件**: 
  - `packages/server/src/modules/user/user.service.ts`
  - `packages/server/src/modules/user/user.controller.ts`
- **内容**: 管理员增删改查用户
- **验证**: 集成测试
- **依赖**: Task 1, Task 4
