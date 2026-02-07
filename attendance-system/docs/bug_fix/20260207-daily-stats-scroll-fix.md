# 每日统计报表滚动问题修复记录

## 问题描述
- **现象**：每日统计全字段报表页面滚动时，整个页面（包括头部）一起滚动，导致表头无法固定，操作不便。
- **复现步骤**：进入每日统计全字段报表，当数据较多或屏幕较小时，滚动页面。
- **影响范围**：每日统计全字段报表页面。

## 设计锚定
- **所属规格**：statistical-report-ui
- **原设计意图**：参考 `MonthlySummaryReport.tsx`，应采用 Flex 布局，固定头部，仅表格区域滚动。
- **当前偏离**：使用了普通 Block 布局，没有限制容器高度。

## 根因分析
- **直接原因**：根容器使用了 `p-6` 且未设置 `h-full overflow-hidden`，导致内容溢出视口。
- **根本原因**：页面布局结构未遵循 Flex 布局模式。
- **相关代码**：`packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 修复方案
- **修复思路**：
    1.  根容器改为 `flex flex-col h-full overflow-hidden`。
    2.  移除内部多余的 wrapper。
    3.  统一头部样式（参考 `MonthlySummaryReport`）。
    4.  表格容器设置为 `flex-1` 以占据剩余空间，并启用内部滚动。
- **改动文件**：
    - `packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| 月度汇总报表 | `MonthlySummaryReport.tsx` | 已检查（作为参考源） |
| 月度卡表 | `MonthlyCardReport.tsx` | 已检查（实现正确） |

## 验证结果
- [x] 原问题已解决（代码结构已对齐）
- [x] 回归测试通过（Lint 通过）
- [x] 设计一致性确认
- [x] 同类组件已检查

## 提交信息
fix(web): 修复每日统计报表页面滚动行为
