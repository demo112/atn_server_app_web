# 每日报表功能优化记录

## 问题描述
用户对每日考勤报表提出以下优化需求：
1. **查询日期优化**：由单日查询改为时间范围查询（开始日期~结束日期），默认显示前一天数据。
2. **重算功能优化**：移除考勤计算的弹窗，改为直接触发系统级全员计算（基于当前筛选的日期范围）。

## 设计锚定
- **所属规格**：SW72 (统计报表)
- **原设计意图**：提供灵活的考勤数据查询和重算功能。
- **变更分析**：
  - 原设计使用单日查询，现扩展为日期范围以支持更灵活的时间段分析。
  - 原设计重算功能通过弹窗支持细粒度控制（选人），现简化为一键全员重算，提升操作效率。

## 修复/优化方案

### 前端 (`DailyStatsReport.tsx`)
1. **状态管理**：
   - 移除 `queryDate`，替换为 `startDate` 和 `endDate`。
   - 默认值设置为 `getYesterday()`。
   - 移除 `recalcModalVisible` 和 `recalcForm` 相关状态及代码。
2. **UI 调整**：
   - 将查询栏的单日选择器改为“开始日期”和“结束日期”两个选择器。
   - 移除“手动重算考勤”弹窗组件 (`StandardModal`)。
   - 更新“考勤计算”按钮点击事件，直接触发 `handleRecalculate`。
3. **逻辑更新**：
   - `fetchData`：传递 `startDate` 和 `endDate` 给后端 API。
   - `handleRecalculate`：直接调用 `triggerCalculation`，传入日期范围，不传 `employeeIds`（触发全员计算）。
   - `handleExport`：使用日期范围生成导出文件名和请求参数。

### 后端验证
- 确认 `statistics.controller.ts` 及 `attendance-scheduler.ts` 的 `triggerCalculation` 逻辑：
  - 当 `employeeIds` 为空时，调度器会查询所有员工并触发计算，符合“计算整个系统人员”的需求。

## 验证结果
- [x] **编译检查**：`npm run build` 通过。
- [x] **功能验证**：
  - 日期范围状态正确初始化为昨天。
  - 查询参数正确传递 `startDate` 和 `endDate`。
  - 重算请求正确发送日期范围且无 `employeeIds`。
  - 导出功能适配日期范围。

## 文档同步
- [ ] design.md：无需更新（API 契约已支持范围查询）。
- [ ] api-contract.md：无需更新。

## 提交信息
feat(statistics): 优化每日报表查询与重算功能

1. web: 将每日报表查询改为日期范围模式
2. web: 移除考勤重算弹窗，改为一键全员计算
3. web: 优化默认查询时间为前一天
