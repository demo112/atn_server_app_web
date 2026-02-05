# Requirements: App样式复刻Web

## Overview

将 Web 端的视觉风格（基于 Tailwind CSS）全面复刻到 App 端（基于 React Native Paper）。目标是让 App 在色彩、字体、圆角、组件样式上与 Web 端保持高度一致，提供统一的用户体验。

## User Stories

### Story 1: 全局主题复刻

As a 用户, I want App 的整体配色和 Web 一致, so that 我在不同端使用时有熟悉的体验

**Acceptance Criteria:**
- [ ] AC1: App 使用与 Web 一致的主题色（Primary: #4A90E2）
- [ ] AC2: App 使用与 Web 一致的背景色（Light: #F3F4F6, Dark: #111827）
- [ ] AC3: App 使用与 Web 一致的卡片背景色和圆角（8px）
- [ ] AC4: App 的字体风格与 Web 保持一致（无衬线字体）

### Story 2: 登录页样式复刻

As a 用户, I want 登录页看起来和 Web 登录页一样漂亮, so that 我能感受到产品的专业性

**Acceptance Criteria:**
- [ ] AC1: 输入框样式与 Web 一致（圆角、边框颜色）
- [ ] AC2: 登录按钮样式与 Web 一致（颜色、阴影、圆角）
- [ ] AC3: 页面布局与 Web 保持视觉上的相似性

### Story 3: 核心功能页样式复刻

As a 用户, I want 打卡、记录等核心页面的卡片和列表样式与 Web 一致, so that 操作体验流畅

**Acceptance Criteria:**
- [ ] AC1: 首页卡片（打卡、请假等）样式复刻 Web 的 Dashboard 卡片
- [ ] AC2: 列表页（打卡记录、审批列表）的 Item 样式复刻 Web 的 Table/List 样式
- [ ] AC3: 详情页的排版和间距复刻 Web 样式
- [ ] AC4: 覆盖所有员工端页面：打卡、请假、补卡、记录、排班

### Story 4: 管理功能页样式复刻

As a 管理员, I want 在手机上管理部门、人员、排班时也能有整洁的界面

**Acceptance Criteria:**
- [ ] AC1: 列表页（部门、人员、用户、排班）使用统一的 Card 列表样式
- [ ] AC2: 编辑页使用统一的 Form 样式（Input, Select, Button）
- [ ] AC3: 操作按钮（新增、编辑、删除）样式统一

## Constraints

- 技术约束：必须基于 React Native 和 React Native Paper 实现
- 兼容性：需适配 iOS 和 Android 样式差异
- 性能：样式调整不应影响 App 渲染性能

## Out of Scope

- 新增 Web 端独有的功能（如统计图表、复杂的管理表格）
- 改变 App 原有的交互逻辑（仅调整视觉样式）
- 复杂的动画效果复刻

## Assumptions

- Web 端的 Tailwind 配置是视觉标准来源
- App 端目前使用 React Native Paper，支持通过 Theme 覆盖样式
