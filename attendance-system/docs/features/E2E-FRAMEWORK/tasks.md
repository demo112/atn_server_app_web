# Implementation Plan: E2E-FRAMEWORK

## Overview

为考勤系统 Web 端搭建 Playwright E2E 测试框架，按照以下顺序实现：安装配置 → 目录结构 → 基础类 → Fixtures → API 辅助层 → 组件对象 → 登录测试示例 → 脚本配置。

## 任务依赖关系

```
┌─────────────────────────────────────────────────────────────────┐
│                        任务依赖图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] 安装 Playwright                                            │
│       │                                                         │
│       ▼                                                         │
│  [2] 目录结构与基础类                                            │
│       │                                                         │
│       ├──────────────────┬──────────────────┐                   │
│       ▼                  ▼                  ▼                   │
│  [3] API 辅助层     [5] 组件对象        [6.1] LoginPage         │
│       │                  │                  │                   │
│       ▼                  │                  │                   │
│  [4] Fixtures            │                  │                   │
│       │                  │                  │                   │
│       └──────────────────┴──────────────────┘                   │
│                          │                                      │
│                          ▼                                      │
│                    [6.2] 登录测试                                │
│                          │                                      │
│                          ▼                                      │
│                    [7] 全局 Setup                                │
│                          │                                      │
│                          ▼                                      │
│                    [8] 脚本配置                                  │
│                          │                                      │
│                          ▼                                      │
│                    [9] Checkpoint                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 可并发任务组

| 阶段 | 可并发任务 | 前置依赖 |
|------|-----------|----------|
| 阶段 1 | Task 1 | 无 |
| 阶段 2 | Task 2.1, 2.2 | Task 1 |
| 阶段 3 | Task 3.1, 3.2, 5.1, 5.2, 5.3, 6.1 | Task 2 |
| 阶段 4 | Task 3.3, 4.1, 4.2, 4.3 | Task 3.1, 3.2 |
| 阶段 5 | Task 4.4, 6.2 | Task 4, 5, 6.1 |
| 阶段 6 | Task 7 | Task 6.2 |
| 阶段 7 | Task 8 | Task 7 |
| 阶段 8 | Task 9 | Task 8 |

## Tasks

- [x] 1. 安装 Playwright 并创建配置文件
  - 在 `packages/e2e/` 创建独立包，安装 `@playwright/test` 依赖
  - 创建 `packages/e2e/playwright.config.ts` 配置文件
  - 配置 webServer 自动启动前后端服务
  - 配置三种浏览器（Chromium、Firefox、WebKit）
  - 配置失败截图和 trace
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. 创建目录结构和基础类
  - [x] 2.1 创建 e2e 目录结构
    - 在 `packages/e2e/` 下创建 `fixtures/`、`pages/`、`components/`、`tests/`、`utils/` 子目录
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 实现 BasePage 基类
    - 实现 `goto()`、`waitForLoad()`、`getToast()`、`getModal()` 方法
    - _Requirements: 2.3_

- [x] 3. 实现 API 辅助层
  - [x] 3.1 实现 ApiClient 类
    - 实现 `login()` 方法获取 token
    - 实现员工 CRUD 方法（`createEmployee`、`deleteEmployee`、`getEmployees`）
    - 实现部门 CRUD 方法（`createDepartment`、`deleteDepartment`）
    - 实现 `cleanupTestData()` 按前缀清理
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 3.2 实现 TestDataFactory 类
    - 实现带前缀的 `createEmployee()`、`createDepartment()` 方法
    - 实现 `generatePhone()`、`generateEmployeeNo()` 唯一值生成
    - _Requirements: 5.4_
  
  - [x] 3.3 编写 API 辅助层属性测试
    - **Property 4: API 登录返回 Token**
    - **Property 5: 前缀批量清理**
    - **Property 6: 唯一值生成**
    - **Validates: Requirements 5.1, 5.3, 5.4**

- [x] 4. 实现 Fixtures
  - [x] 4.1 实现 auth.fixture.ts
    - 实现 `api` Fixture 提供 ApiClient 实例
    - 实现 `authenticatedPage` Fixture（API 登录 + Token 注入）
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 4.2 实现 data.fixture.ts
    - 实现 `workerPrefix` Fixture
    - 实现 `testData` Fixture 自动注入前缀
    - 实现 `autoClean` Fixture 自动清理数据
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.3 创建 fixtures/index.ts 统一导出
  
  - [x] 4.4 编写 Fixtures 属性测试
    - **Property 7: Fixture 自动清理**
    - **Property 8: Worker 隔离性**
    - **Validates: Requirements 4.3, 4.4**

- [ ] 5. 实现组件对象
    - 实现 `workerPrefix` Fixture 返回 `[W{index}]` 格式前缀
    - 实现 `testData` Fixture 提供 TestDataFactory 并自动清理
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 4.3 创建 fixtures/index.ts 统一导出
    - 合并所有 Fixtures 并导出 `test` 和 `expect`
    - _Requirements: 3.3, 3.4_
  
  - [ ] 4.4 编写 Fixtures 属性测试
    - **Property 1: 认证 Token 注入**
    - **Property 2: Worker 前缀隔离**
    - **Property 3: 测试数据自动清理**
    - **Validates: Requirements 3.1, 3.2, 4.1, 4.2, 4.3**

- [x] 5. 实现组件对象
  - [x] 5.1 实现 TableComponent
    - 实现 `rows`、`getDataRowCount()`、`findRowByText()`
    - 实现 `clickRowAction()`、`search()`、`nextPage()`、`prevPage()`
    - _Requirements: 6.1_
  
  - [x] 5.2 实现 ModalComponent
    - 实现 `waitForOpen()`、`waitForClose()`、`getTitle()`
    - 实现 `close()`、`confirm()`、`cancel()`、`fillField()`
    - _Requirements: 6.2_
  
  - [x] 5.3 实现 ToastComponent
    - 实现 `expectSuccess()`、`expectError()`、`expectWarning()`
    - 实现 `expectToastDisappear()`
    - _Requirements: 6.3_

- [x] 6. 实现登录测试示例
  - [x] 6.1 实现 LoginPage 页面对象
    - 定义定位器：`usernameInput`、`passwordInput`、`agreeCheckbox`、`loginButton`
    - 实现 `login()`、`expectLoginSuccess()`、`expectError()`、`expectWarning()`
    - _Requirements: 7.1_
  
  - [ ] 6.2 编写登录测试用例
    - 测试正确账号密码登录成功
    - 测试错误密码显示错误提示
    - 测试未勾选协议显示警告
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 7. 创建全局 Setup/Teardown
  - 创建 `global-setup.ts` 确保基础数据存在
  - 实现兜底清理所有 `[W` 前缀数据
  - _Requirements: 4.4_

- [ ] 8. 配置 package.json 脚本
  - 添加 `test:e2e` 运行所有 E2E 测试
  - 添加 `test:e2e:ui` 启动 UI 模式
  - 添加 `test:e2e:headed` 有头浏览器运行
  - 添加 `test:e2e:debug` 调试模式
  - 添加 `test:e2e:codegen` 录制器
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Checkpoint - 验证框架完整性
  - 执行 `pnpm test:e2e` 确保登录测试通过
  - 验证失败时生成截图和 trace
  - 确保所有测试通过，如有问题请反馈

## Notes

- 所有任务均为必选，包括属性测试
- 每个任务引用具体需求条款以保证可追溯性
- Checkpoint 任务用于阶段性验证
