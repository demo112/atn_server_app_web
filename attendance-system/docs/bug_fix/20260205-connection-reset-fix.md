# CONNECTION_RESET 错误修复记录

## 问题描述
- **现象**：访问 `http://localhost:5173/api/v1/users/9` 报错 `net::ERR_CONNECTION_RESET`。
- **复现步骤**：
  1. 启动后端服务 `npm run dev`。
  2. 前端请求 API。
  3. 后端服务静默退出，导致连接重置。
- **影响范围**：所有 API 接口不可用。

## 设计锚定
- **所属规格**：UA1 (用户管理)
- **原设计意图**：后端应提供 RESTful API，监听 3001 端口。
- **当前偏离**：
  - `ts-node-dev` 在当前环境下不稳定，导致服务启动后立即退出。
  - Redis 连接失败可能导致 Event Loop 为空，进程提前退出。
  - 代码存在语法错误（index.ts 注释）和重复导入（app.ts）。

## 根因分析
- **直接原因**：后端 Node.js 进程在启动后不久退出。
- **根本原因**：
  1. `ts-node-dev` 环境兼容性问题。
  2. 异步初始化逻辑（Redis）失败后，没有足够的活跃 Handle 保持进程运行。
  3. 代码质量问题（重复导入、语法错误）。
- **相关代码**：`packages/server/src/index.ts`, `packages/server/package.json`

## 修复方案
- **修复思路**：
  1. 修复代码中的语法错误和重复导入。
  2. 增强进程保活机制（Keep-Alive Hack）。
  3. 调整启动脚本，改用更稳定的 `ts-node`。
- **改动文件**：
  - `packages/server/src/app.ts`：移除重复导入。
  - `packages/server/src/index.ts`：修复注释，添加 Keep-Alive 机制。
  - `packages/server/package.json`：修改 `dev` 脚本。

## 验证结果
- [x] 原问题已解决：服务可稳定启动，`/health` 接口返回 200。
- [x] 回归测试通过：`/api/v1/users/9` 返回 401（鉴权拦截），证明服务可达。
- [x] 设计一致性确认：API 端口和路径符合设计。

## 文档同步
- [ ] design.md：无需更新。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(server): 修复服务启动崩溃导致的 CONNECTION_RESET 问题
