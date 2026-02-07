# 考勤计算筛选条件失效修复记录

## 问题描述
- **现象**：在月度汇总报表/月度考勤卡表中，按照部门或人员筛选后点击"考勤计算"，计算任务虽然触发，但忽略了筛选条件，导致全量计算或计算范围不符合预期。
- **复现步骤**：
  1. 打开月度汇总报表。
  2. 筛选特定部门（如"研发部"）。
  3. 点击"考勤计算"。
  4. 预期只计算研发部，实际计算了全公司所有人员。
- **影响范围**：考勤计算功能的准确性和性能。

## 设计锚定
- **所属规格**：SW62 (考勤统计)
- **原设计意图**：计算功能应支持按部门、按人员灵活筛选。
- **当前偏离**：后端接口虽然接收了筛选参数，但内部逻辑未处理，导致筛选失效。

## 根因分析
- **直接原因**：`AttendanceScheduler.triggerCalculation` 方法中，构建 `empWhere` 查询条件时，仅处理了 `employeeIds`，漏掉了 `deptId`, `deptName`, `employeeName`。
- **根本原因**：在之前的重构（20260206-auto-attendance-calc-fix）中，接口签名进行了扩展，但对应的实现逻辑未同步更新。
- **相关代码**：`packages/server/src/modules/attendance/attendance-scheduler.ts`

## 修复方案
- **修复思路**：在 `triggerCalculation` 中完善 `empWhere` 的构建逻辑，将 `deptId`, `deptName`, `employeeName` 映射为 Prisma 的查询条件。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance-scheduler.ts`
  - `packages/server/src/modules/attendance/attendance-scheduler.test.ts` (新增测试)

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| StatisticsController | `statistics.controller.ts` | 已检查，透传逻辑正常 |

## 验证结果
- [x] 原问题已解决：新增单元测试验证了筛选参数正确映射到了数据库查询条件。
- [x] 回归测试通过：`npm test packages/server/src/modules/attendance/attendance-scheduler.test.ts` 通过。
- [x] 设计一致性确认：符合设计意图。

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 防回退标记
**关键词**：考勤计算、筛选、triggerCalculation
**设计决策**：后端必须显式处理所有传入的筛选参数，不能静默忽略。

## 提交信息
fix(attendance): 修复考勤计算忽略部门和姓名筛选条件的问题
