# API 契约

## 一、通用规范

- 基础路径: `/api/v1`
- 时间格式: ISO 8601 (`2024-02-01T09:00:00.000Z`)
- 成功响应: `{ "success": true, "data": ... }`
- 错误响应: `{ "success": false, "error": { "code": "ERR_XXX", "message": "..." } }`

## 二、用户模块（sasuke）

### POST /api/v1/auth/login
...（保持原内容，确认前缀正确）

## 三、考勤模块（naruto）

### GET /api/v1/attendance/daily
查询每日考勤记录

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| deptId | number | 否 | 部门ID |
| startDate | string | 否 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | 结束日期 (YYYY-MM-DD) |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": 101,
      "employeeName": "Naruto",
      "deptName": "研发部",
      "workDate": "2024-02-01",
      "shiftName": "早班",
      "startTime": "09:00",
      "endTime": "18:00",
      "checkInTime": "2024-02-01T08:55:00.000Z",
      "checkOutTime": "2024-02-01T18:05:00.000Z",
      "status": "normal"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### POST /api/v1/attendance/corrections/check-in
补签到

**请求体：**
```json
{
  "dailyRecordId": "1",
  "checkInTime": "2024-02-01T09:00:00.000Z",
  "remark": "忘记打卡"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "dailyRecord": { ... },
    "correction": {
      "id": 1,
      "type": "check_in",
      "status": "pending"
    }
  }
}
```

### POST /api/v1/attendance/corrections/check-out
补签退

**请求体：**
```json
{
  "dailyRecordId": "1",
  "checkOutTime": "2024-02-01T18:00:00.000Z",
  "remark": "忘记打卡"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "dailyRecord": { ... },
    "correction": {
      "id": 2,
      "type": "check_out",
      "status": "pending"
    }
  }
}
```

### POST /api/v1/attendance/shifts
创建班次

**请求体:**
```json
{
  "name": "标准早班",
  "cycleDays": 7,
  "days": [
    { "dayOfCycle": 1, "periodIds": [1] }
  ]
}
```

**响应:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "标准早班", "cycleDays": 7 }
}
```

### GET /api/v1/attendance/shifts
获取班次列表

**响应:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "标准早班", "cycleDays": 7 }
  ]
}
```

### GET /api/v1/attendance/clock
查询原始打卡记录

**查询参数:**
- page, pageSize
- employeeId, deptId
- startTime, endTime

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1001",
      "employeeId": 1,
      "clockTime": "2024-02-03T08:55:00Z",
      "type": "SignIn",
      "source": "App"
    }
  ],
  "pagination": { "total": 100, "page": 1, "pageSize": 10 }
}
```

## 四、统计模块

### GET /api/v1/statistics/summary
获取考勤汇总数据

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 是 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 是 | 结束日期 (YYYY-MM-DD) |
| deptId | number | 否 | 部门ID |
| employeeId | number | 否 | 员工ID |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": 1,
      "employeeNo": "EMP001",
      "name": "张三",
      "deptName": "研发部",
      "shouldAttendanceDays": 22,
      "actualAttendanceDays": 21,
      "lateTimes": 1,
      "lateMinutes": 15,
      "earlyLeaveTimes": 0,
      "earlyLeaveMinutes": 0,
      "absentDays": 1,
      "leaveMinutes": 0
    }
  ]
}
```

### POST /api/v1/statistics/calculate
手动触发考勤计算 (Admin Only)

**请求体：**
```json
{
  "startDate": "2024-02-01",
  "endDate": "2024-02-28",
  "employeeIds": [1, 2]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "Calculation triggered successfully"
  }
}
```

### GET /api/v1/statistics/details
查询每日考勤明细

**查询参数:**
- startDate, endDate
- deptId, employeeId
- page, pageSize

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": 1,
      "workDate": "2024-02-03",
      "shiftName": "早班",
      "checkInTime": "08:55",
      "checkOutTime": "18:05",
      "status": "Normal"
    }
  ],
  "pagination": { "total": 100, "page": 1, "pageSize": 10 }
}
```

## 五、App 端专用接口 (Employee Self-Service)

> 统一前缀: /api/v1/app

### POST /api/v1/app/clock
**打卡 (签到/签退)**
App 端核心功能，需携带位置信息。

**请求体:**
```json
{
  "type": "ClockIn", // ClockIn | ClockOut
  "location": {
    "latitude": 30.123456,
    "longitude": 120.123456,
    "address": "科技园A栋"
  },
  "deviceInfo": {
    "deviceId": "uuid-xxx",
    "model": "iPhone 15"
  },
  "remark": "外勤打卡" // 可选
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "recordId": "1001",
    "time": "2024-02-03T08:55:00Z",
    "status": "Normal" // Normal | Late | Early | Outside
  }
}
```

### GET /api/v1/app/schedule/my
**查询我的排班**
用于 App 端日历展示。

**查询参数:**
- `startDate`: 2024-02-01
- `endDate`: 2024-02-29

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-02-03",
      "shiftId": 1,
      "shiftName": "早班 (09:00-18:00)",
      "isWorkDay": true
    }
  ]
}
```

### GET /api/v1/app/attendance/my
**查询我的考勤记录**
用于 App 端查看每日打卡详情。

**查询参数:**
- `date`: 2024-02-03 (单日查询)

**响应:**
```json
{
  "success": true,
  "data": {
    "date": "2024-02-03",
    "shift": { "start": "09:00", "end": "18:00" },
    "records": [
      { "type": "ClockIn", "time": "08:55", "status": "Normal" },
      { "type": "ClockOut", "time": "18:05", "status": "Normal" }
    ],
    "result": "Normal" // 最终日结果
  }
}
```

### POST /api/v1/app/apply/leave
**提交请假申请**

**请求体:**
```json
{
  "type": "SickLeave", // SickLeave | AnnualLeave | ...
  "startTime": "2024-02-04T09:00:00Z",
  "endTime": "2024-02-04T18:00:00Z",
  "reason": "身体不适",
  "attachments": ["url1", "url2"] // 附件图片
}
```

**响应:**
```json
{
  "success": true,
  "data": { "applicationId": "2001", "status": "Pending" }
}
```