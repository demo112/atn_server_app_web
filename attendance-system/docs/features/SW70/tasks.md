# Tasks: SW70 考勤汇总

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 5 |
| 涉及模块 | statistics |
| 涉及端 | Server, Web |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：后端核心

#### Task 1: 定义共享类型 (已完成)
- **文件**: `packages/shared/src/types/statistics.ts`
- **内容**: 定义 `GetSummaryDto`, `AttendanceSummaryVO` 等类型
- **验证**: `npm run type-check` (在 server/web 目录下)
- **依赖**: 无

#### Task 2: 实现统计服务与单元测试 (已完成)
- **文件**: 
  - `packages/server/src/modules/statistics/statistics.service.ts`
  - `packages/server/src/modules/statistics/statistics.service.test.ts`
- **内容**: 
  - 实现 `getDepartmentSummary` 方法：聚合 `AttDailyRecord` 和 `AttLeave` 数据
  - 编写单元测试，Mock Prisma 数据验证聚合逻辑
- **验证**: `npm run test -- statistics.service`
- **依赖**: Task 1

#### Task 3: 实现统计接口与路由
- **文件**: 
  - `packages/server/src/modules/statistics/statistics.controller.ts`
  - `packages/server/src/modules/statistics/statistics.routes.ts`
  - `packages/server/src/app.ts`
- **内容**: 实现 API 接口，并挂载到 `/api/v1/statistics`
- **验证**: 使用 Postman 或 curl 访问接口验证
- **依赖**: Task 2

### 阶段2：前端页面

#### Task 4: 实现考勤汇总页面
- **文件**: 
  - `packages/web/src/pages/statistics/SummaryPage.tsx`
  - `packages/web/src/pages/statistics/components/SummaryTable.tsx` (可选拆分)
- **内容**: 
  - 实现查询表单（日期范围、部门选择）
  - 实现数据表格展示
  - 实现导出 Excel 功能 (`xlsx` 库)
- **验证**: 启动 Web 端，访问页面查看展示和导出功能
- **依赖**: Task 3

#### Task 5: 配置前端路由 (已完成)
- **文件**: `packages/web/src/App.tsx`
- **内容**: 添加 `/statistics/summary` 路由及菜单入口
- **验证**: 点击菜单能正确跳转
- **依赖**: Task 4

## 检查点策略

| 时机 | 操作 |
|------|------|
| Task 2 完成后 | 必须通过单元测试 `npm run test` |
| Task 4 完成后 | 必须验证导出功能是否可用 |
| 全部完成后 | `npm run lint` 确保无代码风格问题 |
