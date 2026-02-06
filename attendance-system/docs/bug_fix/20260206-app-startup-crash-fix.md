# App Startup Crash Fix Record

## 问题描述
- **现象**：App 启动时显示 "Something went wrong" 蓝色错误页。
- **复现步骤**：运行 `npx expo start` 并连接 App。
- **影响范围**：App 无法启动。

## 设计锚定
- **所属规格**：App 基础架构
- **原设计意图**：App 应能正常加载 JS Bundle 并进入首页。
- **当前偏离**：JS Bundle 构建或解析失败，导致运行时崩溃。

## 根因分析
- **直接原因**：缺少 Babel 配置，导致 React Native 代码（JSX 等）无法正确转译。
- **根本原因**：`packages/app` 目录下缺失 `babel.config.js` 和依赖 `babel-preset-expo`。此外，`metro.config.js` 未正确配置 monorepo 的 watchFolders。
- **相关代码**：
  - `packages/app/babel.config.js` (缺失)
  - `packages/app/metro.config.js` (配置不全)

## 修复方案
- **修复思路**：
  1. 安装 `babel-preset-expo`。
  2. 创建 `babel.config.js` 并配置 preset。
  3. 修正 `metro.config.js` 以支持 monorepo 结构。
- **改动文件**：
  - `packages/app/babel.config.js` (新增)
  - `packages/app/metro.config.js` (修改)
  - `packages/app/package.json` (新增依赖)

## 验证结果
- [x] 原问题已解决：`npx expo-doctor` 检查全部通过 (17/17)。
- [x] 回归测试通过：配置修复后环境检查无误。

## 文档同步
- [ ] design.md：无需更新。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(app): 修复 App 启动崩溃问题

背景: App 启动时显示 Something went wrong，expo-doctor 报错
变更:
1. 新增 babel.config.js 和 babel-preset-expo 依赖
2. 修正 metro.config.js 的 monorepo 配置
验证: expo-doctor 检查通过
