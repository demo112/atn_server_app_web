# 需求分析：UA1 用户管理与认证

## 1. 原始需求 (来自 Backlog)

**目标**：实现用户账号管理及全端登录认证功能。

**任务列表**：
- UA1-01 用户表 Prisma Model 定义
- UA1-02 用户 CRUD Service
- UA1-03 用户 CRUD API
- UA1-04 密码加密与验证 (bcrypt)
- UA1-05 JWT 生成与验证中间件
- UA1-06 登录 API
- UA1-07 登录页面 UI (Web)
- UA1-08 登录状态管理 (Web)
- UA1-09 用户列表页面 (Web)
- UA1-10 用户新增/编辑弹窗 (Web)
- UA1-11 App 登录页面 (App)
- UA1-12 App Token 存储 (SecureStore)

## 2. 5W1H 分析

| 维度 | 内容 |
|------|------|
| **Who** | **管理员**：在 Web 端管理所有用户账号。<br>**所有员工**：在 Web/App 端登录系统。 |
| **What** | **用户管理**：创建、查询、更新、删除用户账号。<br>**认证**：账号密码登录，获取 Token，访问受保护接口。 |
| **When** | **系统初始化**：创建初始管理员。<br>**入职/离职**：新增/禁用账号。<br>**日常使用**：每天登录打卡前。 |
| **Where** | **Server**：数据库存储，API 接口，认证逻辑。<br>**Web**：管理界面，登录界面。<br>**App**：登录界面。 |
| **Why** | 账号是系统的基础，只有认证用户才能进行考勤操作；需要区分管理员和普通用户权限。 |
| **How** | **后端**：Node.js + Prisma + JWT + bcrypt。<br>**前端**：React/RN 表单 + Axios 拦截器 + 状态管理。 |

## 3. 核心功能点

### 3.1 用户数据模型
- 核心字段：username, password(hash), role, name, status
- 关联：User -> Employee (1:1) - *注：本阶段仅定义 User，关联在 UA2 处理*

### 3.2 认证体系
- 注册/初始化：通常由管理员创建，暂不开放自助注册。
- 登录：POST /api/v1/auth/login -> 返回 JWT。
- 鉴权：Bearer Token header，后端中间件验证。

### 3.3 用户管理 (Web)
- 列表页：分页、搜索 (username/name)。
- 新增/编辑：弹窗表单，校验必填项。
- 删除/禁用：软删除或状态变更。

### 3.4 客户端适配
- Web：存储 Token 在 localStorage/cookie，处理 401 跳转。
- App：存储 Token 在 SecureStore，启动自动登录。

## 4. 假设与约束

- **唯一性**：用户名 (username) 全局唯一。
- **密码策略**：初始密码策略？(假设默认 123456 或 随机)
- **角色**：简化为 `ADMIN` 和 `USER`。
- **软删除**：用户删除通常是软删除 (`deletedAt`) 或 状态禁用 (`status: 'DISABLED'`)。*采用 status 字段控制更灵活*。
