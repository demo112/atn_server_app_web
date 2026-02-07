# 20260207 - 月度报表未来日期统计修复

## 问题描述
用户反馈“月度汇总报表”中，时间未到的日期也被计入“旷工”或“缺卡”次数。例如，在2月初查询整月报表时，未来日期的缺勤记录被统计在内，导致异常数据偏高。

## 根本原因
后端 `StatisticsService.getDepartmentSummary` 在聚合查询时，直接使用用户请求的结束日期（通常是月末）作为过滤条件。如果数据库中存在预生成的未来日期考勤记录（且状态默认为 absent/missing），这些记录会被计入统计。

## 解决方案
在统计逻辑中增加截止日期限制：`effectiveEndDate = min(queryEnd, now)`。
- 对于聚合统计（如旷工次数、缺卡次数），只统计 `work_date <= effectiveEndDate` 的记录。
- 对于每日详情（Grid），同样只返回 `work_date <= effectiveEndDate` 的记录，前端对于未返回的日期显示为 `-`。

## 变更文件
- `packages/server/src/modules/statistics/statistics.service.ts`: 修改 `getDepartmentSummary` 方法，增加日期过滤逻辑。

## 验证
- 新增回归测试 `packages/server/src/modules/statistics/statistics.regression.test.ts`。
- 测试用例模拟了包含昨天（已过）和明天（未来）的缺勤记录，验证统计结果只包含昨天的记录。
