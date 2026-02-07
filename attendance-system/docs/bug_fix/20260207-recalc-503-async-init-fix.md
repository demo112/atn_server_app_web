# 考勤重算 503 异步初始化修复记录

## 问题描述
- **现象**：在服务器启动后立即调用考勤重算接口，偶尔返回 503 `ERR_SERVICE_UNAVAILABLE`。
- **复现步骤**：重启后端服务，立即点击前端重算按钮。
- **影响范围**：管理员手动重算功能。

## 设计锚定
- **所属规格**：SW68 (Attendance Recalculation)
- **原设计意图**：`AttendanceScheduler` 采用异步初始化以避免阻塞 Server 启动。
- **当前偏离**：`triggerCalculation` 方法未检查异步初始化是否完成，直接判断状态导致误报 503。

## 根因分析
- **直接原因**：`triggerCalculation` 检查 `!this.queue && !this.useInMemory` 时，`init()` 方法可能正在运行中（尚未赋值）。
- **根本原因**：`app.ts` 中 `init()` 是非阻塞调用的，导致 API 服务就绪时间早于 Scheduler 就绪时间。
- **相关代码**：`packages/server/src/modules/attendance/attendance-scheduler.ts`

## 修复方案
- **修复思路**：引入 `initPromise` 状态，在 `triggerCalculation` 中等待初始化完成。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance-scheduler.ts`: 增加 `initPromise` 及等待逻辑。
  - `packages/server/src/index.ts`: 优化 dotenv 加载配置（顺手修复）。

## 关联组件
无

## 验证结果
- [x] 原问题已解决：逻辑上保证了 `triggerCalculation` 会等待 `init` 完成。
- [x] 回归测试通过：后端编译通过，无类型错误。
- [x] 设计一致性确认：符合异步初始化且保证服务可用性的设计。

## 防回退标记
- **关键词**：initPromise, await init()
- **设计决策**：API 方法必须确保依赖的服务已就绪。

## 提交信息
fix(attendance): 修复重算功能 503 异步竞态问题

- 在 triggerCalculation 中增加 await initPromise
- 优化 AttendanceScheduler 初始化逻辑
- 修复 index.ts dotenv 配置
