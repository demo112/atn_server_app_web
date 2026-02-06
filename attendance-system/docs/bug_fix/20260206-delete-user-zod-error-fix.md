# 用户删除报错修复记录

## 问题描述
- **现象**：点击确认删除用户后，用户被删除，但是控制台报错 `ZodError`。
- **复现步骤**：进入用户列表 -> 点击删除 -> 确认删除。
- **影响范围**：用户管理模块删除功能。

## 设计锚定
- **所属规格**：用户管理 (User Account)
- **原设计意图**：删除操作成功后应无错误返回。
- **当前偏离**：前端 Zod 校验期望 `void`，后端返回 `null`，导致校验失败。

## 根因分析
- **直接原因**：后端接口返回 `{ success: true, data: null }`，前端使用 `z.void()` 校验，而 `z.void()` 不接受 `null`。
- **根本原因**：前后端对空响应的数据类型定义不一致（`null` vs `undefined`）。
- **相关代码**：`packages/web/src/services/user.ts:deleteUser`

## 修复方案
- **修复思路**：修改前端校验逻辑，允许 `data` 为 `null`。
- **改动文件**：`packages/web/src/services/user.ts`

## 验证结果
- [x] 原问题已解决：通过单元测试验证 `z.null()` 可以正确解析 `null`。
- [x] 回归测试通过：TypeScript 类型检查通过。
- [x] 设计一致性确认：符合接口实际行为。

## 文档同步
- [ ] design.md：无需修改
- [ ] api-contract.md：无需修改

## 提交信息
fix(web): 修复删除用户时的 ZodError 报错
