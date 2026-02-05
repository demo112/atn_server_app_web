# UI 横向滚动条修复记录

## 问题描述
- **现象**：多个页面的表格在小屏幕或列数较多时，内容被截断或表头显示不全，缺少横向滚动条。
- **复现步骤**：进入补签处理、月度汇总等页面，缩窄浏览器窗口，观察表格右侧内容。
- **影响范围**：补签处理、打卡记录、班次管理、人员概览、综合统计、考勤组管理、部门统计、用户列表、考勤详情、补签详情、各类选择弹窗、月度汇总报表。

## 设计锚定
- **所属规格**：全局 UI 规范
- **原设计意图**：表格应支持响应式布局，内容超出容器时应可横向滚动。
- **当前偏离**：部分页面使用了 `overflow-hidden` 或未设置 `min-w`，导致滚动条缺失。

## 根因分析
- **直接原因**：Table 容器使用了 `overflow-hidden` 或 Table 自身未设置 `min-w` 导致宽度被压缩。
- **根本原因**：前端开发时未充分考虑小屏适配及多列表格的宽度需求。
- **相关代码**：各页面 `.tsx` 文件中的 `<table>` 及其父容器 `<div>`。

## 修复方案
- **修复思路**：为 Table 父容器添加 `overflow-x-auto`，为 Table 添加 `min-w-[1000px]` (或更大值)。
- **改动文件**：
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`
  - `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`
  - `packages/web/src/pages/attendance/group/components/GroupForm.tsx`
  - `packages/web/src/pages/attendance/clock/components/PunchTable.tsx`
  - `packages/web/src/pages/attendance/shift/components/ShiftTable.tsx`
  - `packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx`
  - `packages/web/src/pages/statistics/SummaryPage.tsx`
  - `packages/web/src/pages/attendance/group/components/GroupList.tsx`
  - `packages/web/src/pages/statistics/components/DeptStatsTable.tsx`
  - `packages/web/src/pages/user/UserList.tsx`
  - `packages/web/src/pages/attendance/details/AttendanceDetailsPage.tsx`
  - `packages/web/src/pages/attendance/correction/components/CorrectionView.tsx`

## 验证结果
- [x] 原问题已解决
- [x] 回归测试通过 (type-check)
- [x] 设计一致性确认

## 文档同步
- [ ] design.md：不需要
- [ ] api-contract.md：不需要

## 提交信息
fix(web): 修复多个页面表格缺失横向滚动条的问题
