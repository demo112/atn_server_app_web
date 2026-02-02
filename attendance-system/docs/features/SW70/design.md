
# 设计文档：SW70 考勤汇总

## 架构设计

本模块采用 **定时预计算 + 实时查询** 的混合架构：

1.  **定时计算 (Scheduler)**:
    - 引入任务调度器 (基于 BullMQ)，每天根据配置时间（默认 05:00）触发。
    - 调度器调用考勤计算服务，为所有在职员工生成/更新前一天的 `AttDailyRecord`。
    - **为什么**: 考勤计算涉及打卡记录、班次、请假等多源数据，实时计算开销大；且用户习惯查看 T-1 的日结数据。

2.  **汇总查询 (Aggregator)**:
    - 汇总接口直接基于 `AttDailyRecord` 表进行 SQL 聚合查询 (`SUM`, `COUNT`)。
    - 由于 `AttDailyRecord` 已经是日结数据，聚合查询非常高效（即使 10万条记录也能在毫秒级完成）。

## 接口设计

### GET /api/v1/statistics/summary

获取考勤汇总数据。

**请求参数 (Query)**
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- deptId?: number (部门ID，支持递归查询子部门)
- employeeId?: number (特定员工)

**响应数据**
```typescript
interface AttendanceSummaryVo {
  employeeId: number;
  employeeNo: string;
  name: string;
  deptName: string;
  shouldAttendanceDays: number; // 应出勤天数
  actualAttendanceDays: number; // 实际出勤天数
  lateTimes: number;            // 迟到次数
  lateMinutes: number;          // 迟到时长
  earlyLeaveTimes: number;      // 早退次数
  earlyLeaveMinutes: number;    // 早退时长
  absentDays: number;           // 缺勤天数
  leaveMinutes: number;         // 请假时长
}
```

### POST /api/v1/statistics/calculate (Internal/Admin)

手动触发指定日期范围的考勤重算（用于补数据或测试）。

**请求参数 (Body)**
```typescript
interface TriggerCalculationDto {
  startDate: string;
  endDate: string;
  employeeIds?: number[]; // 不传则计算所有
}
```

## 数据模型

### 核心依赖表
- `AttDailyRecord` (SW69): 每日考勤结果，统计的基础。
- `AttSetting` (SW62): 存储 `auto_calc_time` 配置。

### 汇总计算逻辑 (SQL伪代码)

```sql
SELECT 
  employee_id,
  COUNT(CASE WHEN status != 'rest' THEN 1 END) as should_days,
  COUNT(CASE WHEN status = 'normal' OR status = 'late' OR status = 'early_leave' THEN 1 END) as actual_days,
  SUM(CASE WHEN late_minutes > 0 THEN 1 ELSE 0 END) as late_times,
  SUM(late_minutes) as late_minutes,
  -- ... 其他字段聚合
FROM att_daily_records
WHERE work_date BETWEEN :start AND :end
GROUP BY employee_id
```

## 任务调度设计

使用 `BullMQ` 实现定时任务。

**Queue Name**: `attendance-calculation`

**Job Types**:
1.  `daily-calculation`:
    - **Trigger**: Cron 表达式 (基于 `auto_calc_time` 动态生成，如 `0 5 * * *`)
    - **Action**:
        1. 获取所有状态为 `active` 的 Employee。
        2. 为每个 Employee 创建子任务或批量处理。
        3. 调用 `AttendanceCalculator.calculateDaily(employeeId, date)`。

## 依赖模块变更

### SW62 (考勤配置)
- `AttSetting` 需新增 Key: `auto_calc_time` (Value: "05:00")。
- 需要提供 `getAutoCalcTime()` 方法供 Scheduler 使用。

## 文件变更清单

| 模块 | 文件 | 操作 | 内容 |
|------|------|------|------|
| Server | `src/modules/statistics/statistics.service.ts` | 修改 | 实现聚合查询 |
| Server | `src/modules/statistics/statistics.controller.ts` | 修改 | 适配新接口 |
| Server | `src/modules/attendance/attendance-scheduler.ts` | **新增** | 定时任务逻辑 |
| Server | `src/modules/attendance/attendance-calculator.ts` | 引用 | 核心计算逻辑 (Naruto负责，若无则需Mock) |
| Web | `src/pages/statistics/SummaryPage.tsx` | 修改 | 适配新API |
