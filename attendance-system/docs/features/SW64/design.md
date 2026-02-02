# Design: 班次管理 (SW64)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 创建班次 | API: `POST /api/v1/attendance/shifts` |
| Story 2: 班次列表 | API: `GET /api/v1/attendance/shifts` |
| Story 3: 班次详情 | API: `GET /api/v1/attendance/shifts/:id` |
| Story 4: 更新班次 | API: `PUT /api/v1/attendance/shifts/:id` |
| Story 5: 删除班次 | API: `DELETE /api/v1/attendance/shifts/:id` |

## 数据模型

复用已有的 `AttShift` 和 `AttShiftPeriod` 模型 (无需修改 Schema)。

```prisma
/// 班次表
model AttShift {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  cycleDays Int      @default(7) @map("cycle_days")
  
  periods   AttShiftPeriod[]
  // ...
}

/// 班次时间段关联表
model AttShiftPeriod {
  id         Int @id @default(autoincrement())
  shiftId    Int @map("shift_id")
  periodId   Int @map("period_id")
  dayOfCycle Int @map("day_of_cycle") // 1-7
  sortOrder  Int @default(0) @map("sort_order")
  // ...
}
```

## API定义

### 1. 创建班次

**POST** `/api/v1/attendance/shifts`

**Request:**
```typescript
interface CreateShiftDto {
  name: string;
  cycleDays?: number; // default 7
  days: {
    dayOfCycle: number; // 1-7
    periodIds: number[]; // 按顺序排列的时间段ID
  }[];
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    name: "标准早班",
    cycleDays: 7,
    periods: [ ... ]
  }
}
```

### 2. 获取班次列表

**GET** `/api/v1/attendance/shifts`

**Query:**
- `name`: string (optional, search)

**Response:**
```typescript
{
  success: true,
  data: [
    { id: 1, name: "标准早班", cycleDays: 7 }
  ]
}
```

### 3. 获取班次详情

**GET** `/api/v1/attendance/shifts/:id`

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    name: "标准早班",
    cycleDays: 7,
    days: [ // 聚合后的结构，方便前端展示
      { dayOfCycle: 1, periods: [ { id: 1, name: "09:00-18:00", ... } ] },
      // ...
    ]
  }
}
```

### 4. 更新班次

**PUT** `/api/v1/attendance/shifts/:id`

**Request:**
```typescript
interface UpdateShiftDto {
  name?: string;
  days?: {
    dayOfCycle: number;
    periodIds: number[];
  }[];
}
```

### 5. 删除班次

**DELETE** `/api/v1/attendance/shifts/:id`

- 检查是否被排班 (`AttSchedule`) 引用，若引用则禁止删除。

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/server/src/modules/attendance/attendance-shift.dto.ts` | 新增 | DTO 定义 |
| `packages/server/src/modules/attendance/attendance-shift.service.ts` | 新增 | 班次 CRUD 逻辑 |
| `packages/server/src/modules/attendance/attendance-shift.controller.ts` | 新增 | 班次 API 控制器 |
| `packages/server/src/modules/attendance/attendance.routes.ts` | 修改 | 注册 `/shifts` 路由 |
| `packages/web/src/pages/attendance/shift/ShiftPage.tsx` | 新增 | Web端班次管理页 |
| `packages/web/src/services/shift.ts` | 新增 | Web端班次服务 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 数据库Schema | 无 (使用已有表) | 低 |
| 现有API | 无 | 低 |

## 需要人决策

- 无
