# Tasks: 时间段设置 (SW63)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 10 |
| 涉及模块 | attendance |
| 涉及端 | Server, Web |
| 预计总时间 | 115 分钟 |

## 任务清单

### 阶段1：数据层 (Server)

#### Task 1: 修改 AttTimePeriod 数据模型
- **文件**: `packages/server/prisma/schema.prisma`
- **内容**: 将 `startTime` 和 `endTime` 改为可选，添加 `rules` JSON 字段
- **验证**: `npx prisma validate && npx prisma migrate dev --name update_time_period_schema`
- **依赖**: 无
- **预计**: 5 分钟

### 阶段2：类型层 (Shared)

#### Task 2: 定义时间段相关类型
- **文件**: `packages/shared/src/types/attendance/time-period.ts`, `packages/shared/src/types/index.ts`
- **内容**: 定义 `TimePeriodRules`, `CreateTimePeriodDto`, `TimePeriodVo` 等类型
- **验证**: `npm run type-check`
- **依赖**: Task 1
- **预计**: 5 分钟

### 阶段3：服务层 (Server)

#### Task 3: 实现时间段 DTO 验证
- **文件**: `packages/server/src/modules/attendance/time-period/time-period.dto.ts`
- **内容**: 基于 `class-validator` 实现 DTO 验证逻辑
- **验证**: 单元测试验证
- **依赖**: Task 2
- **预计**: 5 分钟

#### Task 4: 实现时间段业务逻辑 (Service)
- **文件**: `packages/server/src/modules/attendance/time-period/time-period.service.ts`
- **内容**: 实现 CRUD 逻辑，处理 JSON 字段，实现删除校验
- **验证**: `npx vitest run src/modules/attendance/time-period/time-period.test.ts`
- **依赖**: Task 3
- **预计**: 15 分钟

### 阶段4：接口层 (Server)

#### Task 5: 实现时间段接口 (Controller)
- **文件**: `packages/server/src/modules/attendance/time-period/time-period.controller.ts`
- **内容**: 实现 HTTP 接口，注册路由
- **验证**: 启动服务，使用 curl 验证
- **依赖**: Task 4
- **预计**: 10 分钟

### 阶段5：服务端验证

#### Task 6: 服务端集成测试
- **文件**: `packages/server/src/modules/attendance/time-period/time-period.integration.test.ts`
- **内容**: 测试完整 API 流程：创建 -> 查询 -> 修改 -> 删除
- **验证**: `npx vitest run src/modules/attendance/time-period/time-period.integration.test.ts`
- **依赖**: Task 5
- **预计**: 5 分钟

### 阶段6：Web 前端开发

#### Task 7: 实现时间段 Service (Web) (已完成)
- **文件**: `packages/web/src/services/time-period.ts`
- **内容**: 封装 `getTimePeriods`, `createTimePeriod`, `updateTimePeriod`, `deleteTimePeriod` API 调用
- **验证**: 无（作为后续任务依赖）
- **依赖**: Task 5
- **预计**: 10 分钟

#### Task 8: 实现时间段列表页 (Web) (已完成)
- **文件**: `packages/web/src/pages/attendance/time-period/TimePeriodPage.tsx`
- **内容**: 使用 Table 展示时间段列表，支持删除操作；添加“新增”按钮
- **验证**: 页面可展示数据，删除功能正常
- **依赖**: Task 7
- **预计**: 20 分钟

#### Task 9: 实现时间段表单组件 (Web) (已完成)
- **文件**: `packages/web/src/pages/attendance/time-period/components/TimePeriodDialog.tsx`
- **内容**: 
    - 实现新增/编辑弹窗
    - 支持“固定/弹性”班制切换显示不同字段
    - 实现基础字段和 Rules 字段（迟到/早退规则）的表单绑定
- **验证**: 表单验证正常，数据提交成功
- **依赖**: Task 8
- **预计**: 30 分钟

#### Task 10: Web 路由集成与联调 (已完成)
- **文件**: `packages/web/src/App.tsx` (或路由配置)
- **内容**: 配置 `/attendance/settings/time-periods` 路由，进行端到端手动测试
- **验证**: 浏览器中访问页面，完成一次完整的增删改查流程
- **依赖**: Task 9
- **预计**: 10 分钟

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 9 | Rules JSON 字段表单逻辑复杂 | 先实现基础字段，Rules 字段可先用 JSON 编辑器或简化 UI |
