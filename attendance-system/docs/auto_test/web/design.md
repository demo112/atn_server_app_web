# Design: Web端测试覆盖提升方案

## 需求映射

基于 `requirements.md` 的全模块分析，本方案扩展了测试范围以覆盖 Auth, Attendance, Organization, Statistics 四大核心领域。

| 模块 | 关键需求/盲区 | 优先级 | 测试类型 | 实现策略 |
|------|--------------|--------|----------|----------|
| **Auth** | Login协议、错误反馈 | High | Integration | MSW Mock 401/403 |
| **Auth** | 权限路由守卫 | High | Integration | 模拟不同角色访问受限路由 |
| **Attendance** | **Leave (请假)**: 余额/跨天校验 | High | Integration | 模拟提交非法日期范围，验证前端拦截 |
| **Attendance** | **Correction (补卡)**: 审批流转 | High | Integration | 模拟 "提交->拒绝->再提交" 状态变化 |
| **Attendance** | **Schedule (排班)**: 批量边界 | Medium | Unit/Integration | 验证数组边界和日期合法性 |
| **Org** | **Dept**: 树操作循环引用 | High | Unit/Component | 测试 Tree 组件的拖拽/选择逻辑 |
| **Org** | **Employee**: 离职权限 | High | E2E/Integration | 模拟离职状态下的 API 调用 |
| **Stats** | 报表日期范围 | Low | Component | 验证日期选择器的快捷键逻辑 |

## 测试架构设计

### 1. 技术栈 (保持不变)
- Vitest, React Testing Library, MSW

### 2. 目录结构规范 (扩展)

```
packages/web/src/
├── __tests__/
│   ├── integration/
│   │   ├── auth/            # Login, Guard
│   │   ├── attendance/
│   │   │   ├── leave/       # 请假申请流程
│   │   │   ├── correction/  # 补卡流程
│   │   │   └── schedule/    # 排班管理
│   │   ├── organization/
│   │   │   ├── department/  # 部门增删改查
│   │   │   └── employee/    # 人员管理
│   │   └── statistics/      # 报表查看
│   └── utils/               # renderWithProviders, mockData
├── components/
│   └── {Component}/
│       └── index.test.tsx   # 组件级单元测试 (如 DepartmentTree)
└── utils/
    └── *.test.ts            # 纯函数测试 (如 date-utils)
```

### 3. 关键测试策略

#### 3.1 组织架构 (Tree Structure)
- **难点**: 树形结构的递归操作和循环引用检测。
- **策略**: 重点测试 `DepartmentTree` 组件。
  - Mock 一个 3 层深度的树结构。
  - 测试将父节点移动到子节点的操作 -> 预期失败。
  - 测试删除中间节点 -> 验证级联删除提示。

#### 3.2 考勤流程 (State Machine)
- **难点**: 多状态流转 (Pending -> Approved/Rejected)。
- **策略**: 使用 Integration Test 模拟完整流程。
  - **Setup**: `render(<CorrectionPage />)` with mocked API.
  - **Action**: 点击 "补卡" -> 填写表单 -> 提交 (Mock POST 200).
  - **Assert**: 列表刷新，显示 "Pending"。
  - **Action**: 切换管理员视角 (Mock User Context) -> 点击 "拒绝"。
  - **Assert**: 状态变为 "Rejected"。

#### 3.3 统计报表 (Data Visualization)
- **难点**: Canvas/SVG 图表难以断言具体内容。
- **策略**:
  - **不测试** 图表像素级渲染。
  - **测试** 数据传递准确性 (Component Props)。
  - **测试** 筛选条件变化时触发了正确的 API 请求 (MSW Spy)。

## 文件变更清单

| 优先级 | 文件路径 | 说明 |
|--------|----------|------|
| P0 | `src/test/utils.tsx` | 统一 Render 工具 |
| P0 | `src/__tests__/integration/auth/AuthGuard.test.tsx` | 路由权限守卫 |
| P0 | `src/__tests__/integration/attendance/leave.test.tsx` | 请假流程与校验 |
| P1 | `src/__tests__/integration/organization/department.test.tsx` | 部门管理 |
| P1 | `src/__tests__/integration/attendance/correction.test.tsx` | 补卡流程 |

## 风险与应对

1. **Mock 数据量大**: 涉及全模块，需要构建一套完整的 Mock Data Factory (使用 `@faker-js/faker`).
2. **测试运行速度**: 随着用例增加，CI 时间变长 -> 启用 Vitest 并发执行，分离 E2E。
