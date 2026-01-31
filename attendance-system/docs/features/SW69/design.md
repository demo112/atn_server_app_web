# Design: SW69 原始考勤/打卡

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 员工App打卡 | API: POST /api/v1/attendance/clock |
| Story 2: 管理员Web端代打卡 | API: POST /api/v1/attendance/clock (参数区分) |
| Story 3: 打卡记录查询 | API: GET /api/v1/attendance/clock |
| Story 4: 考勤数据导出 | API: GET /api/v1/attendance/clock/export (暂不实现导出功能，仅做接口预留) |

## 数据模型

```prisma
/// 原始打卡记录表
model AttClockRecord {
  id         BigInt    @id @default(autoincrement())
  employeeId Int       @map("employee_id")
  clockTime  DateTime  @map("clock_time")
  type       ClockType @map("type") // 上班/下班
  source     ClockSource @map("source") // 来源
  deviceInfo Json?     @map("device_info") // 设备信息
  location   Json?     // 位置信息 { lat, lng, address }
  operatorId Int?      @map("operator_id") // Web打卡时记录操作人
  remark     String?   @db.VarChar(200)
  createdAt  DateTime  @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id])
  operator User?    @relation("ClockOperator", fields: [operatorId], references: [id])

  @@index([employeeId, clockTime])
  @@map("att_clock_records")
}

enum ClockType {
  SignIn
  SignOut
}

enum ClockSource {
  App
  Web
  Device
}
```

> **注意**: 现有 Schema 中 `AttClockRecord` 定义与新设计有差异（enum值、字段名），需要迁移更新。

## API定义

### POST /api/v1/attendance/clock

提交打卡记录。

**Request:**
```typescript
interface CreateClockDto {
  employeeId: number; // 员工ID (Web端必填，App端从Token获取)
  clockTime: string;  // ISO string
  type: 'SignIn' | 'SignOut';
  source: 'App' | 'Web' | 'Device';
  deviceInfo?: {
    deviceId: string;
    model: string;
    os: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  remark?: string;
}
```

**Response:**
```typescript
interface AttClockRecordVo {
  id: string; // BigInt 转 string
  employeeId: number;
  clockTime: string;
  type: string;
  source: string;
  createdAt: string;
}
```

### GET /api/v1/attendance/clock

查询打卡记录。

**Request (Query):**
```typescript
interface QueryClockDto {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  deptId?: number; // 需关联查询
  startTime?: string;
  endTime?: string;
  source?: string;
}
```

**Response:**
```typescript
interface ClockListVo {
  items: AttClockRecordVo[];
  total: number;
  page: number;
  pageSize: number;
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| ERR_ATT_CLOCK_INVALID_TIME | 打卡时间无效 |
| ERR_ATT_CLOCK_EMPLOYEE_NOT_FOUND | 员工不存在 |

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/server/prisma/schema.prisma | 修改 | 更新 `AttClockRecord` 及 Enums |
| packages/server/src/modules/attendance/attendance-clock.dto.ts | 新增 | DTO定义 |
| packages/server/src/modules/attendance/attendance-clock.service.ts | 新增 | 业务逻辑 (写入、查询) |
| packages/server/src/modules/attendance/attendance-clock.controller.ts | 新增 | 接口实现 |
| packages/server/src/modules/attendance/attendance.routes.ts | 修改 | 注册 `/clock` 路由 |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 现有Schema | 需要执行Migration，且涉及User/Employee关联 | 中 |

## 技术决策

1. **BigInt处理**: Prisma中BigInt在JSON序列化时会报错，需在全局或DTO层统一转换为String返回给前端。
2. **位置存储**: 使用JSON字段存储经纬度和地址，比独立字段更灵活。

## 风险点

- **BigInt序列化**: 这是一个常见坑点，需确保 `JSON.stringify` 能处理 BigInt (或在响应拦截器中处理)。
