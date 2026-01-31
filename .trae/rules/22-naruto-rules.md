# Naruto 工作规则

> 当 naruto 开发时启用此规则

## 身份

你正在协助 naruto 开发考勤系统的考勤核心模块。

## 负责范围

### 数据库表

| 表名 | 说明 |
|------|------|
| att_time_periods | 时间段 |
| att_shifts | 班次 |
| att_shift_periods | 班次时间段关联 |
| att_schedules | 排班 |
| att_settings | 考勤设置 |
| att_clock_records | 原始打卡记录 |
| att_daily_records | 每日考勤记录 |
| att_corrections | 补签记录 |
| att_leaves | 请假/出差记录 |

### 代码目录

| 目录 | 说明 |
|------|------|
| attendance-system/packages/server/src/modules/attendance/ | 考勤模块 |
| attendance-system/packages/web/src/pages/attendance/ | 考勤页面 |
| attendance-system/packages/app/src/screens/clock/ | App 打卡 |

### API 路径

| 路径前缀 | 说明 |
|----------|------|
| /api/v1/attendance/settings/* | 考勤设置 |
| /api/v1/attendance/time-periods/* | 时间段 |
| /api/v1/attendance/shifts/* | 班次 |
| /api/v1/attendance/schedules/* | 排班 |
| /api/v1/attendance/clock/* | 打卡 |
| /api/v1/attendance/daily/* | 每日记录 |
| /api/v1/attendance/corrections/* | 补签 |
| /api/v1/attendance/leaves/* | 请假 |

### 功能规格

| 规格 | 说明 |
|------|------|
| SW62 | 考勤制度基本规则 |
| SW63 | 时间段设置 |
| SW64 | 班次管理 |
| SW65 | 排班管理 |
| SW66 | 补签处理 |
| SW67 | 请假/出差处理 |
| SW68 | 补签记录 |
| SW69 | 原始考勤数据 |

## 禁止操作

❌ 不要修改以下目录/文件：
- attendance-system/packages/server/src/modules/user/
- attendance-system/packages/server/src/modules/employee/
- attendance-system/packages/server/src/modules/department/
- attendance-system/packages/server/src/modules/stats/
- attendance-system/packages/web/src/pages/user/
- attendance-system/packages/web/src/pages/employee/
- attendance-system/packages/web/src/pages/department/
- attendance-system/packages/web/src/pages/stats/
- users、employees、departments 表

这些是 sasuke 负责的模块。

## 跨模块接口

### 你需要调用 sasuke 的接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取部门树 | GET | /api/v1/departments/tree | 排班、统计页面需要 |
| 获取部门人员 | GET | /api/v1/departments/:id/employees | 排班页面需要 |
| 获取人员信息 | GET | /api/v1/employees/:id | 打卡、记录显示需要 |

### 你需要提供给 sasuke 的接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取每日考勤记录 | GET | /api/v1/attendance/daily | 统计模块需要 |
| 获取考勤汇总数据 | GET | /api/v1/attendance/summary | 统计模块需要 |
| 获取原始打卡记录 | GET | /api/v1/attendance/clock | 统计模块需要 |

## 考勤计算核心逻辑

### 考勤日切换

- 默认切换点：凌晨 05:00
- 05:00 前的打卡归属前一天
- 配置位置：att_settings 表，key = day_switch_time

### 状态判定

| 状态 | 判定条件 |
|------|----------|
| normal | 签到签退都在规定时间内 |
| late | 签到时间 > 上班时间 + 宽限期 |
| early_leave | 签退时间 < 下班时间 - 宽限期 |
| absent | 无打卡且无请假 |
| leave | 有已通过的请假记录 |
| business_trip | 有已通过的出差记录 |

### 请假审批

- 只有 approved 状态的请假才影响考勤计算
- 审批通过后自动触发相关日期的考勤重算

## 任务清单

当前 Sprint 任务请参考：attendance-system/docs/task-backlog.md

筛选条件：负责人 = naruto
