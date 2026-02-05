# 端口不匹配导致网络错误修复记录

## 问题描述
- **现象**：前端请求后端 API 出现 `AxiosError: Network Error` 和 `net::ERR_CONNECTION_REFUSED`。
- **复现步骤**：
  1. 启动 Server (`npm start`)。
  2. 启动 Web (`npm run dev`)。
  3. 访问 Web 页面，观察控制台网络请求。
- **影响范围**：所有涉及后端 API 的页面（用户列表、部门、员工、统计等）。

## 设计锚定
- **所属规格**：全局配置
- **原设计意图**：Server 应监听指定端口，Web 通过 Proxy 转发请求到该端口。
- **当前偏离**：
  - `vite.config.ts` 配置 Proxy 指向 `http://localhost:3000`。
  - Server 实际监听 `3001` (由 `.env` 中的 `PORT=3001` 决定)。
  - `app.ts` 中 `statistics` 路由被注释，导致相关请求 404（如果端口通了的话）。

## 根因分析
- **直接原因**：Vite Proxy 端口 (3000) 与 Server 监听端口 (3001) 不一致。
- **根本原因**：Server 环境配置 (`.env`) 设定了非标准端口 3001，而代码和前端配置默认为 3000。且 Server 启动时存在端口占用或僵尸进程问题。
- **相关代码**：
  - `packages/web/vite.config.ts`
  - `packages/server/src/index.ts`
  - `packages/server/.env`

## 修复方案
- **修复思路**：
  1. 清理占用端口的僵尸进程。
  2. 调整 Frontend `vite.config.ts` 适配 Server 的实际端口 (3001)。
  3. 恢复 `app.ts` 中被注释的 `statistics` 路由。
- **改动文件**：
  - `packages/web/vite.config.ts`: Proxy target `3000` -> `3001`
  - `packages/server/src/app.ts`: Uncomment `statisticsRouter`
  - `packages/server/src/index.ts`: (尝试统一默认值，但在 .env 存在时不起作用，已保留改动作为 fallback)

## 验证结果
- [x] 原问题已解决：`curl http://localhost:3001/api/v1/users` 返回 401 (连接成功)，不再是 Connection Refused。
- [x] 回归测试通过：`npm run build` 通过。
- [x] 设计一致性确认：路由恢复完整。

## 文档同步
- [ ] design.md：无变更
- [ ] api-contract.md：无变更

## 提交信息
fix(config): 修正Vite代理端口与Server不一致问题，恢复统计路由

- feat: 将 Vite 代理目标调整为 3001 以匹配 .env 配置
- fix: 恢复 app.ts 中被注释的 statistics 路由
- chore: 清理 index.ts 端口默认值逻辑
