# Design: 请假/出差管理 (SW67)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 记录管理 | API: GET/POST/PUT/DELETE `/api/v1/leaves` |
| Story 2: 考勤关联 | `AttendanceCalculator` 服务中集成 `LeaveService` 查询逻辑 |

## 数据模型

复用已有的 `AttLeave` 模型，无需修改 Schema。

```prisma
model AttLeave {
  id         Int         @id @default(autoincrement())
  employeeId Int         @map("employee_id")
  type       LeaveType
  startTime  DateTime    @map("start_time")
  endTime    DateTime    @map("end_time")
  reason     String?     @db.VarChar(500)
  status     LeaveStatus @default(pending) // 业务逻辑中直接设为 approved
  approverId Int?        @map("approver_id") // 记录录入人
  approvedAt DateTime?   @map("approved_at") // 记录录入时间
  // ... 其他字段
}

enum LeaveType {
  annual, sick, personal, business_trip, // ...
}
```

## API 设计

### 1. 查询请假记录
- **Method**: `GET /api/v1/leaves`
- **Query**:
  - `deptId`: 部门ID（可选，递归查询）
  - `employeeId`: 人员ID（可选）
  - `startTime`: 开始日期
  - `endTime`: 结束日期
  - `type`: 假期类型（可选）
- **Response**: `{ items: AttLeave[], total: number }`

### 2. 新增请假记录
- **Method**: `POST /api/v1/leaves`
- **Body**:
  ```typescript
  {
    employeeId: number;
    type: LeaveType;
    startTime: string; // ISO DateTime
    endTime: string;   // ISO DateTime
    reason?: string;
  }
  ```
- **Logic**:
  - 校验时间范围（结束时间 > 开始时间）
  - 校验是否存在时间重叠的已有记录
  - 设置 `status = approved`
  - 设置 `approverId = currentUser.id`
  - 设置 `approvedAt = now()`

### 3. 更新请假记录
- **Method**: `PUT /api/v1/leaves/:id`
- **Body**: 同新增（部分更新）
- **Logic**:
  - 只能修改基本信息，不可修改 `employeeId`
  - 重新校验时间重叠（排除自身）

### 4. 删除请假记录
- **Method**: `DELETE /api/v1/leaves/:id`

## Web 界面设计

### 页面结构
- 路径: `/attendance/leaves`
- 布局: 左侧部门树，右侧数据表格

### 组件
1. **LeaveList**: 表格展示
   - 列：姓名、部门、类型、开始时间、结束时间、时长、原因、录入人
   - 操作：编辑、删除
2. **LeaveFormModal**: 新增/编辑弹窗
   - 字段：
     - 人员（下拉选择/搜索，受部门树联动）
     - 类型（下拉枚举）
     - 时间范围（日期时间选择器）
     - 原因（文本域）

## 考勤计算逻辑变更

在 `AttendanceCalculator.calculateDaily(employeeId, date)` 中：

1. 获取该员工当天的班次时间段。
2. 查询该员工在该日期的所有 `approved` 请假记录。
3. **计算逻辑**:
   - 如果请假时间覆盖了整个班次 -> 状态设为 `Leave` 或 `BusinessTrip`，`absentMinutes` = 0（根据 Logic B，虽不算有效，但不记为缺勤异常）。
   - 如果部分覆盖 -> 扣除重叠部分的应出勤时长，减少迟到/早退/缺勤的判定阈值。
   - **当前简化实现**：
     - 若 `LeaveType == business_trip` -> 状态 `AttendanceStatus.business_trip`
     - 其他类型 -> 状态 `AttendanceStatus.leave`
     - 且 `absentMinutes` 置为 0，`lateMinutes` 置为 0，`earlyLeaveMinutes` 置为 0。
     - `effectiveMinutes` = 实际打卡时长（不包含请假时长，因为 Logic B 不算有效工时）。

## 文件变更清单

| 模块 | 文件 | 操作 | 说明 |
|------|------|------|------|
| Server | `src/modules/attendance/leave.dto.ts` | 新增 | DTO 定义 |
| Server | `src/modules/attendance/leave.service.ts` | 新增 | 业务逻辑 |
| Server | `src/modules/attendance/leave.controller.ts` | 新增 | 控制器 |
| Server | `src/modules/attendance/attendance.routes.ts` | 修改 | 注册路由 |
| Server | `src/modules/attendance/services/attendance-calculator.ts` | 修改 | 集成请假逻辑 |
| Web | `src/pages/attendance/leaves/index.tsx` | 新增 | 列表页 |
| Web | `src/pages/attendance/leaves/components/LeaveForm.tsx` | 新增 | 表单组件 |
| Web | `src/services/leave.ts` | 新增 | API 调用 |
