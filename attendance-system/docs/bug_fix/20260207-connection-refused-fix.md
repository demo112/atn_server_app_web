# AI 修复记录：Connection Refused 修复

## 1. 问题描述
用户反馈在浏览器预览中出现 `net::ERR_CONNECTION_REFUSED` 错误，涉及以下接口：
- `http://localhost:5173/api/v1/departments/tree`
- `http://localhost:5173/api/v1/users`

## 2. 原因分析
通过 `netstat` 和 `curl` 诊断发现：
1.  Web Server (Vite) 的 5173 端口处于监听状态 (`LISTENING`)，但 `curl` 尝试连接时报 `Connection refused`。这表明 Vite 进程可能处于僵死状态或网络绑定异常。
2.  Server 端也存在端口冲突风险（日志中曾出现 `EADDRINUSE: address already in use 0.0.0.0:3001`）。
3.  Vite 代理配置正确 (`target: http://127.0.0.1:3001`)，且后端服务在 3001 端口正常响应。

结论：这是由于 Node 进程状态异常导致的连接拒绝，而非代码逻辑错误。

## 3. 修复方案
执行环境重置：
1.  强制终止所有 `node.exe` 进程 (`taskkill /F /IM node.exe`)。
2.  按顺序重启服务：
    - 先启动 Server (`npm run dev -w @attendance/server`)，确认端口 3001 就绪。
    - 再启动 Web (`npm run dev -w @attendance/web`)，确认端口 5173 就绪。

## 4. 验证结果
执行 `curl` 验证代理连通性：
```bash
$ curl.exe -v http://localhost:5173/api/v1/departments
< HTTP/1.1 401 Unauthorized
< x-powered-by: Express
```
返回 401 且包含 Express 头信息，证明请求已成功通过 Vite 代理到达后端。

## 5. 影响范围
- 开发环境 (Web & Server)
- 这里的修复仅涉及重启服务，无代码变更。
