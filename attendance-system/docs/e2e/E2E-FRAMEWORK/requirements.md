# Requirements Document

## Introduction

为考勤系统 Web 端搭建 Playwright E2E 测试框架，与现有的 Vitest 单元测试、集成测试、属性测试体系整合，实现真实浏览器 + 真实后端的端到端验证能力。

## Glossary

- **E2E_Framework**: Playwright E2E 测试框架，包含配置、Fixtures、Page Objects、组件对象、工具函数等基础设施
- **Page_Object**: 页面对象模型，封装页面定位器和操作，暴露业务语义方法
- **Component_Object**: 可复用组件对象，封装表格、弹窗、Toast 等通用 UI 组件的交互
- **Fixture**: Playwright 测试夹具，提供认证状态、数据准备等可复用的测试上下文
- **API_Client**: API 辅助层，通过 HTTP 直接调用后端 API 进行数据准备和清理
- **Test_Data_Factory**: 测试数据工厂，生成带 Worker 前缀的隔离测试数据
- **Worker_Prefix**: 并行执行时的数据隔离前缀，格式为 `[W0]`、`[W1]` 等

## Requirements

### Requirement 1: Playwright 安装与配置

**User Story:** As a 开发者, I want to 安装配置 Playwright 测试框架, so that 可以在真实浏览器中运行 E2E 测试。

#### Acceptance Criteria

1. WHEN 执行 `pnpm test:e2e` THEN THE E2E_Framework SHALL 启动 Playwright 并运行测试
2. THE E2E_Framework SHALL 支持 Chromium、Firefox、WebKit 三种浏览器
3. WHEN 测试失败 THEN THE E2E_Framework SHALL 自动截图并生成 trace 文件
4. THE E2E_Framework SHALL 配置 webServer 自动启动前端和后端服务
5. WHEN 在 CI 环境运行 THEN THE E2E_Framework SHALL 禁用并行执行并增加重试次数

### Requirement 2: 目录结构与基础类

**User Story:** As a 开发者, I want to 有清晰的 E2E 测试目录结构, so that 测试代码组织有序且易于维护。

#### Acceptance Criteria

1. THE E2E_Framework SHALL 在 `packages/e2e/` 目录下创建标准目录结构
2. THE E2E_Framework SHALL 包含 `fixtures/`、`pages/`、`components/`、`tests/`、`utils/` 子目录
3. THE Page_Object SHALL 继承 BasePage 基类，提供通用的页面导航和等待方法
4. WHEN 创建新页面测试 THEN THE Page_Object SHALL 封装该页面的定位器和操作方法

### Requirement 3: 认证 Fixture 实现

**User Story:** As a 开发者, I want to 通过 Fixture 快速获取已登录状态, so that 非登录测试无需重复执行 UI 登录流程。

#### Acceptance Criteria

1. WHEN 测试需要已登录状态 THEN THE Fixture SHALL 通过 API 登录获取 token
2. THE Fixture SHALL 将 token 注入浏览器 localStorage
3. THE Fixture SHALL 提供 `authenticatedPage` 供测试直接使用已登录页面
4. THE Fixture SHALL 提供 `api` 实例供测试进行数据准备和清理

### Requirement 4: 数据准备与清理 Fixture

**User Story:** As a 开发者, I want to 每个测试拥有独立的测试数据, so that 测试之间不会相互干扰。

#### Acceptance Criteria

1. THE Fixture SHALL 提供 `workerPrefix` 返回当前 Worker 的前缀（如 `[W0]`）
2. THE Test_Data_Factory SHALL 自动为创建的数据添加 Worker 前缀
3. WHEN 测试结束 THEN THE Fixture SHALL 自动清理该测试创建的所有数据
4. THE E2E_Framework SHALL 在全局 Teardown 中兜底清理所有带 `[W` 前缀的数据

### Requirement 5: API 辅助层实现

**User Story:** As a 开发者, I want to 通过 API 快速准备测试数据, so that 测试执行更快且更稳定。

#### Acceptance Criteria

1. THE API_Client SHALL 提供 `login` 方法获取认证 token
2. THE API_Client SHALL 提供员工、部门等资源的 CRUD 方法
3. THE API_Client SHALL 提供 `cleanupTestData` 方法按前缀批量清理数据
4. THE Test_Data_Factory SHALL 提供 `generatePhone`、`generateEmployeeNo` 等唯一值生成方法

### Requirement 6: 组件对象实现

**User Story:** As a 开发者, I want to 复用通用 UI 组件的交互逻辑, so that 减少测试代码重复。

#### Acceptance Criteria

1. THE Component_Object SHALL 提供 TableComponent 封装表格的行查找、操作按钮点击、搜索、分页
2. THE Component_Object SHALL 提供 ModalComponent 封装弹窗的打开、关闭、表单填写、确认
3. THE Component_Object SHALL 提供 ToastComponent 封装 Toast 消息的断言
4. WHEN UI 组件结构变化 THEN 只需修改 Component_Object 而非所有测试用例

### Requirement 7: 登录流程测试示例

**User Story:** As a 开发者, I want to 有完整的登录测试示例, so that 可以参考编写其他测试。

#### Acceptance Criteria

1. THE E2E_Framework SHALL 提供 LoginPage 页面对象封装登录页面交互
2. WHEN 输入正确账号密码并勾选协议 THEN THE 测试 SHALL 验证成功跳转到首页
3. WHEN 输入错误密码 THEN THE 测试 SHALL 验证显示错误提示
4. WHEN 未勾选协议 THEN THE 测试 SHALL 验证显示警告提示

### Requirement 8: package.json 脚本配置

**User Story:** As a 开发者, I want to 通过简单命令运行 E2E 测试, so that 测试执行便捷。

#### Acceptance Criteria

1. THE E2E_Framework SHALL 配置 `test:e2e` 脚本运行所有 E2E 测试
2. THE E2E_Framework SHALL 配置 `test:e2e:ui` 脚本启动 Playwright UI 模式
3. THE E2E_Framework SHALL 配置 `test:e2e:headed` 脚本在有头浏览器中运行
4. THE E2E_Framework SHALL 配置 `test:e2e:debug` 脚本启动调试模式
5. THE E2E_Framework SHALL 配置 `test:e2e:codegen` 脚本启动录制器
