# Design: 全公司考勤统计与日历视图

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 管理员查看全公司每日统计 | API: `GET /api/attendance/stats/daily-summary`, App: `AttendanceRecordsScreen` (Company Tab) |
| Story 2: 统一的日历视图 | App: `AttendanceCalendar` 组件改造，支持 Personal/Company 两种模式 |

## 数据模型

不需要新增数据表，复用现有的 `DailyAttendance` 表进行统计。

## API定义

### GET /api/attendance/stats/daily-summary

获取指定日期范围的全公司每日考勤统计。

**Request:**
```typescript
interface GetDailyStatsQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}
```

**Response:**
```typescript
interface DailyStatsVo {
  date: string;          // YYYY-MM-DD
  expectedCount: number; // 应到人数（活跃员工数）
  actualCount: number;   // 实到人数（有打卡记录）
  attendanceRate: number;// 出勤率 (0-100)
  abnormalCount: number; // 异常人数（迟到/早退/缺卡）
  totalEmployees: number;// 总人数
}

interface GetDailyStatsResponse {
  success: boolean;
  data: DailyStatsVo[];
}
```

**权限**: 仅管理员 (`admin`) 可访问。

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/shared/src/types/attendance/stats.ts | 新增 | `DailyStatsVo` 类型定义 |
| packages/server/src/modules/statistics/statistics.controller.ts | 修改 | 添加 `getDailyStats` 方法 |
| packages/server/src/modules/statistics/statistics.service.ts | 修改 | 实现 `getDailyStats` 统计逻辑 |
| packages/server/src/modules/statistics/statistics.routes.ts | 修改 | 注册 `/daily-summary` 路由 |
| packages/app/src/services/statistics.ts | 修改 | 添加 `getDailyStats` API 调用 |
| packages/app/src/screens/attendance/AttendanceRecords.tsx | 修改 | 添加 Tab 切换，集成日历视图 |
| packages/app/src/screens/attendance/AttendanceCalendar.tsx | 修改 | 改造为通用日历组件，支持显示统计数据 |

## 详细设计

### 1. Server: StatisticsService

```typescript
class StatisticsService {
  async getDailyStats(query: GetDailyStatsQuery): Promise<DailyStatsVo[]> {
    const { startDate, endDate } = query;
    // 使用 Prisma Raw Query 进行聚合统计
    // 补全日期范围内的空缺数据
  }
}
```

### 2. App: AttendanceCalendar 改造

增加 `viewMode` 状态：

```typescript
const [viewMode, setViewMode] = useState<'personal' | 'company'>('personal');
```

- **Personal Mode**: 保持现有逻辑，显示圆点。
- **Company Mode**:
  - 管理员可见。
  - 显示公司整体统计数据（出勤率、异常数）。
  - 下方显示选中日期的详细统计（应到、实到、出勤率、异常）。

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 考勤记录页面 | 布局结构改变，从列表变为 Tab + 日历 | 中 |
| 现有 API | 无影响，复用 Statistics 模块 | 低 |

## 技术决策

- **统计数据源**：
  - 应到人数 = 活跃员工数（简单粗暴，忽略排班）。
  - 实到人数 = `DailyAttendance` 中有打卡记录的人数。
  - 异常人数 = `DailyAttendance` 中状态为异常的人数。
  - 采用了 Prisma Raw Query 优化性能。
  - 在 Service 层进行了日期补全，确保每天都有数据。

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 数据量大导致统计慢 | 页面加载延迟 | 仅统计单月，且 Server 端加缓存（可选） |
| 应到人数统计不准 | 统计数据误导 | MVP 阶段明确口径：应到=活跃员工总数 |

## 需要人决策

- [x] 统计口径确认：**应到人数** 是否可以直接取 **当前活跃员工总数**？
  - 决定：是的，MVP 阶段先取活跃员工总数。
