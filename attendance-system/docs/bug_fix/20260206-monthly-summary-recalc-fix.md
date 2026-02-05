# 月度汇总报表考勤计算按钮修复记录

## 问题描述
- **现象**：用户反馈月度汇总报表的考勤计算功能需要与月度卡表一致（带弹窗选择日期范围）。
- **原实现**：原有实现仅支持 `confirm` 弹窗确认整月重算，灵活性差且交互体验不一致。
- **影响范围**：统计报表模块的用户无法灵活触发考勤重算。

## 设计锚定
- **所属规格**：Statistical Report UI
- **设计意图**：提供统一的手动触发考勤计算入口，支持按日期范围和人员重算。
- **当前偏离**：`MonthlySummaryReport` 实现较为简陋，与 `DailyStatsReport` 和 `MonthlyCardReport` 不一致。

## 根因分析
- **直接原因**：早期实现仅满足最基本需求，未跟随最新设计进行迭代。
- **根本原因**：UI 组件未复用标准交互模式。
- **相关代码**：`packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 修复方案
- **修复思路**：
  1. 引入 `StandardModal` 组件。
  2. 替换旧的 `handleCalculate` 为带弹窗的 `handleRecalculate`。
  3. 支持选择开始日期、结束日期和员工ID列表。
  4. 重算后若在当前查看月份范围内，自动刷新数据。
- **改动文件**：
  - `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 验证结果
- [x] 原问题已解决：按钮点击弹出标准对话框，支持灵活重算。
- [x] 回归测试通过：TypeScript 编译通过 (`npm run type-check`)。
- [x] 设计一致性确认：交互方式与其它报表页面保持一致。

## 文档同步
- [ ] design.md：无需更新 (UI 实现细节)。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 升级月度汇总报表考勤计算功能

背景: 统一报表页面的考勤计算交互体验
变更:
1. 月度汇总报表使用 StandardModal 替换原生 confirm
2. 支持按日期范围和人员进行重算
影响: 月度汇总报表模块
