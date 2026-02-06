# 修复月度汇总手动重算弹窗回归问题

## 问题描述
用户反馈月度汇总页面的"考勤计算"功能出现了手动选择日期的弹窗，这违反了之前约定的"策略跟每日报表的考勤计算保持一致"（即无弹窗，直接重算当前视图范围）的设计原则。

## 原因分析
- 代码中保留了 `StandardModal` 及相关的 `recalcForm` 状态。
- `handleRecalculate` 依赖于弹窗表单的输入，而不是当前页面的 `currentMonth` 状态。

## 修复方案
1. **移除弹窗**：删除 `StandardModal` 组件及相关 UI 状态 (`recalcModalVisible`, `recalcForm`)。
2. **对齐策略**：参考 `DailyStatsReport.tsx` 的实现，点击按钮直接触发重算。
3. **参数适配**：重算范围自动锁定为当前选中的月份 (`currentMonth`)，不再需要用户手动选择日期。

## 变更文件
- `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 验证结果
- `npm run build` (packages/web): **Passed**
- 类型检查通过，无未使用变量。
