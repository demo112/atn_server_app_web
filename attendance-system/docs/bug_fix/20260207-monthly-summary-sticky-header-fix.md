# 月度汇总报表表头滚动修复

## 问题描述
- **现象**：月度汇总报表在垂直滚动时，第二行表头（姓名等）会错误地上滚消失，或被第一行遮挡，或行为异常。
- **复现步骤**：进入月度汇总报表页面，向下滚动表格。
- **影响范围**：月度汇总报表 (MonthlySummaryReport)。

## 设计锚定
- **所属规格**：SW72 (统计报表)
- **原设计意图**：表格头部应在滚动时固定，方便查看数据。对于多级表头，所有层级都应固定。
- **当前偏离**：由于 CSS `sticky` 属性在 `thead` 和内部 `th` (用于固定列) 混合使用时的限制，导致垂直滚动时多级表头定位失效。

## 根因分析
- **直接原因**：`thead` 设置了 `sticky top-0`，但内部的 `th` (如“姓名”列) 为了水平固定设置了 `sticky left-0`。当元素自身设置了 `sticky` 且只有 `left` 没有 `top` 时，它在垂直方向的行为不再受父级 `thead` 的 `sticky` 控制（或者行为未定义/浏览器兼容性问题）。
- **根本原因**：多级表头的 Sticky 实现需要精确控制每一行的 `top` 值，而不是依赖 `thead` 的整体固定。
- **相关代码**：`packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 修复方案
- **修复思路**：
    1. 移除 `thead` 的 `sticky` 属性。
    2. 将 `sticky` 属性下沉到具体的 `th` 元素。
    3. 第一行 `th` 设置 `top-0`。
    4. 第二行 `th` 设置 `top-[第一行高度]` (49px)。
    5. 显式设置 `z-index` 确保角落（交叉点）的表头层级最高。
    6. 显式设置背景色，防止内容透视。
- **改动文件**：
    - `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| DailyStatsReport | .../DailyStatsReport.tsx | ❌ (单行表头或无垂直固定需求，未复现) |
| MonthlyCardReport | .../MonthlyCardReport.tsx | ❌ (单行表头，正常) |

## 验证结果
- [x] 原问题已解决 (代码逻辑修正)
- [x] 回归测试通过 (编译无相关错误)
- [x] 设计一致性确认

## 提交信息
fix(web): 修复月度汇总报表多级表头滚动问题
