# Requirements: 班次管理 (SW64)

## Overview

在移动端 App 中实现班次列表查看功能，允许管理员或有权限的用户快速浏览当前配置的班次信息。
*注：完整的班次管理（新增、编辑、删除、排班）请在 Web 管理端进行操作。*

## User Stories

### Story 1: 查看班次列表

As a 管理员/用户, I want 在手机上查看所有班次列表, so that 我可以了解当前的班次配置情况

**Acceptance Criteria:**
- [ ] AC1: 显示班次列表，包含班次名称、开始时间、结束时间
- [ ] AC2: 列表为空时显示友好的空状态（Empty State）
- [ ] AC3: 列表支持滚动查看
- [ ] AC4: 列表头部显示当前班次总数

### Story 2: 搜索班次

As a 管理员/用户, I want 通过名称或时间搜索班次, so that 我能快速找到特定的班次配置

**Acceptance Criteria:**
- [ ] AC1: 顶部提供搜索输入框
- [ ] AC2: 输入关键词时实时过滤列表
- [ ] AC3: 支持匹配班次名称（不区分大小写）
- [ ] AC4: 支持匹配时间字符串（如 "09:00"）

## Constraints

- **技术栈**: React Native + Expo
- **UI 风格**: 需适配移动端操作习惯，使用 NativeWind 进行样式复刻

## Out of Scope

- **新增/编辑/删除班次**（所有写操作收敛至 Web 端）
- 班次与考勤组的关联配置
- AI 智能建议

## Assumptions

- 班次数据从后端 API 获取（需对接 `/api/v1/attendance/shifts`）

## Metadata

- 规模：小
- 涉及模块：attendance
- 涉及端：App (View Only)
