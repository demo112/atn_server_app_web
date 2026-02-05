# Tasks: 补签处理模块 (SW66)

## Task 1: 创建独立补签处理页面
- **状态**: [x] 已完成
- **文件**:
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx` (New)
  - `packages/web/src/routes/modules/attendance.tsx` (Modify) -> `packages/web/src/App.tsx`
- **内容**:
  - 创建页面组件，实现 UI Cloning (`incoming/web/signed`)
  - 实现筛选栏（日期、部门、状态）
  - 实现数据表格（带操作列）
  - 配置路由 `/attendance/correction-processing`
- **验证**: 编译通过

## Task 2: 集成补签交互逻辑
- **状态**: [x] 已完成
- **文件**:
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`
- **内容**:
  - 引入 `CheckInDialog` 和 `CheckOutDialog`
  - 实现“补签到”和“补签退”按钮点击逻辑
  - 实现补签成功后的列表刷新
- **验证**: 编译通过
