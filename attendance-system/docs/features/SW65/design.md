# 设计文档：排班管理 (SW65)

## 1. 核心逻辑：排班冲突处理策略

### 1.1 冲突定义
当 `(Existing.StartDate <= New.EndDate) AND (Existing.EndDate >= New.StartDate)` 时，判定为时间冲突。

### 1.2 处理策略
系统支持两种模式：

#### A. 严格模式 (默认, Force=false)
- **行为**：检测到任何冲突，立即抛出异常 `ERR_SCHEDULE_CONFLICT`。
- **返回**：包含冲突的详情（人员、日期、旧排班ID）。
- **操作**：不进行任何数据库修改。

#### B. 覆盖模式 (Force=true)
- **行为**：以**新排班为准**，自动修改或删除旧排班以消除重叠。
- **算法（切断与拆分）**：
  对于每一个冲突的旧排班 record：

  1. **完全包含 (Obsolete)**
     - 条件：`Old.Start >= New.Start` && `Old.End <= New.End`
     - 动作：**删除**旧排班。

  2. **左侧重叠 (Trim Right)**
     - 条件：`Old.Start < New.Start` && `Old.End <= New.End`
     - 动作：更新 `Old.End = New.Start - 1 day`。

  3. **右侧重叠 (Trim Left)**
     - 条件：`Old.Start >= New.Start` && `Old.End > New.End`
     - 动作：更新 `Old.Start = New.End + 1 day`。

  4. **中间被切 (Split)**
     - 条件：`Old.Start < New.Start` && `Old.End > New.End`
     - 动作：
       - 更新 `Old.End = New.Start - 1 day` (保留左段)。
       - 新增一条排班：`Start = New.End + 1 day`, `End = Old.End` (创建右段)。

## 2. API 设计

### 2.1 创建排班 (单人)
- **POST** `/api/v1/attendance/schedules`
- **Body**:
  ```typescript
  {
    employeeId: number;
    shiftId: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    force?: boolean;   // default false
  }
  ```

### 2.2 批量排班 (部门)
- **POST** `/api/v1/attendance/schedules/batch`
- **Body**:
  ```typescript
  {
    departmentIds: number[];
    shiftId: number;
    startDate: string;
    endDate: string;
    force?: boolean;
    includeSubDepartments?: boolean; // 是否包含子部门
  }
  ```

### 2.3 查询排班
- **GET** `/api/v1/attendance/schedules`
- **Query**: `employeeId`, `departmentId`, `startDate`, `endDate`

## 3. 数据模型 (Prisma)
沿用现有 `AttSchedule` 模型：
```prisma
model AttSchedule {
  id         Int      @id @default(autoincrement())
  employeeId Int
  shiftId    Int
  startDate  DateTime @db.Date
  endDate    DateTime @db.Date
  // ... relations
}
```
