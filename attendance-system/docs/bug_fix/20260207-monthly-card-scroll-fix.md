# 2026-02-07 月度考勤卡表详情页无法滚动修复

## 问题描述
用户反馈在"月度考勤卡表"页面点击查看详情后，弹窗内容无法向下滚动查看全部信息。

## 根因分析
Modal 组件采用 Flex 布局，父容器设置了 `flex-col` 和 `max-h-[90vh]` 以及 `overflow-hidden`。
内容区域虽然设置了 `overflow-y-auto`，但没有设置 `flex-1` 或明确高度，导致内容区域被撑开超过父容器高度，从而被父容器的 `overflow-hidden` 截断，而不是在内容区域内滚动。

## 修复方案
给内容区域的 `div` 添加 `flex-1` 类，使其占据父容器剩余空间并正确处理溢出滚动。

## 影响范围
- `packages/web/src/pages/statistics/MonthlyCardReport.tsx`

## 验证
- 代码审查：对比 `StandardModal` 组件实现，确认方案正确。
- 构建验证：`npm run build` 通过（修复了顺带发现的 toast 类型错误）。
