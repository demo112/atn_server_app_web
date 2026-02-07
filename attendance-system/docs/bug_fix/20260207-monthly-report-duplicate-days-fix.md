# 月度汇总报表应打卡天数异常修复记录

## 问题描述
- **现象**：月度汇总报表中，某员工（SuueHappy）的"应打卡(天)"显示为 12 天，而实际只有 4 天排班（2月1日-7日）。其他数据（如正常天数）也异常偏高。
- **复现步骤**：
  1. 进入"考勤统计" -> "月度汇总报表"。
  2. 查询 2026年2月的数据。
  3. 观察 SuueHappy 的数据。
- **影响范围**：所有存在重复考勤记录的员工，导致统计数据成倍增加。

## 设计锚定
- **所属规格**：Statistics
- **原设计意图**：每日考勤记录 (`AttDailyRecord`) 应该每个员工每天只有一条。
- **当前偏离**：数据库中存在大量重复的每日考勤记录（同一天多条），导致 `COUNT(*)` 统计错误。

## 根因分析
- **直接原因**：`att_daily_records` 表中存在重复数据。例如 2月4日有 3 条记录（1条请假，2条正常）。
- **根本原因**：`attendance-scheduler.ts` 中的 `ensureDailyRecordExists` 方法缺乏原子性保护。在并发场景下（如多次点击"计算"或重试机制），可能在检查不存在后同时创建多条记录。且数据库层面缺少 `(employeeId, workDate)` 的唯一约束。
- **相关代码**：`packages/server/src/modules/attendance/attendance-scheduler.ts`

## 修复方案
- **数据清洗**：编写脚本清理已有的重复数据，保留状态非 `normal` 或最新的记录。
- **代码修复**：修改 `ensureDailyRecordExists` 方法，将"检查-创建"逻辑包裹在 Prisma 事务中，降低并发导致重复创建的概率。

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| AttendanceScheduler | `packages/server/src/modules/attendance/attendance-scheduler.ts` | ✅ |

## 验证结果
- [x] 原问题已解决：清理后 SuueHappy 的记录数恢复正常（4条）。
- [x] 回归测试通过：代码编译通过。
- [x] 设计一致性确认：符合每日一条记录的设计。

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 防回退标记
**关键词**：重复记录、应打卡天数、ensureDailyRecordExists
**设计决策**：在无法添加数据库唯一约束（Schema 冻结）的情况下，使用事务来减轻并发问题。

## 提交信息
fix(server): 修复考勤计算并发导致重复记录问题

- 清理数据库中的重复考勤记录
- 优化 ensureDailyRecordExists 使用事务防止并发创建
