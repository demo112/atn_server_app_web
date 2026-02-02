# Design: UA2 人员管理

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 员工档案维护 | API: POST/PUT/DELETE /api/v1/employees<br>Server: EmployeeService.create/update/delete<br>Web: EmployeeModal 组件 |
| Story 2: 员工列表与查询 | API: GET /api/v1/employees<br>Server: EmployeeService.findAll<br>Web: EmployeeList 页面 |
| Story 3: 员工账号关联 | API: POST /api/v1/employees/:id/bind-user<br>Server: EmployeeService.bindUser<br>Web: EmployeeModal 绑定组件 |

## 数据模型

需要修改 `EmployeeStatus` 枚举，增加 `deleted` 状态。

```prisma
// 引用自 schema.prisma (需修改)
model Employee {
  // ... 其他字段不变
  employeeNo String         @unique @map("employee_no") @db.VarChar(50)
  status     EmployeeStatus @default(active)
  
  // ...
}

enum EmployeeStatus {
  active   // 在职
  deleted  // 已删除 (软删除)
  // inactive 状态已废弃
}
```

> **删除逻辑 (Soft Delete with Rename)**:
> 1. 用户调用 `DELETE` 接口。
> 2. 系统将 `status` 设为 `deleted`。
> 3. 系统将 `employeeNo` 修改为 `del_{timestamp}_{originalNo}`，释放唯一约束。
> 4. 系统解除 `User` 关联 (User.employeeId = null)。
> 5. 前端列表默认过滤掉 `deleted` 状态。
> 6. 历史考勤记录通过外键依然指向该记录，因此可显示姓名。

## API定义

> **注意**: 所有接口响应均遵循标准格式 `{ success: true, data: T }`。

### 1. 员工管理 (Employee)

#### GET /api/v1/employees
查询员工列表，支持分页与筛选。默认仅返回 `active` 状态的员工。

**Request (Query):**
```typescript
interface GetEmployeesDto {
  page?: number
  pageSize?: number
  keyword?: string // name / employeeNo / phone
  deptId?: number
  // status 默认为 active，不暴露给前端选择
}
```

**Response:**
```typescript
interface EmployeeVo {
  id: number
  employeeNo: string
  name: string
  phone?: string
  email?: string
  deptId?: number
  deptName?: string
  status: 'active'
  hireDate?: string
  userId?: number
  username?: string
}
```

#### POST /api/v1/employees
新增员工。

**Request:**
```typescript
interface CreateEmployeeDto {
  employeeNo: string
  name: string
  deptId: number
  hireDate: string // YYYY-MM-DD
  phone?: string
  email?: string
  position?: string
}
```

#### PUT /api/v1/employees/:id
更新员工信息。

**Request:**
```typescript
interface UpdateEmployeeDto {
  name?: string
  deptId?: number
  phone?: string
  email?: string
  hireDate?: string
}
```

#### DELETE /api/v1/employees/:id
物理删除员工（业务视角）。

**Request:** 无

**Response:**
```typescript
{ success: true }
```

#### POST /api/v1/employees/:id/bind-user
绑定/解绑系统账号。

**Request:**
```typescript
interface BindUserDto {
  userId: number | null // null 表示解绑
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/server/prisma/schema.prisma` | 修改 | EmployeeStatus 枚举变更为 active/deleted |
| `packages/shared/src/types/employee.ts` | 新增 | 定义 EmployeeDto, EmployeeVo 等共享类型 |
| `packages/server/src/modules/employee/employee.dto.ts` | 新增 | 定义 DTO 类 |
| `packages/server/src/modules/employee/employee.service.ts` | 新增 | 实现 create, update, delete (soft), bindUser |
| `packages/server/src/modules/employee/employee.controller.ts` | 新增 | 实现 API 接口 |
| `packages/server/src/modules/employee/employee.routes.ts` | 新增 | 注册路由 |
| `packages/server/src/index.ts` | 修改 | 注册 employee 路由 |
| `packages/web/src/services/employee.ts` | 新增 | 前端 API 调用封装 |
| `packages/web/src/pages/employee/EmployeeList.tsx` | 新增 | 员工列表页面 (含删除按钮) |
| `packages/web/src/pages/employee/components/EmployeeModal.tsx` | 新增 | 新增/编辑弹窗 |
| `packages/web/src/pages/employee/components/BindUserModal.tsx` | 新增 | 账号绑定弹窗 |
| `packages/web/src/App.tsx` | 修改 | 添加路由 `/employee` |

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| Schema Migration | 需执行 `prisma migrate dev` 修改枚举 | 中 |
| User模块 | 需处理解绑逻辑 | 低 |

## 需要你决策

- [x] **删除策略**：已确认为“伪物理删除”（Soft Delete + Rename），满足“释放工号”和“保留历史”的双重需求。

