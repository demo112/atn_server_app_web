# 考勤计算按钮自动参数修复记录

## 问题描述
- **现象**：在月度汇总报表中点击"考勤计算"按钮后，需要手动选择日期和输入人员ID，操作繁琐且容易出错。
- **复现步骤**：
  1. 进入月度汇总报表页面
  2. 筛选特定月份或人员
  3. 点击"考勤计算"按钮
  4. 弹出模态框要求重新输入日期和人员ID
- **影响范围**：月度汇总报表页面的考勤重算功能

## 设计锚定
- **所属规格**：SW62 (考勤统计)
- **原设计意图**：提供便捷的考勤重算功能，应尽量减少用户重复输入。
- **当前偏离**：用户在页面外层已经选择了筛选条件，但点击计算时未自动继承这些条件。

## 根因分析
- **直接原因**：前端模态框设计为独立表单，未与页面筛选状态联动。
- **根本原因**：后端计算接口仅支持 `employeeIds` 列表，不支持按照部门名称或员工姓名模糊匹配进行批量计算，导致前端无法直接传递页面筛选条件。
- **相关代码**：
  - Frontend: `MonthlySummaryReport.tsx`
  - Backend: `attendance-scheduler.ts`, `statistics.controller.ts`

## 修复方案
- **修复思路**：
  1. 扩展后端计算接口，支持 `deptName` 和 `employeeName` 参数。
  2. 修改前端逻辑，点击按钮时自动获取当前页面的月份范围和筛选条件。
  3. 将模态框改为确认框，展示即将计算的范围，不再需要用户手动输入。
- **改动文件**：
  - `packages/shared/src/types/attendance/stats.ts` (DTO update)
  - `packages/server/src/modules/attendance/attendance-scheduler.ts` (Logic update)
  - `packages/server/src/modules/statistics/statistics.controller.ts` (Controller update)
  - `packages/web/src/pages/statistics/MonthlySummaryReport.tsx` (UI/UX update)

## 验证结果
- [x] 原问题已解决：代码逻辑已更新，模态框现在自动显示当前筛选条件。
- [x] 回归测试通过：TypeScript 编译检查通过，无类型错误。
- [x] 设计一致性确认：符合简化用户操作的设计意图。

## 文档同步
- [ ] design.md：无需更新 (API 扩展兼容原设计)
- [ ] api-contract.md：无需更新 (内部 API 变更)

## 提交信息
fix(statistics): 优化考勤计算按钮，自动继承页面筛选条件
