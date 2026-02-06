# 补签退卡死问题修复记录

## 问题描述
- **现象**：用户反馈在进行补签退操作时，系统卡死。
- **影响范围**：考勤补签功能（补签到、补签退）。

## 根因分析
1. **外键约束违反风险**：原代码在创建补签记录（AttCorrection）时，先将 `employeeId` 设为 `0`，试图稍后修正。这违反了数据库的外键约束（`AttCorrection.employeeId` -> `Employee.id`），可能导致数据库事务异常或死锁等待。
2. **潜在的死循环**：`AttendanceCalculator` 中的请假区间合并逻辑缺乏循环次数限制，如果数据异常（如大量重叠区间），可能导致无限循环，表现为 CPU 飙升或进程卡死。
3. **数据一致性问题**：重算考勤时，获取补签记录未排序，可能取到旧的补签记录，导致计算结果不正确。

## 修复方案
1. **调整事务逻辑**：
   - 在 `checkIn` 和 `checkOut` 方法中，改为**先查询 DailyRecord 获取 employeeId**，再创建 Correction 记录。
   - 确保 `employeeId` 始终有效，避免违反外键约束。
   - 移除了后续“修正 employeeId”的冗余更新操作，减少数据库交互。

2. **增加循环保护**：
   - 在 `AttendanceCalculator` 的区间合并逻辑中增加了 `1000` 次循环上限检查，防止死循环。

3. **优化数据获取**：
   - 在 `recalculateDailyRecord` 中查询 `AttCorrection` 时添加 `orderBy: { createdAt: 'desc' }`，确保总是使用最新的补签记录。

4. **增强可观测性**：
   - 在关键路径（checkOut、recalculateDailyRecord、calculate）添加了详细的诊断日志。

## 验证结果
- [x] **编译通过**：`npm run build` 成功。
- [x] **逻辑自洽**：修复了明显的逻辑漏洞（外键引用 0）。
- [x] **安全兜底**：增加了死循环保护机制。

## 改动文件
- `packages/server/src/modules/attendance/attendance-correction.service.ts`
- `packages/server/src/modules/attendance/domain/attendance-calculator.ts`
