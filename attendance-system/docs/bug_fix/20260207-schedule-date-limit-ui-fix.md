# 排班日期限制修复记录

## 问题描述
- **现象**：用户在新建排班或批量排班时，可以选择结束日期早于开始日期。
- **复现步骤**：
  1. 进入排班管理页面。
  2. 点击"新建排班"或"批量排班"。
  3. 选择一个开始日期（例如 2026-02-10）。
  4. 选择一个结束日期（例如 2026-02-01）。
  5. 系统未在 UI 上进行阻止。
- **影响范围**：排班管理模块 (SW65)。

## 设计锚定
- **所属规格**：SW65 (排班管理)
- **原设计意图**：需防止无效的日期范围。虽然服务端和提交时有校验，但 UI 应提供实时反馈，提升用户体验。
- **当前偏离**：UI 缺少 `min` 和 `max` 属性限制。

## 根因分析
- **直接原因**：`<input type="date">` 元素缺少 `min` 和 `max` 属性。
- **根本原因**：前端组件开发时遗漏了日期联动限制。
- **相关代码**：
  - `packages/web/src/pages/attendance/schedule/components/ScheduleDialog.tsx`
  - `packages/web/src/pages/attendance/schedule/components/BatchScheduleDialog.tsx`

## 修复方案
- **修复思路**：利用 HTML5 input 的 `min` 和 `max` 属性，当用户选择开始日期时，设置结束日期的 `min` 为开始日期；反之亦然。
- **改动文件**：
  - `packages/web/src/pages/attendance/schedule/components/ScheduleDialog.tsx`
  - `packages/web/src/pages/attendance/schedule/components/BatchScheduleDialog.tsx`
  - `packages/web/src/__tests__/integration/schedule/date-limit.test.tsx` (新增测试)

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| ScheduleDialog | .../ScheduleDialog.tsx | ✅ |
| BatchScheduleDialog | .../BatchScheduleDialog.tsx | ✅ |

## 验证结果
- [x] 原问题已解决：新增测试用例 `src/__tests__/integration/schedule/date-limit.test.tsx` 通过。
- [x] 回归测试通过：`npm test` 通过。
- [x] 编译通过：`npm run build` 通过。

## 提交信息
fix(web): 限制排班开始时间不能晚于结束时间

背景: 用户反馈排班日期选择需增加UI限制。
变更: 
1. ScheduleDialog 和 BatchScheduleDialog 增加日期 min/max 属性联动。
2. 新增集成测试覆盖日期限制逻辑。
影响: 排班弹窗的日期选择行为。
