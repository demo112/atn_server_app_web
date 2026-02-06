# 用户删除失败 ZodError 修复记录

## 问题描述
- **现象**：用户列表点击删除确认后，控制台报错 `ZodError`，提示删除失败。
- **复现步骤**：
  1. 进入用户管理页面
  2. 点击任意用户的"删除"按钮
  3. 在确认弹窗中点击"确认"
  4. 观察控制台报错 `[error] ZodError`
- **影响范围**：用户管理模块的删除功能。

## 设计锚定
- **所属规格**：UA1 (用户管理)
- **原设计意图**：API 设计中删除接口 `DELETE /api/v1/users/{id}` 成功时应返回成功状态。虽然设计文档未明确指定 Response Body 是 `null` 还是 `undefined`，但后端实现返回了 `data: null`。
- **当前偏离**：后端返回 `data: null`，前端 Service 层使用 `z.void()` 进行校验。`z.void()` 仅接受 `undefined`，遇到 `null` 会抛出校验错误。

## 根因分析
- **直接原因**：前端 `userService.deleteUser` 使用 `z.void()` 校验响应数据。
- **根本原因**：Zod 的 `z.void()` 定义严格（不接受 `null`），而后端 Express/JSON 响应中空数据通常表现为 `null`。
- **相关代码**：
  - Backend: `user.controller.ts` -> `res.json({ success: true, data: null })`
  - Frontend: `user.ts` -> `validateResponse(z.void(), res)`

## 修复方案
- **修复思路**：将前端校验规则从 `z.void()` 调整为 `z.null()`，以匹配后端实际返回的数据结构。
- **改动文件**：
  - `packages/web/src/services/user.ts`

## 验证结果
- [x] 原问题已解决：代码逻辑已修正，`z.null()` 能够正确校验 `null` 值。
- [x] 回归测试通过：已添加测试 `packages/web/src/services/api.test.ts` 验证 `z.null()` 与 `z.void()` 对 null 值的处理差异。
- [x] 设计一致性确认：符合 API 交互现状。

## 文档同步
- [ ] design.md：无需更新，属实现细节。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复用户删除时的 ZodError

原因：后端返回 null 但前端使用 z.void() 校验导致失败
变更：将 deleteUser 的校验规则改为 z.null()
