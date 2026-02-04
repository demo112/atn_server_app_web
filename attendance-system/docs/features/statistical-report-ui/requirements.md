# Requirements: 统计报表 UI 仿制 (UI Cloning)

## Overview

将 `incoming/web/statistical_report` 中的统计报表 UI 移植到现有的 Web 端项目中。目标是复刻其视觉风格和交互流程，并集成到现有的路由系统中。

## User Stories

### Story 1: 统计报表仪表盘 (Statistics Dashboard)

As a 管理员, I want 一个统一的入口查看各类统计报表, so that 我可以快速导航到需要的报表

**Acceptance Criteria:**
- [ ] AC1: 显示三个卡片入口：每日统计表、月度汇总表、月度卡表
- [ ] AC2: 卡片包含标题、描述、图标和渐变背景，具有 Hover 动效
- [ ] AC3: 点击卡片跳转到对应页面

### Story 2: 每日统计报表 (Daily Stats Report)

As a 管理员, I want 查看每日的详细考勤数据, so that 我可以了解员工当天的出勤情况

**Acceptance Criteria:**
- [ ] AC1: 实现"每日统计全字段报表"页面
- [ ] AC2: 表格支持多列（姓名、部门、工号、日期、考勤组、班次、6次打卡、工时统计）
- [ ] AC3: 表格头部固定（Sticky Header），前两列（姓名、部门）固定
- [ ] AC4: 包含查询栏（日期、范围筛选）和操作栏（导出、重新计算）
- [ ] AC5: 视觉风格与参考代码一致（蓝色/紫色/靛青色区分不同打卡时段）

### Story 3: 月度汇总报表 (Monthly Summary Report)

As a 管理员, I want 查看员工的月度出勤概况, so that 我可以进行薪酬结算

**Acceptance Criteria:**
- [ ] AC1: 实现"月度汇总报表"页面
- [ ] AC2: 表格显示员工基本信息、月度统计（迟到/早退/缺勤等）
- [ ] AC3: 表格显示 1-31 日的每日状态简码（√、迟、休等）
- [ ] AC4: 包含月份选择和查询范围筛选

### Story 4: 月度卡表视图 (Monthly Card View)

As a 管理员, I want 以卡片/详情形式查看员工月度考勤, so that 我可以详细核对个人考勤

**Acceptance Criteria:**
- [ ] AC1: 实现"月度考勤卡表"列表页
- [ ] AC2: 列表显示员工基本信息，操作列有"查看详情"按钮
- [ ] AC3: 点击详情弹出模态框 (Modal)
- [ ] AC4: 模态框显示该员工的"月度汇总数据"和"日历详细考勤明细"（表格形式）

## Constraints

- **技术栈**: React + TypeScript + Tailwind CSS (现有项目架构)
- **路由**: 使用 react-router-dom 集成到 `/statistics/*`
- **布局**: 使用现有 Layout (Sidebar/Header)，页面内容区域显示报表
- **数据**: 优先复用 `src/services/statistics` 接口，若字段不支持则使用 Mock 数据并标记 TODO

## Out of Scope

- 后端 API 的修改（本次任务专注于前端 UI 移植）
- 复杂的业务逻辑（如考勤计算的具体实现，仅实现 UI 交互）

## Assumptions

- 现有项目已配置 Tailwind CSS
- 现有 `AttendanceSummaryVo` 等类型可能需要扩展或新建类型以匹配 UI 需求

## Metadata

- 规模：中
- 涉及模块：statistics
- 涉及端：Web
- 创建时间：2026-02-04
- 状态：已确认
