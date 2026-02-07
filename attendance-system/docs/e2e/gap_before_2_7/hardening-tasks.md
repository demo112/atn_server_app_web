# Tasks: 测试系统加固 (Test System Hardening)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 10 |
| 涉及模块 | Server, Web, App |
| 涉及端 | 全端 |
| 预计总时间 | 4-5 小时 |
| 来源计划 | `test-system-hardening-plan.md` |

## 任务清单

### 阶段1：静态防线建设 (P0)

> 目标：将本次漏测分析的脚本固化为 CI/CD 流程的一部分，防止新问题引入。

#### Task 1: 标准化 Schema 审计脚本 (Web)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/scripts/lint-schema.ts` |
| 操作 | 新增/迁移 |
| 内容 | 将 `audit-zod-schemas.ts` 改造为标准 Lint 脚本，发现缺失 `.max()` 时以非零状态码退出。 |
| 验证 | 命令: `npm run lint:schema` (需在 package.json 中配置) |
|      | 预期: 扫描现有代码报错（预期内），修复后通过。 |
| 预计 | 30 分钟 |
| 依赖 | 无 |

#### Task 2: 标准化导航审计脚本 (App)

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/scripts/lint-nav.ts` |
| 操作 | 新增/迁移 |
| 内容 | 将 `audit-navigation.ts` 改造为标准 Lint 脚本，发现裸用 `route.params` 时报错。 |
| 验证 | 命令: `npm run lint:nav` (需在 package.json 中配置) |
|      | 预期: 扫描现有代码报错（预期内），修复后通过。 |
| 预计 | 30 分钟 |
| 依赖 | 无 |

#### Task 3: 集成到 CI 流程

| 属性 | 值 |
|------|-----|
| 文件 | `package.json` (Root & Packages) |
| 操作 | 修改 |
| 内容 | 在 `lint` 命令中增加上述检查，确保 `npm run lint` 包含安全扫描。 |
| 验证 | 命令: `npm run lint` |
|      | 预期: 执行所有检查。 |
| 预计 | 15 分钟 |
| 依赖 | Task 1, Task 2 |

### 阶段2：Server 端安全加固 (P1)

> 目标：修复后端 DTO 校验缺失，建立 API 安全测试基准。

#### Task 4: 修复 DTO 长度限制

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/**/dto/*.ts` |
| 操作 | 修改 |
| 内容 | 根据 `server-dto-gaps.md` 报告，为所有 `z.string()` 添加 `.max()` 限制。 |
| 验证 | 命令: `npm run lint:dto` (如新增脚本) 或 `npx vitest run dto-validation.test.ts` |
|      | 预期: `dto-validation.test.ts` 中的超长 Payload 测试由 500 变更为 400 Bad Request。 |
| 预计 | 45 分钟 |
| 依赖 | 无 |

#### Task 5: 建立 API 安全模糊测试套件

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/test/security/api-fuzzing.test.ts` |
| 操作 | 新增 |
| 内容 | 将 `dto-validation.test.ts` 泛化，自动扫描所有注册的 POST 接口，注入超长字符串进行 Fuzzing。 |
| 验证 | 命令: `npx vitest run api-fuzzing.test.ts` |
|      | 预期: 所有接口返回 400 而非 500。 |
| 预计 | 60 分钟 |
| 依赖 | Task 4 |

#### Task 6: 补充 DTO 单元测试

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/**/dto/*.test.ts` |
| 操作 | 新增 |
| 内容 | 为核心模块（User, Auth, Attendance）的 DTO 编写单元测试，覆盖边界情况。 |
| 验证 | 命令: `npx vitest run dto` |
|      | 预期: 测试通过。 |
| 预计 | 45 分钟 |
| 依赖 | Task 4 |

### 阶段3：客户端健壮性提升 (P2)

> 目标：提升前端和移动端的容错能力。

#### Task 7: 修复 Web Schema 问题

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/**/*.ts` (Schema files) |
| 操作 | 修改 |
| 内容 | 根据 `web-schema-gaps.md` 报告，修复 100+ 处缺失 `.max()` 的 Schema。 |
| 验证 | 命令: `npm run lint:schema` |
|      | 预期: 检查通过，无报错。 |
| 预计 | 60 分钟 |
| 依赖 | Task 1 |

#### Task 8: 修复 App 导航参数校验

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/**/*.tsx` |
| 操作 | 修改 |
| 内容 | 引入 `zod` 或自定义 Hook，对 `route.params` 进行运行时解析和校验。 |
| 验证 | 命令: `npm run lint:nav` |
|      | 预期: 检查通过，无裸用 params。 |
| 预计 | 60 分钟 |
| 依赖 | Task 2 |

#### Task 9: App 页面容错测试

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/__tests__/*.test.tsx` |
| 操作 | 新增 |
| 内容 | 测试页面组件在 `params=null` 时的渲染表现（不应 Crash）。 |
| 验证 | 命令: `npm run test:app` |
|      | 预期: 测试通过。 |
| 预计 | 45 分钟 |
| 依赖 | Task 8 |

### 阶段4：E2E 覆盖完善 (P3)

#### Task 10: Web 端破坏性测试

| 属性 | 值 |
|------|-----|
| 文件 | `packages/e2e/tests/web/robustness.spec.ts` |
| 操作 | 新增 |
| 内容 | 模拟用户输入 1000+ 字符到表单，验证前端 UI 提示。 |
| 验证 | 命令: `pnpm test:e2e -- robustness` |
|      | 预期: 测试通过，断言 UI 显示错误提示。 |
| 预计 | 30 分钟 |
| 依赖 | Task 7 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 阶段1完成 | 提交 CI 脚本，确保后续代码不退化。 |
| 阶段2完成 | Server 端安全基线建立，API Fuzzing 测试通过。 |
| 阶段3完成 | 客户端代码合规，Lint 检查全部通过。 |
| 全部完成 | 全链路回归测试。 |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 7 (Web Schema) | 涉及文件较多（100+），可能漏改或改错业务逻辑 | 分模块进行，优先处理 Auth 和 User 模块；利用 Task 1 的脚本辅助验证。 |
| Task 8 (App Params) | 修改导航参数获取方式可能导致现有页面逻辑中断 | 封装统一的 `useSafeParams<T>(schema)` Hook，渐进式替换。 |
