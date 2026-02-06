# 日期范围选择逻辑修复记录

## 问题描述
- **现象**：考勤统计及其他页面中，开始日期可以选择晚于结束日期。
- **复现步骤**：
    1. 进入每日统计报表页面。
    2. 选择开始日期晚于当前结束日期。
    3. 系统未做拦截或联动，导致无效查询范围。
- **影响范围**：
    - `DailyStatsReport.tsx`
    - `AttendanceDetailsPage.tsx`
    - `DailyRecords.tsx`

## 设计锚定
- **所属规格**：`statistical-report-ui` 及其他相关模块
- **原设计意图**：提供日期范围查询。
- **当前偏离**：前端未限制非法日期范围（Start > End）。

## 根因分析
- **直接原因**：前端 `input type="date"` 的 `onChange` 事件仅更新状态，未检查日期大小关系。
- **根本原因**：UI 组件交互逻辑缺失。
- **相关代码**：上述文件的 `onChange` 处理函数。

## 修复方案
- **修复思路**：使用 `input[type="date"]` 的 `min` 和 `max` 属性进行限制。当选择开始日期时，自动限制结束日期的最小值为开始日期；当选择结束日期时，自动限制开始日期的最大值为结束日期。
- **改动文件**：
    - `packages/web/src/pages/statistics/DailyStatsReport.tsx`
    - `packages/web/src/pages/attendance/details/AttendanceDetailsPage.tsx`
    - `packages/web/src/pages/attendance/DailyRecords.tsx`
    - `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`
    - `packages/web/src/pages/statistics/MonthlyCardReport.tsx`
    - `packages/web/src/pages/attendance/leave/components/LeaveDialog.tsx`
    - `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx`

## 验证结果
- [x] 原问题已解决（通过代码逻辑审查）
- [x] 回归测试通过（Build & Type Check 通过）
- [x] 设计一致性确认（符合通用 UX）
- [x] 全局扫描确认（已覆盖所有类似日期/时间选择组件）

## 提交信息
fix(web): 修复日期选择器允许开始日期晚于结束日期的问题
