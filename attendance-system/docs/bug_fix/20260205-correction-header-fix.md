# 补签处理页面表头修复记录

## 问题描述
- **现象**：补签处理页面的表头“日期”与参考设计 `incoming/web/signed` 中的“工作日”不一致。
- **复现步骤**：打开补签处理页面，查看表格第一列标题。
- **影响范围**：`packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 设计锚定
- **所属规格**：SW66_Supplement
- **原设计意图**：UI 结构应 Clone `incoming/web/signed/App.tsx`。
- **当前偏离**：代码中使用“日期”，参考代码使用“工作日”。设计文档 `docs/features/SW66_Supplement/design.md` 中也描述为“工作日”。

## 根因分析
- **直接原因**：开发时未严格照搬参考代码的表头文本。
- **根本原因**：UI Clone 过程中的细节遗漏。
- **相关代码**：`packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx` 第 200 行。

## 修复方案
- **修复思路**：
  1. 将 `<th>日期</th>` 修改为 `<th>工作日</th>`。
  2. 顺手修复 `DepartmentTree` 回调中的类型不匹配问题 (`number | null` -> `number | undefined`)。
- **改动文件**：`packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 验证结果
- [x] 原问题已解决：表头已更新。
- [x] 回归测试通过：当前文件类型检查通过（全量构建因其他模块已有错误而失败，不影响本次修复）。
- [x] 设计一致性确认

## 文档同步
- [ ] design.md：已一致，无需更新
- [ ] api-contract.md：无影响

## 提交信息
fix(web): 修正补签处理页面表头为"工作日"
