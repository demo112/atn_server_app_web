# Design: 统计报表 UI 仿制

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: 仪表盘 | 页面 `StatisticsDashboard.tsx`，显示导航卡片 |
| Story 2: 每日统计 | 页面 `DailyStatsReport.tsx`，使用 Mock 数据展示复杂表格 |
| Story 3: 月度汇总 | 页面 `MonthlySummaryReport.tsx`，使用 Mock 数据展示汇总表 |
| Story 4: 月度卡表 | 页面 `MonthlyCardReport.tsx`，包含列表和详情 Modal |

## 数据模型 (Frontend Types)

将在 `packages/web/src/pages/statistics/types.ts` 中定义：

```typescript
export type PageType = 'dashboard' | 'daily_stats' | 'monthly_summary' | 'monthly_card';

export interface DailyRecord {
  id: string;
  name: string;
  department: string;
  employeeId: string;
  date: string;
  attendanceGroup: string;
  shift: string;
  shifts: {
    time: string;
    status: '正常' | '迟到' | '早退' | '缺卡' | '未签到' | '不需打卡';
  }[];
  // ... 其他统计字段
}

export interface MonthlySummaryRecord {
  // ... 对应 MonthlySummary 字段
}
```

## API定义

本次任务专注于 UI 移植，暂时使用本地 Mock 数据。
后续需对接 API：
- `GET /api/v1/stats/daily` (对应 DailyStats)
- `GET /api/v1/stats/monthly` (对应 MonthlySummary)
- `GET /api/v1/stats/card` (对应 MonthlyCard)

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/web/src/pages/statistics/types.ts | 新增 | 类型定义 |
| packages/web/src/pages/statistics/mockData.ts | 新增 | Mock 数据 (复用 incoming 代码) |
| packages/web/src/pages/statistics/StatisticsDashboard.tsx | 新增 | 仪表盘页面 |
| packages/web/src/pages/statistics/DailyStatsReport.tsx | 新增 | 每日统计页面 |
| packages/web/src/pages/statistics/MonthlySummaryReport.tsx | 新增 | 月度汇总页面 |
| packages/web/src/pages/statistics/MonthlyCardReport.tsx | 新增 | 月度卡表页面 |
| packages/web/src/components/layout/Sidebar.tsx | 修改 | 更新侧边栏链接 |
| packages/web/src/App.tsx | 修改 | 注册新路由 |

## 引用的已有代码

- `packages/web/src/components/layout/Sidebar.tsx` - 需修改菜单结构
- `incoming/web/statistical_report/*` - 参考代码

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 侧边栏导航 | 菜单项增加，原有 `Statistics` 菜单结构改变 | 低 |
| 路由系统 | 新增路由，无破坏性变更 | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据来源 | 本地 Mock | 优先保证 UI 还原度，后端 API 尚未就绪 |
| 样式方案 | Tailwind CSS | 保持与 incoming 代码和现有项目一致 |
| 图标库 | Material Icons | 复用 incoming 代码的图标类名 (需确认 index.html 引入) |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| Material Icons 缺失 | 图标不显示 | 检查 index.html，如缺失则添加 CDN 链接 |
| Tailwind 版本差异 | 样式微调 | 手动调整不兼容的类名 |

## 需要人决策

- [ ] 确认是否接受暂时使用 Mock 数据进行 UI 演示？(默认假设：是)
