# Tasks: 时间段设置 (SW63)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 45 分钟 |

## 任务清单

### 阶段1：数据层

#### Task 1: 修改 AttTimePeriod 数据模型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma` |
| 操作 | 修改 |
| 内容 | 将 `startTime` 和 `endTime` 改为可选，添加 `rules` JSON 字段 |
| 验证 | `npx prisma validate && npx prisma migrate dev --name update_time_period_schema` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：类型层

#### Task 2: 定义时间段相关类型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/attendance/time-period.ts`, `packages/shared/src/types/index.ts` |
| 操作 | 新增 |
| 内容 | 定义 `TimePeriodRules`, `CreateTimePeriodDto`, `TimePeriodVo` 等类型 |
| 验证 | `npm run type-check` |
| 预计 | 5 分钟 |
| 依赖 | Task 1 |

### 阶段3：服务层

#### Task 3: 实现时间段 DTO 验证

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/time-period/time-period.dto.ts` |
| 操作 | 新增 |
| 内容 | 基于 `class-validator` 实现 DTO 验证逻辑 |
| 验证 | 单元测试验证（后续集成） |
| 预计 | 5 分钟 |
| 依赖 | Task 2 |

#### Task 4: 实现时间段业务逻辑 (Service)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/time-period/time-period.service.ts`, `packages/server/src/modules/attendance/time-period/time-period.test.ts` |
| 操作 | 新增 |
| 内容 | 实现 CRUD 逻辑，处理 JSON 字段，实现删除校验 |
| 验证 | `npx vitest run src/modules/attendance/time-period/time-period.test.ts` |
| 预计 | 15 分钟 |
| 依赖 | Task 3 |

### 阶段4：接口层

#### Task 5: 实现时间段接口 (Controller)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/time-period/time-period.controller.ts`, `packages/server/src/app.ts` |
| 操作 | 新增 |
| 内容 | 实现 HTTP 接口，注册路由 |
| 验证 | 启动服务，使用 curl 或 postman 简单验证 |
| 预计 | 10 分钟 |
| 依赖 | Task 4 |

### 阶段5：集成联调

#### Task 6: 集成测试

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/time-period/time-period.integration.test.ts` (新增) |
| 操作 | 新增 |
| 内容 | 测试完整流程：创建 -> 查询 -> 修改 -> 删除 |
| 验证 | `npx vitest run src/modules/attendance/time-period/time-period.integration.test.ts` |
| 预计 | 5 分钟 |
| 依赖 | Task 5 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 1 | Schema 变更可能影响现有数据 | 开发环境会自动迁移，生产环境需注意 |
| Task 4 | JSON 字段查询性能 | 规则字段不作为主要查询条件，仅用于读取配置 |
