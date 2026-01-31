# Design: 时间段设置 (SW63)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 管理普通时间段 | API: POST/PUT /api/v1/attendance/time-periods, Service: create/update |
| Story 2: 管理弹性时间段 | API: POST/PUT /api/v1/attendance/time-periods, Service: create/update |
| Story 3: 时间段列表管理 | API: GET /api/v1/attendance/time-periods, DELETE /api/v1/attendance/time-periods/:id |

## 数据模型

修改 `AttTimePeriod` 表，将 `startTime` 和 `endTime` 改为可选，以支持弹性班制。

```prisma
model AttTimePeriod {
  id   Int    @id @default(autoincrement())
  name String @db.VarChar(100)
  type Int    @default(0) @db.TinyInt // 0:固定班制, 1:弹性班制

  // 工作时间 (弹性班制可能为空)
  startTime String? @map("start_time") @db.Char(5) // HH:mm
  endTime   String? @map("end_time") @db.Char(5) // HH:mm

  // 休息时间
  restStartTime String? @map("rest_start_time") @db.Char(5)
  restEndTime   String? @map("rest_end_time") @db.Char(5)

  // 规则配置 (存储扩展规则)
  rules Json? 

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 关联
  shifts       AttShiftPeriod[]
  dailyRecords AttDailyRecord[]

  @@map("att_time_periods")
}
```

### Rules JSON 结构定义

```typescript
interface TimePeriodRules {
  // 普通班制规则
  checkInStart?: string    // 签到开始时间
  checkInEnd?: string      // 签到结束时间
  checkOutStart?: string   // 签退开始时间
  checkOutEnd?: string     // 签退结束时间
  isCheckInRequired?: boolean
  isCheckOutRequired?: boolean
  
  // 弹性班制规则
  workDuration?: number    // 每日工作时长(分钟)
  calculationMode?: 'first_last' | 'accumulated' // 计算方式
  minInterval?: number     // 有效打卡间隔(分钟)
  daySwitchTime?: string   // 跨天切换点(HH:mm)
  
  // 异常规则
  lateRule?: { 
    allowMinutes: number   // 允许迟到分钟数
  }
  earlyLeaveRule?: { 
    allowMinutes: number   // 允许早退分钟数
  }
}
```

## API定义

### POST /api/v1/attendance/time-periods

创建时间段。

**Request:**
```typescript
interface CreateTimePeriodDto {
  name: string
  type: number // 0 | 1
  startTime?: string
  endTime?: string
  restStartTime?: string
  restEndTime?: string
  rules?: TimePeriodRules
}
```

**Response:**
```typescript
interface TimePeriodVo {
  id: number
  name: string
  type: number
  startTime: string | null
  endTime: string | null
  // ...其他字段
}
```

### PUT /api/v1/attendance/time-periods/:id

更新时间段。

### GET /api/v1/attendance/time-periods

查询时间段列表。支持按名称搜索。

**Query:**
```typescript
interface TimePeriodQuery {
  name?: string
  page?: number
  pageSize?: number
}
```

### DELETE /api/v1/attendance/time-periods/:id

删除时间段。

**Error:**
- `ERR_ATT_TIME_PERIOD_IN_USE`: 时间段被班次引用，无法删除

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/server/prisma/schema.prisma | 修改 | AttTimePeriod 字段改为可选 |
| packages/shared/src/types/attendance/time-period.ts | 新增 | DTO 和类型定义 |
| packages/shared/src/types/index.ts | 修改 | 导出新模块 |
| packages/server/src/modules/attendance/time-period/time-period.dto.ts | 新增 | DTO 验证类 |
| packages/server/src/modules/attendance/time-period/time-period.service.ts | 新增 | 业务逻辑 |
| packages/server/src/modules/attendance/time-period/time-period.controller.ts | 新增 | 控制器 |
| packages/server/src/modules/attendance/time-period/time-period.test.ts | 新增 | 单元测试 |
| packages/server/src/app.ts | 修改 | 注册路由 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 数据库Schema | 修改字段为可选 | 低 (需执行迁移) |
| 现有代码引用 | 需检查是否有代码直接使用 startTime/endTime 且假定非空 | 中 |

## 技术决策

1.  **JSON存储规则**：为了避免表字段过度膨胀，且规则可能随业务变化，采用 JSON 字段存储非检索类规则。
2.  **字段可选**：弹性班制可能没有固定的上下班时间，因此 `startTime`/`endTime` 改为可选。

## 需要人决策

- [ ] 确认 `startTime`/`endTime` 改为可选是否接受？(Prisma 生成的类型会变为 `string | null`)
