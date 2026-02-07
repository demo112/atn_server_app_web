# 20260207-date-range-fix 修复记录

## 问题描述
- **现象**：考勤异常处理页面的时间选择器中，开始时间可以晚于结束时间，缺乏约束。
- **复现步骤**：
  1. 进入考勤异常处理页面。
  2. 设置开始时间为较晚的日期（如月底）。
  3. 设置结束时间为较早的日期（如月初）。
  4. 系统未阻止该操作，导致筛选条件逻辑错误。
- **影响范围**：
  - `CorrectionProcessingPage.tsx` (考勤异常处理)
  - `CorrectionView.tsx` (同类组件)

## 设计锚定
- **所属规格**：UI-CLONE-Correction
- **原设计意图**：提供日期范围筛选功能。
- **当前偏离**：缺少日期范围的逻辑约束（Start <= End）。

## 根因分析
- **直接原因**：使用了原生 `<input type="date">` 但未设置 `min` 和 `max` 属性，且 `onChange` 事件中未对日期逻辑进行校验。
- **根本原因**：前端开发时遗漏了日期选择器的常规 UX 约束。
- **相关代码**：`packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 修复方案
- **修复思路**：
  1. 为开始时间输入框添加 `max={endDate}`。
  2. 为结束时间输入框添加 `min={startDate}`。
  3. 在 `onChange` 事件中添加逻辑：
     - 当 Start > End 时，自动将 End 重置为 Start。
     - 当 End < Start 时，自动将 Start 重置为 End。
- **改动文件**：
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`
  - `packages/web/src/pages/attendance/correction/components/CorrectionView.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| CorrectionProcessingPage | `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx` | ✅ |
| CorrectionView | `packages/web/src/pages/attendance/correction/components/CorrectionView.tsx` | ✅ |

## 验证结果
- [x] 原问题已解决：E2E 测试 `date-range-validation.spec.ts` 验证通过。
- [x] 回归测试通过：`npm test` (exit code 0)。
- [x] 设计一致性确认：符合常规 UX 设计。
- [x] **同类组件已检查**：`CorrectionView.tsx` 已同步修复。

## 文档同步
- [ ] design.md：无需更新（纯代码 Bug）。
- [ ] api-contract.md：无需更新。

## 防回退标记
**关键词**：起止时间、日期范围、DatePicker
**设计决策**：原生 Date Input 必须配合 min/max 和 onChange 逻辑校验使用。

## 提交信息
fix(web): 修复考勤异常页面日期选择范围无约束问题
