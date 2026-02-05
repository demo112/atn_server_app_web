# DailyStatsReport total 未定义修复记录

## 问题描述
- **现象**：进入统计仪表盘每日报表时页面报错。
- **错误信息**：`ReferenceError: total is not defined`。
- **位置**：`DailyStatsReport.tsx`。
- **影响范围**：统计报表 - 每日统计全字段报表页面崩溃。

## 设计锚定
- **所属规格**：SW72 (统计报表) / SW71
- **原设计意图**：报表需支持分页显示，展示总记录数。
- **当前偏离**：代码中使用了 `total`, `page`, `pageSize` 变量但未在组件内定义状态，导致运行时错误。

## 根因分析
- **直接原因**：组件状态 `total`, `page`, `pageSize` 缺失。
- **根本原因**：代码实现不完整，可能是复制粘贴或重构时遗漏了状态定义。
- **相关代码**：`packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 修复方案
- **修复思路**：补充缺失的 `useState` 定义，并完善 `fetchData` 的分页参数传递。
- **改动文件**：`packages/web/src/pages/statistics/DailyStatsReport.tsx`
- **具体改动**：
  1. 添加 `total`, `page`, `pageSize` 状态。
  2. 修改 `fetchData` 支持分页参数并更新 `total`。
  3. 修复 `StatusBadge` 组件中未使用的 `status` 变量警告。

## 验证结果
- [x] 原问题已解决：`total` 变量已定义，分页逻辑已补全。
- [x] 编译检查通过：`DailyStatsReport.tsx` 无类型错误。
- [x] 设计一致性确认：符合分页设计要求。

## 文档同步
- [ ] design.md：无需更新（代码修复符合原设计）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复每日报表 total 未定义错误

修复 DailyStatsReport 组件缺失的分页状态 (total, page, pageSize)，导致运行时崩溃的问题。
同时完善 fetchData 分页逻辑。
