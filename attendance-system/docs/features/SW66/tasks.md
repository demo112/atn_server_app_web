# Tasks: SW66 补签处理

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 8 |
| 涉及模块 | attendance |
| 涉及端 | Server, Web |
| 预计总时间 | 120 分钟 |

## 任务清单

### 阶段1：类型与领域层

#### Task 1: 定义补签相关类型 (Shared)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/attendance/correction.ts` |
| 操作 | 新增 |
| 内容 | `CorrectionType`, `QueryDailyRecordsDto`, `DailyRecordVo`, `SupplementCheckInDto`, `SupplementCheckOutDto`, `SupplementResultVo` |
| 验证 | `npm run type-check` (server/web) |
| 预计 | 10 分钟 |
| 依赖 | 无 |

#### Task 2: 实现核心考勤计算引擎 (Domain)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/domain/attendance-calculator.ts` |
| 操作 | 新增 |
| 内容 | `AttendanceCalculator` 类，实现 `calculate(record, shift)` 逻辑 (Late/Early/Absent 判定) |
| 验证 | `npm test packages/server/src/modules/attendance/domain/attendance-calculator.test.ts` (需新增测试文件) |
| 预计 | 30 分钟 |
| 依赖 | Task 1 |

### 阶段2：服务与接口层

#### Task 3: 实现补签服务 (Server)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/correction/attendance-correction.service.ts` |
| 操作 | 新增 |
| 内容 | `checkIn`, `checkOut` 方法，使用 Prisma 事务：更新记录 -> 调用 Calculator 重算 -> 写入 Correction 日志 |
| 验证 | `npm test packages/server/src/modules/attendance/correction/attendance-correction.service.test.ts` (需新增测试文件) |
| 预计 | 25 分钟 |
| 依赖 | Task 2 |

#### Task 4: 实现补签控制器与路由 (Server)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/correction/attendance-correction.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | `queryDailyRecords`, `supplementCheckIn`, `supplementCheckOut` 接口实现与路由注册 |
| 验证 | 启动 Server，使用 Postman 或 curl 调用接口 |
| 预计 | 15 分钟 |
| 依赖 | Task 3 |

### 阶段3：Web 前端

#### Task 5: 封装补签 API (Web)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/services/attendance-correction.ts` |
| 操作 | 新增 |
| 内容 | 调用后端补签相关接口 |
| 验证 | 无 (作为 Task 6, 7 的依赖) |
| 预计 | 5 分钟 |
| 依赖 | Task 4 |

#### Task 6: 实现异常考勤列表页 (Web)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/correction/CorrectionPage.tsx` |
| 操作 | 新增 |
| 内容 | 部门树筛选、异常记录表格展示 (复用 DepartmentTree 组件) |
| 验证 | 启动 Web，查看页面渲染和数据加载 |
| 预计 | 20 分钟 |
| 依赖 | Task 5 |

#### Task 7: 实现补签弹窗组件 (Web)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`<br>`packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx` |
| 操作 | 新增 |
| 内容 | 补签到/补签退表单，时间选择，提交逻辑 |
| 验证 | 在列表页点击操作，验证弹窗交互和提交 |
| 预计 | 15 分钟 |
| 依赖 | Task 6 |

### 阶段4：集成验证

#### Task 8: 集成测试 (E2E)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/correction/attendance-correction.integration.test.ts` |
| 操作 | 新增 |
| 内容 | 模拟完整流程：创建异常记录 -> 补签 -> 验证状态变为正常 -> 验证生成 Correction 日志 |
| 验证 | `npm test packages/server/src/modules/attendance/correction/attendance-correction.integration.test.ts` |
| 预计 | 10 分钟 |
| 依赖 | Task 7 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证通过 -> git add -> git commit |
| 全部完成后 | 运行所有相关测试 -> 文档同步 -> git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 2 | 考勤计算逻辑复杂，边界情况多 | 编写详细的单元测试覆盖各种时间点组合 |
| Task 3 | 事务处理可能死锁 | 保持事务简短，避免在事务中进行耗时操作 |
