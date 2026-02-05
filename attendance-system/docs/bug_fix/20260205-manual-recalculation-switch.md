# 考勤重算模式调整修复记录

## 问题描述
- **现象**：用户指出不应在请假/补卡后自动重算，而是应由用户手动点击按钮触发重算，同时保留每日定时重算。
- **原因**：之前的修复（自动重算）不符合用户最新的需求（手动控制 + 定时任务）。
- **影响范围**：请假、补卡、考勤日报页面。

## 设计锚定
- **所属规格**：SW62 (考勤基础)
- **原设计意图**：系统支持定时重算（`AttendanceScheduler`）。手动重算作为辅助功能，允许管理员或用户在必要时强制刷新。
- **当前偏离**：`LeaveService` 包含自动重算逻辑；前端缺乏显式的手动重算入口。

## 修复方案
- **后端**：
  1. 回滚 `LeaveService` 中的自动重算逻辑。
  2. 在 `attendance.routes.ts` 中新增 `POST /recalculate` 路由，复用 `attendanceScheduler.triggerCalculation`。
- **前端**：
  1. `AttendanceDetailsPage` 新增"重新计算"按钮。
  2. `CheckInDialog` / `CheckOutDialog` 文案调整为引导用户使用重算按钮。
  3. `correction` 服务增加 `triggerRecalculation` 方法。

## 验证结果
- [x] 代码编译通过。
- [x] 路由配置正确。
- [x] 前端逻辑完整。

## 文档同步
- [ ] design.md：无需修改。
- [ ] api-contract.md：无需修改（内部接口）。

## 提交信息
fix(attendance): 调整考勤重算为手动触发模式

背景: 用户要求取消操作后的自动重算，改为手动按钮触发
变更:
1. 移除 LeaveService 自动重算逻辑
2. 新增手动重算 API 及前端按钮
3. 调整相关提示文案
