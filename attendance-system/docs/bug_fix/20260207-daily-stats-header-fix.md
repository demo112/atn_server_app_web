# 每日报表表头滚动固定修复记录

## 问题描述
- **现象**：每日报表（DailyStatsReport）在纵向滚动时，表头会随内容移动，导致用户无法对应列名。
- **复现步骤**：
  1. 进入“每日统计全字段报表”页面。
  2. 查询大量数据（或缩小窗口）直至出现纵向滚动条。
  3. 向下滚动表格，表头消失。
- **影响范围**：每日报表页面 (`packages/web/src/pages/statistics/DailyStatsReport.tsx`)。

## 设计锚定
- **所属规格**：`statistical-report-ui` (SW62)
- **原设计意图**：提供复杂大宽表展示，参考同类报表（如月度汇总），长列表应支持表头固定 (Sticky Header)。
- **当前偏离**：`DailyStatsReport.tsx` 中 `thead` 内的 `th` 缺少 `sticky top-0` 样式，仅实现了首列横向固定 (`sticky left-0`)。相比之下，`MonthlySummaryReport.tsx` 已经正确实现了双向固定。

## 根因分析
- **直接原因**：`DailyStatsReport.tsx` 的 `th` 元素缺少 `sticky` 和 `top` CSS 属性。
- **根本原因**：在开发该页面时，遗漏了对纵向滚动固定的样式处理，可能只关注了横向滚动。
- **相关代码**：`packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 修复方案
- **修复思路**：
  1. 为 `thead` 中的第一行 `th` 添加 `sticky top-0`。
  2. 为第二行 `th` 添加 `sticky top-[41px]` (计算得出的第一行高度)。
  3. 调整 `z-index`，确保表头层级正确（冻结列 z-30 > 普通表头 z-20 > 冻结列内容 z-10 > 普通内容 z-0）。
  4. 确保 Sticky 表头具有不透明背景 (`bg-slate-50` 或具体颜色)，防止内容穿透。
- **改动文件**：
  - `packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 关联组件（重要）
| 组件 | 文件路径 | 是否同步修复 | 备注 |
|------|----------|--------------|------|
| MonthlySummaryReport | `packages/web/src/pages/statistics/MonthlySummaryReport.tsx` | ❌ | 已正确实现，无需修复 |
| MonthlyCardReport | `packages/web/src/pages/statistics/MonthlyCardReport.tsx` | ❌ | 卡片布局，无复杂表头 |

## 验证结果
- [x] 原问题已解决：代码逻辑已添加 sticky 属性。
- [x] 回归测试通过：`npm run build` 通过。
- [x] 设计一致性确认：与月度汇总报表交互体验一致。
- [x] **同类组件已检查**：确认月度报表无此问题。

## 文档同步
- [ ] design.md：无需更新，属 UI 实现细节。

## 防回退标记
**关键词**：daily stats, sticky header, table scroll
**设计决策**：多行表头采用 CSS Sticky + 硬编码 Top 值实现，需注意不同浏览器的兼容性及行高变化风险。

## 提交信息
fix(web): 修复每日报表表头滚动不固定问题
