# Tasks: SW69 原始考勤/打卡

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 40 分钟 |

## 任务清单

### 阶段1：数据层

#### Task 1: 更新数据模型 (Schema)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma` |
| 操作 | 修改 |
| 内容 | 更新 `AttClockRecord` 模型，添加 `ClockType` 和 `ClockSource` 枚举 |
| 验证 | `npx prisma validate` |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：服务层

#### Task 2: 实现Service与DTO

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-clock.dto.ts`<br>`packages/server/src/modules/attendance/attendance-clock.service.ts` |
| 操作 | 新增 |
| 内容 | 定义DTO，实现打卡写入与查询逻辑，处理BigInt序列化 |
| 验证 | `npm run type-check` |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

### 阶段3：接口层

#### Task 3: 实现Controller与路由

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-clock.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | 实现API接口，注册路由，处理错误响应 |
| 验证 | `npm run type-check` |
| 预计 | 10 分钟 |
| 依赖 | Task 2 |

### 阶段4：交付与文档

#### Task 4: 集成验证与文档同步

| 属性 | 值 |
|------|-----|
| 文件 | `docs/api-contract.md`<br>`docs/changelog.md` |
| 操作 | 修改 |
| 内容 | 更新API契约文档，记录变更日志，执行简单集成验证 |
| 验证 | `git status` 确认文件变更 |
| 预计 | 10 分钟 |
| 依赖 | Task 3 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → 标记Todo完成 |
| 全部完成后 | Git提交 (一次性提交整个Feature) |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 2 | BigInt在JSON中序列化失败 | 在DTO转换或全局拦截器中将BigInt转为String |
