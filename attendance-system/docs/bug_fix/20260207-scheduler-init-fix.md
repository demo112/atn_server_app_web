# 考勤计算服务未就绪修复记录

## 问题描述
- **现象**：点击“考勤计算”按钮时，右上角弹出“考勤计算服务未就绪” (ERR_SERVICE_UNAVAILABLE) 的错误提示。
- **复现步骤**：
  1. 打开任意统计报表页面（如每日统计）。
  2. 点击“考勤计算”按钮。
  3. 观察报错信息。
- **影响范围**：整个考勤重算功能不可用。

## 设计锚定
- **所属规格**：SW70 (考勤汇总)
- **原设计意图**：
  - 考勤计算由 `AttendanceScheduler` 负责调度。
  - `AttendanceScheduler` 依赖 Redis (`BullMQ`)，如果 Redis 不可用，应降级到 In-Memory 模式。
  - 应用启动时应初始化 Scheduler。
- **当前偏离**：
  - `AttendanceScheduler` 未在应用启动时初始化，导致其内部状态（Redis连接或Fallback模式）未就绪。

## 根因分析
- **直接原因**：`AttendanceScheduler` 实例的 `triggerCalculation` 方法抛出 `ERR_SERVICE_UNAVAILABLE`。
- **根本原因**：`packages/server/src/app.ts` 中 `attendanceScheduler.init()` 方法调用被注释掉，导致调度器从未初始化。
- **相关代码**：`packages/server/src/app.ts`

## 修复方案
- **修复思路**：在应用启动流程 (`app.ts`) 中恢复 `attendanceScheduler.init()` 的调用。
- **改动文件**：
  - `packages/server/src/app.ts`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| 无 | | |

## 验证结果
- [x] 原问题已解决：通过脚本验证 `init()` 被调用后，`triggerCalculation` 不再抛出“服务未就绪”错误。
- [x] 回归测试通过：相关单元测试通过，Server 构建通过。
- [x] 设计一致性确认：符合设计意图（服务必须初始化）。

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 防回退标记
**关键词**：attendanceScheduler.init(), ERR_SERVICE_UNAVAILABLE
**设计决策**：必须在应用启动时初始化调度器，即使 Redis 连接失败也会自动降级到内存模式。

## 提交信息
fix(server): 修复考勤计算服务未初始化导致无法使用的问题
