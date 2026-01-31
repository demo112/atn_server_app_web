# Tasks: 排班管理 (SW65)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 45 分钟 |

## 任务清单

### 阶段1：类型层

#### Task 1: 定义排班相关类型 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/attendance/schedule.ts` |
| 操作 | 新增 |
| 内容 | 定义 CreateScheduleDto, BatchCreateScheduleDto, ScheduleVo |
| 验证 | `pnpm --filter @attendance/shared build` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：服务层

#### Task 2: 实现排班DTO验证 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/schedule/schedule.dto.ts` |
| 操作 | 新增 |
| 内容 | 实现 class-validator 装饰的 DTO 类 |
| 验证 | `npm run test:unit` (需配合 Service 测试) |
| 预计 | 5 分钟 |
| 依赖 | Task 1 |

#### Task 3: 实现单人排班逻辑 (含冲突检测) (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/schedule/schedule.service.ts` |
| 操作 | 新增 |
| 内容 | 实现 `create` 方法，包含冲突检测和 Force=true 时的切断逻辑 |
| 验证 | 编写单元测试验证冲突检测逻辑 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

#### Task 4: 实现批量排班逻辑 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/schedule/schedule.service.ts` |
| 操作 | 修改 |
| 内容 | 实现 `batchCreate` 方法，使用 Prisma 事务处理部门批量排班 |
| 验证 | 编写单元测试验证批量事务 |
| 预计 | 10 分钟 |
| 依赖 | Task 3 |

#### Task 5: 实现排班查询与删除 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/schedule/schedule.service.ts` |
| 操作 | 修改 |
| 内容 | 实现 `getOverview` 和 `delete` 方法 |
| 验证 | 单元测试 |
| 预计 | 5 分钟 |
| 依赖 | Task 4 |

### 阶段3：接口层

#### Task 6: 实现排班控制器与路由 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/schedule/schedule.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | 实现 API 接口并注册路由 |
| 验证 | `curl` 或 Postman 测试接口 |
| 预计 | 5 分钟 |
| 依赖 | Task 5 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| Task 3/4 完成后 | 重点验证冲突处理逻辑 |
| 全部完成后 | 集成测试 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 3 | 冲突检测逻辑复杂，边界条件多 | 编写详细的单元测试覆盖各种重叠场景 |
