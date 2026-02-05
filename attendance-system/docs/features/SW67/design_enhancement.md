# Design: 请假管理 - 部门树筛选增强

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 部门筛选 | API: 修改 `GET /api/v1/leaves` 支持递归 `deptId` 查询<br>UI: 引入 `DepartmentTree` 组件 |
| Story 2: 人员联动 | UI: 新增 `EmployeeSelect` 组件，监听 `deptId` 变化刷新列表 |

## API 设计

### GET /api/v1/leaves (修改)

**Query Parameters:**
- `deptId`: 部门ID（**变更**: 改为递归查询，包含该部门及其所有子部门的员工）
- `employeeId`: 员工ID（保持不变）

**逻辑变更:**
1. 接收 `deptId`
2. 调用 `DepartmentService.getSubDepartmentIds(deptId)` 获取所有子部门 ID 列表
3. 查询条件 `where.employee.deptId` 使用 `in: [deptId, ...subDeptIds]`

## 模块设计

### 1. DepartmentService (Server)

新增方法：
```typescript
/**
 * 获取指定部门及其所有子部门的ID列表
 */
async getSubDepartmentIds(rootId: number): Promise<number[]>
```
实现逻辑：使用广度优先搜索 (BFS) 遍历内存中的部门树（或数据库查询）。考虑到部门数量不多，可先查出所有部门再在内存处理，或使用递归查询。

### 2. LeavePage (Web)

**布局变更:**
```tsx
<div className="flex h-full">
  <div className="w-64 border-r bg-gray-50 p-4">
    <DepartmentTree onSelect={handleDeptSelect} />
  </div>
  <div className="flex-1 p-6">
    {/* Filter Bar & Table */}
  </div>
</div>
```

**组件交互:**
- `selectedDeptId` 状态提升至 Page
- `EmployeeSelect` 组件接收 `deptId` prop，当 `deptId` 变化时重新 fetch options
- Filter Bar 移除 `EmployeeID` input，替换为 `EmployeeSelect`

## 文件变更清单

| 模块 | 文件 | 操作 | 说明 |
|------|------|------|------|
| Server | `src/modules/department/department.service.ts` | 修改 | 新增 `getSubDepartmentIds` |
| Server | `src/modules/attendance/leave.service.ts` | 修改 | `findAll` 支持递归部门查询 |
| Web | `src/pages/attendance/leave/LeavePage.tsx` | 修改 | 调整布局，集成部门树和人员选择 |
| Web | `src/components/common/EmployeeSelect.tsx` | 新增 | 封装人员选择组件 |
