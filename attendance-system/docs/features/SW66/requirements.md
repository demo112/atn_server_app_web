# Requirements: SW66 补签处理

## Overview

补签处理功能旨在让管理员能够查看和处理员工的考勤异常（如缺卡、迟到、早退等）。通过补录打卡记录，系统应自动修正考勤状态和工时统计，确保考勤数据的准确性。所有补签操作均需记录审计日志。

## User Stories

### Story 1: 查看异常考勤记录

**As a** 考勤管理员,
**I want** 按部门和日期查看存在异常的考勤记录,
**So that** 我可以识别需要处理的问题。

**Acceptance Criteria:**
- [ ] AC1: 界面展示部门树，点击部门筛选该部门人员记录。
- [ ] AC2: 列表显示：工作日、人员信息(编号/姓名/部门)、班次信息(名称/时间段)、打卡时间(签到/签退)、当前状态、缺勤时长。
- [ ] AC3: 支持按日期范围筛选（默认当月）。
- [ ] AC4: 列表仅展示异常状态（迟到、早退、缺卡、旷工）的记录。

### Story 2: 补签到 (Supplement Check-in)

**As a** 考勤管理员,
**I want** 为员工补录签到时间,
**So that** 修正缺卡或迟到状态。

**Acceptance Criteria:**
- [ ] AC1: 点击“补签到”弹出对话框，选择补签时间。
- [ ] AC2: 提交后，更新每日考勤记录的 `clockInTime`。
- [ ] AC3: 提交后，自动触发考勤状态重算（如：迟到 -> 正常）。
- [ ] AC4: 自动在 `att_corrections` 表生成一条补签记录（类型：Check-in）。

### Story 3: 补签退 (Supplement Check-out)

**As a** 考勤管理员,
**I want** 为员工补录签退时间,
**So that** 修正缺卡或早退状态。

**Acceptance Criteria:**
- [ ] AC1: 点击“补签退”弹出对话框，选择补签时间。
- [ ] AC2: 提交后，更新每日考勤记录的 `clockOutTime`。
- [ ] AC3: 提交后，自动触发考勤状态重算（如：早退 -> 正常，并计算工时）。
- [ ] AC4: 自动在 `att_corrections` 表生成一条补签记录（类型：Check-out）。

## Constraints

- **数据一致性**: 补签操作必须在一个事务中完成（更新记录 + 插入日志）。
- **重算逻辑**: 必须在本模块中实现核心考勤计算逻辑（AttendanceCalculator），因为当前系统尚无此服务。补签必须触发该逻辑以修正 Daily Record 状态。
- **权限**: 仅授权的管理员可执行。

## Out of Scope

- 员工自助申请补签（这是审批流功能，不在 SW66 范围内）。
- 批量补签（当前仅支持单条处理）。

## Assumptions

- 异常记录来源于 `att_daily_records` 表。
- 补签实质上是修改 `att_daily_records` 并记录日志到 `att_corrections`。
