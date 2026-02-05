# Requirements: 统计报表 (SW72)

## Overview

为管理员提供可视化的考勤数据统计功能，支持按部门查看出勤率、异常情况，并支持导出统计报表，以便进行月度考勤核算和管理决策。

## User Stories

### Story 1: 部门考勤统计
As a 管理员, I want 查看指定月份的部门考勤统计数据, so that 了解各部门的出勤状况

**Acceptance Criteria:**
- [ ] AC1: 支持选择月份查询
- [ ] AC2: 列表展示各部门的统计数据（总人数、正常出勤天数、迟到/早退/缺勤次数、平均出勤率）
- [ ] AC3: 支持按部门名称搜索

### Story 2: 考勤概览图表
As a 管理员, I want 以图表形式查看全公司考勤概况, so that 直观掌握整体出勤趋势

**Acceptance Criteria:**
- [ ] AC1: 展示每日出勤率趋势图（折线图）
- [ ] AC2: 展示异常考勤类型分布图（饼图：迟到/早退/缺勤/请假占比）

### Story 3: 导出统计报表
As a 管理员, I want 将统计结果导出为 Excel 文件, so that 用于线下存档或进一步处理

**Acceptance Criteria:**
- [ ] AC1: 支持导出当前查询月份的部门统计表
- [ ] AC2: 导出文件包含统计汇总数据
- [ ] AC3: 导出格式为 .xlsx

### Story 4: App 个人考勤统计
As a 员工, I want 在手机上查看自己的月度考勤统计, so that 我能核对自己的出勤情况

**Acceptance Criteria:**
- [ ] AC1: 展示月历视图，标记每日考勤状态（正常/异常/请假）
- [ ] AC2: 显示月度汇总数据（出勤天数、迟到次数、缺勤天数等）
- [ ] AC3: 点击具体日期可查看当日打卡明细

### Story 5: 每日考勤日报
As a 管理员, I want 查看和导出每日考勤报表, so that 及时掌握昨日全员出勤情况

**Acceptance Criteria:**
- [ ] AC1: 支持选择日期查询
- [ ] AC2: 列表展示当日所有人员的考勤状态（正常/迟到/缺勤等）及打卡时间
- [ ] AC3: 支持按部门筛选
- [ ] AC4: 支持导出日报为 Excel

### Story 6: 年度考勤统计
As a 管理员, I want 查看员工的年度考勤汇总, so that 进行年度绩效考核

**Acceptance Criteria:**
- [ ] AC1: 支持选择年份查询
- [ ] AC2: 列表展示员工全年的累计出勤天数、迟到次数、缺勤天数、请假天数
- [ ] AC3: 支持导出年报为 Excel

### Story 7: 异常与请假专项报表
As a 管理员, I want 查看专门的异常和请假统计, so that 重点关注问题员工

**Acceptance Criteria:**
- [ ] AC1: 异常报表：仅展示有迟到/早退/缺勤记录的员工及详情
- [ ] AC2: 请假报表：按假期类型（年假/病假等）统计请假时长和频次
- [ ] AC3: 支持导出

## Constraints
- 性能要求：统计查询响应时间 < 3秒 (年报可能需放宽至 5-10秒)
- 兼容性：图表库需兼容主流浏览器
- 导出限制：单次导出最大记录数限制（如 10000 条）

## Out of Scope

- 自动发送邮件报表
- App 端管理层统计报表（图表/部门统计仅 Web 端支持）

## Assumptions

- 统计数据基于已归档或实时的 `AttDailyRecord`
- 图表使用 Web 端现有 UI 库或通用图表库（如 Recharts）
- 导出使用 ExcelJS 或类似库
