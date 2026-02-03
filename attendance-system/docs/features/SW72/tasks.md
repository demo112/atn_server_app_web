# Tasks: 统计报表 (SW72)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | statistics |
| 涉及端 | Server, Web |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：Server端实现

#### Task 1: DTO与业务逻辑实现 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/statistics/statistics.dto.ts`<br>`packages/server/src/modules/statistics/statistics.service.ts` |
| 操作 | 修改 |
| 内容 | 1. 定义GetDeptStatsDto, GetChartStatsDto, ExportStatsDto<br>2. 实现getDeptStats聚合查询<br>3. 实现getChartStats图表数据<br>4. 实现exportStats导出Excel逻辑 |
| 验证 | `npm test src/modules/statistics` |
| 预计 | 20 分钟 |
| 依赖 | 无 |

#### Task 2: 接口层与集成测试 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/statistics/statistics.controller.ts`<br>`packages/server/src/modules/statistics/statistics.integration.test.ts` |
| 操作 | 修改 |
| 内容 | 1. 新增 /departments, /charts, /export 接口<br>2. 补充集成测试用例覆盖新接口 |
| 验证 | `npm test src/modules/statistics/statistics.integration.test.ts` |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

### 阶段2：Web端实现

#### Task 3: API定义与图表组件 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/services/statistics.ts`<br>`packages/web/src/types/statistics.ts`<br>`packages/web/src/pages/statistics/components/AttendanceCharts.tsx` |
| 操作 | 新增/修改 |
| 内容 | 1. 定义前端API与类型<br>2. 实现AttendanceCharts组件(基于Recharts) |
| 验证 | 启动Web服务验证组件渲染 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

#### Task 4: 报表页面与导出集成 (已完成)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/statistics/ReportPage.tsx`<br>`packages/web/src/pages/statistics/components/DeptStatsTable.tsx` |
| 操作 | 新增 |
| 内容 | 1. 实现DeptStatsTable表格组件<br>2. 组装ReportPage页面<br>3. 集成Excel导出功能 |
| 验证 | 端到端验证页面展示与导出功能 |
| 预计 | 10 分钟 |
| 依赖 | Task 3 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| Server端完成后 | 运行后端集成测试 |
| 全部完成后 | Web端手动验证 + 文档同步 |
