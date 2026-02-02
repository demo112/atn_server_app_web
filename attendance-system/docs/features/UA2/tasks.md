# Tasks: UA2 人员管理

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 7 |
| 涉及模块 | Employee, User |
| 涉及端 | Server, Web |
| 预计总时间 | 120 分钟 |

## 任务清单

### 阶段1：数据层与类型定义

#### Task 1: 数据库模型与共享类型
| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma`<br>`packages/shared/src/types/employee.ts` |
| 操作 | 修改/新增 |
| 内容 | 1. 修改 `EmployeeStatus` 枚举 (active/deleted)<br>2. 定义 `EmployeeDto`, `EmployeeVo` 等共享类型 |
| 验证 | `npx prisma validate`<br>`npm run type-check` (shared) |
| 状态 | ✅ 已完成 |

### 阶段2：服务端实现

#### Task 2: Employee DTO 与 Service 实现
| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/employee/employee.dto.ts`<br>`packages/server/src/modules/employee/employee.service.ts`<br>`packages/server/src/modules/employee/employee.test.ts` |
| 操作 | 新增 |
| 内容 | 1. 实现 DTO 验证类<br>2. 实现 CRUD 逻辑 (含伪物理删除)<br>3. 实现 `bindUser` 逻辑<br>4. 编写单元测试 |
| 验证 | `npm test -- employee.test.ts` |
| 状态 | ✅ 已完成 |

#### Task 3: Employee Controller 与路由注册
| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/employee/employee.controller.ts`<br>`packages/server/src/modules/employee/employee.routes.ts`<br>`packages/server/src/index.ts` |
| 操作 | 新增/修改 |
| 内容 | 1. 实现 API 接口<br>2. 配置路由<br>3. 在入口文件注册路由 |
| 验证 | `npm run build` (server)<br>Postman 冒烟测试接口 |
| 状态 | ✅ 已完成 |

### 阶段3：Web端实现

#### Task 4: 前端 Service 封装
| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/services/employee.ts`<br>`packages/web/src/App.tsx` |
| 操作 | 新增/修改 |
| 内容 | 1. 封装 Employee API 调用<br>2. 添加 `/employee` 路由 |
| 验证 | `npm run type-check` (web) |
| 状态 | ✅ 已完成 |

#### Task 5: 员工列表与删除功能
| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/employee/index.tsx` |
| 操作 | 新增 |
| 内容 | 1. 展示员工列表<br>2. 实现搜索/筛选<br>3. 实现删除操作 (调用 DELETE 接口) |
| 验证 | `npm run build` (web)<br>页面可正常渲染列表 |
| 状态 | ✅ 已完成 |

#### Task 6: 员工编辑/新增弹窗
| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/employee/components/EmployeeModal.tsx` |
| 操作 | 新增 |
| 内容 | 1. 实现新增/编辑表单<br>2. 实现账号绑定/解绑 UI |
| 验证 | 弹窗表单交互正常，数据提交成功 |
| 状态 | ✅ 已完成 |

### 阶段4：集成验收

#### Task 7: 集成测试与文档同步
| 属性 | 值 |
|------|-----|
| 文件 | `docs/features/UA2/tasks.md`<br>`docs/features/UA2/design.md` |
| 操作 | 更新 |
| 内容 | 1. 验证完整业务流程 (增删改查+绑定)<br>2. 确认删除后的数据表现<br>3. 同步文档状态 |
| 验证 | 业务流程通畅，无报错 |
| 状态 | ✅ 已完成 |

### 阶段5：App端实现 (App)

#### Task 8: App端员工Service与列表

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/services/employee.ts`<br>`packages/app/src/screens/organization/employee/EmployeeListScreen.tsx` |
| 操作 | 新增 |
| 内容 | 1. 封装 Employee API<br>2. 员工列表展示 (含搜索) |
| 验证 | 模拟器查看列表，搜索功能正常 |
| 预计 | 20 分钟 |
| 状态 | ✅ 已完成 |
| 依赖 | UA3-Task9 (入口) |

#### Task 9: App端员工详情与编辑

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/organization/employee/EmployeeDetailScreen.tsx`<br>`packages/app/src/screens/organization/employee/EmployeeEditScreen.tsx` |
| 操作 | 新增 |
| 内容 | 1. 员工详情展示<br>2. 新增/编辑表单 (含部门选择) |
| 验证 | 增删改流程测试通过 |
| 预计 | 30 分钟 |
| 状态 | ✅ 已完成 |
| 依赖 | Task 8, UA3-Task7 (部门选择器) |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit (feat/UA2) |
| 服务端完成后 | 验证 API 接口可用性 |
| 全部完成后 | 集成测试 → git push |
