# Web 端删除操作报错修复记录

## 问题描述
- **现象**：在 Web 端执行删除操作（如删除部门、删除排班）时，操作虽然在后端执行成功，但前端抛出 "Response validation failed" 错误。
- **复现步骤**：
  1. 打开部门管理页面。
  2. 点击删除一个部门。
  3. 弹出错误提示。
- **影响范围**：
  - 所有使用 `z.void()` 进行响应验证的删除接口（部门、员工、排班、班次、时间段）。

## 设计锚定
- **所属规格**：Common / API Infrastructure
- **原设计意图**：后端 API 在成功删除时返回 `{ success: true, data: null }`。
- **当前偏离**：前端使用 `z.void()` 验证响应数据。在 Zod 中，`z.void()` 期望输入是 `undefined`，但实际接收到的是 `null`，导致验证失败。

## 根因分析
- **直接原因**：`z.void().parse(null)` 会抛出错误，因为 `null !== undefined`。
- **根本原因**：前端验证逻辑 `validateResponse` 直接将 API 的 `data` 字段（值为 `null`）传给了 `z.void()` schema。

## 修复方案
- **修复思路**：
  1. **兜底修复**：修改 `packages/web/src/services/api.ts` 中的 `validateResponse`，检测如果 schema 是 `z.ZodVoid` 实例，则忽略数据内容，直接返回 `undefined`。这能防止未来有人误用 `z.void()` 导致同样问题。
  2. **规范修复**：修改现有的 Service 文件，将 `delete` 操作的返回 Schema 从 `z.void()` 改为 `z.null()`，以更准确地描述后端返回的数据类型（`null`）。

- **改动文件**：
  - `packages/web/src/services/api.ts`: 添加 `z.ZodVoid` 特殊处理。
  - `packages/web/src/services/api.test.ts`: 添加回归测试用例。
  - `packages/web/src/services/department.ts`: `z.void()` -> `z.null()`
  - `packages/web/src/services/employee.ts`: `z.void()` -> `z.null()`
  - `packages/web/src/services/attendance.ts`: `z.void()` -> `z.null()`
  - `packages/web/src/services/shift.ts`: `z.void()` -> `z.null()`
  - `packages/web/src/services/time-period.ts`: `z.void()` -> `z.null()`

## 验证结果
- [x] 原问题已解决：`api.test.ts` 中新增测试用例 `should handle null data correctly with z.void()` 验证通过。
- [x] 回归测试通过：`pnpm --filter @attendance/web build` 构建成功。
- [x] 设计一致性确认：修复后前端能正确处理后端返回的 `null`，符合 API 契约。

## 文档同步
- 无需更新 design.md，这是实现层面的 bug。

## 防回退标记
**关键词**：z.void(), delete response, validation failed
**设计决策**：在 `validateResponse` 中对 `z.void()` 做宽容处理，同时推荐使用 `z.null()` 匹配 `data: null`。

## 提交信息
fix(web): fix validation error on delete operations due to z.void() mismatch with null response
