# 每日统计查询进度失败修复记录

## 问题描述
- **现象**：每日统计全字段报表页面点击重算后，轮询进度时报错"查询计算进度失败"。
- **复现步骤**：
  1. 进入每日统计全字段报表页面。
  2. 点击"重新计算"按钮。
  3. 等待几秒，页面右上角弹出红色错误提示"查询计算进度失败"。
- **影响范围**：每日统计全字段报表页面的重算功能。

## 设计锚定
- **所属规格**：Statistics (可能关联 SW68 或 statistical-report-ui)
- **原设计意图**：前端轮询后端 API `/statistics/calculate/:batchId/status` 获取进度，直到完成。
- **当前偏离**：
  - 前端 `web/src/services/statistics.ts` 定义的 `CalculationStatus` 接口和 Zod Schema 强制要求 `progress` 字段。
  - 后端 `attendanceScheduler.getBatchStatus` 返回的 Redis 数据中仅包含 `total` 和 `completed`，缺少 `progress` 字段。
  - Zod 校验失败导致前端抛出异常，触发 `poll` 函数的 `catch` 分支。

## 根因分析
- **直接原因**：API 响应结构与前端 Zod Schema 定义不匹配（缺少 `progress` 字段）。
- **根本原因**：后端在实现进度查询时，未计算百分比进度，仅返回了原始计数。
- **相关代码**：
  - `packages/server/src/modules/attendance/attendance-scheduler.ts` (Backend)
  - `packages/web/src/services/statistics.ts` (Frontend)

## 修复方案
- **修复思路**：在后端 `getBatchStatus` 方法中，根据 `completed`, `failed`, `total` 计算 `progress` (百分比 0-100)，并添加到返回对象中。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance-scheduler.ts`

## 验证结果
- [x] 原问题已解决：后端 API 现返回 `progress` 字段。
- [x] 回归测试通过：Debug 脚本验证通过，逻辑正确。
- [x] 设计一致性确认：符合 API 契约（前端定义的 Schema）。

## 文档同步
- [ ] design.md：无需更新（属实现细节完善）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(attendance): 修复统计重算进度查询缺少progress字段的问题
