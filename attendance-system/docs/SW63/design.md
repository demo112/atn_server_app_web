# Design: 时间段设置 (SW63)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 时间段管理 | API: GET/POST/PUT/DELETE /attendance/time-periods |
| Story 2: 考勤规则配置 | 字段: `rules` (JSON), DTO校验规则 |
| Story 3: 时间段列表 | Web: Table组件, 调用 GET API |
| Story 4: 时间段表单 | Web: Form组件, 调用 POST/PUT API |

## 数据模型

```prisma
model AttTimePeriod {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  type        Int      @default(0) @db.TinyInt // 0:固定班制, 1:弹性班制
  
  // 工作时间
  startTime   String   @map("start_time") @db.Char(5) // HH:mm
  endTime     String   @map("end_time") @db.Char(5)   // HH:mm
  
  // 休息时间
  restStartTime String? @map("rest_start_time") @db.Char(5)
  restEndTime   String? @map("rest_end_time") @db.Char(5)
  
  // 规则配置 (JSON)
  // { 
  //   lateMinutes: number,       // 允许迟到分钟数
  //   earlyMinutes: number,      // 允许早退分钟数
  //   seriousLateMinutes: number,// 严重迟到分钟数
  //   absentMinutes: number      // 缺勤分钟数
  //   workHours: number          // 弹性班制每日工时
  // }
  rules       Json?
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 关联
  shifts      AttShiftPeriod[]

  @@map("att_time_periods")
}

// 关联表占位 (SW64)
model AttShiftPeriod {
  id           Int @id @default(autoincrement())
  shiftId      Int @map("shift_id")
  periodId     Int @map("period_id")
  period       AttTimePeriod @relation(fields: [periodId], references: [id])
  
  @@map("att_shift_periods")
}
```

## API定义

### 1. 创建时间段
**POST /api/v1/attendance/time-periods**

**Request (CreateTimePeriodDto):**
```typescript
interface CreateTimePeriodDto {
  name: string;          // 必填，唯一
  type: number;          // 0:固定, 1:弹性
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  restStartTime?: string;// HH:mm
  restEndTime?: string;  // HH:mm
  rules: {
    lateMinutes?: number;
    earlyMinutes?: number;
    seriousLateMinutes?: number;
    absentMinutes?: number;
    workHours?: number;  // 弹性班制必填
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: { id: 1, ... }
}
```

### 2. 更新时间段
**PUT /api/v1/attendance/time-periods/:id**

**Request (UpdateTimePeriodDto):**
同 CreateTimePeriodDto，字段可选。

### 3. 获取时间段列表
**GET /api/v1/attendance/time-periods**

**Query:**
- name?: string (模糊搜索)
- type?: number

**Response:**
```typescript
{
  success: true,
  data: [ { ... }, { ... } ]
}
```

### 4. 删除时间段
**DELETE /api/v1/attendance/time-periods/:id**

**Validation:**
- 检查是否被班次引用（AttShiftPeriod表），若引用则报错 ERR_PERIOD_IN_USE。

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/server/prisma/schema.prisma` | 修改 | 完善 AttTimePeriod 模型 |
| `packages/server/src/modules/attendance/attendance-period.dto.ts` | 新增 | DTO定义与校验 |
| `packages/server/src/modules/attendance/attendance-period.service.ts` | 新增 | 业务逻辑 (CRUD, 校验) |
| `packages/server/src/modules/attendance/attendance-period.controller.ts` | 新增 | API接口实现 |
| `packages/server/src/modules/attendance/attendance.routes.ts` | 修改 | 注册新路由 |
| `docs/api-contract.md` | 修改 | 同步API定义 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 数据库Schema | 新增表，无破坏性变更 | 低 |
| 路由配置 | 新增路由挂载 | 低 |

## 决策点

- **跨天处理**：采用 `startTime > endTime` 自动判定跨天，不在数据库增加额外字段。
  - *理由*：简化模型，符合通常习惯（如 22:00-06:00 显然跨天）。
- **规则存储**：使用 JSON 字段存储规则参数。
  - *理由*：规则可能随业务扩展（如增加打卡范围限制），JSON 更灵活，且查询时通常是一起查出来。

## 验证计划

- **单元测试**:
  - 验证 HH:mm 格式校验
  - 验证 JSON 规则结构
  - 验证删除时的引用检查
- **集成测试**:
  - 完整 CRUD 流程
