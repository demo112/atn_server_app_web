# Requirements: App 班次添加页面仿制

## Overview

基于 `incoming/app/shift_add` 提供的设计原型，在 App 端实现/升级班次添加与编辑功能。目标是提供更流畅、符合 iOS 风格的用户体验，支持多段班次配置和详细的缺勤规则设置。

## User Stories

### Story 1: 班次基本信息设置

As a 管理员, I want 设置班次名称, so that 我可以区分不同的班次

**Acceptance Criteria:**
- [ ] AC1: 显示班次名称输入框，必填
- [ ] AC2: 验证班次名称不能为空

### Story 2: 时间段管理 (Segment Management)

As a 管理员, I want 灵活配置每天的上下班时间段, so that 适应不同的作息时间

**Acceptance Criteria:**
- [ ] AC1: 支持添加最多 3 个时间段 (早/中/晚)
- [ ] AC2: 每个时间段包含：上班时间、下班时间
- [ ] AC3: 支持通过 Toggle 开关控制是否必须签到/签退
- [ ] AC4: 开启签到/签退后，显示对应的打卡有效范围设置

### Story 3: 缺勤规则设置

As a 管理员, I want 设置允许迟到和早退的时间, so that 系统能自动判定考勤状态

**Acceptance Criteria:**
- [ ] AC1: 设置允许迟到时长（分钟）
- [ ] AC2: 设置允许早退时长（分钟）

## UI/UX Requirements (仿制重点)

- **风格**：采用 iOS 风格的卡片式布局 (Rounded Grouped List)。
- **交互**：
    - Toggle 开关带动画效果。
    - 时间选择器点击后弹出。
    - 底部固定保存按钮。

## 涉及页面与组件

| 模块 | 对应文件 | 状态 | 操作 |
|------|----------|------|------|
| 页面 | `src/screens/shift/ShiftEditScreen.tsx` | 已存在 | **重构**，采用 incoming 布局 |
| 组件 | `src/components/shift/SegmentCard.tsx` | 已存在 | **重构**，增加 Toggle 和新样式 |
| 组件 | `src/components/common/Toggle.tsx` | 待新增 | **新增**，仿制 incoming 的 Toggle |
| 类型 | `src/types/shift.ts` | 已存在 | **更新**，确认字段对齐 |

## Metadata

- 规模：中
- 涉及模块：attendance
- 涉及端：App
- 参考源：`attendance-system/incoming/app/shift_add`
- 状态：已分析
