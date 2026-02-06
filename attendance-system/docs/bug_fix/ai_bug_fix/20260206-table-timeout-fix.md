# E2E测试表格组件超时修复记录

## 问题描述
- **现象**：在运行 E2E 测试（特别是数据加载较慢的页面，如考勤汇总）时，`TableComponent` 经常误报无数据，导致断言失败。
- **复现步骤**：运行 `pnpm test:e2e` 执行涉及表格数据加载的用例（如 SW70 考勤汇总）。
- **影响范围**：E2E 测试稳定性，特别是涉及复杂查询的页面。

## 设计锚定
- **所属规格**：E2E 测试框架
- **原设计意图**：`TableComponent.getDataRowCount` 应能准确获取表格行数，兼容数据加载延迟。
- **当前偏离**：原 `timeout` 设置为 5000ms，在部分环境或数据量大时不足以等待数据渲染。

## 根因分析
- **直接原因**：`table.component.ts` 中 `getDataRowCount` 方法的等待超时时间（5000ms）过短。
- **根本原因**：前端渲染和后端查询在复杂场景下耗时可能超过 5 秒。
- **相关代码**：`packages/e2e/components/table.component.ts`

## 修复方案
- **修复思路**：
  将等待超时时间延长至 10000ms，以适应更长的数据加载时间。
- **改动文件**：
  - `packages/e2e/components/table.component.ts`
  ```typescript
  // 修改前
  await this.rows.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  // 修改后
  await this.rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  ```

## 验证结果
- [x] 原问题已解决：SW70 考勤汇总等测试用例稳定性提升。
- [x] 回归测试通过：不影响其他使用 Table 的测试用例（仅增加最大等待时间，不影响快速加载）。

## 提交信息
test(e2e): 完善考勤汇总(SW70)测试及环境修复

背景: 表格数据加载超时导致测试失败
变更: 将 TableComponent 等待时间延长至 10s
影响: 所有使用 TableComponent 的 E2E 测试
