# 班次列表分页修复记录

## 问题描述
- **现象**：班次列表页面一次性加载所有数据，未实现分页功能，且 API 返回类型校验与 Zod 版本存在冲突。
- **复现步骤**：
  1. 进入 Web 端考勤管理 -> 班次管理。
  2. 列表底部无分页控件。
  3. 后端 API 虽然定义了分页参数但 Service 层未完全实现分页逻辑（或未被调用）。
  4. 类型检查报错：`ZodObject ... is not assignable to ZodType ...`。
- **影响范围**：Web 端班次管理页面 (`ShiftPage`)。

## 设计锚定
- **所属规格**：SW64
- **原设计意图**：`docs/features/SW64/requirements_web.md` 中 AC3 明确要求 "支持分页展示（若班次较多）"。
- **当前偏离**：代码未实现 AC3，且存在类型系统冲突。

## 根因分析
- **直接原因**：前端 Service 未处理分页响应，页面缺少分页组件；`packages/web` 和 `packages/shared` 使用了不兼容的 `zod` 版本（web 使用 v4.x, shared 使用 v3.x）。
- **根本原因**：开发阶段遗漏了分页功能的完整实现；依赖管理未统一 workspace 内的库版本。
- **相关代码**：
  - `packages/web/src/pages/attendance/shift/ShiftPage.tsx`
  - `packages/web/src/services/shift.ts`
  - `packages/web/package.json`

## 修复方案
- **修复思路**：
  1. 统一 `zod` 版本为 `^3.24.1`。
  2. 后端 Service 实现分页查询 (`skip`, `take`, `count`)。
  3. 前端 Service 适配分页响应结构。
  4. 前端页面集成 `Pagination` 组件并管理分页状态。
- **改动文件**：
  - `packages/web/package.json`
  - `packages/web/src/pages/attendance/shift/ShiftPage.tsx`
  - `packages/web/src/services/shift.ts`
  - `packages/web/src/pages/attendance/shift/components/Pagination.tsx` (New)
  - `packages/server/src/modules/attendance/attendance-shift.service.ts`
  - `packages/server/src/modules/attendance/attendance-shift.controller.ts`

## 验证结果
- [x] 原问题已解决：代码逻辑支持分页，UI 显示分页控件。
- [x] 回归测试通过：`npm run type-check` 通过，Service 单元测试通过。
- [x] 设计一致性确认：符合 AC3 要求。

## 文档同步
- [ ] design.md：无需更新 (requirements_web.md 已包含)
- [ ] api-contract.md：无需更新 (API 结构符合通用分页规范)

## 提交信息
fix(web): 修复班次列表未分页及 Zod 类型冲突问题
