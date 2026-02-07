# Tasks: 人员管理增强功能 (SW74)

## Backend (Server)

- [x] **Install Dependencies** <!-- id: 0 -->
  - Install `multer` and `@types/multer`

- [x] **DTO & Routes** <!-- id: 1 -->
  - Define Zod schemas for batch operations in `employee.dto.ts`
  - Add routes in `employee.routes.ts` (`/batch-delete`, `/batch-department`, `/import-template`, `/import`, `/export`)

- [x] **Service Implementation - Batch Ops** <!-- id: 2 -->
  - Implement `batchDelete` in `EmployeeService` (transactional)
  - Implement `batchUpdateDept` in `EmployeeService`

- [x] **Service Implementation - Excel** <!-- id: 3 -->
  - Implement `generateTemplate` using `exceljs`
  - Implement `exportEmployees` using `exceljs` (reuse `findAll` filter logic)
  - Implement `importEmployees` (parse, validate, create)

- [x] **Controller Implementation** <!-- id: 4 -->
  - Connect routes to service methods in `EmployeeController`

## Frontend (Web)

- [x] **Service Update** <!-- id: 5 -->
  - Add API methods to `web/src/services/employee.ts`

- [x] **Batch Update Department UI** <!-- id: 6 -->
  - Create `BatchDeptModal` component
  - Integrate into `PersonnelDashboard`

- [x] **Import UI** <!-- id: 7 -->
  - Create `ImportEmployeeModal` component (Download Template + Upload)
  - Integrate into `PersonnelDashboard`

- [x] **Export & Batch Delete Integration** <!-- id: 8 -->
  - Implement `handleExport` in `PersonnelDashboard`
  - Connect `onBatchDelete` to real API

## Verification

- [x] **Integration Test** <!-- id: 9 -->
  - Verify all 4 features manually
