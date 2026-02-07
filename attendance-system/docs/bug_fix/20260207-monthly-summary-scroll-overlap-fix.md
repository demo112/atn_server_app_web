# 月度汇总报表滚动重叠修复

## 问题描述
- **现象**：滚动月度汇总报表的列表时，内容会溢出重叠，数字插入表头中。
- **复现步骤**：
  1. 进入月度汇总报表页面
  2. 向下滚动列表
  3. 观察表头下方，数据行内容与表头重叠
- **影响范围**：月度汇总报表 (MonthlySummaryReport)

## 设计锚定
- **所属规格**：SW72 (统计报表) / statistical-report-ui
- **原设计意图**：表头应固定在顶部，遮挡滚动上来的数据行。
- **当前偏离**：表头使用了半透明背景色 (`bg-blue-50/40` 等)，导致下方滚动经过的数据行透视显示，产生重叠错觉。

## 根因分析
- **直接原因**：CSS 类名使用了带透明度的背景色 (e.g., `bg-blue-50/40`) 应用于 `sticky` 定位的表头单元格。
- **根本原因**：UI 开发时为了视觉效果使用了半透明背景，未考虑到固定定位元素下层内容滚动时的透视问题。
- **相关代码**：`packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 修复方案
- **修复思路**：将表头和固定列的背景色改为不透明颜色。
- **改动文件**：`packages/web/src/pages/statistics/MonthlySummaryReport.tsx`
  - `bg-blue-50/40` -> `bg-blue-50`
  - `bg-red-50/40` -> `bg-red-50`
  - `bg-indigo-50/40` -> `bg-indigo-50`
  - `bg-slate-50/80` -> `bg-slate-50`
  - `group-hover:bg-blue-50/40` -> `group-hover:bg-blue-50` (左侧固定列)

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| DailyStatsReport | .../DailyStatsReport.tsx | ✅ (检查无此类用法) |
| MonthlyCardReport | .../MonthlyCardReport.tsx | ✅ (检查无此类用法) |

## 验证结果
- [x] 原问题已解决 (移除透明度)
- [x] 回归测试通过 (编译检查通过)
- [x] 设计一致性确认 (视觉上无明显差异，但解决了 Bug)
- [x] 同类组件已检查

## 提交信息
fix(web): 修复月度汇总报表滚动时内容重叠问题
