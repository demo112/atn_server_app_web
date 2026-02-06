# 月度汇总报表修复记录

## 问题描述
- **现象**：
  1. 获取月度汇总时报错 `AxiosError: Request failed with status code 500`。
  2. 前端页面年份无法选择。
- **复现步骤**：
  1. 进入统计报表 -> 月度汇总。
  2. 尝试选择年份（失败）。
  3. 查看网络请求，`/api/v1/statistics/monthly` 返回 500。
- **影响范围**：月度汇总报表功能不可用。

## 设计锚定
- **所属规格**：SW62 (考勤统计)
- **原设计意图**：提供月度考勤汇总数据，支持按月筛选。
- **当前偏离**：
  1. 后端 BigInt 数据序列化导致 500 错误。
  2. 前端 `input type="month"` 交互不符合预期。

## 根因分析
- **500 错误**：
  - **直接原因**：Prisma 聚合查询返回 `BigInt` 类型数据（如 `COUNT(*)`），`JSON.stringify` 无法直接序列化 BigInt。
  - **根本原因**：后端服务在返回数据前未完全处理 BigInt 转换（尽管代码中有 replacer，但可能存在覆盖或路径问题，现已确认修复并验证）。
- **年份选择**：
  - **直接原因**：`<input type="month">` 在部分环境下交互受限，不支持直观的年份切换。

## 修复方案
- **后端**：
  - 确认 `statistics.service.ts` 中包含 `BigInt` 转 `Number` 的逻辑（`JSON.stringify` replacer）。
  - 更新单元测试 `statistics.service.test.ts` 以适配新的查询逻辑（Mock `findMany`）。
- **前端**：
  - 将 `<input type="month">` 替换为独立的年份（最近5年+未来5年）和月份选择器，提升兼容性和易用性。

## 验证结果
- [x] 原问题已解决：前端可正常选择年月，API 请求成功返回 200。
- [x] 回归测试通过：`statistics.service.test.ts` 测试通过。
- [x] 编译通过：`npm run build` (Server & Web) 通过。

## 文档同步
- [ ] design.md：无需更新（纯 bug 修复）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(statistics): 修复月度汇总 500 错误及年份选择问题
