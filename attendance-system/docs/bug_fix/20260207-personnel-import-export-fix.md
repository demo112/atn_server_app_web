# 20260207-personnel-import-export-fix.md

## 问题描述
- **现象**：人员导入导出按钮点击没有反应。
- **复现步骤**：进入人员管理页面，点击“导入”或“导出人员”按钮。
- **影响范围**：Web端人员管理页面。

## 设计锚定
- **所属规格**：疑似 SW62（人员管理），但文档缺失相关设计。
- **原设计意图**：UI 模板包含按钮，但后端 API 及前端逻辑均未实现。
- **当前偏离**：UI 展示了不可用的功能，且无反馈。

## 根因分析
- **直接原因**：按钮元素未绑定 `onClick` 事件。
- **根本原因**：功能尚未开发，属于半成品。
- **相关代码**：`packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx`

## 修复方案
- **修复思路**：在功能正式开发前，添加 Toast 提示“功能开发中”，明确告知用户状态，避免误认为死机。
- **改动文件**：`packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PersonnelDashboard | packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx | ✅ |

## 验证结果
- [x] 原问题已解决（点击有 Toast 提示）
- [x] 回归测试通过（类型检查通过）
- [x] 设计一致性确认（符合最小改动原则）

## 文档同步
- [ ] design.md：无需更新（本身缺失）

## 防回退标记
**关键词**：人员导入、导出人员、Toast
**设计决策**：在后端 API 就绪前，保持按钮可见但提示“开发中”。

## 提交信息
fix(web): 修复人员导入导出按钮点击无反应的问题
