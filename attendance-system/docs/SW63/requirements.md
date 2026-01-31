# Requirements: 时间段设置 (SW63)

## Overview

时间段（Time Period）是考勤制度的原子单位，定义了"什么时候算上班/下班"。支持配置普通时间段（固定上下班）和弹性时间段（按时长计算），并允许定义迟到、早退、缺勤的规则。

## User Stories

### Story 1: 时间段管理 (Server)
As a 考勤管理员, I want 增删改查时间段配置, so that 我可以灵活定义不同的上下班时间

**Acceptance Criteria:**
- [ ] AC1: 支持创建"固定班制"时间段（如 09:00-18:00）
- [ ] AC2: 支持创建"弹性班制"时间段（如 每日工作8小时）
- [ ] AC3: 支持设置午休时间段（扣除工时用）
- [ ] AC4: 时间段名称必须唯一
- [ ] AC5: 删除时间段时，若被班次引用则禁止删除

### Story 2: 考勤规则配置 (Server/Shared)
As a 考勤管理员, I want 为时间段配置考勤规则, so that 系统能自动判断迟到早退

**Acceptance Criteria:**
- [ ] AC1: 支持配置"允许迟到/早退分钟数"（宽限期）
- [ ] AC2: 支持配置"严重迟到/早退分钟数"
- [ ] AC3: 支持配置"缺勤分钟数"（超过多少分钟算缺勤）
- [ ] AC4: 规则数据结构需符合 JSON Schema 定义

### Story 3: 时间段列表 (Web)
As a 考勤管理员, I want 在网页端查看时间段列表, so that 我能概览所有配置

**Acceptance Criteria:**
- [ ] AC1: 表格展示时间段名称、类型、工作时间、休息时间
- [ ] AC2: 支持按名称搜索
- [ ] AC3: 支持筛选时间段类型（固定/弹性）

### Story 4: 时间段表单 (Web)
As a 考勤管理员, I want 在网页端填写表单配置时间段, so that 操作直观便捷

**Acceptance Criteria:**
- [ ] AC1: 提供时间选择器选择 HH:mm
- [ ] AC2: 动态表单：根据类型显示不同字段
- [ ] AC3: 规则配置区域支持折叠/展开

## Constraints
- 时间格式：HH:mm
- 跨天处理：需支持次日（如 22:00 - 06:00(次日)）
- 数据一致性：规则字段存储为 JSON，需保证结构校验

## Out of Scope
- 排班管理（SW65）
- 班次组合（SW64）
- 复杂轮班规则

## Assumptions
- 弹性班制通常只需要规定"必须在岗时长"，或者"核心工作时间"（Core Time）
- 简单起见，Sprint 1 弹性班制只实现"每日工作时长"考核

## Metadata
- 规模：中
- 涉及模块：attendance
- 涉及端：Server, Web
- 负责人：naruto
- 状态：已分析
