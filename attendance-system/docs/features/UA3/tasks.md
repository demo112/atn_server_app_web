# Tasks: UA3 部门管理

| Task | Owner | Status |
|---|---|---|
| Task 1 | sasuke | ✅ |
| Task 2 | sasuke | ✅ |
| Task 3 | sasuke | ✅ |
| Task 4 | sasuke | ✅ |
| Task 5 | sasuke | ✅ |
| Task 6 | sasuke | ✅ |

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | department |
| 涉及端 | Server, Web |
| 预计总时间 | 75 分钟 |

## 任务清单

### 阶段1：类型定义 (Shared)

#### Task 1: 定义部门公共类型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/department.ts` |
| 操作 | 新增 |
| 内容 | 定义 `DepartmentVO`, `CreateDepartmentDto`, `UpdateDepartmentDto` |
| 验证 | `npm run type-check` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：服务端实现 (Server)

#### Task 2: 实现部门 Service

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/department/department.service.ts` |
| 操作 | 新增 |
| 内容 | 实现 `create`, `update`, `delete`, `getTree` (递归构建), `checkCircular` |
| 验证 | 编写单元测试或等待 Controller 联调 |
| 预计 | 20 分钟 |
| 依赖 | Task 1 |

#### Task 3: 实现部门 Controller

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/department/department.controller.ts`<br>`packages/server/src/modules/department/index.ts` |
| 操作 | 新增 |
| 内容 | 实现 CRUD API 接口，绑定路由 |
| 验证 | `curl` 测试 API 响应 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

### 阶段3：Web端实现 (Web)

#### Task 4: 部门树组件与页面框架

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/department/components/DepartmentTree.tsx`<br>`packages/web/src/pages/department/DepartmentPage.tsx` |
| 操作 | 新增 |
| 内容 | 实现 DepartmentTree (展示), 页面左右布局 |
| 验证 | 浏览器访问页面，能看到静态或空数据的树 |
| 预计 | 15 分钟 |
| 依赖 | Task 3 |

#### Task 5: 部门增删改交互

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/department/components/DepartmentForm.tsx`<br>`packages/web/src/pages/department/DepartmentPage.tsx` |
| 操作 | 新增 |
| 内容 | 实现表单弹窗，集成 API 调用 (React Query) |
| 验证 | 完整测试新增、编辑、删除流程 |
| 预计 | 20 分钟 |
| 依赖 | Task 4 |

### 阶段4：公共组件 (Web)

#### Task 6: 部门选择组件

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/components/DepartmentSelect/DepartmentSelect.tsx` |
| 操作 | 新增 |
| 内容 | 封装 TreeSelect 组件，供 User/Attendance 模块选择部门 |
| 验证 | 在 Storybook 或临时页面测试组件渲染 |
| 预计 | 10 分钟 |
| 依赖 | Task 5 |

### 阶段5：App端实现 (App)

#### Task 7: App端基础与Service

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/services/department.ts`<br>`packages/app/src/components/DepartmentSelect.tsx` |
| 操作 | 新增 |
| 内容 | 1. 封装 Department API<br>2. 实现 App 端部门选择器 (Modal) |
| 验证 | 单元测试 Service，组件渲染测试 |
| 预计 | 15 分钟 |
| 状态 | ✅ 已完成 |
| 依赖 | Task 3 |

#### Task 8: App端部门管理页面

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/organization/department/DepartmentListScreen.tsx`<br>`packages/app/src/screens/organization/department/DepartmentEditScreen.tsx` |
| 操作 | 新增 |
| 内容 | 1. 部门层级展示 (Drill-down)<br>2. 部门增删改表单 |
| 验证 | 模拟器中测试完整 CRUD 流程 |
| 预计 | 25 分钟 |
| 状态 | ✅ 已完成 |
| 依赖 | Task 7 |

#### Task 9: App端管理入口集成

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/App.tsx`<br>`packages/app/src/screens/HomeScreen.tsx` |
| 操作 | 修改 |
| 内容 | 1. 注册部门管理路由<br>2. 在 HomeScreen 增加管理入口 (Admin可见) |
| 验证 | Admin 登录可见入口，跳转正常 |
| 预计 | 10 分钟 |
| 状态 | ✅ 已完成 |
| 依赖 | Task 8 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| Server 完成后 | 接口测试通过 |
| Web 完成后 | 端到端流程测试 |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 2 | 循环引用校验逻辑复杂 | 编写针对性测试用例 |
