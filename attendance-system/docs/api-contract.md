# API 契约文档

## 一、通用规范

### 基础路径

```
http://localhost:3000/api/v1
```

### 请求头

```
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": T
}

// 分页响应
{
  "success": true,
  "data": T[],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERR_USER_NOT_FOUND",
    "message": "用户不存在"
  }
}
```

### 通用查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 20 |
| sortBy | string | 排序字段 |
| sortOrder | 'asc' \| 'desc' | 排序方向 |

---

## 二、认证模块（sasuke）

### POST /auth/login

登录获取 Token

**请求体：**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "employee": {
        "id": 1,
        "employeeNo": "EMP001",
        "name": "张三"
      }
    }
  }
}
```

### POST /auth/logout

登出

**响应：**
```json
{
  "success": true,
  "data": null
}
```

---

## 三、考勤核心模块（naruto）

### GET /attendance/settings

获取考勤全局配置

**认证**: 需要

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "key": "day_switch_time",
      "value": "05:00",
      "description": "考勤日切换时间"
    }
  ]
}
```

### PUT /attendance/settings

更新考勤全局配置

**认证**: 需要

**Request:**
```json
{
  "items": [
    {
      "key": "day_switch_time",
      "value": "04:00"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "day_switch_time",
      "value": "04:00",
      "description": "考勤日切换时间"
    }
  ]
}
```

### GET /auth/me

获取当前用户信息

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "employee": {
      "id": 1,
      "employeeNo": "EMP001",
      "name": "张三",
      "deptId": 1,
      "deptName": "技术部"
    }
  }
}
```

---

## 三、用户管理（sasuke）

### GET /users

获取用户列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 搜索关键词（用户名） |
| role | string | 角色筛选 |
| status | string | 状态筛选 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "status": "active",
      "employeeId": 1,
      "employeeName": "张三",
      "createdAt": "2026-02-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /users

创建用户

**请求体：**
```json
{
  "username": "user001",
  "password": "123456",
  "role": "user",
  "employeeId": 2
}
```

### PUT /users/:id

更新用户

**请求体：**
```json
{
  "role": "admin",
  "status": "inactive"
}
```

### DELETE /users/:id

删除用户

---

## 四、人员管理（sasuke）

### GET /employees

获取人员列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 搜索（编号/姓名/手机） |
| deptId | number | 部门ID |
| status | string | 状态筛选 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeNo": "EMP001",
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "deptId": 1,
      "deptName": "技术部",
      "status": "active",
      "hireDate": "2025-01-01",
      "createdAt": "2026-02-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### GET /employees/:id

获取单个人员详情

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employeeNo": "EMP001",
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "deptId": 1,
    "deptName": "技术部",
    "status": "active",
    "hireDate": "2025-01-01",
    "leaveDate": null
  }
}
```

### POST /employees

创建人员

**请求体：**
```json
{
  "employeeNo": "EMP002",
  "name": "李四",
  "phone": "13800138001",
  "email": "lisi@example.com",
  "deptId": 1,
  "hireDate": "2026-02-01"
}
```

### PUT /employees/:id

更新人员

### DELETE /employees/:id

删除人员

### POST /employees/batch

批量获取人员信息（naruto 调用）

**请求体：**
```json
{
  "ids": [1, 2, 3]
}
```

**响应：**
```json
{
  "success": true,
  "data": [
    { "id": 1, "employeeNo": "EMP001", "name": "张三", "deptName": "技术部" },
    { "id": 2, "employeeNo": "EMP002", "name": "李四", "deptName": "技术部" }
  ]
}
```

---

## 五、部门管理（sasuke）

### GET /departments/tree

