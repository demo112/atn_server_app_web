
## 三、考勤模块（naruto）

### GET /attendance/daily

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

### POST /attendance/corrections/check-in

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

### POST /attendance/corrections/check-out

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
