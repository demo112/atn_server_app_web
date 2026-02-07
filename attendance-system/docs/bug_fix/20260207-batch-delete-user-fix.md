# 批量删除用户失败修复记录

## 问题描述
- **现象**：在用户管理页面批量删除用户时，提示"部分删除失败，请刷新重试"。
- **复现步骤**：
  1. 进入用户管理页面。
  2. 选中一个或多个用户。
  3. 点击"删除"按钮并确认。
  4. 出现错误提示。
- **影响范围**：用户管理模块的删除功能（单删和批量删除）。

## 设计锚定
- **所属规格**：UA1 (用户管理)
- **原设计意图**：删除操作成功后应无错误返回。后端接口返回 `{ success: true, data: null }`。
- **当前偏离**：前端 Service 层期望返回 `{ id: number }`，导致 Zod 校验失败。虽然之前有修复记录提到改为 `z.null()`，但代码库中实际使用的是错误的 `z.object({ id: z.number() })`。

## 根因分析
- **直接原因**：`userService.deleteUser` 使用 `z.object({ id: z.number() })` 校验响应数据。
- **根本原因**：后端返回 `null`，与前端期望的 Schema 不匹配。
- **相关代码**：`packages/web/src/services/user.ts`

## 修复方案
- **修复思路**：将前端校验规则改为 `z.null()`，以匹配后端实际返回的数据结构。
- **改动文件**：
  - `packages/web/src/services/user.ts`
  - 新增测试 `packages/web/src/services/user.test.ts`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| UserList | `packages/web/src/pages/user/UserList.tsx` | 不需要修改 |

## 验证结果
- [x] 原问题已解决：新增单元测试验证 `deleteUser` 正确处理 `null` 响应。
- [x] 回归测试通过：`type-check` 通过，API 基础测试通过。
- [x] 设计一致性确认：符合后端实际行为。

## 文档同步
- [ ] design.md：无需修改。
- [ ] api-contract.md：无需修改。

## 防回退标记
**关键词**：用户删除、User Delete、ZodError
**设计决策**：后端删除接口返回 `null`，前端必须使用 `z.null()` 校验。

## 提交信息
fix(web): 修复批量删除用户失败的问题

原因：后端返回 null 但前端校验期望对象，导致 ZodError
变更：修正 deleteUser 的响应校验为 z.null()，并添加单元测试
