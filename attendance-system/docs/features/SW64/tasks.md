# Tasks: 班次管理 (SW64)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 40 分钟 |

## 任务清单

### 阶段1：数据层

#### Task 1: 验证数据模型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma` |
| 操作 | 检查 |
| 内容 | 确认 `AttShift` 和 `AttShiftPeriod` 模型定义正确，执行 `npx prisma generate` 更新Client |
| 验证 | `npx prisma validate` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：服务层

#### Task 2: 实现Service与DTO

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-shift.dto.ts`<br>`packages/server/src/modules/attendance/attendance-shift.service.ts` |
| 操作 | 新增 |
| 内容 | 定义DTO (Create/Update)，实现CRUD逻辑 (create, findAll, findById, update, delete) |
| 验证 | `npx tsc --noEmit` |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

### 阶段3：接口层

#### Task 3: 实现Controller与路由

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-shift.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | 实现Controller方法，注册 `/shifts` 路由 |
| 验证 | `npx tsc --noEmit` |
| 预计 | 10 分钟 |
| 依赖 | Task 2 |

### 阶段4：验证与交付

#### Task 4: 集成验证与文档同步

| 属性 | 值 |
|------|-----|
| 文件 | `docs/api-contract.md`<br>`docs/changelog.md` |
| 操作 | 修改 |
| 内容 | 更新API文档，记录变更，执行手动测试 |
| 验证 | 手动调用API验证功能 |
| 预计 | 10 分钟 |
| 依赖 | Task 3 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 → git push |
