# 考勤计算结果同步显示修复记录

## 问题描述
- **现象**：用户在提交请假或补卡申请后，考勤结果未及时更新，界面上提示用户"手动刷新"。
- **复现步骤**：
  1. 提交请假申请（管理员直接通过）或补卡申请。
  2. 查看考勤日报，结果未变。
  3. 需要手动刷新页面或等待定时任务执行才能看到最新结果。
- **影响范围**：请假管理、补卡申请、考勤日报显示。

## 设计锚定
- **所属规格**：SW62 (考勤基础), SW66 (补签)
- **原设计意图**：考勤系统应实时或近实时反映最新的考勤状态。虽然计算通常是异步或定时的，但对于用户主动发起的操作（如请假、补卡），应立即触发重算以保证用户体验。
- **当前偏离**：`LeaveService` 在创建/更新/取消请假记录后，未触发考勤重算逻辑。前端 UI 仍然保留了"请手动刷新"的过时提示。

## 根因分析
- **直接原因**：`LeaveService` 中缺少调用 `AttendanceScheduler` 或 `AttendanceCalculator` 的逻辑。
- **根本原因**：在实现请假模块时，未将"修改后重算"作为必要步骤集成，仅依赖后台定时任务。
- **相关代码**：`packages/server/src/modules/attendance/leave.service.ts`

## 修复方案
- **修复思路**：
  1. 在 `LeaveService` 中引入 `attendanceScheduler`。
  2. 在 `create` (仅限 approved), `update`, `cancel` 方法成功后，调用 `attendanceScheduler.calculateEmployeeDaily`。
  3. 由于请假可能跨多天，需遍历请假时间范围内的每一天进行重算。
  4. 更新前端 `CheckInDialog` 和 `CheckOutDialog` 的提示文案，移除"手动刷新"，改为"系统将自动重新计算"。
- **改动文件**：
  - `packages/server/src/modules/attendance/leave.service.ts`
  - `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`
  - `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx`

## 验证结果
- [x] 原问题已解决：单元测试验证 `triggerRecalculation` 被正确调用。
- [x] 回归测试通过：`npm run type-check` (web) 和 `npm run lint` (server) 通过。
- [x] 设计一致性确认：符合"即时响应"的设计原则。

## 文档同步
- [ ] design.md：无需修改，属实现细节。
- [ ] api-contract.md：无接口变更。

## 提交信息
fix(attendance): 同步计算考勤结果，移除手动刷新提示

背景: 用户操作后考勤结果未实时更新
变更:
1. LeaveService 新增自动触发重算逻辑
2. 优化前端补卡弹窗提示文案
影响: 请假和补卡操作将立即触发考勤重算
