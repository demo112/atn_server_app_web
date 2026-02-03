# Design: 考勤明细 (SW71)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 管理员查询 (Web) | API: GET /api/v1/statistics/details, 组件: AttendanceDetailsTable |
| Story 2: 员工查询 (Web) | API: GET /api/v1/statistics/details (复用，后端过滤), 组件: AttendanceDetailsTable |
| Story 3: 员工日历 (App) | API: GET /api/v1/statistics/calendar (新接口), 组件: AttendanceCalendar |
| Story 5: 管理员查询 (App) | API: GET /api/v1/statistics/details (复用), 组件: AttendanceRecordCard |
| Story 4: 手动重算 | API: POST /api/v1/statistics/calculate (已存在), 组件: RecalculateButton |

## 数据模型

复用现有 `AttDailyRecord` 模型，无需新增表结构。

```prisma
// 仅做查询，不修改Schema
model AttDailyRecord {
  // ... 现有字段
  id                BigInt           @id @default(autoincrement())
  employeeId        Int              @map("employee_id")
  workDate          DateTime         @map("work_date") @db.Date
  status            AttendanceStatus @default(normal)
  // ...
}
```

## API定义

### GET /api/v1/statistics/details

查询每日考勤明细列表。

**Request:**
```typescript
interface GetDailyRecordDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deptId?: number;   // 部门ID
  employeeId?: number; // 员工ID (员工自查时必填为自己)
  employeeName?: string; // 模糊搜索
  status?: AttendanceStatus; // 状态筛选
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
  employeeNo: string;
  deptName: string;
  workDate: string;
  shiftName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  absentMinutes: number;
  leaveMinutes: number;
}

type Response = PaginatedResponse<DailyRecordVo>;
```

### GET /api/v1/statistics/calendar

查询指定月份的简要考勤状态（用于App日历）。

**Request:**
```typescript
interface GetCalendarDto {
  year: number;
  month: number;
  employeeId: number; // 查谁的日历
}
```

**Response:**
```typescript
interface CalendarDailyVo {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  isAbnormal: boolean; // 是否异常（用于标红点）
}
```

### POST /api/v1/statistics/calculate (SW70已存在)

复用现有接口，支持手动重算。

**Request:**
```typescript
interface TriggerCalculationDto {
  startDate: string;
  endDate: string;
  employeeIds: number[]; // 支持批量
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/shared/src/types/attendance/record.ts` | 修改 | 新增明细查询相关 Type 定义 |
| `packages/server/src/modules/statistics/statistics.service.ts` | 修改 | 实现 getDailyRecords, getCalendar 方法 |
| `packages/server/src/modules/statistics/statistics.controller.ts` | 修改 | 新增 controller 方法与权限控制 |
| `packages/server/src/modules/statistics/statistics.routes.ts` | 修改 | 注册 /details, /calendar 路由 |
| `packages/web/src/pages/attendance/DailyRecords.tsx` | 新增 | Web 端考勤明细页面 |
| `packages/app/src/screens/attendance/AttendanceCalendar.tsx` | 新增 | App 端考勤日历组件 |
| `packages/app/src/screens/attendance/AttendanceRecords.tsx` | 新增 | App 端考勤明细列表组件 |
| `packages/app/src/App.tsx` | 修改 | 注册 AttendanceCalendar 和 AttendanceRecords 路由 |
| `packages/app/src/screens/HomeScreen.tsx` | 修改 | 新增管理员考勤明细入口 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 统计服务 | 增加明细查询逻辑 | 低 |
| 移动端路由 | 需要增加新页面路由 | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| ID处理 | BigInt 转 String | 前端不支持 BigInt，传输时必须序列化为字符串 |
| 权限控制 | 后端统一处理 | Controller层判断角色，非管理员强制覆盖 employeeId 为当前用户 |
| 分页策略 | 数据库分页 | 明细数据量大，必须在数据库层分页 |

## 需要人决策

- [ ] 无 (设计符合常规模式)
