# Requirements: Web端测试覆盖提升 (迭代1)

## Overview

当前 Web 端功能模块已开发完成，但测试覆盖率较低。本需求旨在梳理现有功能，并结合最新的测试体系，启动第一阶段的测试覆盖提升工作。
迭代1将聚焦于**基础设施验证**、**工具函数**、**公共组件**以及**核心基础业务**（登录、组织架构），为后续复杂业务测试打下基础。

## Current Implementation Analysis (现状梳理)

基于 `packages/web/src` 的代码审计：

| 模块 | 路径 | 包含功能 | 复杂度 |
|------|------|----------|--------|
| **基础** | `utils/`, `context/` | Auth, Request, Types | 低 |
| **组件** | `components/` | DepartmentSelect, Tree | 低 |
| **登录** | `pages/Login.tsx` | 登录表单, Token处理 | 中 |
| **部门** | `pages/department/` | 树形展示, 增删改查 | 中 |
| **员工** | `pages/employee/` | 列表, 搜索, 绑定用户 | 中 |
| **考勤** | `pages/attendance/*` | 打卡, 补卡, 请假, 排班 | 高 |
| **统计** | `pages/statistics/` | 汇总报表 | 中 |

## User Stories (Iteration 1)

### Story 1: 测试基础设施验证
As a 开发者, I want 确保测试环境运行正常, So that 后续编写的测试能被正确执行
**Acceptance Criteria:**
- [ ] AC1: `pnpm test` 能成功运行
- [ ] AC2: `pnpm test:coverage` 能生成覆盖率报告
- [ ] AC3: MSW (Mock Service Worker) 能拦截并模拟 API 请求

### Story 2: 工具函数单元测试
As a 开发者, I want 覆盖核心工具函数, So that 确保底层逻辑的正确性
**Acceptance Criteria:**
- [ ] AC1: `utils/auth.ts` (Token管理) 覆盖率 > 90%
- [ ] AC2: `utils/request.ts` (拦截器逻辑) 覆盖率 > 90%
- [ ] AC3: `utils/type-helpers.ts` 覆盖率 > 90%

### Story 3: 公共组件测试
As a 开发者, I want 覆盖公共UI组件, So that 确保复用组件的交互正确
**Acceptance Criteria:**
- [ ] AC1: `components/DepartmentSelect` 支持加载状态、选择回调
- [ ] AC2: `components/DepartmentTree` 正确渲染树形结构

### Story 4: 核心页面集成测试 (Happy Path)
As a QA, I want 覆盖最基础的业务流程, So that 确保系统核心功能可用
**Acceptance Criteria:**
- [ ] AC1: **登录流程** - 输入正确账号密码能跳转，错误显示提示
- [ ] AC2: **部门管理** - 能加载部门列表，能打开新增弹窗
- [ ] AC3: **员工管理** - 能加载员工列表，能进行搜索

## Constraints

- **测试框架**: Vitest + React Testing Library
- **Mock工具**: MSW (Mock Service Worker)
- **覆盖率目标**: 本次迭代不强制整体达标，重点文件需达标

## Out of Scope (Iteration 1)

- 复杂考勤业务 (打卡、补卡、请假、排班) -> 留待迭代2
- E2E 测试 (Playwright/Cypress) -> 留待迭代3
- 异常边界测试 (本次优先覆盖 Happy Path)

## Assumptions

- 现有代码结构稳定，不需要大规模重构
- MSW 能够模拟所有后端接口
