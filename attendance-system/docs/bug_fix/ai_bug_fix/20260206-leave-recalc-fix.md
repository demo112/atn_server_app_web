# 请假撤销未触发考勤重算修复记录

## 问题描述
- **现象**：员工在系统撤销已通过的请假申请后，该日期的考勤状态未自动恢复（如未更新为“缺卡”或“正常”），仍保持“请假”状态。
- **复现步骤**：
  1. 员工申请请假并获批。
  2. 员工撤销该请假。
  3. 查看当日考勤明细，状态未更新。
- **影响范围**：考勤计算准确性，导致薪资计算错误。

## 设计锚定
- **所属规格**：SW67 请假管理
- **原设计意图**：任何影响考勤状态的变更（请假、补卡、排班变更）都应触发即时或定时的考勤重算。
- **当前偏离**：`LeaveService.cancelLeave` 方法仅更新了请假单状态，遗漏了触发重算的逻辑。

## 根因分析
- **直接原因**：`leave.service.ts` 中 `cancelLeave` 方法逻辑不完整。
- **根本原因**：后端业务逻辑实现时遗漏了状态变更后的副作用处理。
- **相关代码**：`packages/server/src/modules/attendance/leave.service.ts`

## 修复方案
- **修复思路**：
  1. 在 `cancelLeave` 事务成功后，获取请假单的时间范围和员工ID。
  2. 调用 `AttendanceScheduler.triggerCalculation` 触发重算。
  3. 增加错误处理，确保重算失败不影响撤销操作（或根据业务要求决定）。
- **改动文件**：
  - `packages/server/src/modules/attendance/leave.service.ts`

## 验证结果
- [x] 原问题已解决：撤销请假后，相关日期的考勤结果会自动重新计算。
- [x] 回归测试通过：E2E 测试 `tests/attendance/leave.spec.ts` 覆盖了撤销场景。
- [x] 编译通过：Server 端编译无误。

## 提交信息
fix(attendance): 修复请假撤销时未触发考勤重算的问题

背景: 撤销请假后考勤状态未更新
变更: 在 cancelLeave 方法中增加 triggerRecalculation 调用
影响: 请假模块、考勤计算