获取部门树（naruto 调用）

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "总公司",
      "parentId": null,
      "sortOrder": 0,
      "employeeCount": 50,
      "children": [
        {
          "id": 2,
          "name": "技术部",
          "parentId": 1,
          "sortOrder": 1,
          "employeeCount": 20,
          "children": []
        }
      ]
    }
  ]
}
```

### GET /departments/:id/employees

获取部门下人员（naruto 调用）

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| includeChildren | boolean | 是否包含子部门人员，默认 false |

**响应：**
```json
{
  "success": true,
  "data": [
    { "id": 1, "employeeNo": "EMP001", "name": "张三", "status": "active" },
    { "id": 2, "employeeNo": "EMP002", "name": "李四", "status": "active" }
  ]
}
```

### GET /departments

获取部门列表（平铺）

### POST /departments

创建部门

**请求体：**
```json
{
  "name": "研发组",
  "parentId": 2,
  "sortOrder": 1
}
```

### PUT /departments/:id

更新部门

### DELETE /departments/:id

删除部门

---

## 六、考勤设置（naruto）

### GET /attendance/settings

获取所有考勤设置

**响应：**
```json
{
  "success": true,
  "data": {
    "day_switch_time": "05:00",
    "data_retention_years": 2
  }
}
```

### PUT /attendance/settings

更新考勤设置

**请求体：**
```json
{
  "day_switch_time": "06:00"
}
```

---

## 七、时间段管理（naruto）

### GET /attendance/time-periods

获取时间段列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 类型筛选（normal/flexible） |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "标准工作时间",
      "type": "normal",
      "workStart": "09:00",
      "workEnd": "18:00",
      "checkInStart": "08:00",
      "checkInEnd": "10:00",
      "checkOutStart": "17:00",
      "checkOutEnd": "20:00",
      "requireCheckIn": true,
      "requireCheckOut": true,
      "lateRule": { "graceMinutes": 10 },
      "earlyLeaveRule": { "graceMinutes": 10 }
    }
  ]
}
```

### GET /attendance/time-periods/:id

获取单个时间段

### POST /attendance/time-periods

创建时间段

**请求体（固定班制）：**
```json
{
  "name": "标准工作时间",
  "type": 0,
  "startTime": "09:00",
  "endTime": "18:00",
  "restStartTime": "12:00",
  "restEndTime": "13:00",
  "rules": {
    "lateGraceMinutes": 10,
    "earlyLeaveGraceMinutes": 10
  }
}
```

**请求体（弹性班制）：**
```json
{
  "name": "弹性工作制",
  "type": 1,
  "startTime": "09:00",
  "endTime": "18:00",
  "rules": {
    "minWorkHours": 8,
    "flexRangeMinutes": 60
  }
}
```

### PUT /attendance/time-periods/:id

更新时间段

### DELETE /attendance/time-periods/:id

删除时间段

---

## 八、班次管理（naruto）

### GET /attendance/shifts

获取班次列表

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "标准班",
      "cycleDays": 7,
      "periods": [
        {
          "id": 1,
          "dayOfCycle": 1,
          "sortOrder": 0,
          "period": {
            "id": 1,
            "name": "标准工作时间",
            "workStart": "09:00",
            "workEnd": "18:00"
          }
        }
      ]
    }
  ]
}
```

### GET /attendance/shifts/:id

获取单个班次

### POST /attendance/shifts

创建班次

**请求体：**
```json
{
  "name": "标准班",
  "cycleDays": 7,
  "periods": [
    { "periodId": 1, "dayOfCycle": 1, "sortOrder": 0 },
    { "periodId": 1, "dayOfCycle": 2, "sortOrder": 0 },
    { "periodId": 1, "dayOfCycle": 3, "sortOrder": 0 },
    { "periodId": 1, "dayOfCycle": 4, "sortOrder": 0 },
    { "periodId": 1, "dayOfCycle": 5, "sortOrder": 0 }
  ]
}
```

### PUT /attendance/shifts/:id

更新班次

### DELETE /attendance/shifts/:id

删除班次

---

## 九、排班管理（naruto）

### GET /attendance/schedules

获取排班列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| employeeId | number | 人员ID |
| deptId | number | 部门ID |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "shiftId": 1,
      "shiftName": "标准班",
      "startDate": "2026-02-01",
      "endDate": "2026-12-31"
    }
  ]
}
```

### GET /attendance/schedules/employee/:employeeId/date/:date

获取人员某日的班次信息（打卡时调用）

**响应：**
```json
{
  "success": true,
  "data": {
    "shiftId": 1,
    "shiftName": "标准班",
    "periods": [
      {
        "periodId": 1,
        "periodName": "标准工作时间",
        "workStart": "09:00",
        "workEnd": "18:00"
      }
    ]
  }
}
```

### POST /attendance/schedules

创建排班

**请求体：**
```json
{
  "employeeId": 1,
  "shiftId": 1,
  "startDate": "2026-02-01",
  "endDate": "2026-12-31"
}
```

### POST /attendance/schedules/batch

批量排班

**请求体：**
```json
{
  "employeeIds": [1, 2, 3],
  "shiftId": 1,
  "startDate": "2026-02-01",
  "endDate": "2026-12-31"
}
```

### PUT /attendance/schedules/:id

