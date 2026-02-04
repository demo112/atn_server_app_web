# Design: App样式复刻Web

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 全局主题复刻 | 创建 `src/theme.ts` 定义 RN Paper Theme，在 `App.tsx` 中注入 |
| Story 2: 登录页样式复刻 | 修改 `LoginScreen.tsx`，使用自定义 Theme 和样式 |
| Story 3: 核心功能页样式复刻 | 修改 `ClockInScreen`, `LeaveScreen`, `CorrectionScreen`, `HistoryScreen`, `ScheduleScreen` 等 |
| Story 4: 管理功能页样式复刻 | 修改 `DepartmentList`, `EmployeeList`, `UserList`, `ShiftList` 及其编辑页 |

## 样式映射 (Tailwind -> RN Paper)

| Tailwind Token | RN Paper Theme Property | Value |
|----------------|-------------------------|-------|
| `colors.primary` (#4A90E2) | `colors.primary` | #4A90E2 |
| `colors.background.light` (#F3F4F6) | `colors.background` | #F3F4F6 |
| `colors.card.light` (#ffffff) | `colors.surface` | #ffffff |
| `colors.text` (默认) | `colors.onSurface` | #111827 |
| `borderRadius.DEFAULT` (8px) | `roundness` | 2 |

## 文件变更清单

### 1. 基础设施
| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/app/src/theme.ts` | 新增 | 定义 `appTheme` |
| `packages/app/src/App.tsx` | 修改 | 注入 `PaperProvider` |

### 2. 员工端页面
| 文件 | 操作 | 内容 |
|------|------|------|
| `src/screens/auth/LoginScreen.tsx` | 修改 | 适配 Paper 组件 |
| `src/screens/HomeScreen.tsx` | 修改 | 适配 Paper Grid |
| `src/screens/attendance/ClockInScreen.tsx` | 修改 | 适配打卡按钮和状态展示 |
| `src/screens/attendance/LeaveScreen.tsx` | 修改 | 适配表单和列表 |
| `src/screens/attendance/CorrectionScreen.tsx` | 修改 | 适配表单和列表 |
| `src/screens/attendance/HistoryScreen.tsx` | 修改 | 适配记录列表 |
| `src/screens/attendance/ScheduleScreen.tsx` | 修改 | 适配日历和排班列表 |
| `src/screens/attendance/AttendanceCalendar.tsx` | 修改 | 适配日历样式 |
| `src/screens/attendance/AttendanceRecords.tsx` | 修改 | 适配记录 Item |

### 3. 管理端页面
| 文件 | 操作 | 内容 |
|------|------|------|
| `src/screens/organization/department/DepartmentListScreen.tsx` | 修改 | 适配列表 |
| `src/screens/organization/employee/EmployeeListScreen.tsx` | 修改 | 适配列表 |
| `src/screens/organization/user/UserListScreen.tsx` | 修改 | 适配列表 |
| `src/screens/shift/ShiftListScreen.tsx` | 修改 | 适配列表 |
| `src/screens/organization/*/EditScreen.tsx` | 修改 | 适配表单 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 主题方案 | React Native Paper Theme | 成本最低，一致性好 |
| 列表组件 | ScrollView + Card / FlatList | 统一使用 Paper Card 作为列表项容器 |
| 表单组件 | Paper TextInput | 统一输入框交互和视觉 |
| 布局容器 | Surface | 使用 Surface 替代 View 作为页面背景容器，自动适配深色模式 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 样式兼容性 | 部分 CSS 属性在 RN 中不支持 | 使用 RN 兼容的样式替代 |
| 导航栏样式 | React Navigation 默认样式不一致 | 在 NavigationContainer 中配置 theme |
| 工作量 | 涉及页面较多 | 按优先级分批执行：Home/Login -> 员工端 -> 管理端 |
