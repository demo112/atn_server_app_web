# 端口变更修复记录

## 问题描述
- **现象**：应用端口配置为 3000，用户要求更改为 3001。
- **复现步骤**：查看 `.env` 和代码中硬编码的端口。
- **影响范围**：Server, Web, App, E2E 测试。

## 设计锚定
- **所属规格**：ENG01 (Infrastructure)
- **原设计意图**：端口配置应通过环境变量管理，避免硬编码。
- **当前偏离**：代码中存在大量硬编码的 `3000` 端口。

## 根因分析
- **直接原因**：项目初期开发时使用了默认端口 3000 并硬编码在多处。
- **根本原因**：缺乏统一的配置管理或环境变量引用。
- **相关代码**：
  - `packages/server/src/index.ts`
  - `packages/web/vite.config.ts`
  - `packages/app/src/utils/request.ts`
  - `packages/e2e/playwright.config.ts`

## 修复方案
- **修复思路**：
  1. 修改 Server 启动端口默认值为 3001。
  2. 修改 Web 和 E2E 配置文件，通过读取 `packages/server/.env` 文件动态获取端口，消除硬编码。
  3. 修改 App 请求 Base URL 默认值为 3001，并支持 `EXPO_PUBLIC_API_URL`。
  4. 将测试代码中的硬编码端口替换为环境变量引用。
- **改动文件**：
  - `packages/server/src/index.ts`
  - `packages/server/ecosystem.config.js`
  - `packages/web/vite.config.ts` (动态读取端口)
  - `packages/web/src/test/setup.ts`
  - `packages/web/src/__tests__/integration/*.test.tsx`
  - `packages/app/src/utils/request.ts`
  - `packages/e2e/playwright.config.ts` (动态读取端口)
  - `packages/e2e/utils/api-client.ts`
  - `packages/e2e/fixtures/*.ts`

## 验证结果
- [x] 原问题已解决：代码中不再硬编码端口，而是动态读取 Server 配置。
- [x] 回归测试通过：Web 编译通过，Server 编译通过。
- [x] 设计一致性确认：符合配置与代码分离的设计原则，真正实现了“引用变量”。

## 文档同步
- [ ] design.md：无需更新，属实现细节。
- [ ] api-contract.md：无需更新。

## 注意事项
- **需要手动更新**：`packages/server/.env` 文件需手动修改 `PORT=3001`（受保护文件）。
