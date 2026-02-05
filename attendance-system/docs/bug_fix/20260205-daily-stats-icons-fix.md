# 每日统计页面图标显示修复记录

## 问题描述
- **现象**：每日统计全字段报表页面中，图标显示为英文文本（如 `chevron_left`, `download`, `refresh`）。
- **复现步骤**：进入统计报表 -> 每日统计报表页面。
- **影响范围**：所有使用 `material-icons-outlined` 样式的页面。

## 设计锚定
- **所属规格**：SW72 / statistical-report-ui
- **原设计意图**：UI 仿制需求要求使用 Material Icons 显示图标。
- **当前偏离**：`packages/web/index.html` 未引入 `Material+Icons+Outlined` 字体系列，导致使用了该类的图标回退到文本显示。

## 根因分析
- **直接原因**：浏览器无法加载 `Material Icons Outlined` 字体。
- **根本原因**：`packages/web/index.html` 中仅引入了 Filled 和 Round 版本的 Material Icons，漏掉了 Outlined 版本。

## 修复方案
- **修复思路**：在 `index.html` 中添加 `Material+Icons+Outlined` 的 Google Fonts 引用。
- **改动文件**：`packages/web/index.html`

## 验证结果
- [x] 原问题已解决（代码审查确认引入）
- [x] 回归测试通过（Build 成功）
- [x] 设计一致性确认

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 提交信息
fix(web): 修复每日统计页面图标显示为英文的问题

背景: 每日统计页面图标显示为 Ligature 文本。
变更: 在 index.html 中引入 Material Icons Outlined 字体。
影响: 修复所有使用 material-icons-outlined 类的图标显示。
