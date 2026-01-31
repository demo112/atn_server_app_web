# Design: SW62 考勤制度

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 初始化默认配置 | Service: `AttendanceSettingsService.initDefaults()` |
| Story 2: 获取考勤设置 | API: `GET /api/v1/attendance/settings`, Controller: `getSettings` |
| Story 3: 修改考勤设置 | API: `PUT /api/v1/attendance/settings`, Controller: `updateSettings` |

## 数据模型

已有 `AttSetting` 模型满足需求，无需修改：

```prisma
model AttSetting {
  id          Int      @id @default(autoincrement())
  key         String   @unique @db.VarChar(50)
  value       Json
  description String?  @db.VarChar(200)
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("att_settings")
}
```

**预定义 Keys:**
- `day_switch_time`: 考勤日切换时间 (e.g., "05:00")

## API定义

### GET /api/v1/attendance/settings

获取所有考勤设置。

**Response:**
```typescript
interface GetSettingsResponse {
  success: true
  data: {
    day_switch_time: string // HH:mm
    [key: string]: any
  }
}
```

### PUT /api/v1/attendance/settings

批量更新考勤设置。

**Request:**
```typescript
interface UpdateSettingsDto {
  day_switch_time?: string // HH:mm
}
```

**Response:**
```typescript
interface UpdateSettingsResponse {
  success: true
  data: {
    day_switch_time: string
    // ... other updated keys
  }
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| ERR_ATT_INVALID_TIME_FORMAT | 时间格式错误 (非 HH:mm) |

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/server/src/modules/attendance/attendance-settings.controller.ts | 新增 | Settings Controller |
| packages/server/src/modules/attendance/attendance-settings.service.ts | 新增 | Settings Service (含初始化逻辑) |
| packages/server/src/modules/attendance/attendance-settings.dto.ts | 新增 | DTO 定义 |
| packages/server/src/modules/attendance/attendance.routes.ts | 修改 | 注册 settings 路由 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 考勤计算 | 依赖 `day_switch_time` | 高 |

## 技术决策

1.  **Json Value**: 使用 `Json` 类型存储 value，方便存储非字符串类型的配置（如 boolean, number），虽然目前只有 string 时间。
2.  **初始化逻辑**: Service 启动时检查 `day_switch_time` 是否存在，不存在则插入默认值 "05:00"。

## 需要人决策

- 无
