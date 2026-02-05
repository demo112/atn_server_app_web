# Tailwind 依赖配置修复记录

## 问题描述
- **现象**：Web 端构建失败，报错 `Can't resolve '@tailwindcss/forms'`。
- **复现步骤**：在 `packages/web` 下运行 `npm run build` 或 `vite build`。
- **影响范围**：Web 端无法构建，样式插件失效。

## 设计锚定
- **所属规格**：Web Infrastructure (UI-STD-001)
- **原设计意图**：统一使用 Tailwind CSS。
- **当前偏离**：`index.css` 使用了 v4 语法引用插件，但 `package.json` 中缺失对应的 npm 包依赖。

## 根因分析
- **直接原因**：`@tailwindcss/forms` 和 `@tailwindcss/typography` 插件包未安装。
- **根本原因**：项目依赖配置不完整，未能匹配 `index.css` 中的插件引用。此外，pnpm 依赖提升机制可能导致部分包未正确链接到 `node_modules`。
- **相关代码**：`packages/web/package.json`

## 修复方案
- **修复思路**：补全缺失的开发依赖，并强制重新安装以修复链接。
- **改动文件**：
  - `packages/web/package.json`: 添加 `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/postcss`。
  - `pnpm-lock.yaml`: 更新锁定文件。
- **操作**：
  - `pnpm install --force`：强制重新链接依赖，解决 `node_modules` 缺失问题。

## 验证结果
- [x] 原问题已解决：`vite build` 成功执行，无插件解析错误。
- [x] 回归测试通过：CSS 构建流程正常。
- [x] 设计一致性确认：符合使用 Tailwind CSS 的设计意图。
- [x] 依赖检查：确认 `node_modules/@tailwindcss` 下包含 `forms` 和 `typography` 目录。

## 提交信息
fix(web): 修复 Tailwind 插件依赖缺失并强制同步依赖
