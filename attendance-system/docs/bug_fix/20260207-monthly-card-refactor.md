# 2026-02-07 月度考勤卡表布局重构

## 问题描述
用户反馈“查看月度卡片”页面（MonthlyCardReport）之前的滚动修复仍然不理想，要求复用“月度汇总报表”（MonthlySummaryReport）的列表组件结构，以保持 UI 一致性和更好的滚动体验。

## 重构内容
将 `MonthlyCardReport` 的页面布局重构为与 `MonthlySummaryReport` 一致的结构：

1.  **拆分 Card**：将原本包含所有内容的单一 Card 拆分为“筛选区”和“列表区”两个独立的 Card。
2.  **布局优化**：
    - 顶部：Header。
    - 上部：筛选 Card（月份选择、查询范围、查询/重置按钮）。
    - 中部：操作按钮行（导出、计算），放置在列表上方，而非筛选 Card 内部。
    - 下部：列表 Card，占据剩余空间 (`flex-1`)，包含表格和分页。
3.  **表格滚动**：
    - 列表 Card 使用 `flex-col flex-1 overflow-hidden` 布局。
    - 表格容器使用 `flex-1 overflow-x-auto`，配合 `sticky` 表头，实现表头固定、内容滚动的效果。
4.  **业务逻辑保留**：
    - 保持了原有的数据源 (`AttendanceSummaryVo`)、列定义和“查看详情”操作按钮逻辑。
    - 保持了原有的 Modal 详情查看逻辑。

## 影响范围
- `packages/web/src/pages/statistics/MonthlyCardReport.tsx`

## 验证
- 代码审查：确认布局结构与 `MonthlySummaryReport` 高度一致。
- 构建验证：`npm run build` 通过（忽略了其他无关的 TS 错误）。
