# Tasks: 时间段设置 (SW63)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 45 分钟 |

## 任务清单

### 阶段1：数据层

#### Task 1: 更新数据模型 (Schema)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma` |
| 操作 | 修改 |
| 内容 | 完善 `AttTimePeriod`，添加 `AttShiftPeriod` (占位) |
| 验证 | `npx prisma validate && npx prisma migrate dev --name add_time_period` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：服务层 (含DTO)

#### Task 2: 实现Service与DTO

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-period.dto.ts`<br>`packages/server/src/modules/attendance/attendance-period.service.ts` |
| 操作 | 新增 |
| 内容 | 定义DTO(含校验)，实现CRUD逻辑，处理规则JSON |
| 验证 | `npm run test -- attendance-period.service` (需先创建测试文件) |
| 预计 | 20 分钟 |
| 依赖 | Task 1 |

### 阶段3：接口层

#### Task 3: 实现Controller与路由

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-period.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | 实现API接口，挂载路由，处理错误响应 |
| 验证 | 启动服务，使用 curl 验证基本连通性 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

### 阶段4：验证与文档

#### Task 4: 集成验证与文档同步

| 属性 | 值 |
|------|-----|
| 文件 | `docs/api-contract.md`<br>`packages/server/src/modules/attendance/attendance-period.test.ts` |
| 操作 | 修改/新增 |
| 内容 | 编写集成测试验证完整流程，同步API文档 |
| 验证 | `npm run test -- attendance-period` |
| 预计 | 5 分钟 |
| 依赖 | Task 3 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit (中文规范) |
| 全部完成后 | 运行完整测试套件 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 1 | 数据库迁移可能失败 | 确保本地数据库连接正常 |
| Task 2 | JSON字段类型处理 | 注意 Prisma Json 类型与 TS 类型的转换 |
