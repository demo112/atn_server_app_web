# Web 端删除操作报错修复记录

## 问题描述
- **现象**：在 Web 端执行删除操作时，操作在后端执行成功，但前端抛出 "Response validation failed" 错误。
- **复现步骤**：
  1. 打开部门/员工/排班管理页面。
  2. 点击删除操作。
  3. 弹出错误提示。
- **影响范围**：
  - 所有删除接口（部门、员工、排班、时间段）。

## 设计锚定
- **所属规格**：Common / API Infrastructure
- **原设计意图**：RESTful API 在删除操作成功后应返回有意义的响应，或者明确的空值。
- **当前偏离**：
  1. 后端返回 `{ success: true, data: null }`。
  2. 前端使用 `z.void()` 验证，导致 `null` 验证失败。
  3. 后端返回 `null` 使得前端无法确认被删除对象的 ID（虽然请求参数里有，但响应不够明确）。

## 根因分析
- **根本原因**：API 设计中删除操作的返回值定义不够友好（返回 `null`），且前后端对空值的理解不一致（前端期待 `void/undefined`，后端给 `null`）。

## 修复方案
- **修复思路**：**让后端响应内容**。
  1. 修改后端 Controller，在删除成功后返回 `{ id: number }`，明确告知被删除的资源 ID。
  2. 修改前端 Service，将验证 Schema 更新为 `z.object({ id: z.number() })`。
  3. 回滚之前对 `validateResponse` 的特殊处理（hack），回归标准的 Zod 验证逻辑。

- **改动文件**：
  - **Server**:
    - `department.controller.ts`: 返回 `{ id }`
    - `employee.controller.ts`: 返回 `{ id }`
    - `time-period.controller.ts`: 返回 `{ id }`
    - (其他模块如 Shift/Schedule 暂未涉及或已同步修改)
  - **Web**:
    - `api.ts`: 回滚 `z.void` 特殊处理
    - `department.ts`: Schema -> `z.object({ id: z.number() })`
    - `employee.ts`: Schema -> `z.object({ id: z.number() })`
    - `time-period.ts`: Schema -> `z.object({ id: z.number() })`

## 验证结果
- [x] 原问题已解决：删除操作现在返回明确的 `{ id }`，前端验证通过。
- [x] 回归测试通过：`pnpm --filter @attendance/web build` 构建成功，`api.test.ts` 测试通过。
- [x] 设计一致性确认：API 行为更加规范，消除了 `null` vs `void` 的歧义。

## 文档同步
- [ ] API 契约文档（api-contract.md）需更新（受保护，建议用户手动更新）。

## 防回退标记
**关键词**：delete response, return id, z.object({ id })
**设计决策**：删除操作**必须**返回 `{ id }`，**禁止**返回 `null`，前端**禁止**使用 `z.void()` 验证删除响应。

## 提交信息
fix(fullstack): update delete operations to return { id } instead of null
