# Tasks: 手机号登录

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | auth |
| 涉及端 | Server, Web, App |
| 预计总时间 | 40 分钟 |

## 任务清单

### 阶段1：后端开发

#### Task 1: 实现后端手机号查找逻辑

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/auth/auth.service.ts`<br>`packages/server/src/modules/auth/auth.service.test.ts` |
| 操作 | 修改 |
| 内容 | 1. 修改 `login` 方法，增加"若用户名未找到则按手机号查找"的逻辑<br>2. 更新单元测试，增加手机号登录的测试用例 |
| 验证 | 命令: `npm run test -- packages/server/src/modules/auth/auth.service.test.ts` |
|      | 预期: 所有测试通过，包含新增的手机号登录用例 |
| 预计 | 15 分钟 |
| 依赖 | 无 |

### 阶段2：前端开发

#### Task 2: Web 端登录页适配

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/Login.tsx` |
| 操作 | 修改 |
| 内容 | 修改登录表单中用户名的 placeholder 为 "用户名 / 手机号" |
| 验证 | 命令: `npm run lint -- packages/web/src/pages/Login.tsx` |
|      | 预期: 无 Lint 错误 |
| 预计 | 5 分钟 |
| 依赖 | 无 |

#### Task 3: App 端登录页适配

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/auth/LoginScreen.tsx` |
| 操作 | 修改 |
| 内容 | 修改登录输入框的 placeholder 为 "用户名 / 手机号" |
| 验证 | 命令: `npm run lint -- packages/app/src/screens/auth/LoginScreen.tsx` |
|      | 预期: 无 Lint 错误 |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段3：验证与交付

#### Task 4: E2E 测试验证

| 属性 | 值 |
|------|-----|
| 文件 | `packages/e2e/tests/auth/login.spec.ts` |
| 操作 | 修改 |
| 内容 | 新增 E2E 测试用例：使用关联了手机号的账号，通过手机号登录成功 |
| 验证 | 命令: `npm run test:e2e -- login.spec.ts` |
|      | 预期: 测试通过 |
| 预计 | 15 分钟 |
| 依赖 | Task 1, Task 2 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | E2E 测试 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 1 | 手机号重复可能导致错误 | 代码中已增加重复检测逻辑，重复时拒绝登录 |
