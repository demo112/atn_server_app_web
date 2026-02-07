# Design: 人员管理增强功能 (SW74)

## API Design

### 1. 批量删除
- **Endpoint**: `POST /api/v1/employees/batch-delete`
- **Request Body**:
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```
- **Response**: `200 OK` `{ success: true, data: { count: 3 } }`

### 2. 批量更换部门
- **Endpoint**: `POST /api/v1/employees/batch-department`
- **Request Body**:
  ```json
  {
    "ids": [1, 2, 3],
    "deptId": 10
  }
  ```
- **Response**: `200 OK` `{ success: true, data: { count: 3 } }`

### 3. 获取导入模板
- **Endpoint**: `GET /api/v1/employees/import-template`
- **Response**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (File Stream)
- **Columns**:
  - 工号 (必填)
  - 姓名 (必填)
  - 手机号 (选填)
  - 邮箱 (选填)
  - 部门名称 (选填，需精确匹配)
  - 入职日期 (选填, 格式 YYYY-MM-DD)

### 4. 导入人员
- **Endpoint**: `POST /api/v1/employees/import`
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (Excel file)
- **Logic**:
  1. 解析 Excel
  2. 校验数据格式
  3. 校验部门名称是否存在（不存在则报错）
  4. 校验工号是否重复
  5. 批量创建
- **Response**: 
  - Success: `200 OK` `{ success: true, data: { count: 10 } }`
  - Error: `400 Bad Request` `{ success: false, error: { message: "第 3 行部门不存在: xxx" } }`

### 5. 导出人员
- **Endpoint**: `GET /api/v1/employees/export`
- **Query Params**: Same as list API (`deptId`, `keyword`, `status`)
- **Response**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (File Stream)

## Data Model Changes

No schema changes required. Uses existing `Employee` model.

## Implementation Details

### Server
- **Dependencies**: 
  - `exceljs`: 已安装，用于读写 Excel。
  - `multer`: **需安装**，用于处理文件上传。
- **Controller**: Add methods to `EmployeeController`.
- **Service**: Add `batchDelete`, `batchUpdateDept`, `generateTemplate`, `importEmployees`, `exportEmployees`.
- **Validation**: Use `zod` schemas for request bodies.

### Web
- **Components**:
  - `PersonnelDashboard.tsx`: Update handlers for existing buttons.
  - `BatchDeptModal` (New): Modal to select department for batch update.
  - `ImportModal` (New): Modal to download template and upload file.
- **Service**: Update `employeeService` in frontend to call new APIs.

## Dependencies

- Backend: `npm install multer @types/multer`
