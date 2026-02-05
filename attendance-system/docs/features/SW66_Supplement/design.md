# Design: 补签处理模块集成 (SW66)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 每日考勤列表支持补签操作 | 修改 `AttendanceDetailsPage.tsx`，集成 `CheckInDialog`/`CheckOutDialog` |

## 页面设计

### 新增页面: 补签处理 (CorrectionProcessingPage)

**路径**: `/attendance/correction/processing`
**文件**: `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

**UI 结构 (Cloning incoming/web/signed)**:
1.  **Header**: 标题 "补签处理"
2.  **Filter Bar**:
    *   日期范围 (DateRangePicker)
    *   部门选择 (DepartmentSelect)
    *   人员搜索 (Input)
    *   状态筛选 (Select: 缺卡/迟到/早退)
    *   按钮: 查询, 重置
3.  **Data Table**:
    *   Columns: 工作日, 部门, 工号, 姓名, 班次, 上下班时间, 签到/退时间, 状态, **操作**
    *   Style: Tailwind CSS (参考 `incoming/web/signed/App.tsx`)
4.  **Pagination**: 标准分页控件
5.  **Modals**:
    *   `CheckInDialog` (Existing)
    *   `CheckOutDialog` (Existing)

## API 交互

### 数据获取
*   **GET** `/attendance/daily` (复用 `getDailyRecords`)
    *   Params: `startDate`, `endDate`, `deptId`, `keyword`, `status`
    *   Response: `PaginatedResponse<DailyRecordVo>`

### 补签操作
*   **POST** `/attendance/correction/check-in` (Existing)
*   **POST** `/attendance/correction/check-out` (Existing)

## 路由配置
在 `packages/web/src/routes/index.tsx` (或模块路由配置) 中添加:
```typescript
{
  path: 'correction/processing',
  element: <CorrectionProcessingPage />
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx` | 新增 | 独立补签处理页面，UI Clone |
| `packages/web/src/routes/modules/attendance.tsx` | 修改 | 注册新路由 |

## 决策点

- [x] 复用现有的 Dialog 组件，确保 UI 一致性。
- [x] 操作按钮显示逻辑：优先处理缺卡，其次处理异常状态。