更新排班

### DELETE /attendance/schedules/:id

删除排班

---

## 十、打卡管理（naruto）

### POST /attendance/clock

打卡（App 调用）

**请求体：**
```json
{
  "employeeId": 1,
  "clockTime": "2026-02-01T09:00:00Z",
  "clockType": "app",
  "remark": ""
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "clockTime": "2026-02-01T09:00:00Z",
    "clockType": "app",
    "status": "normal",
    "message": "签到成功"
  }
}
```

### POST /attendance/clock/manual

手动打卡（Web 管理员操作）

**请求体：**
```json
{
  "employeeId": 1,
  "clockTime": "2026-02-01T09:00:00Z",
  "remark": "补录打卡"
}
```

### GET /attendance/clock

获取打卡记录（sasuke 统计模块调用）

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| employeeId | number | 人员ID |
| deptId | number | 部门ID |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| clockType | string | 打卡类型 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "deptName": "技术部",
      "clockTime": "2026-02-01T09:00:00Z",
      "clockType": "app"
    }
  ],
  "pagination": { ... }
}
```

### GET /attendance/clock/today/:employeeId

获取人员今日打卡记录（App 调用）

**响应：**
```json
{
  "success": true,
  "data": [
    { "id": 1, "clockTime": "2026-02-01T09:00:00Z", "clockType": "app" },
    { "id": 2, "clockTime": "2026-02-01T18:05:00Z", "clockType": "app" }
  ]
}
```

---

## 十一、每日考勤记录（naruto）

### GET /attendance/daily

获取每日考勤记录（sasuke 统计模块调用）

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| employeeId | number | 人员ID |
| deptId | number | 部门ID |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| status | string | 状态筛选 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "deptId": 1,
      "deptName": "技术部",
      "workDate": "2026-02-01",
      "shiftName": "标准班",
      "periodName": "标准工作时间",
      "checkInTime": "2026-02-01T09:00:00Z",
      "checkOutTime": "2026-02-01T18:05:00Z",
      "status": "normal",
      "actualMinutes": 545,
      "effectiveMinutes": 540,
      "lateMinutes": 0,
      "earlyLeaveMinutes": 0,
      "absentMinutes": 0
    }
  ],
  "pagination": { ... }
}
```

### GET /attendance/daily/abnormal

获取异常考勤记录（补签处理页面）

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| deptId | number | 部门ID |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**响应：** 同上，但只返回 status 不为 normal 的记录

### POST /attendance/daily/recalculate

手动重算考勤

**请求体：**
```json
{
  "employeeId": 1,
  "startDate": "2026-02-01",
  "endDate": "2026-02-28"
}
```

---

## 十二、补签管理（naruto）

### GET /attendance/corrections

获取补签记录

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| employeeId | number | 人员ID |
| deptId | number | 部门ID |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "deptName": "技术部",
      "dailyRecordId": 1,
      "type": "check_in",
      "correctionTime": "2026-02-01T09:00:00Z",
      "operatorId": 1,
      "operatorName": "管理员",
      "createdAt": "2026-02-02T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /attendance/corrections

创建补签

**请求体：**
```json
{
  "employeeId": 1,
  "dailyRecordId": 1,
  "type": "check_in",
  "correctionTime": "2026-02-01T09:00:00Z",
  "remark": "忘记打卡"
}
```

### PUT /attendance/corrections/:id

更新补签

### DELETE /attendance/corrections/:id

删除补签

---

## 十三、请假管理（naruto）

### GET /attendance/leaves

获取请假记录

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| employeeId | number | 人员ID |
| deptId | number | 部门ID |
| type | string | 请假类型 |
| status | string | 审批状态 |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "deptName": "技术部",
      "type": "annual",
      "startTime": "2026-02-10T09:00:00Z",
      "endTime": "2026-02-10T18:00:00Z",
      "reason": "个人事务",
      "status": "pending",
      "approverId": null,
      "approverName": null,
      "approvedAt": null,
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /attendance/leaves

创建请假申请

**请求体：**
```json
{
  "employeeId": 1,
  "type": "annual",
  "startTime": "2026-02-10T09:00:00Z",
  "endTime": "2026-02-10T18:00:00Z",
  "reason": "个人事务"
}
```

### PUT /attendance/leaves/:id

更新请假

### DELETE /attendance/leaves/:id

删除请假

### POST /attendance/leaves/:id/approve

审批通过

**请求体：**
```json
{
  "approverId": 1
}
```

