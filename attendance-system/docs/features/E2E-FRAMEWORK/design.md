# E2E-FRAMEWORK - 设计文档

## Overview

为考勤系统 Web 端搭建 Playwright E2E 测试框架，实现真实浏览器 + 真实后端的端到端验证。框架采用 Page Object Model 设计模式，通过 Fixtures 管理认证状态和测试数据，使用 API 辅助层加速数据准备，支持并行执行时的数据隔离。

### 设计目标

1. **与现有测试体系整合**：与 Vitest 单元测试、集成测试、属性测试共存
2. **测试隔离**：每个测试独立数据，并行执行不冲突
3. **快速执行**：API 登录 + Token 注入，避免重复 UI 登录
4. **易于维护**：Page Object 封装，UI 变更只改一处

### 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| E2E 框架 | Playwright | 跨浏览器、速度快、Trace Viewer 调试强 |
| 定位策略 | 语义化优先 | 不侵入业务代码，贴近用户视角 |
| 数据隔离 | Worker 前缀 | 单库实现简单，冲突风险低 |
| 认证方式 | API 登录 + Token 注入 | 快速（<100ms），稳定 |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        E2E 测试架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Test Specs                            │   │
│  │  tests/auth/login.spec.ts                               │   │
│  │  tests/employee/crud.spec.ts                            │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Fixtures                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ auth.fixture │  │ data.fixture │  │ workerPrefix │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                   │
│         ▼                 ▼                 ▼                   │
│  ┌────────────┐   ┌────────────┐   ┌────────────────┐          │
│  │   Pages    │   │ Components │   │     Utils      │          │
│  │ LoginPage  │   │ Table      │   │ ApiClient      │          │
│  │ BasePage   │   │ Modal      │   │ TestDataFactory│          │
│  └────────────┘   │ Toast      │   └────────────────┘          │
│                   └────────────┘                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Browser (Playwright)                  │   │
│  │  Chromium / Firefox / WebKit                            │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   Web Dev Server │  │   API Server     │                    │
│  │   localhost:5173 │  │   localhost:3000 │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 测试执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                    测试执行流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Global Setup                                               │
│    └── 确保基础数据存在（管理员账号）                          │
│                                                             │
│  每个测试（完全独立）                                         │
│    ├── Fixture 初始化                                       │
│    │   ├── 获取 workerPrefix: [W0]                         │
│    │   ├── API 登录获取 token                               │
│    │   └── Token 注入浏览器                                  │
│    ├── 通过 API 创建本测试专属数据                           │
│    ├── 执行测试                                             │
│    └── 通过 API 清理本测试创建的数据                         │
│                                                             │
│  Global Teardown                                            │
│    └── 兜底清理所有带 [W 前缀的数据                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 目录结构

```
packages/e2e/
├── playwright.config.ts      # Playwright 配置
├── global-setup.ts           # 全局初始化
├── fixtures/                 # 测试夹具
│   ├── index.ts              # 导出所有 fixtures
│   ├── auth.fixture.ts       # 登录态 fixture
│   └── data.fixture.ts       # 数据准备 fixture
├── pages/                    # Page Object Model
│   ├── base.page.ts          # 基础页面类
│   └── login.page.ts         # 登录页面
├── components/               # 可复用组件对象
│   ├── table.component.ts    # 表格组件
│   ├── modal.component.ts    # 弹窗组件
│   └── toast.component.ts    # Toast 组件
├── tests/                    # 测试用例
│   └── auth/
│       └── login.spec.ts     # 登录测试
└── utils/                    # 工具函数
    ├── api-client.ts         # API 辅助
    └── test-data.ts          # 测试数据工厂
```

### BasePage 基类

```typescript
// e2e/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  /** 页面 URL 路径 */
  abstract readonly url: string;

  /** 导航到页面 */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** 等待页面加载完成 */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** 获取 Toast 容器 */
  getToast(): Locator {
    return this.page.locator('.fixed.top-4.right-4 > div');
  }

  /** 获取 Modal 容器 */
  getModal(): Locator {
    return this.page.locator('[role="dialog"]');
  }
}
```

### LoginPage 页面对象

```typescript
// e2e/pages/login.page.ts
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  // 定位器（语义化优先）
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('手机号/邮箱');
    this.passwordInput = page.getByPlaceholder('请输入密码');
    this.agreeCheckbox = page.getByRole('checkbox');
    this.loginButton = page.getByRole('button', { name: '登录' });
  }

  /** 执行登录操作 */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.agreeCheckbox.check();
    await this.loginButton.click();
  }

  /** 断言：登录成功跳转首页 */
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL('/');
  }

  /** 断言：显示错误提示 */
  async expectError(message: string): Promise<void> {
    await expect(this.getToast()).toContainText(message);
  }

  /** 断言：显示警告提示 */
  async expectWarning(message: string): Promise<void> {
    await expect(this.getToast()).toContainText(message);
  }
}
```

### 组件对象接口

```typescript
// e2e/components/table.component.ts
export class TableComponent {
  constructor(private page: Page, containerSelector?: string);
  
  /** 获取所有数据行 */
  get rows(): Locator;
  
  /** 获取数据行数 */
  async getDataRowCount(): Promise<number>;
  
  /** 根据文本查找行 */
  async findRowByText(text: string): Promise<Locator>;
  
  /** 点击行操作按钮 */
  async clickRowAction(rowText: string, actionName: string): Promise<void>;
  
  /** 搜索 */
  async search(keyword: string): Promise<void>;
  
  /** 下一页 */
  async nextPage(): Promise<void>;
  
  /** 上一页 */
  async prevPage(): Promise<void>;
}

// e2e/components/modal.component.ts
export class ModalComponent {
  constructor(private page: Page);
  
  /** 等待弹窗打开 */
  async waitForOpen(): Promise<void>;
  
  /** 等待弹窗关闭 */
  async waitForClose(): Promise<void>;
  
  /** 获取标题 */
  async getTitle(): Promise<string | null>;
  
  /** 关闭弹窗 */
  async close(): Promise<void>;
  
  /** 点击确认 */
  async confirm(): Promise<void>;
  
  /** 点击取消 */
  async cancel(): Promise<void>;
  
  /** 填写表单字段 */
  async fillField(placeholder: string, value: string): Promise<void>;
}

// e2e/components/toast.component.ts
export class ToastComponent {
  constructor(private page: Page);
  
  /** 断言成功消息 */
  async expectSuccess(message: string): Promise<void>;
  
  /** 断言错误消息 */
  async expectError(message: string): Promise<void>;
  
  /** 断言警告消息 */
  async expectWarning(message: string): Promise<void>;
  
  /** 等待 Toast 消失 */
  async expectToastDisappear(): Promise<void>;
}
```

### Fixtures 接口

```typescript
// e2e/fixtures/index.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ApiClient } from '../utils/api-client';
import { TestDataFactory } from '../utils/test-data';

type E2EFixtures = {
  /** API 客户端 */
  api: ApiClient;
  
  /** 登录页面对象 */
  loginPage: LoginPage;
  
  /** 已认证的页面（已注入 token） */
  authenticatedPage: Page;
  
  /** Worker 前缀，用于数据隔离 */
  workerPrefix: string;
  
  /** 测试数据工厂 */
  testData: TestDataFactory;
};

export const test = base.extend<E2EFixtures>({...});
export { expect } from '@playwright/test';
```

### API Client 接口

```typescript
// e2e/utils/api-client.ts
export class ApiClient {
  constructor(baseURL?: string);
  
  /** 登录并获取 token */
  async login(username: string, password: string): Promise<{ token: string; user: object }>;
  
  /** 创建员工 */
  async createEmployee(data: { name: string; phone?: string; departmentId?: number }): Promise<{ id: number; name: string }>;
  
  /** 删除员工 */
  async deleteEmployee(id: number): Promise<void>;
  
  /** 获取员工列表 */
  async getEmployees(params?: { keyword?: string }): Promise<{ items: object[]; total: number }>;
  
  /** 创建部门 */
  async createDepartment(data: { name: string; parentId?: number }): Promise<{ id: number; name: string }>;
  
  /** 删除部门 */
  async deleteDepartment(id: number): Promise<void>;
  
  /** 按前缀清理测试数据 */
  async cleanupTestData(prefix: string): Promise<void>;
}
```

### TestDataFactory 接口

```typescript
// e2e/utils/test-data.ts
export class TestDataFactory {
  constructor(api: ApiClient, prefix: string);
  
  /** 创建带前缀的员工 */
  async createEmployee(data: { name: string; phone?: string; departmentId?: number }): Promise<{ id: number; name: string }>;
  
  /** 创建带前缀的部门 */
  async createDepartment(data: { name: string; parentId?: number }): Promise<{ id: number; name: string }>;
  
  /** 生成唯一手机号 */
  generatePhone(): string;
  
  /** 生成唯一工号 */
  generateEmployeeNo(): string;
}
```

## Data Models

### Playwright 配置

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter @attendance/server dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @attendance/web dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### 数据隔离策略

```
┌─────────────────────────────────────────────────────────────┐
│                单数据库 + Worker 前缀隔离                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Worker 0              Worker 1              Worker 2       │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐    │
│  │ Test A   │         │ Test C   │         │ Test E   │    │
│  │ Test B   │         │ Test D   │         │ Test F   │    │
│  └────┬─────┘         └────┬─────┘         └────┬─────┘    │
│       │                    │                    │           │
│       ▼                    ▼                    ▼           │
│  创建数据:              创建数据:              创建数据:      │
│  [W0] 张三              [W1] 李四              [W2] 王五     │
│       │                    │                    │           │
│       └────────────────────┼────────────────────┘           │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │  共享 Server     │                       │
│                   │  Port: 3000     │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │  单个测试数据库   │                       │
│                   │  attendance_dev │                       │
│                   └─────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 定位器策略优先级

| 优先级 | 定位方式 | 示例 | 稳定性 |
|--------|----------|------|--------|
| 1 | Role + Name | `getByRole('button', { name: '登录' })` | 最高 |
| 2 | Placeholder/Label | `getByPlaceholder('请输入密码')` | 高 |
| 3 | Text | `getByText('确认删除')` | 中 |
| 4 | CSS Selector | `locator('.btn-primary')` | 低（最后手段） |



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

基于需求分析，以下是可通过属性测试验证的正确性属性：

### Property 1: 认证 Token 注入

*For any* 使用 `authenticatedPage` Fixture 的测试，浏览器 localStorage 中应该包含有效的 token，且该 token 应该是通过 API 登录获取的。

**Validates: Requirements 3.1, 3.2**

### Property 2: Worker 前缀隔离

*For any* Worker 索引 N（N >= 0），`workerPrefix` 应该返回格式为 `[W{N}]` 的字符串；且 `TestDataFactory.createEmployee({ name: X })` 创建的员工名称应该以该前缀开头。

**Validates: Requirements 4.1, 4.2**

### Property 3: 测试数据自动清理

*For any* 通过 `testData` Fixture 创建的数据，在测试结束后应该被自动删除，数据库中不应存在该数据。

**Validates: Requirements 4.3**

### Property 4: API 登录返回 Token

*For any* 有效的用户名密码组合，`ApiClient.login(username, password)` 应该返回包含非空 `token` 字段的对象。

**Validates: Requirements 5.1**

### Property 5: 前缀批量清理

*For any* 前缀字符串 P 和一组带该前缀的测试数据，调用 `ApiClient.cleanupTestData(P)` 后，所有名称包含 P 的数据应该被删除。

**Validates: Requirements 5.3**

### Property 6: 唯一值生成

*For any* 连续 N 次调用 `TestDataFactory.generatePhone()` 或 `generateEmployeeNo()`，返回的 N 个值应该互不相同。

**Validates: Requirements 5.4**

## Error Handling

### 网络错误处理

| 场景 | 处理方式 |
|------|----------|
| API 服务未启动 | Playwright webServer 配置自动启动，超时报错 |
| API 请求超时 | ApiClient 设置合理超时，抛出明确错误 |
| API 返回错误 | 记录错误信息，测试失败时包含 API 响应 |

### 测试失败处理

| 场景 | 处理方式 |
|------|----------|
| 定位器超时 | Playwright 自动等待，超时后截图 |
| 断言失败 | 生成 trace 文件，记录失败时页面状态 |
| 数据清理失败 | 忽略错误（可能已被测试删除），全局 Teardown 兜底 |

### 并行执行冲突处理

| 场景 | 处理方式 |
|------|----------|
| 数据名称冲突 | Worker 前缀隔离，不同 Worker 数据不冲突 |
| 端口冲突 | webServer 配置 reuseExistingServer |
| 资源竞争 | 每个测试独立数据，不共享状态 |

## Testing Strategy

### 测试层级

| 层级 | 工具 | 职责 | 运行时机 |
|------|------|------|----------|
| 单元测试 | Vitest | 纯函数、工具方法 | 每次提交 |
| 属性测试 | Vitest + fast-check | 边界条件、不变量 | 每次提交 |
| 集成测试 | Vitest + RTL + MSW | 组件交互、mock API | 每次提交 |
| E2E 测试 | Playwright | 完整用户流程、真实后端 | PR/部署前 |

### E2E 测试配置

- **最小迭代次数**：属性测试 100 次（由于 E2E 较慢，可适当减少）
- **浏览器覆盖**：Chromium（主要）、Firefox、WebKit
- **失败重试**：CI 环境 2 次，本地 0 次
- **并行执行**：本地并行，CI 串行

### 测试命令

```bash
# 单元 + 集成测试（快速，每次提交）
pnpm test

# 属性测试（定期，关键模块）
pnpm test:pbt

# E2E 测试（PR/部署前）
pnpm test:e2e

# E2E UI 模式（调试）
pnpm test:e2e:ui

# 全量测试
pnpm test:all
```

### 属性测试标注格式

每个属性测试必须包含注释标注：

```typescript
/**
 * Feature: e2e-framework, Property 2: Worker 前缀隔离
 * Validates: Requirements 4.1, 4.2
 */
test('Worker 前缀格式正确', async () => {
  // ...
});
```
