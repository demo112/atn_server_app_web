# Requirements: App 端全量测试覆盖 (Auto Test)

## Overview

本项目旨在对 `packages/app` 进行全方位的测试覆盖，消除测试盲区，确保移动端应用的稳定性。测试范围涵盖所有屏幕页面(Screens)、通用组件(Components)、业务服务(Services)及核心工具函数(Utils)。

## Scope

- **Screens**: 考勤管理、组织架构管理、认证与首页
- **Components**: 业务通用组件、错误边界
- **Services**: API 交互层
- **Utils**: 核心基础设施

## User Stories

### Story 1: 考勤业务模块 (Attendance) 测试覆盖

As a 员工/管理员, I want 考勤相关功能稳定可靠, so that 能够正常处理日常考勤事务

**Acceptance Criteria:**
- [ ] **AttendanceCalendar**: 验证日历渲染、打卡状态标记(正常/异常/缺卡)、月份切换。
- [ ] **AttendanceRecords**: 验证记录列表渲染、下拉刷新、上拉加载更多、空状态显示。
- [ ] **CorrectionScreen (补卡)**:
    - 验证表单提交（时间、原因）。
    - 验证表单校验（必填项、时间合理性）。
- [ ] **LeaveScreen (请假)**:
    - 验证请假类型选择、日期范围选择。
    - 验证跨天请假时长计算逻辑（如有）。
- [ ] **ScheduleScreen (排班)**: 验证排班表显示、当前班次高亮。
- [ ] **HistoryScreen**: 验证历史数据查询与筛选。

### Story 2: 组织架构模块 (Organization) 测试覆盖

As a 管理员, I want 在 App 端管理组织架构, so that 可以随时随地维护人员信息

**Acceptance Criteria:**
- [ ] **Department**:
    - `DepartmentListScreen`: 验证列表展示、层级结构（如有）、删除操作。
    - `DepartmentEditScreen`: 验证新增/编辑表单、上级部门选择。
- [ ] **Employee**:
    - `EmployeeListScreen`: 验证人员搜索、筛选、列表渲染。
    - `EmployeeEditScreen`: 验证人员信息录入、部门关联、入职日期选择。
- [ ] **User**:
    - `UserListScreen`: 验证账号列表、状态切换（启用/禁用）。
    - `UserEditScreen`: 验证角色分配、密码重置逻辑。

### Story 3: 通用组件 (Components) 测试覆盖

As a 开发者, I want 基础组件经过充分测试, so that 在各处引用时表现一致

**Acceptance Criteria:**
- [ ] **DepartmentSelect**:
    - 验证树状/级联选择逻辑。
    - 验证单选/多选模式。
    - 验证搜索功能。
- [ ] **ErrorBoundary**:
    - 验证子组件抛出错误时，能够捕获并显示友好的错误提示 UI。
    - 验证"重试"按钮功能。

### Story 4: 核心服务与工具 (Services & Utils) 测试覆盖

As a 架构师, I want 核心底层逻辑稳健, so that 业务层构建在可靠的基础之上

**Acceptance Criteria:**
- [ ] **Request Utils**:
    - 验证 Token 自动注入。
    - 验证 401 自动登出/刷新 Token 逻辑。
    - 验证网络超时、服务器错误的统一处理。
- [ ] **Services (Unit Test)**:
    - 验证 `attendance.ts`, `department.ts` 等 Service 方法正确转换请求/响应参数（DTO <-> VO）。

### Story 5: App 集成测试 (Integration Tests)

As a QA, I want 验证关键业务链路, so that 确保模块间协同工作正常

**Acceptance Criteria:**
- [ ] **E2E链路 1**: 登录 -> 首页 -> 进入考勤页 -> 完成打卡 -> 查看记录。
- [ ] **E2E链路 2**: 登录 -> 组织管理 -> 新增部门 -> 新增员工 -> 关联部门。

## Constraints

- **测试框架**: Vitest + React Native Testing Library
- **覆盖率目标**: 全量行覆盖率 > 85%
- **Mock 策略**: 
    - 单元测试：完全 Mock `request.ts` 或 Service 层。
    - 集成测试：Mock API 响应数据，不依赖真实后端。

## Out of Scope

- 真实原生设备功能（如实际的 GPS 信号获取、摄像头硬件调用），使用 Mock 数据替代。
- 复杂的动画交互效果测试。

## Metadata

- 路径：`packages/app`
- 创建时间：2026-02-04
- 优先级：High
