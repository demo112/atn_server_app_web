# Tasks: 统计报表 UI 复刻

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | web/statistics |
| 涉及端 | Web |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：基础准备

#### Task 1: 创建类型定义与 Mock 数据 [Completed]
- **文件**:
  - `packages/web/src/pages/statistics/types.ts`
  - `packages/web/src/pages/statistics/mockData.ts`
- **内容**:
  - 定义 `StatisticsPageType`, `DailyStats`, `MonthlyStats`, `UserCard` 等接口
  - 迁移 incoming 代码中的 Mock 数据
- **验证**: `npm run type-check` 无报错
- **依赖**: 无

### 阶段2：页面组件实现

#### Task 2: 实现统计报表仪表盘 [Completed]
- **文件**: `packages/web/src/pages/statistics/StatisticsDashboard.tsx`
- **内容**:
  - 实现三个入口卡片（每日统计、月度汇总、月度卡表）
  - 实现 Hover 渐变动效
  - 实现点击导航跳转
- **验证**: 页面显示正常，卡片交互流畅
- **依赖**: Task 1

#### Task 3: 实现每日统计报表 [Completed]
- **文件**: `packages/web/src/pages/statistics/DailyStatsReport.tsx`
- **内容**:
  - 实现日期范围筛选器
  - 实现多列 Sticky Header 表格
  - 实现打卡时段颜色区分
- **验证**: 表格横向滚动时表头和前两列固定
- **依赖**: Task 1

#### Task 4: 实现月度汇总报表 [Completed]
- **文件**: `packages/web/src/pages/statistics/MonthlySummaryReport.tsx`
- **内容**:
  - 实现 31 天列宽表格
  - 实现考勤状态代码渲染（正常/迟到/早退等）
  - 实现底部汇总行
- **验证**: 表格渲染 31 天数据，布局不崩坏
- **依赖**: Task 1

#### Task 5: 实现月度卡表视图 [Completed]
- **文件**: `packages/web/src/pages/statistics/MonthlyCardReport.tsx`
- **内容**:
  - 实现人员卡片列表
  - 实现详情模态框 (Modal)
  - 实现模态框内的日历表格和统计数据
- **验证**: 点击人员卡片弹出模态框，数据显示正确
- **依赖**: Task 1

### 阶段3：集成与导航

#### Task 6: 配置路由与菜单 [Completed]
- **文件**:
  - `packages/web/src/components/layout/Sidebar.tsx`
  - `packages/web/src/App.tsx`
- **内容**:
  - 在 `Sidebar` 中添加"统计报表"下的子菜单
  - 在 `App.tsx` 中注册 4 个新页面的路由
- **验证**: 侧边栏点击可正确跳转到各新页面
- **依赖**: Task 2, Task 3, Task 4, Task 5

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证组件无报错 → git commit |
| 全部完成后 | 启动 Web 端进行完整交互测试 |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 3/4 | 表格列数过多导致布局溢出 | 使用 Tailwind `min-w-max` 和 `overflow-x-auto` 确保滚动 |
| Task 6 | 路由路径冲突 | 确保使用 `/statistics/report/*` 独立命名空间 |
