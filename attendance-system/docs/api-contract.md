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
| sortOrder | 'asc' | 'desc' | 排序方向 |

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

## 八、打卡记录 (naruto)

### POST /attendance/clock

创建打卡记录 (App/Web)

**请求体:**
```json
{
  "type": "sign_in", // sign_in | sign_out
  "source": "app", // app | web | device
  "location": { "lat": 30.1, "lng": 120.1, "address": "..." },
  "deviceInfo": { "deviceId": "...", "model": "iPhone 13" },
  "employeeId": 1 // App端可选(自动获取), Web端必填
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "employeeId": 1,
    "clockTime": "2026-02-01T09:00:00Z",
    "type": "sign_in",
    "source": "app",
    "createdAt": "..."
  }
}
```

### GET /attendance/clock

查询打卡记录列表

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| employeeId | number | 员工ID |
| deptId | number | 部门ID |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| type | string | sign_in | sign_out |
| source | string | app | web | device |

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": 1,
      "employeeName": "张三",
      "clockTime": "2026-02-01T09:00:00Z",
      "type": "sign_in",
      "source": "app",
      "deviceInfo": { ... },
      "location": { ... }
    }
  ],
  "pagination": { ... }
}
```