### POST /attendance/leaves/:id/reject

审批拒绝

**请求体：**
```json
{
  "approverId": 1,
  "reason": "时间冲突"
}
```

### POST /attendance/leaves/:id/cancel

撤销申请

---

## 十四、考勤汇总（sasuke）

### GET /stats/summary

获取考勤汇总数据

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| startDate | string | ✓ | 开始日期 |
| endDate | string | ✓ | 结束日期 |
| deptId | number | | 部门ID |
| employeeId | number | | 人员ID |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": 1,
      "employeeNo": "EMP001",
      "employeeName": "张三",
      "deptId": 1,
      "deptName": "技术部",
      "totalDays": 22,
      "actualDays": 20,
      "lateCount": 2,
      "lateMinutes": 30,
      "earlyLeaveCount": 0,
      "earlyLeaveMinutes": 0,
      "absentCount": 1,
      "absentMinutes": 540,
      "leaveCount": 1,
      "leaveMinutes": 540,
      "actualMinutes": 10800,
      "effectiveMinutes": 10800
    }
  ]
}
```

### GET /stats/summary/export

导出考勤汇总（Excel）

**查询参数：** 同上

**响应：** 文件下载

---

## 十五、考勤明细（sasuke）

### GET /stats/detail

获取考勤明细

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| startDate | string | ✓ | 开始日期 |
| endDate | string | ✓ | 结束日期 |
| deptId | number | | 部门ID |
| employeeId | number | | 人员ID |
| status | string | | 状态筛选 |

**响应：** 同 GET /attendance/daily

### GET /stats/detail/export

导出考勤明细（Excel）

---

## 十六、统计报表（sasuke）

### GET /stats/report/daily

日报表

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| date | string | ✓ | 日期 |
| deptId | number | | 部门ID |

**响应：**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-01",
    "totalEmployees": 50,
    "actualEmployees": 48,
    "lateCount": 3,
    "earlyLeaveCount": 1,
    "absentCount": 2,
    "leaveCount": 2,
    "details": [ ... ]
  }
}
```

### GET /stats/report/monthly

月报表

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| year | number | ✓ | 年份 |
| month | number | ✓ | 月份 |
| deptId | number | | 部门ID |

### GET /stats/report/department

部门报表

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| startDate | string | ✓ | 开始日期 |
| endDate | string | ✓ | 结束日期 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "deptId": 1,
      "deptName": "技术部",
      "totalEmployees": 20,
      "avgAttendanceRate": 95.5,
      "totalLateCount": 10,
      "totalAbsentCount": 2
    }
  ]
}
```

### GET /stats/report/yearly

年报表

### GET /stats/report/abnormal

异常报表

**响应：**
```json
{
  "success": true,
  "data": {
    "totalAbnormal": 50,
    "byType": {
      "late": 30,
      "early_leave": 10,
      "absent": 10
    },
    "byDepartment": [
      { "deptName": "技术部", "count": 20 },
      { "deptName": "销售部", "count": 30 }
    ],
    "details": [ ... ]
  }
}
```

---

## 十七、错误码定义

| 错误码 | 说明 |
|--------|------|
| ERR_UNAUTHORIZED | 未登录或 Token 过期 |
| ERR_FORBIDDEN | 无权限 |
| ERR_USER_NOT_FOUND | 用户不存在 |
| ERR_USER_EXISTS | 用户名已存在 |
| ERR_EMPLOYEE_NOT_FOUND | 人员不存在 |
| ERR_EMPLOYEE_NO_EXISTS | 人员编号已存在 |
| ERR_DEPT_NOT_FOUND | 部门不存在 |
| ERR_DEPT_HAS_CHILDREN | 部门下有子部门，无法删除 |
| ERR_DEPT_HAS_EMPLOYEES | 部门下有人员，无法删除 |
| ERR_PERIOD_NOT_FOUND | 时间段不存在 |
| ERR_SHIFT_NOT_FOUND | 班次不存在 |
| ERR_SCHEDULE_NOT_FOUND | 排班不存在 |
| ERR_SCHEDULE_CONFLICT | 排班时间冲突 |
| ERR_LEAVE_NOT_FOUND | 请假记录不存在 |
| ERR_LEAVE_ALREADY_APPROVED | 请假已审批，无法修改 |
| ERR_CORRECTION_NOT_FOUND | 补签记录不存在 |
| ERR_INVALID_DATE_RANGE | 日期范围无效 |
