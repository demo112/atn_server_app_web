# 共识文档：SW62 考勤制度

## 概述
实现考勤系统的基础规则配置，核心功能是管理「考勤日切换点」，支持跨天考勤计算。系统需提供后端 API 进行配置的增删改查，并具备默认初始化能力。

## User Stories

### Story 1: 初始化默认考勤设置
**As a** 系统运维/开发者, **I want** 系统启动时自动初始化默认考勤设置, **So that** 系统开箱即用。

**验收标准（AC）：**
- [ ] AC1: 数据库 `att_settings` 表为空时，自动插入默认记录
- [ ] AC2: 默认 `day_switch_time` 为 "05:00"

### Story 2: 获取考勤设置
**As a** 系统模块或管理员, **I want** 获取当前的考勤设置, **So that** 能够正确计算考勤归属日期。

**验收标准（AC）：**
- [ ] AC1: 提供 GET `/api/v1/attendance/settings` 接口
- [ ] AC2: 返回 Key-Value 格式的设置列表

### Story 3: 修改考勤设置
**As a** 管理员, **I want** 修改考勤设置, **So that** 适应考勤制度变化。

**验收标准（AC）：**
- [ ] AC1: 提供 PUT `/api/v1/attendance/settings` 接口
- [ ] AC2: 验证 `day_switch_time` 格式必须为 HH:mm
- [ ] AC3: 修改成功后数据持久化

## 约束条件
- 数据模型采用 Key-Value 结构
- 时间格式统一为 24 小时制 HH:mm

## 不做的事项
- 暂不开发 Web 端配置页面
- 暂不实现除了 `day_switch_time` 以外的其他复杂规则（如加班规则等）

## 已确认的假设
- 数据存储在 `att_settings` 表
- 仅提供后端 API
