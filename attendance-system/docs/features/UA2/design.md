# Design: UA2 人员与部门管理

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 部门结构管理 | API: GET/POST/PUT/DELETE /api/v1/departments<br>Server: DepartmentService<br>Web: DepartmentSidebar (Enhanced) |
| Story 2: 员工档案维护 | API: POST/PUT/DELETE /api/v1/employees<br>Server: EmployeeService.create/update/delete<br>Web: EmployeeModal 组件 |
| Story 3: 员工列表与查询 | API: GET /api/v1/employees<br>Server: EmployeeService.findAll<br>Web: EmployeeList 页面 |
| Story 4: 员工账号关联 | API: POST /api/v1/employees/:id/bind-user<br>Server: EmployeeService.bindUser<br>Web: EmployeeModal 绑定组件 |

## 数据模型

### Employee (原有)
```prisma
model Employee {
  // ... 字段
  status     EmployeeStatus @default(active)
}

enum EmployeeStatus {
  active
  deleted
}
```

### Department (新增)
```prisma
model Department {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  parentId  Int?     @map("parent_id")
  parent    Department? @relation("DeptToDept", fields: [parentId], references: [id])
  children  Department[] @relation("DeptToDept")
  sortOrder Int      @default(0) @map("sort_order")
  
  employees Employee[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("att_departments")
}
```

## API定义

### 1. 部门管理 (Department)

#### GET /api/v1/departments/tree
获取部门树结构。

#### POST /api/v1/departments
创建部门。

#### PUT /api/v1/departments/:id
更新部门。

#### DELETE /api/v1/departments/:id
删除部门。

### 2. 员工管理 (Employee)

(原有 API 保持不变)

## Web UI 设计

### 页面布局
- 左侧：**部门树 (DepartmentSidebar)**
  - 展示部门层级
  - **增强功能**：每个节点右侧或右键菜单提供 [新增子部门] [编辑] [删除] 按钮
  - 选中部门时，右侧列表自动筛选
- 右侧：**员工列表 (EmployeeList)**
  - 顶部工具栏：搜索框、[新增员工] 按钮
  - 表格展示：员工信息

## 文件变更清单
| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx` | 修改 | 集成部门增删改入口 |
| `packages/web/src/pages/employee/components_new/DepartmentModal.tsx` | 新增 | 部门表单弹窗 |
| `packages/web/src/pages/department/` | 删除 | 移除独立部门管理模块 |
| `packages/web/src/App.tsx` | 修改 | 移除 /departments 路由 |
| `packages/web/src/components/layout/Sidebar.tsx` | 修改 | 移除部门管理菜单 |
