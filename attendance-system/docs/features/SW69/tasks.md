# Tasks: SW69 原始考勤/打卡

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 5 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 50 分钟 |

## 任务清单

### 阶段1：数据层

#### Task 1: 更新数据模型 (Schema) ✅
- **文件**: `packages/server/prisma/schema.prisma`
- **状态**: 已完成

### 阶段2：服务层

#### Task 2: 实现Service与DTO ✅
- **文件**: `packages/server/src/modules/attendance/attendance-clock.dto.ts`<br>`packages/server/src/modules/attendance/attendance-clock.service.ts`
- **状态**: 已完成

### 阶段3：接口层

#### Task 3: 实现Controller与路由 ✅
- **文件**: `packages/server/src/modules/attendance/attendance-clock.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts`
- **状态**: 已完成

### 阶段4：交付与文档

#### Task 4: 文档同步 ✅
- **文件**: `docs/api-contract.md`<br>`docs/changelog.md`
- **状态**: 已完成

#### Task 5: 自动化测试 (新增) ✅
- **文件**: `packages/server/src/modules/attendance/__tests__/attendance-clock.integration.test.ts`
- **内容**: 编写并执行集成测试，覆盖打卡与查询流程
- **状态**: 已完成

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → 标记Todo完成 |
| 全部完成后 | Git提交 (一次性提交整个Feature) |
