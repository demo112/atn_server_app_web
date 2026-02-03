# ENG01 - 任务拆分

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | root, web |
| 涉及端 | Server, Web, App |
| 预计总时间 | 60 分钟 |

## 任务清单

### 阶段1：L1 治理层 (Governance)

#### Task 1: 升级 ESLint 强类型规则
- **文件**: `eslint.config.mjs`
- **内容**: 
  - 将 `@typescript-eslint/no-explicit-any` 升级为 `error`
  - 将 `no-console` 升级为 `error` (允许 warn/error)
- **验证**: `npm run lint` (检查规则是否生效)
- **依赖**: 无

#### Task 2: 构建 Web 端防腐层 (Zod Schema) - 基础
- **文件**: 
  - `packages/web/src/schemas/common.ts` (分页等通用定义)
  - `packages/web/src/schemas/user.ts` (用户模型)
  - `packages/web/src/schemas/auth.ts` (登录模型)
- **内容**: 创建基础 Zod Schemas，定义 API 数据契约
- **验证**: `pnpm --filter @attendance/web exec tsc --noEmit`
- **依赖**: 无

#### Task 3: 构建 Web 端防腐层 (Zod Schema) - 业务
- **文件**: 
  - `packages/web/src/schemas/department.ts`
- **内容**: 创建部门相关 Zod Schemas
- **验证**: `pnpm --filter @attendance/web exec tsc --noEmit`
- **依赖**: Task 2

### 阶段2：L3 运营层 (Operations) - Web S1

#### Task 4: 集成 Zod 运行时校验 (示例)
- **文件**: 
  - `packages/web/src/services/api.ts` (增强请求方法)
  - `packages/web/src/services/auth.ts` (应用校验)
- **内容**: 在 API 请求层引入 Schema 校验，拦截不符合契约的数据
- **验证**: `npm run test:web` (确保现有测试通过)
- **依赖**: Task 2

## 完成标准 (DoD)

每个任务完成前必须确认：

### 代码层面
- [ ] `npm run lint` 通过 (Task 1 可能会暴露存量问题，需评估)
- [ ] `npm run typecheck` 通过
- [ ] 无 `any` 使用 (Task 1 后强制)

### 文档层面
- [ ] design.md 已同步
