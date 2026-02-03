# Requirements: 工程质量治理体系 (ENG01)

## Overview

工程质量治理体系 (ENG01) 是一个集"规范立法(Governance)"、"基础设施(Infrastructure)"、"运营落地(Operations)"于一体的系统化工程。
旨在解决项目中存在的 TypeScript 类型失效、前后端契约断裂、测试覆盖率低、代码规范不统一等问题，通过建立从静态检查到运行时验证的完整质量闭环。

## 核心价值

- **统一规范**：消除 "Broken Windows"，确保三端 (Server/Web/App) 代码风格一致。
- **质量基建**：提供开箱即用的测试工具链，降低编写测试的门槛。
- **数据驱动**：通过覆盖率和错误率指标，量化质量现状，驱动持续改进。

## User Stories

### L1: 治理层 (Governance) - "立法"

> 目标：制定规则，建立门禁，统一错误处理与类型契约。

#### Story 1.1: 静态代码分析与规范
As a **Tech Lead**, I want **统一的 ESLint/Prettier 配置**, So that **消除低级语法错误和风格争议**.
- **AC1**: 三端统一禁用 `any` (`no-explicit-any: error`)。
- **AC2**: 强制要求显式函数返回类型。
- **AC3**: 消除所有未使用的变量。

#### Story 1.2: 提交门禁 (Git Hooks)
As a **Developer**, I want **在提交前自动检查代码**, So that **错误代码不会进入代码仓库**.
- **AC1**: Pre-commit 阶段自动运行 Lint 和 Type Check。
- **AC2**: Commit Message 必须符合 `<type>(<scope>): <subject>` 规范。

#### Story 1.3: 运行时数据校验
As a **Frontend Developer**, I want **在数据入口处校验后端响应**, So that **避免因数据结构变更导致的白屏**.
- **AC1**: 引入 Zod 库。
- **AC2**: 关键业务接口响应必须经过 Zod Schema 校验。

---

### L2: 基建层 (Infrastructure) - "修路"

> 目标：提供统一的测试运行器、Mock 服务和 CI 流水线。

#### Story 2.1: 统一测试运行环境
As a **Developer**, I want **在根目录一键运行所有测试**, So that **无需切换目录即可验证全系统**.
- **AC1**: `pnpm test` 可触发所有包的测试。
- **AC2**: Shared 包配置好 Vitest (Node环境)。
- **AC3**: Web 包配置好 Vitest + RTL (JSDOM环境)。
- **AC4**: App 包配置好 Jest + RNTL (Mobile环境)。

#### Story 2.2: API Mock 服务
As a **Frontend Developer**, I want **拦截并模拟 API 请求**, So that **前端测试不依赖真实后端服务**.
- **AC1**: Web 端集成 MSW (Mock Service Worker)。
- **AC2**: 提供常用业务数据的 Factory 或 Fixtures。
- **AC3**: Mock 数据结构必须与真实 API 响应结构一致（含 `ApiResponse` 封套）。

---

### L3: 运营层 (Operations) - "行车"

> 目标：执行具体的测试覆盖和专项治理行动。

#### Story 3.1: Web 端核心覆盖率提升 (S1)
As a **QA**, I want **覆盖 Web 端核心业务路径**, So that **保证基本功能不回退**.
- **AC1**: 核心工具函数 (`utils/auth`, `utils/request`) 覆盖率 > 90%。
- **AC2**: 核心组件 (`DepartmentSelect`, `DepartmentTree`) 交互逻辑覆盖。
- **AC3**: 关键页面 (`Login`, `Department`, `Employee`) 的 Happy Path 集成测试。

#### Story 3.2: 后端契约测试 (S2 - Planned)
As a **Backend Developer**, I want **确保 API 变更不破坏前端**, So that **前后端协作更顺畅**.
- **AC1**: 基于 Zod Schema 生成 API 文档或契约测试用例。

## Constraints

- **技术栈**: Vitest (Web/Shared), Jest (App), MSW, Zod, ESLint, Husky.
- **兼容性**: 必须兼容 Windows/PowerShell 开发环境。
- **性能**: 提交门禁检查需在 10s 内完成（只检查 staged 文件）。

## Out of Scope

- E2E 测试 (Cypress/Playwright) - 暂不纳入 ENG01，后续单独规划。
- 性能测试 (Load Testing) - 暂不纳入。
- 遗留代码的全面重构 - 仅在涉及到的模块进行 "Boy Scout Rule" 式的小幅清理。

## Assumptions

- 团队成员已熟悉基本的 TypeScript 和 React 语法。
- 现有的 CI 环境 (如 GitHub Actions) 可用。

## Metadata

- **状态**: In Progress
- **负责人**: AI Assistant
- **最后更新**: 2026-02-03
