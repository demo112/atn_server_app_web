# Tasks: Web UI 标准化整改 (UI-STD-001)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 7 |
| 涉及模块 | Shift, Correction, Schedule, Leave, Org |
| 涉及端 | Web |
| 预计总时间 | 120 分钟 |

## 任务清单

### 阶段1：基础设施

#### Task 1: 创建 StandardModal 组件

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/components/common/StandardModal.tsx` |
| 操作 | 新增 |
| 内容 | 封装统一的 Modal 组件 (Header, Overlay, Footer) |
| 验证 | `npm run build` && 视觉验证（颜色/间距/圆角/阴影）与 design.md 一致 |
| 预计 | 10 分钟 |
| 依赖 | 无 |

### 阶段2：模块改造

#### Task 2: 改造 Shift 模块 (样板)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/shift/components/ShiftModal.tsx`, `packages/web/src/pages/attendance/shift/components/ShiftTable.tsx` |
| 操作 | 修改 |
| 内容 | 使用 `StandardModal`，重构 Table 样式 |
| 验证 | 启动 Web 端，访问 Shift 页面验证视觉一致性 |
| 预计 | 20 分钟 |
| 依赖 | Task 1 |

#### Task 3: 改造 Correction 模块

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`, `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx` |
| 操作 | 修改 |
| 内容 | 使用 `StandardModal` |
| 验证 | 访问 Correction 页面验证弹窗视觉一致性 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

#### Task 4: 改造 Schedule 模块

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/schedule/components/BatchScheduleDialog.tsx`, `packages/web/src/pages/attendance/schedule/components/ScheduleDialog.tsx` |
| 操作 | 修改 |
| 内容 | 使用 `StandardModal` |
| 验证 | 访问 Schedule 页面验证弹窗视觉一致性 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

#### Task 5: 改造 Leave & TimePeriod 模块

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/leave/components/LeaveDialog.tsx`, `packages/web/src/pages/attendance/time-period/components/TimePeriodDialog.tsx` |
| 操作 | 修改 |
| 内容 | 使用 `StandardModal` |
| 验证 | 访问 Leave 和 TimePeriod 页面验证视觉一致性 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

#### Task 6: 改造 Org 模块

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/department/components/DepartmentForm.tsx`, `packages/web/src/pages/employee/components/BindUserModal.tsx`, `packages/web/src/pages/employee/components/EmployeeModal.tsx` |
| 操作 | 修改 |
| 内容 | 使用 `StandardModal` |
| 验证 | 访问 Department 和 Employee 页面验证视觉一致性 |
| 预计 | 20 分钟 |
| 依赖 | Task 1 |

#### Task 7: 统一其他页面表格

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx`, `packages/web/src/pages/user/UserList.tsx`, `packages/web/src/pages/employee/EmployeeList.tsx` |
| 操作 | 修改 |
| 内容 | 统一 Table 样式 (Gray Header, Hover Effect, Material Icons) |
| 验证 | 访问对应页面验证表格样式视觉一致性 |
| 预计 | 25 分钟 |
| 依赖 | Task 2 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 (OpenPreview) |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| 所有任务 | 可能会破坏现有的 CSS 布局 | 每次修改后务必进行视觉验证 |
| Task 6 | 部门树组件可能有特殊的样式依赖 | 小心处理嵌套结构 |
