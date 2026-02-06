# E2E测试模态框确认按钮识别修复记录

## 问题描述
- **现象**：在运行 E2E 测试（特别是删除操作）时，测试脚本经常无法点击确认模态框的按钮，导致超时失败。
- **复现步骤**：运行 `pnpm test:e2e` 执行涉及删除确认的用例（如 SW64 班次删除）。
- **影响范围**：CI/CD 流水线稳定性，测试通过率。

## 设计锚定
- **所属规格**：E2E 测试框架
- **原设计意图**：`ModalComponent` 应能通用地处理系统中的标准确认弹窗。
- **当前偏离**：系统中的确认按钮文案不统一（存在“确定”、“确认”、“OK”等），原定位器匹配规则过窄。

## 根因分析
- **直接原因**：`modal.component.ts` 中 `confirmButton` 的定位器仅匹配了特定文本。
- **根本原因**：前端组件文案缺乏严格统一，测试组件未做兼容处理。
- **相关代码**：`packages/e2e/components/modal.component.ts`

## 修复方案
- **修复思路**：
  使用正则表达式扩大按钮文本的匹配范围，覆盖常见确认文案。
- **改动文件**：
  - `packages/e2e/components/modal.component.ts`
  ```typescript
  // 修改前
  this.confirmButton = this.root.locator('button', { hasText: '确定' });
  // 修改后
  this.confirmButton = this.root.locator('button').filter({ hasText: /确定|确认|Confirm|OK/i });
  ```

## 验证结果
- [x] 原问题已解决：SW64 等模块的删除测试用例稳定通过。
- [x] 回归测试通过：不影响其他使用 Modal 的测试用例。

## 提交信息
test(e2e): 修复模态框确认按钮定位不稳的问题

背景: 确认按钮文案多样导致测试失败
变更: 使用正则 /确定|确认|Confirm|OK/i 匹配按钮
影响: 所有使用 ModalComponent 的 E2E 测试
