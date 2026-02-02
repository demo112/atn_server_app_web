# 任务拆分：排班管理 (SW65)

## Task 1: 定义 API 接口类型 (Shared)
- **文件**: `packages/shared/src/types/attendance/schedule.ts`
- **内容**:
  - 定义 `CreateScheduleDto`, `BatchCreateScheduleDto`, `ScheduleQueryDto`。
  - 定义 `ScheduleVo`。
  - 导出到 `packages/shared/src/types/index.ts`。
- **验证**: `npm run type-check` (在 server/web 目录下运行) [x]
- **依赖**: 无

## Task 2: 实现排班服务 - 核心冲突检测与处理 (Server)
- **文件**: `packages/server/src/modules/attendance/schedule.service.ts`
- **内容**:
  - 实现 `createSchedule` 方法。
  - 实现 `detectConflicts` 私有方法：
    - 查询 `[New.Start, New.End]` 范围内的排班。
    - 仅检测日期重叠。
  - 实现 `resolveConflicts` 私有方法 (Force=true)：
    - 处理 Obsolete (删除)。
    - 处理 Trim Right/Left (更新)。
    - 处理 Split (更新 + 新增)。
  - **关键逻辑**: 忽略时间边界冲突，允许跨天物理时间重叠。
- **验证**: 编写单元测试 `packages/server/src/modules/attendance/schedule.service.test.ts` 覆盖各种冲突场景。 [x]
- **依赖**: Task 1

## Task 3: 实现排班服务 - 批量处理 (Server)
- **文件**: `packages/server/src/modules/attendance/schedule.service.ts`
- **内容**:
  - 实现 `batchCreateSchedule` 方法。
  - 处理部门递归查找人员。
  - 循环调用 `createSchedule` (复用逻辑)。
  - 事务处理 (`prisma.$transaction`)。
- **验证**: 单元测试覆盖批量场景。 [x]
- **依赖**: Task 2

## Task 4: 实现排班控制器 (Server)
- **文件**: `packages/server/src/modules/attendance/schedule.controller.ts`
- **内容**:
  - 实现 `create`, `batchCreate`, `query` 接口。
  - 错误处理：`ERR_SCHEDULE_CONFLICT`。
- **文件**: `packages/server/src/routes/attendance.ts` (或 `index.ts`)
  - 注册路由 `/schedules`。
- **验证**: 使用 curl 或 Postman 测试接口。 [x]
- **依赖**: Task 3

## Task 5: 前端排班 API 调用 (Web)
- **文件**: `packages/web/src/services/attendance/schedule.ts`
- **内容**:
  - 实现 `createSchedule`, `batchCreateSchedule`, `getSchedules`。
- **验证**: 无 (代码静态检查) [x]
- **依赖**: Task 1

## Task 6: 排班管理页面 - 排班表视图 (Web)
- **文件**: `packages/web/src/pages/attendance/ScheduleManagement.tsx`
- **内容**:
  - 展示日历/排班表。
  - 调用 `getSchedules` 加载数据。
  - 展示排班色块。
- **验证**: 启动 Web 端，查看页面渲染。 [x]
- **依赖**: Task 5

## Task 7: 排班管理页面 - 新增/编辑弹窗 (Web)
- **文件**: `packages/web/src/pages/attendance/components/ScheduleModal.tsx`
- **内容**:
  - 表单：人员/部门、日期范围、班次。
  - 提交逻辑：
    - 第一次提交 `force=false`。
    - 若捕获 `ERR_SCHEDULE_CONFLICT`，提示用户冲突详情。
    - 用户确认“覆盖”后，再次提交 `force=true`。
  - **提示优化**: 若存在跨天班次，显示警告“存在跨天时间重叠，系统将自动融合”。
- **验证**: 手动测试排班冲突和覆盖流程。 [x]
- **依赖**: Task 6

## Task 8: 集成测试 (E2E)
- **内容**:
  1. 创建 1/1 跨天夜班 (22:00-10:00)。
  2. 创建 1/2 早班 (09:00-18:00)。
  3. 预期：不报错，两条记录并存。
  4. 验证 API 返回数据正确。
- **验证**: 手动或脚本执行完整流程。 [x]
- **依赖**: Task 7
