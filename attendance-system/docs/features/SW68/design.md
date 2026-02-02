# Design: SW68 补签记录

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 查看补签记录列表 | API: GET /attendance/corrections, Service: AttendanceCorrectionService.getCorrections |
| Story 2: 编辑补签记录 | API: PUT /attendance/corrections/:id, Service: AttendanceCorrectionService.updateCorrection |
| Story 3: 删除补签记录 | API: DELETE /attendance/corrections/:id, Service: AttendanceCorrectionService.deleteCorrection |

## 数据模型

```prisma
// 修改 AttCorrection 表，增加 updatedAt
model AttCorrection {
  id             Int            @id @default(autoincrement())
  employeeId     Int            @map("employee_id")
  dailyRecordId  BigInt         @map("daily_record_id")
  type           CorrectionType
  correctionTime DateTime       @map("correction_time")
  operatorId     Int            @map("operator_id")
  remark         String?        @db.VarChar(200)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @default(now()) @updatedAt @map("updated_at") // 新增

  employee    Employee       @relation(fields: [employeeId], references: [id])
  dailyRecord AttDailyRecord @relation(fields: [dailyRecordId], references: [id])
  operator    User           @relation("CorrectionOperator", fields: [operatorId], references: [id])

  @@map("att_corrections")
}
```

## 核心逻辑：考勤重算 (Recalculate)

所有涉及补签的增删改操作，统一调用重算逻辑：

1. **输入**: `dailyRecordId`
2. **获取数据**:
   - 查询 `AttDailyRecord` (含 `period`, `shift`)
   - 查询当日所有 `AttClockRecord`
   - 查询当日所有有效 `AttCorrection`
   - 查询当日所有有效 `AttLeave`
3. **确定打卡时间**:
   - **CheckIn**: 优先取 `Correction(type=check_in)` 的时间；若无，取最早的 `ClockRecord(type=sign_in)`。
   - **CheckOut**: 优先取 `Correction(type=check_out)` 的时间；若无，取最晚的 `ClockRecord(type=sign_out)`。
4. **计算状态**: 调用 `AttendanceCalculator`。
5. **更新存储**: 更新 `AttDailyRecord`。

## API定义

### GET /attendance/corrections

查询补签记录列表。

**Request:**
```typescript
interface QueryCorrectionsDto {
  deptId?: number
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
  page?: number
  pageSize?: number
}
```

**Response:**
```typescript
interface CorrectionVo {
  id: number
  employeeId: number
  employeeName: string
  deptName: string
  type: 'check_in' | 'check_out'
  correctionTime: string // ISO Date
  operatorName: string
  updatedAt: string // ISO Date (操作时间)
  remark?: string
}

interface CorrectionListVo {
  items: CorrectionVo[]
  total: number
}
```

### PUT /attendance/corrections/:id

编辑补签记录。

**Request:**
```typescript
interface UpdateCorrectionDto {
  correctionTime: string // ISO Date
  remark?: string
}
```

**Response:**
```typescript
interface UpdateCorrectionResult {
  success: true
}
```

### DELETE /attendance/corrections/:id

删除补签记录。

**Response:**
```typescript
interface DeleteCorrectionResult {
  success: true
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/server/prisma/schema.prisma | 修改 | `AttCorrection` 增加 `updatedAt` |
| packages/shared/src/types/attendance/correction.ts | 修改 | 增加 Query/Update DTO 和 VO |
| packages/server/src/modules/attendance/attendance-correction.service.ts | 修改 | 实现 query, update, delete 及 `recalculate` |
| packages/server/src/modules/attendance/attendance-correction.controller.ts | 修改 | 增加 query, update, delete 接口 |
| packages/server/src/modules/attendance/attendance.routes.ts | 修改 | 注册路由 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 补签申请 (SW66) | 现有的 checkIn/checkOut 方法需要重构，统一使用 `recalculate` 逻辑 | 中 |
| 每日考勤查询 | 无影响，仅数据变动 | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 重算策略 | 实时重算 | 保证管理员操作后立即看到最新的考勤状态，符合用户预期 |
| 删除策略 | 物理删除 | 补签本身是修正记录，错误的修正应直接移除，无需软删除 |
| 时间确定逻辑 | 补签优先 | 只要存在补签记录，就忽略原始打卡记录；删除补签后自动回退到原始打卡 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 重构风险 | 修改现有的 checkIn/checkOut 可能引入 bug | 编写集成测试覆盖新增和原有场景 |
| 性能风险 | 频繁重算可能影响性能 | 目前是单人单日操作，性能压力在可控范围 |

## 需要人决策

无
