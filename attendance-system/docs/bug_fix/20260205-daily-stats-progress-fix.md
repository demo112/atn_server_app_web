# 每日统计查询进度失败修复记录

## 问题描述
- **现象**：每日统计全字段报表页面点击重算后，轮询进度时报错"查询计算进度失败"。
- **复现步骤**：
  1. 进入每日统计全字段报表页面。
  2. 点击"重新计算"按钮。
  3. 等待几秒，页面右上角弹出红色错误提示"查询计算进度失败"。
- **影响范围**：每日统计全字段报表、考勤汇总页、月度考勤卡表页面的重算功能。

## 设计锚定
- **所属规格**：SW70 (Statistics)
- **原设计意图**：前端轮询后端 API `/statistics/calculate/:batchId/status` 获取进度，直到完成。
- **当前偏离**：
  1. **字段缺失**：前端 `web/src/services/statistics.ts` 定义的 `CalculationStatus` 接口和 Zod Schema 强制要求 `progress` 字段，但后端未返回。
  2. **状态未处理**：后端可能返回 `completed_with_errors` 状态（当部分任务失败时），但前端 Schema 和页面逻辑未涵盖此状态，导致 Zod 校验失败或逻辑分支未命中。
  3. **Schema 不匹配**：前端 `DailyRecordVoSchema` 中 `employeeNo` 字段类型定义与 Shared 类型不一致（TypeScript 编译错误）。

## 根因分析
- **直接原因**：
  1. 后端 API 响应缺少 `progress` 字段。
  2. 前端 Zod Schema 过于严格，未包含 `completed_with_errors` 枚举值。
  3. 前端 Schema 类型定义与 Shared 类型不兼容。
- **根本原因**：
  1. 后端实现时未计算百分比进度。
  2. 前端未考虑到批量计算部分失败的场景。
- **相关代码**：
  - `packages/server/src/modules/attendance/attendance-scheduler.ts`
  - `packages/web/src/services/statistics.ts` & `correction.ts`
  - `packages/web/src/schemas/attendance.ts`
  - `packages/web/src/pages/statistics/DailyStatsReport.tsx`
  - `packages/web/src/pages/statistics/SummaryPage.tsx`
  - `packages/web/src/pages/statistics/MonthlyCardReport.tsx`

## 修复方案
1. **后端**：在 `attendance-scheduler.ts` 中计算 `progress` (completed + failed / total * 100) 并返回；明确设置 `completed_with_errors` 状态。
2. **前端 Service**：更新 `CalculationStatus` 接口和 Zod Schema，添加 `completed_with_errors` 状态。
3. **前端页面**：在轮询逻辑中处理 `completed_with_errors`，显示"重算完成，但有部分失败"的提示。
4. **前端 Schema**：修正 `DailyRecordVoSchema` 中 `employeeNo` 的类型定义，使其与 Shared 类型一致。

## 验证结果
- [x] 原问题已解决：后端返回 `progress`，前端能正确解析并显示进度/结果。
- [x] 回归测试通过：
  - Debug 脚本验证后端逻辑正确。
  - 前端构建 (`npm run build`) 通过，无 TypeScript 错误。
  - 代码逻辑检查确认所有重算入口均已处理新状态。
- [x] 设计一致性确认：已更新 `design.md` 中的 API 定义。

## 文档同步
- [x] design.md：已更新 `CalculationStatus` 定义。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(attendance): 修复统计重算进度查询失败及Schema类型错误

- 后端: 增加 progress 字段返回，支持 completed_with_errors 状态
- 前端: 适配新的计算状态，修复 Zod Schema 校验错误
- 修复 DailyRecordVoSchema 中 employeeNo 类型不匹配问题
