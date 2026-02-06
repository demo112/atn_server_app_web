# E2E测试工具类缺失方法修复记录

## 问题描述
- **现象**：在编写补卡、考勤明细等模块的 E2E 测试时，无法通过 `testData` 工厂快速生成前置数据，导致测试编写受阻或需要手动模拟复杂流程。
- **复现步骤**：尝试编写 `correction.spec.ts`，需要预先存在“缺卡”或“正常”的考勤记录，以及补卡申请记录。
- **影响范围**：E2E 测试开发效率，测试覆盖率。

## 设计锚定
- **所属规格**：E2E 测试框架
- **原设计意图**：`ApiClient` 和 `TestDataFactory` 应提供全面的 API 封装和数据生成能力，实现“数据隔离”和“快速 setup”。
- **当前偏离**：随着测试覆盖范围扩大到补卡和日报模块，原有的 API 封装已不足以支持新需求。

## 根因分析
- **直接原因**：`ApiClient` 缺失 `supplementCheckIn`, `getDailyRecords` 等方法；`TestDataFactory` 缺失 `createDailyRecord`, `createCorrection` 等方法。
- **根本原因**：测试基础设施建设滞后于测试用例需求。
- **相关代码**：
  - `packages/e2e/utils/api-client.ts`
  - `packages/e2e/utils/test-data.ts`

## 修复方案
- **修复思路**：
  1. 在 `ApiClient` 中封装补卡申请、考勤明细查询、打卡等 API。
  2. 在 `TestDataFactory` 中封装组合逻辑：如“先打卡触发考勤计算生成日报，再基于日报申请补卡”。
- **改动文件**：
  - `packages/e2e/utils/api-client.ts`: 新增 `supplementCheckIn`, `updateCorrection` 等。
  - `packages/e2e/utils/test-data.ts`: 新增 `createDailyRecord`, `createCorrection`。

## 验证结果
- [x] 原问题已解决：`tests/attendance/correction.spec.ts` 和 `daily-records.spec.ts` 可以成功调用数据工厂生成数据。
- [x] 回归测试通过：TypeScript 编译通过，未破坏现有测试。

## 提交信息
test(e2e): 补充测试工具类缺失的API方法

背景: 补卡和日报测试需要特定的前置数据
变更:
1. ApiClient 新增 correction/daily/clock 相关接口
2. TestDataFactory 新增 createDailyRecord/createCorrection
影响: E2E 测试基础设施
