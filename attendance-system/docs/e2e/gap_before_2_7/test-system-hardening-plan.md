# 测试系统加固计划 (Test System Hardening Plan)

基于 `gap-analysis-requirements` 及实际执行的漏测分析报告，制定以下分层加固计划。本计划旨在从静态分析、单元测试、集成测试、E2E 测试四个维度系统性提升测试覆盖率和系统健壮性。

## 1. 静态分析层 (L1 - Static Analysis)

**目标**: 在代码提交前自动拦截明显的安全隐患和规范违规。

| 模块 | 问题 | 加固措施 | 具体任务 |
| :--- | :--- | :--- | :--- |
| **Web** | Schema 缺失 `.max()` 限制 | 集成自定义 Lint 规则 | 将 `audit-zod-schemas.ts` 改造为 CI 脚本，作为 `lint` 命令的一部分。 |
| **App** | 导航参数未校验 | 集成自定义 Lint 规则 | 将 `audit-navigation.ts` 改造为 CI 脚本，作为 `lint` 命令的一部分。 |
| **Server**| DTO 缺失 `.max()` 限制 | 新增 DTO 审计脚本 | 编写 Server 端 Schema 审计脚本，检查所有 `z.string()` 是否包含长度限制。 |

## 2. 单元/组件测试层 (L2 - Unit/Component Test)

**目标**: 验证最小单元的业务逻辑和边界条件，不依赖外部服务。

| 模块 | 问题 | 加固措施 | 具体任务 |
| :--- | :--- | :--- | :--- |
| **Server** | DTO 校验逻辑未独立测试 | 增加 DTO 单元测试 | 为 `packages/server/src/modules/*/dto` 下的文件建立对应的 `.test.ts`，重点测试超长字符串、特殊字符、空值等边界。 |
| **Web** | 表单组件容错性未知 | 增加表单组件测试 | 使用 React Testing Library 对核心表单组件进行测试，验证输入超长文本时的 UI 表现（如截断、错误提示）。 |
| **App** | 页面接收无效参数时的表现未知 | 增加 Screen 组件测试 | 使用 React Native Testing Library 测试页面组件，传入 `route.params: null` 或无效 ID，验证页面是否崩溃（应显示错误页或 Loading）。 |

## 3. 集成测试层 (L3 - Integration Test)

**目标**: 验证模块间协作及 API 契约，模拟真实数据流。

| 模块 | 问题 | 加固措施 | 具体任务 |
| :--- | :--- | :--- | :--- |
| **Server** | 缺乏针对超长输入的系统性拦截测试 | 扩展 API Fuzzing 测试 | 扩展 `dto-validation.test.ts`，将其泛化为通用测试工具，对所有 POST/PUT 接口自动注入超长 Payload 进行测试。 |
| **App** | 导航流程缺乏保护 | 增加导航集成测试 | 模拟深层链接（Deep Link）跳转，验证未登录或无权限时的跳转拦截逻辑。 |

## 4. E2E 测试层 (L4 - E2E Test)

**目标**: 模拟真实用户行为，验证端到端流程的稳健性。

| 模块 | 问题 | 加固措施 | 具体任务 |
| :--- | :--- | :--- | :--- |
| **Web** | 极端输入下的用户体验 | 增加“破坏性”测试用例 | 在 Playwright 测试中增加针对核心表单（创建用户、部门）的破坏性测试：输入 1000+ 字符，断言前端是否弹出友好提示而非 Crash。 |

## 5. 执行路线图

### 第一阶段：静态防线建设 (P0)
- [ ] 将 Web/App/Server 的审计脚本标准化，集成到 `package.json` 的 `lint` 命令中。
- [ ] 在 CI 流程中启用这些检查，阻止新增违规代码入库。

### 第二阶段：Server 端安全加固 (P1)
- [ ] 修复所有 DTO 缺失 `.max()` 的问题。
- [ ] 将 `dto-validation.test.ts` 固化为标准测试套件 `api-security.test.ts`。

### 第三阶段：客户端健壮性提升 (P2)
- [ ] 修复 Web 端 Zod Schema 问题。
- [ ] 修复 App 端导航参数校验问题（引入 Zod 解析参数）。
- [ ] 补充 App 页面级容错测试。

### 第四阶段：E2E 覆盖完善 (P3)
- [ ] 在 `packages/e2e` 中补充 Web 端破坏性测试用例。

---

*注：本计划遵循“只测不改”原则的下一阶段——即“修复与加固”阶段。当前阶段仅产出此计划供评审。*
