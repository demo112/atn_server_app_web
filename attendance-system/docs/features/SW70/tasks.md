# Tasks: SW70 考勤汇总

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | statistics, attendance |
| 涉及端 | Server, Web |
| 预计总时间 | 90 分钟 |

## 任务清单

### 阶段1：后端核心 (重构与新增)

#### Task 1: 升级考勤配置 (SW62依赖)
- **状态**: ✅ 已完成
- **文件**: 
  - `packages/server/src/modules/attendance/attendance-settings.service.ts`
  - `packages/server/src/modules/attendance/attendance-settings.dto.ts`
- **内容**: 
  - 增加 `auto_calc_time` 配置项支持
  - 更新默认初始化逻辑
- **验证**: `npm run test`
- **依赖**: 无

#### Task 2: 实现定时调度器 (Scheduler)
- **状态**: ✅ 已完成
- **文件**: 
  - `packages/server/src/modules/attendance/attendance-scheduler.ts`
  - `packages/server/src/app.ts` (初始化调度器)
- **内容**: 
  - 集成 `BullMQ`
  - 实现 `daily-calculation` 任务定义
  - 在应用启动时根据配置注册 Cron Job
- **验证**: 启动服务，手动触发 Job 验证日志
- **依赖**: Task 1

#### Task 3: 重构统计服务 (Statistics Service)
- **状态**: ✅ 已完成
- **文件**: 
  - `packages/server/src/modules/statistics/statistics.service.ts`
- **内容**: 
  - 修改 `getDepartmentSummary` 方法
  - 改为直接聚合 `AttDailyRecord` 表（不再实时合并 Leave 表，假设 DailyRecord 已包含）
  - 使用 Prisma `groupBy` 或 Raw Query 优化性能
- **验证**: `npm run test -- statistics.service`
- **依赖**: Task 2

#### Task 4: 更新统计接口
- **状态**: ✅ 已完成
- **文件**: 
  - `packages/server/src/modules/statistics/statistics.controller.ts`
  - `packages/server/src/modules/statistics/statistics.routes.ts`
- **内容**: 
  - 适配 Service 变更
  - 新增 `POST /calculate` 手动触发接口 (Admin only)
- **验证**: Postman 测试接口
- **依赖**: Task 3

### 阶段2：前端页面

#### Task 5: 实现考勤汇总页面
- **状态**: ✅ 已完成
- **文件**: 
  - `packages/web/src/pages/statistics/SummaryPage.tsx`
  - `packages/web/src/pages/statistics/components/SummaryTable.tsx`
- **内容**: 
  - 实现查询表单（日期范围、部门选择）
  - 实现数据表格展示
  - 实现导出 Excel 功能
- **验证**: 启动 Web 端，访问页面查看展示和导出功能
- **依赖**: Task 4

#### Task 6: 考勤规则配置页更新 (SW62补充)
- **状态**: ✅ 已完成
- **文件**: `packages/web/src/pages/attendance/settings/AttendanceSettingsPage.tsx` (若存在)
- **内容**: 增加“自动计算时间”设置项
- **验证**: 能保存并回显时间配置
- **依赖**: Task 1

## 检查点策略

| 时机 | 操作 |
|------|------|
| Task 2 完成后 | 验证 Cron Job 能正确注册和触发 |
| Task 3 完成后 | 验证聚合查询的性能和准确性 |
| 全部完成后 | 完整验证：修改配置 -> 触发计算 -> 查看汇总 |
