# 登录跳转失败与错误提示重复修复记录

## 问题描述
- **现象**：
  1. 登录成功后未跳转到首页，停留在 `/login`。
  2. 输入错误密码时，页面同时弹出 "Server error" 和 "登录失败" 两个提示。
- **复现步骤**：
  1. 启动前后端服务。
  2. 访问 `/login`，输入正确账号密码，点击登录 -> 未跳转。
  3. 输入错误密码，点击登录 -> 弹出两个 Toast。
- **影响范围**：所有用户的登录功能。

## 设计锚定
- **所属规格**：`UA1` (User Authentication)
- **原设计意图**：用户登录成功后应自动重定向到首页；登录失败应显示明确的错误原因。
- **当前偏离**：
  - 代理配置错误导致前端连接被拒绝（ECONNREFUSED），从而引发 500 错误。
  - 错误处理逻辑在 Context 和拦截器中重复。

## 根因分析
- **直接原因**：
  1. Vite 代理配置指向 `localhost:3001`，但后端实际运行在 `3000` 端口，且 Node.js 在某些环境下对 `localhost` 解析不稳定。
  2. `AuthContext.tsx` 捕获异常后调用了 `toast.error`，而全局拦截器 `request.ts` 也调用了 `toast.error`。
- **根本原因**：
  - 开发环境配置与实际运行端口不匹配。
  - 错误处理职责边界不清。
- **相关代码**：
  - `packages/web/vite.config.ts`
  - `packages/web/src/context/AuthContext.tsx`

## 修复方案
- **修复思路**：
  1. 修正 Vite 代理端口为 `3000` 并使用 `127.0.0.1`。
  2. 移除 `AuthContext` 中的冗余 Toast，统一由拦截器处理。
  3. 优化 `Login.tsx` 的跳转逻辑，依赖 `isAuthenticated` 状态变化。
- **改动文件**：
  - `packages/web/vite.config.ts`
  - `packages/web/src/context/AuthContext.tsx`
  - `packages/web/src/pages/Login.tsx`
  - `packages/e2e/tests/auth/login.spec.ts` (修正测试用例中的 key)

## 验证结果
- [x] 原问题已解决：登录成功后正常跳转，错误提示只显示一次。
- [x] 回归测试通过：`npx playwright test tests/auth/login.spec.ts` 全部通过。
- [x] 设计一致性确认：符合 UA1 规格。

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 提交信息
fix(auth): fix login redirect and duplicate error toasts

- fix: update vite proxy target to 127.0.0.1:3000
- refactor: remove duplicate toast in AuthContext
- test: fix token key in e2e test
