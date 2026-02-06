# Tasks: 全公司考勤统计与日历视图

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | attendance |
| 涉及端 | Server, App |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：类型定义

#### Task 1: 定义每日统计数据类型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/attendance/stats.ts` |
| 操作 | 新增 |
| 内容 | 定义 `DailyStatsVo` 和 `GetDailyStatsQuery` 接口 |
| 验证 | 命令: `npm run type-check -w packages/shared` |
|      | 预期: 退出码 0，无类型错误 |
| 预计 | 5 分钟 |
| 依赖 | 无 |
| 状态 | ✅ 完成 |

### 阶段2：服务端实现

#### Task 2: 实现考勤统计服务

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-stats.service.ts` |
| 操作 | 新增 |
| 内容 | 实现 `getDailyStats` 方法，按照MVP口径（应到=活跃员工数）统计 |
| 验证 | 命令: `npm run test -- attendance-stats.service.test.ts` (需创建测试文件) |
|      | 预期: 所有测试通过，退出码 0 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |
| 状态 | ✅ 完成 |

#### Task 3: 实现考勤统计接口

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-stats.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 新增/修改 |
| 内容 | 创建 Controller，注册 `/stats/daily-summary` 路由，仅管理员可访问 |
| 验证 | 命令: `curl -s "http://localhost:3000/api/v1/attendance/stats/daily-summary?month=2024-02" -H "Authorization: Bearer $ADMIN_TOKEN"` |
|      | 预期: HTTP 200, 返回 `{success:true, data:[...]}` |
| 预计 | 10 分钟 |
| 依赖 | Task 2 |
| 状态 | ✅ 完成 |

### 阶段3：App端实现

#### Task 4: 添加统计API服务调用

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/services/statistics.ts` |
| 操作 | 修改/新增 |
| 内容 | 添加 `getDailyStats` 方法调用后端接口 |
| 验证 | 命令: `npm run type-check -w packages/app` |
|      | 预期: 退出码 0，无类型错误 |
| 预计 | 5 分钟 |
| 依赖 | Task 1 |
| 状态 | ✅ 完成 |

#### Task 5: 改造日历组件支持公司模式

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/attendance/AttendanceCalendar.tsx` |
| 操作 | 修改 |
| 内容 | 增加 `mode` 属性，支持 'company' 模式，自定义渲染统计数据（如出勤率） |
| 验证 | 命令: `npm run lint -- packages/app/src/screens/attendance/AttendanceCalendar.tsx` |
|      | 预期: 无 Lint 错误 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |
| 状态 | ✅ 完成 |

#### Task 6: 集成考勤记录页面

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/attendance/AttendanceRecords.tsx`<br>`packages/app/src/screens/attendance/components/DayStatsCard.tsx` |
| 操作 | 修改/新增 |
| 内容 | 添加 Tab 切换（个人/公司），集成 `AttendanceCalendar` 和 `DayStatsCard` |
| 验证 | 命令: `npm run lint -- packages/app/src/screens/attendance/AttendanceRecords.tsx` |
|      | 预期: 无 Lint 错误 |
| 预计 | 10 分钟 |
| 依赖 | Task 5, Task 4 |
| 状态 | ✅ 完成 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| Server端完成后 | 验证 API 接口连通性 |
| 全部完成后 | 手动验证 App 端日历展示和 Tab 切换 |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 2 | 统计性能可能较慢 | MVP先实现功能，后续可加缓存 |
| Task 5 | 日历组件自定义渲染可能样式错乱 | 需要多机型简单验证布局 |
