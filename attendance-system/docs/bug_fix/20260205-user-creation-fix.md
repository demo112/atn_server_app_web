# 用户创建 ZodError 及 409 错误修复记录

## 问题描述
- **现象**：
  - 用户创建失败，控制台报错 `ZodError`。
  - 创建已存在的用户时，控制台报错 `AxiosError: Request failed with status code 409`，但界面无明确提示。
- **复现步骤**：
  1. 打开用户列表页面。
  2. 点击"新建用户"，填写信息并提交。-> 报错 ZodError。
  3. 再次提交相同的用户名。-> 报错 409。
- **影响范围**：用户管理模块（创建/编辑用户）。

## 设计锚定
- **所属规格**：UA1 (用户管理)
- **原设计意图**：
  - 后端应返回创建/更新后的完整用户资源。
  - 前端 `UserSchema` 要求返回 `createdAt` 和 `updatedAt`。
- **当前偏离**：
  - 后端 `userService.create` 和 `update` 返回的部分对象缺少 `createdAt`, `updatedAt`。
  - 前端忽略了 409 错误。

## 根因分析
- **直接原因**：
  1. 后端 Service 层手动构建返回值时漏掉了时间字段。
  2. 前端 `validateResponse` 使用 Zod 强校验，字段缺失导致抛出 ZodError。
  3. 前端错误处理逻辑 `if (!(error instanceof AxiosError))` 导致 AxiosError 被忽略。
- **根本原因**：前后端数据契约实现不一致，且错误处理逻辑存在漏洞。
- **相关代码**：
  - `packages/server/src/modules/user/user.service.ts`
  - `packages/web/src/pages/user/UserList.tsx`

## 修复方案
- **修复思路**：
  1. 后端：补全 Service 返回值。
  2. 前端：优化错误处理，明确捕获 409。
- **改动文件**：
  - `packages/server/src/modules/user/user.service.ts`
  - `packages/web/src/pages/user/UserList.tsx`

## 验证结果
- [x] 原问题已解决：通过 verification test 确认后端返回字段完整。
- [x] 回归测试通过：`user.integration.test.ts` 通过。
- [x] 设计一致性确认：符合 RESTful 风格和前端 Schema 要求。

## 文档同步
- [ ] design.md：无需更新（设计意图未变，只是实现修正）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(user): 修复创建用户时的 ZodError 和 409 错误处理

1. 后端：create/update 接口返回完整的 createdAt/updatedAt 字段
2. 前端：UserList 正确处理 409 Conflict 错误提示
