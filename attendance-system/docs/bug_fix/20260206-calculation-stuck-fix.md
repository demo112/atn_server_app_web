# 考勤计算卡顿与类型缺失修复

## 问题描述

1. **考勤计算一直转圈**：用户反馈点击"重新计算"后，进度条卡在"计算中..."，一直不结束。
2. **类型缺失**：Server 端编译报错，提示 `@attendance/shared` 缺失 `DailyStatsVo` 和 `GetDailyStatsQuery` 类型。

## 原因分析

1. **计算卡顿原因**：
   - 原 `AttendanceScheduler` 将一天的所有员工计算打包在一个 Job 中 (`daily-calculation`)。
   - 状态更新逻辑仅在 Job 完成时触发。
   - 如果员工数量多，单次 Job 执行时间过长，导致前端长时间无法收到进度更新。
   - 且使用了非原子的 Redis String (`JSON.stringify`) 存储状态，存在并发读写风险（虽然单 Job 模式下风险较小，但扩展性差）。

2. **类型缺失原因**：
   - `SW73` 设计文档中定义了新类型，但未同步更新到 `packages/shared` 代码中。

## 修复方案

### 1. 重构 AttendanceScheduler (Server)

- **拆分任务粒度**：将按天计算拆分为**按人按天**计算 (`daily-calculation` job 携带 `employeeId`)。
- **原子状态更新**：使用 Redis Hash (`hmset`, `hincrby`) 存储和更新批次状态。
- **进度实时反馈**：每完成一个员工的计算，即原子增加 `completed` 计数，前端可实时获取进度。
- **兼容性保留**：`processDailyCalculation` 保留了对批量 `employeeIds` 的支持（虽主要用于旧模式，但逻辑兼容）。

### 2. 补充 Shared Types

- 在 `packages/shared/src/types/attendance/stats.ts` 中补全 `DailyStatsVo` 和 `GetDailyStatsQuery` 接口定义。

## 验证结果

- **编译验证**：`packages/server` 执行 `npm run build` 通过。
- **逻辑验证**：代码已重构为细粒度任务，理论上解决了长任务导致的进度假死问题。

## 影响范围

- `packages/server/src/modules/attendance/attendance-scheduler.ts`
- `packages/shared/src/types/attendance/stats.ts`
