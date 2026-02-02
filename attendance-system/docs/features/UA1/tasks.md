# Tasks: UA1 用户管理与认证

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | auth, user |
| 涉及端 | Server, Web, App |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：类型与基础 (Shared & Common)

#### Task 1: 定义公共类型与中间件 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/user.ts`<br>`packages/server/src/common/middleware/auth.ts` |
| 操作 | 新增 |
| 内容 | 1. 定义 User 相关 VO/DTO 类型<br>2. 实现 JWT 验证中间件 |
| 验证 | `npm run type-check` |
| 状态 | 已完成 |
| 预计 | 10 分钟 |
| 依赖 | 无 |

### 阶段2：服务端实现 (Server)

#### Task 2: 实现 Auth 模块 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/auth/auth.dto.ts`<br>`packages/server/src/modules/auth/auth.service.ts`<br>`packages/server/src/modules/auth/auth.controller.ts` |
| 操作 | 新增 |
| 内容 | 1. 实现登录逻辑 (bcrypt 验证)<br>2. 生成 JWT Token<br>3. 获取当前用户信息接口 |
| 验证 | `curl` 测试登录接口 |
| 状态 | 已完成 |
| 预计 | 15 分钟 |
| 依赖 | Task 1 |

#### Task 3: 实现 User 模块 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/user/user.dto.ts`<br>`packages/server/src/modules/user/user.service.ts`<br>`packages/server/src/modules/user/user.controller.ts`<br>`packages/server/src/modules/user/user.routes.ts`<br>`packages/server/src/index.ts` |
| 操作 | 新增/修改 |
| 内容 | 1. 用户 CRUD 逻辑<br>2. 注册 Auth 和 User 路由 |
| 验证 | `curl` 测试用户增删改查 |
| 状态 | 已完成 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

### 阶段3：Web端实现 (Web)

#### Task 4: Web 端认证与基础 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/utils/auth.ts`<br>`packages/web/src/pages/login/index.tsx` |
| 操作 | 新增 |
| 内容 | 1. Token 存储与 Axios 拦截器<br>2. 登录页面 UI 与逻辑 |
| 验证 | 浏览器访问登录页，成功登录跳转 |
| 状态 | 已完成 |
| 预计 | 10 分钟 |
| 依赖 | Task 2 |

#### Task 5: Web 端用户管理 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/pages/user/index.tsx`<br>`packages/web/src/pages/user/components/UserModal.tsx` |
| 操作 | 新增 |
| 内容 | 1. 用户列表展示 (分页/搜索)<br>2. 用户创建/编辑弹窗 |
| 验证 | 浏览器操作用户管理功能 |
| 状态 | 已完成 |
| 预计 | 15 分钟 |
| 依赖 | Task 3, Task 4 |

### 阶段4：App端实现 (App)

#### Task 6: App 端认证 ✅

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/utils/auth.ts`<br>`packages/app/src/screens/auth/LoginScreen.tsx` |
| 操作 | 新增 |
| 内容 | 1. SecureStore Token 存储<br>2. App 登录屏幕 UI 与逻辑 |
| 验证 | 模拟器运行 App，测试登录 |
| 状态 | 已完成 |
| 预计 | 10 分钟 |
| 依赖 | Task 2 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 → git push |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 3 | 默认密码安全性 | 创建用户时记录日志提醒 |
| Task 6 | Expo SecureStore 依赖 | 确保 native 依赖正确安装 |
