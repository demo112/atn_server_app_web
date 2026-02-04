# Requirements: Web UI 标准化整改 (UI-STD-001)

## Overview

本项目旨在统一 Web 端所有页面的 UI 风格，特别是弹窗（Modal/Dialog）和表格（Table）。标准风格参考 `incoming/web/shift_add` 的实现。这将提升系统的一致性和用户体验。

## User Stories

### Story 1: 统一弹窗风格

As a 用户, I want 系统中所有的弹窗具有一致的视觉和交互体验, so that 我能更流畅地使用系统

**Acceptance Criteria:**
- [ ] AC1: 所有弹窗使用统一的半透明遮罩 (`bg-black/50 backdrop-blur-sm`)
- [ ] AC2: 弹窗头部统一为蓝色背景 (`bg-primary`)，白色文字，包含标题和关闭按钮
- [ ] AC3: 关闭按钮支持 hover 效果 (`hover:bg-white/20`)
- [ ] AC4: 底部操作栏统一风格 (Cancel: 灰边白底, Confirm: 蓝底白字)
- [ ] AC5: 表单控件样式统一 (Tailwind Forms 风格)

### Story 2: 统一表格风格

As a 用户, I want 所有的表格具有一致的视觉风格, so that 数据展示清晰且易于阅读

**Acceptance Criteria:**
- [ ] AC1: 表格使用统一的 Header 样式 (浅灰背景，加粗文字)
- [ ] AC2: 表格行具有 hover 效果
- [ ] AC3: 操作列按钮风格统一

## Scope

本次整改涉及以下模块的弹窗和表格：
- 考勤补卡 (Correction)
- 请假管理 (Leave)
- 排班管理 (Schedule)
- 班次管理 (Shift)
- 考勤时段 (Time Period)
- 部门管理 (Department)
- 员工管理 (Employee)
- 用户管理 (User)

## Constraints

- 必须使用 Tailwind CSS v4 (`@theme` 配置)
- 图标系统统一使用 Material Icons (class based)
- 保持现有的业务逻辑不变，仅调整 UI

## References

- 参考代码路径: `attendance-system/incoming/web/shift_add`
