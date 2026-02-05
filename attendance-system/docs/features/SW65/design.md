# 设计文档：排班管理 (SW65)

## 1. 核心逻辑：排班冲突处理策略

### 1.1 冲突定义

系统从**管理日期 (Administrative Date)** 和 **实际时间 (Real Time)** 两个维度定义冲突。

#### A. 日期重叠 (Date Overlap)
当 `(Existing.StartDate <= New.EndDate) AND (Existing.EndDate >= New.StartDate)` 时，判定为日期冲突。

#### B. 时间边界重叠 (允许并存，逻辑融合)
即使日期不重叠，如果相邻日期的班次因**跨天 (Overnight Shift)** 导致实际工作时间重叠，**不视为排班冲突，允许并在数据库中**。

系统将在**考勤计算阶段**采用“**新排班优先融合 (New Schedule Priority Fusion)**”策略处理：

*   **场景**：`Previous.EndDate` (跨天后) > `Next.StartDate`。
*   **策略**：`Next` (后一班次) 的开始时间构成 `Previous` (前一班次) 的**硬性截止墙 (Hard Cutoff)**。
*   **计算逻辑**：
    1.  `Previous` 的**有效结束时间 (Effective End Time)** 自动截断为 `Next.StartDate`。
    2.  重叠时间段内的打卡记录，优先归属于 `Next`。
    3.  `Previous` 的早退/缺勤判定，将基于截断后的结束时间计算。

> **示例**：
> - 1月1日 夜班: 22:00 - 次日 10:00
> - 1月2日 早班: 09:00 - 18:00
> - **融合结果**: 1月1日夜班的有效结束时间变为 **09:00**。09:00 之后的打卡归属 1月2日早班。

### 1.2 处理策略

系统支持两种模式（仅针对**日期重叠**）：

#### A. 严格模式 (默认, Force=false)
- **行为**：检测到**日期重叠**，立即抛出异常 `ERR_SCHEDULE_CONFLICT`。
- **注意**：时间边界重叠不报错，视为合法排班。
- **返回**：包含冲突的详情。
- **操作**：不进行任何数据库修改。

#### B. 覆盖模式 (Force=true)
- **行为**：以**新排班为准**，自动修改或删除旧排班以消除**日期重叠**。
- **算法（切断与拆分）**：
  对于每一个**日期冲突**的旧排班 record：

  1. **完全包含 (Obsolete)**
     - 条件：`Old.Start >= New.Start` && `Old.End <= New.End`
     - 动作：**删除**旧排班。

  2. **左侧重叠 (Trim Right)**
     - 条件：`Old.Start < New.Start` && `Old.End <= New.End`
     - 动作：更新 `Old.End = New.Start - 1 day`。
     - **融合**：若修改后仍有跨天时间重叠，交由计算引擎执行“融合策略”。

  3. **右侧重叠 (Trim Left)**
     - 条件：`Old.Start >= New.Start` && `Old.End > New.End`
     - 动作：更新 `Old.Start = New.End + 1 day`。
     - **融合**：若修改后仍有跨天时间重叠，交由计算引擎执行“融合策略”。

  4. **中间被切 (Split)**
     - 条件：`Old.Start < New.Start` && `Old.End > New.End`
     - 动作：
       - **左段**：`Old.End = New.Start - 1 day`。
       - **右段**：新增 `Start = New.End + 1 day`, `End = Old.End`。
     - **融合**：边界处的跨天重叠交由计算引擎处理。

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

### 2.4 约束限制
- **最大跨度**：单次排班创建跨度不能超过 1 年 (366天)。超出抛出 `ERR_INVALID_DATE_RANGE` (400)。

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

## 4. 关键实现细节

### 4.1 跨天判定逻辑
1. 读取 Shift 关联的 `AttTimePeriod`。
2. 如果 `endTime < startTime`，则判定为跨天（次日）。
3. 实际结束时间 = `Schedule.Date + 1 day + TimePeriod.endTime`。

### 4.2 冲突检测流程
1. **DB查询**：查找 `[New.Start, New.End]` 范围内的所有排班。
   - 仅关注日期重叠。
2. **内存过滤**：
   - 筛选出日期重叠的记录。
3. **决策**：
   - Force=false: 有日期重叠即报错 `ERR_SCHEDULE_CONFLICT`。
   - Force=true: 对日期重叠记录执行 Update/Delete。
   - **不检测时间边界冲突**：即使切断后产生物理时间重叠，也允许保存。
   - **警告**：虽然允许保存，但前端应提示用户存在跨天重叠，并说明融合规则。
