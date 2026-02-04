# Requirements: UI-CLONE-Correction 补签页面UI升级

## Overview
基于 `incoming/web/signed` 参考代码，升级现有的补签处理页面 (`CorrectionPage`) UI，使其具有现代化的视觉风格。

## User Stories

### Story 1: 升级补签列表页面 UI
As a 用户, I want 补签页面具有清晰的筛选栏和美观的表格, So that 提升操作体验

**Acceptance Criteria:**
- [ ] AC1: 页面顶部包含筛选栏（时间范围、状态筛选、搜索框）
- [ ] AC2: 表格样式与参考代码一致（间距、字体、边框、Hover效果）
- [ ] AC3: 底部包含分页组件
- [ ] AC4: 保留左侧部门树筛选功能（这是业务必须的）

### Story 2: 升级补签弹窗 UI
As a 用户, I want 补签弹窗样式美观且交互流畅, So that 填写补签信息更舒适

**Acceptance Criteria:**
- [ ] AC1: 弹窗使用参考代码的 Header 样式（蓝色背景、白色文字）
- [ ] AC2: 表单控件样式优化（输入框、标签）
- [ ] AC3: 添加"温馨提示"区域
- [ ] AC4: 保持原有的数据提交逻辑不变

## 约束条件
- 必须使用 Tailwind CSS
- 必须保留现有的业务逻辑（Service 调用）
- 必须保留 `DepartmentTree` 组件
