# Design: SW66 补签处理

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 查看异常考勤记录 | API: GET /attendance/corrections/daily-records<br>Web: CorrectionTable 组件 |
| Story 2: 补签到 | API: POST /attendance/corrections/check-in<br>Server: AttendanceCorrectionService.checkIn<br>Web: CheckInDialog 组件 |
| Story 3: 补签退 | API: POST /attendance/corrections/check-out<br>Server: AttendanceCorrectionService.checkOut<br>Web: CheckOutDialog 组件 |

## 数据模型

复用现有模型 `AttDailyRecord` 和 `AttCorrection`。无需修改 Schema。

```prisma
// 引用自 schema.prisma

model AttDailyRecord {
  id                BigInt           @id @default(autoincrement())
  employeeId        Int              @map("employee_id")
  workDate          DateTime         @map("work_date") @db.Date
  checkInTime       DateTime?        @map("check_in_time")
  checkOutTime      DateTime?        @map("check_out_time")
  status            AttendanceStatus @default(normal)
  // ... 其他统计字段
  corrections       AttCorrection[]
}

model AttCorrection {
  id             Int            @id @default(autoincrement())
  employeeId     Int            @map("employee_id")
  dailyRecordId  BigInt         @map("daily_record_id")
  type           CorrectionType // check_in, check_out
  correctionTime DateTime       @map("correction_time")
  operatorId     Int            @map("operator_id")
  remark         String?        @db.VarChar(200)
  createdAt      DateTime       @default(now()) @map("created_at")
}
```

## API定义

### GET /api/v1/attendance/corrections/daily-records

查询存在异常（迟到、早退、缺勤）的每日考勤记录。

**Request:**
```typescript
interface QueryDailyRecordsDto {
  deptId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
interface DailyRecordVo {
  id: string; // BigInt -> String
  employeeId: number;
  employeeName: string;
  deptName: string;
  workDate: string;
  shiftName?: string;
  startTime?: string; // 班次开始时间
  endTime?: string;   // 班次结束时间
  checkInTime?: string;
  checkOutTime?: string;
  status: 'late' | 'early_leave' | 'absent';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  absentMinutes?: number;
}
```

### POST /api/v1/attendance/corrections/check-in

补签到。

**Request:**
```typescript
interface SupplementCheckInDto {
  dailyRecordId: string; // BigInt -> String
  checkInTime: string;   // ISO String
  remark?: string;
}
```

**Response:**
```typescript
interface SupplementResultVo {
  success: boolean;
  dailyRecord: DailyRecordVo; // 返回更新后的记录
}
```

### POST /api/v1/attendance/corrections/check-out

补签退。

**Request:**
```typescript
interface SupplementCheckOutDto {
  dailyRecordId: string; // BigInt -> String
  checkOutTime: string;  // ISO String
  remark?: string;
}
```

## 核心服务设计 (AttendanceCalculator)

由于系统当前缺乏考勤计算逻辑，将在 `packages/server/src/modules/attendance/domain` 下新建核心领域服务。

### AttendanceCalculator

负责根据班次规则和打卡时间计算考勤状态。

```typescript
export class AttendanceCalculator {
  /**
   * 计算单日考勤状态
   * @param record 每日记录（包含打卡时间）
   * @param shift 班次信息（包含时间段规则）
   * @returns 计算后的状态和统计数据（迟到/早退分钟数等）
   */
  calculate(record: AttDailyRecord, shift: AttShift): CalculationResult;
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/shared/src/types/attendance/correction.ts` | 新增 | DTO 和 VO 类型定义 |
| `packages/server/src/modules/attendance/domain/attendance-calculator.ts` | 新增 | **核心计算逻辑** |
| `packages/server/src/modules/attendance/correction/attendance-correction.service.ts` | 新增 | 补签业务逻辑（事务处理） |
| `packages/server/src/modules/attendance/correction/attendance-correction.controller.ts` | 新增 | API 接口实现 |
| `packages/server/src/modules/attendance/attendance.routes.ts` | 修改 | 注册路由 |
| `packages/web/src/pages/attendance/correction/CorrectionPage.tsx` | 新增 | 异常处理页面 |
| `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx` | 新增 | 补签到弹窗 |
| `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx` | 新增 | 补签退弹窗 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 每日考勤记录 | 补签会直接修改每日记录的状态 | 中 |
| 统计报表 | 补签后的数据会实时反映在报表中（如果报表基于 DailyRecord） | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态重算 | **同步重算** | 补签是管理员交互操作，立即反馈结果体验更好。且单条计算开销小。 |
| 计算逻辑位置 | **Domain Service** | 将计算逻辑从 Service 层剥离到 Domain 层 (`attendance-calculator.ts`)，便于复用和测试。 |
| 事务管理 | **Prisma Interactive Transactions** | 保证更新记录和插入日志的原子性。 |

## 需要人决策

- [ ] 无。已确认必须在本次实现考勤计算逻辑。
