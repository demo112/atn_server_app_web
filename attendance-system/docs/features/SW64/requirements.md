# Requirements: 班次管理 (SW64)

## Overview

在移动端 App 中实现班次管理功能，允许管理员查看、搜索和添加班次。

## User Stories

### Story 1: 查看班次列表

As a 管理员, I want 在手机上查看所有班次列表, so that 我可以了解当前的班次配置情况

**Acceptance Criteria:**
- [ ] AC1: 显示班次列表，包含班次名称、开始时间、结束时间
- [ ] AC2: 列表为空时显示友好的空状态（Empty State）
- [ ] AC3: 列表支持滚动查看
- [ ] AC4: 列表头部显示当前班次总数

### Story 2: 搜索班次

As a 管理员, I want 通过名称或时间搜索班次, so that 我能快速找到特定的班次配置

**Acceptance Criteria:**
- [ ] AC1: 顶部提供搜索输入框
- [ ] AC2: 输入关键词时实时过滤列表
- [ ] AC3: 支持匹配班次名称（不区分大小写）
- [ ] AC4: 支持匹配时间字符串（如 "09:00"）

### Story 3: 添加班次

As a 管理员, I want 添加新的班次, so that 我可以配置新的工作时间段

**Acceptance Criteria:**
- [ ] AC1: 点击添加按钮打开添加班次界面（Modal/Sheet）
- [ ] AC2: 输入班次名称、开始时间、结束时间
- [ ] AC3: 验证输入不能为空
- [ ] AC4: 点击保存后添加到列表并关闭界面

## Constraints

- **技术栈**: React Native + Expo
- **UI 风格**: 需适配移动端操作习惯，使用 NativeWind 进行样式复刻

## Out of Scope

- 编辑班次（本次仅实现查看和添加，参考 `incoming` 代码范围）
- 删除班次
- 班次与考勤组的关联配置
- AI 智能建议（已移除）

## Assumptions

- 班次数据暂时存储在本地状态中（根据 `incoming` 代码逻辑），后续对接后端 API

## Metadata

- 规模：小
- 涉及模块：attendance
- 涉及端：App
- 参考代码：`incoming/app/shift_list`
