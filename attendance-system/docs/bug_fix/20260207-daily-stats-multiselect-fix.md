# 每日统计报表多选功能修复记录

## 问题描述
- **现象**：在每日统计报表中，点击筛选员工的输入框（div），弹出的选择器只能选择单个员工。用户反馈 "div 只能单选"。
- **复现步骤**：
  1. 进入"每日统计全字段报表"页面。
  2. 点击"查询范围"输入框。
  3. 在弹出的模态框中尝试选择多个员工。
  4. 发现每次选择都会覆盖上一次的选择，无法多选。
- **影响范围**：每日统计报表 (DailyStatsReport) 无法进行多员工对比或批量查询。

## 设计锚定
- **所属规格**：SW68 (Statistical Report UI) / Story 2
- **原设计意图**：虽然 Design Doc 未明确说明，但作为统计报表，支持多选（如按部门或多个员工）是标准需求。
- **当前偏离**：前端组件被显式限制为 `multiple={false}`，且后端接口原仅支持单 ID 查询。

## 根因分析
- **直接原因**：`DailyStatsReport.tsx` 中 `PersonnelSelectionModal` 组件的 `multiple` 属性被硬编码为 `false`。
- **根本原因**：后端 API (`StatisticsController`) 和 Shared 类型 (`DailyRecordQuery`) 在设计初期仅考虑了单员工查询场景，导致前端只能限制为单选以匹配后端能力。
- **相关代码**：
  - `packages/web/src/pages/statistics/DailyStatsReport.tsx`
  - `packages/server/src/modules/statistics/statistics.controller.ts`

## 修复方案
- **修复思路**：全栈打通多选支持。
  1. **Shared**: 更新 `DailyRecordQuery` 类型支持数组。
  2. **Server**: 更新 Controller 解析数组参数，更新 Service 使用 `in` 查询。
  3. **Web**: 开启 `PersonnelSelectionModal` 的多选模式，并正确传递数组参数。
- **改动文件**：
  - `packages/shared/src/types/attendance/record.ts`
  - `packages/server/src/modules/statistics/statistics.controller.ts`
  - `packages/server/src/modules/statistics/statistics.service.ts`
  - `packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 关联组件（重要）
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PunchFilter | `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx` | ❌ (暂未修复，需确认需求) |
| MonthlySummary | `packages/web/src/pages/statistics/MonthlySummaryReport.tsx` | ❌ (暂未涉及) |

## 验证结果
- [x] 原问题已解决：前端已开启多选，参数传递支持数组。
- [x] 回归测试通过：Server 端 Build 通过，Service 逻辑覆盖单/多选。
- [x] 设计一致性确认：符合报表查询的通用交互设计。

## 文档同步
- [ ] design.md：无需更新，属实现细节优化。
- [ ] api-contract.md：无需更新，Query 参数通常兼容单值/多值。

## 防回退标记
**关键词**：DailyStatsReport, multiple selection, employeeId array
**设计决策**：报表类页面应默认支持多选，后端接口应使用 `in` 查询兼容数组参数。

## 提交信息
fix(statistics): enable multiple employee selection in daily stats report

- feat(shared): update DailyRecordQuery to support employeeId array
- feat(server): update statistics api to handle multiple employee ids
- fix(web): enable multiple mode in PersonnelSelectionModal for daily stats
