# Design: 统计报表 (SW72)

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 部门考勤统计 | API: `GET /api/v1/statistics/departments`, 组件: `DeptStatsTable` |
| Story 2: 考勤概览图表 | API: `GET /api/v1/statistics/charts`, 组件: `AttendanceCharts` |
| Story 3: 导出统计报表 | API: `GET /api/v1/statistics/export`, 组件: `ExportButton` |

## 数据模型

复用现有 `AttDailyRecord` 和 `Department` 模型，进行聚合查询。

## API定义

### GET /api/v1/statistics/departments

查询部门维度的考勤统计数据。

**Request:**
```typescript
interface GetDeptStatsDto {
  month: string; // YYYY-MM
  deptId?: number;
}
```

**Response:**
```typescript
interface DeptStatsVo {
  deptId: number;
  deptName: string;
  totalHeadcount: number; // 总人数
  normalCount: number;    // 正常出勤人次
  lateCount: number;      // 迟到人次
  earlyLeaveCount: number;// 早退人次
  absentCount: number;    // 缺勤人次
  leaveCount: number;     // 请假人次
  attendanceRate: number; // 出勤率 (0-100)
}

type Response = { items: DeptStatsVo[] };
```

### GET /api/v1/statistics/charts

查询图表统计数据。

**Request:**
```typescript
interface GetChartStatsDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}
```

**Response:**
```typescript
interface ChartStatsVo {
  dailyTrend: {
    date: string;
    attendanceRate: number;
  }[];
  statusDistribution: {
    status: string; // normal/late/early/absent/leave
    count: number;
  }[];
}
```

### GET /api/v1/statistics/export

导出部门统计报表。

**Request:**
```typescript
interface ExportStatsDto {
  month: string; // YYYY-MM
  deptId?: number;
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Body: Binary Buffer (Excel File)

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/server/src/modules/statistics/statistics.controller.ts` | 修改 | 新增 stats/charts/export 接口 |
| `packages/server/src/modules/statistics/statistics.service.ts` | 修改 | 新增聚合查询与导出逻辑 |
| `packages/server/src/modules/statistics/statistics.dto.ts` | 修改 | 新增 DTO 定义 |
| `packages/web/src/pages/statistics/ReportPage.tsx` | 新增 | 统计报表页面 |
| `packages/web/src/pages/statistics/components/DeptStatsTable.tsx` | 新增 | 部门统计表格 |
| `packages/web/src/pages/statistics/components/AttendanceCharts.tsx` | 新增 | 图表组件 (Recharts) |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 图表库 | Recharts | React 生态成熟，轻量级 |
| Excel 导出 | exceljs | 后端生成，性能好，支持复杂格式 |
| 聚合方式 | Prisma GroupBy | 数据库原生聚合，减少内存开销 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 导出大数据量超时 | 接口超时 | 限制单次导出月份跨度，或改异步导出 |
| 聚合查询性能 | 响应慢 | 确保 `work_date` 和 `dept_id` 索引 |
