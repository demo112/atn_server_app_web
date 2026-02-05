# ZodError Fix Record

## 问题描述
- **现象**：在前端创建用户时，抛出 `ZodError`。
- **复现步骤**：
  1. 打开用户列表页面。
  2. 点击"新增用户"。
  3. 填写表单并提交。
  4. 控制台报错 `ZodError`。
- **影响范围**：用户创建功能不可用。

## 设计锚定
- **所属规格**：UA1 (User Admin 1)
- **原设计意图**：`POST /api/v1/users` 应返回创建成功的用户对象。虽然 `design.md` 未显式定义 POST 响应结构，但 `UserSchema` (Web端) 要求返回包含 `createdAt`、`updatedAt` 的完整用户对象。
- **当前偏离**：
  1. 后端 `UserService.create` 返回的对象缺失 `createdAt` 和 `updatedAt` 字段。
  2. 后端 `employeeId` 可能为 `null`，但前端 Schema 定义为 `number | undefined` (optional)，未处理 `null` 情况。

## 根因分析
- **直接原因**：前端 `userService.createUser` 使用 `UserSchema` 验证响应数据，后端返回数据不满足 Schema 要求。
- **根本原因**：前后端数据契约对齐不严谨，后端 Service 层返回了部分字段，而前端期望完整字段；且对 Nullable 字段的处理不一致。
- **相关代码**：
  - `packages/server/src/modules/user/user.service.ts`
  - `packages/web/src/schemas/user.ts`

## 修复方案
- **修复思路**：
  1. 补全后端返回值：修改 `user.service.ts`，在创建成功后返回 `createdAt` 和 `updatedAt`。
  2. 修正前端 Schema：修改 `UserSchema`，允许 `employeeId` 为 `null`。
- **改动文件**：
  - `packages/server/src/modules/user/user.service.ts`
  - `packages/web/src/schemas/user.ts`
  - `packages/server/src/modules/user/user.service.test.ts` (同步测试)
  - `packages/server/src/modules/user/user.acv.test.ts` (同步测试)

## 验证结果
- [x] 原问题已解决：后端测试通过，返回结构已匹配。
- [x] 回归测试通过：`user.service.test.ts` 和 `user.acv.test.ts` 全部通过。
- [x] 设计一致性确认：符合 `design.md` 中 User 模型定义 (`employeeId` 可为空)。

## 文档同步
- [ ] design.md：无需更新 (design.md 未定义 POST 响应细节，且代码现在符合 User 模型定义)。
- [ ] api-contract.md：无需更新 (同上)。

## 提交信息
fix(user): 修复创建用户时的 ZodError

背景: 前端创建用户时因响应数据结构不匹配抛出 ZodError
变更:
1. 后端 UserService.create 返回完整的 createdAt/updatedAt 字段
2. 前端 UserSchema 允许 employeeId 为 null
影响: 修复了用户创建功能的崩溃问题
