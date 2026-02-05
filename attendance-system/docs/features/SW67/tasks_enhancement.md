# 任务拆分：请假管理部门树增强

## Task 1: Server端部门递归查询支持
- **文件**: 
  - `packages/server/src/modules/department/department.service.ts`
  - `packages/server/src/modules/attendance/leave.service.ts`
- **内容**:
  - `DepartmentService` 新增 `getSubDepartmentIds` 方法。
  - `LeaveService` 更新 `findAll`，注入 `DepartmentService`，实现递归部门过滤。
- **验证**: 单元测试验证 `getSubDepartmentIds` 返回正确 ID 列表；API 测试验证 `deptId` 参数能查出子部门数据。

## Task 2: Web端人员选择组件
- **文件**: `packages/web/src/components/common/EmployeeSelect.tsx`
- **内容**:
  - 创建基于 React Select (或原生 Select) 的人员选择组件。
  - 支持 `deptId` 属性过滤。
  - 支持 `keyword` 搜索。
  - 使用 `employeeService.getEmployees` 获取数据。
- **验证**: Storybook 或页面测试，切换部门能更新人员列表。

## Task 3: Web端页面重构与集成
- **文件**: `packages/web/src/pages/attendance/leave/LeavePage.tsx`
- **内容**:
  - 引入 `DepartmentTree`，调整为左右布局。
  - 替换 `EmployeeId` 输入框为 `EmployeeSelect`。
  - 联动逻辑：选部门 -> 更新 `selectedDeptId` -> 触发 API 查询 & 更新 `EmployeeSelect`。
- **验证**: 完整功能测试：选部门 -> 列表刷新；选部门+选人 -> 列表刷新。
