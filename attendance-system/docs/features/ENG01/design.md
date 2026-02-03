# ENG01 - 设计文档

## 技术方案

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        质量门禁体系                                   │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│  写代码前  │  写代码时  │  保存时   │  提交前   │  推送后   │   合并前     │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│  Rules   │  ESLint  │  Format  │ Pre-commit│   CI     │  Code Review │
│  Steering│  TS编译   │  Hooks   │  Hooks   │  Pipeline│  DoD 检查    │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
     ↓           ↓          ↓          ↓          ↓           ↓
   [软约束]    [即时反馈]   [自动修复]  [本地门禁]  [远程门禁]   [人工门禁]
```

### 各层职责

| 层级 | 工具 | 作用 | 强制性 |
|------|------|------|--------|
| 软约束 | Rules/Steering | 指导 AI 生成代码 | ❌ 可忽略 |
| 即时反馈 | ESLint + IDE | 写代码时实时提示 | ❌ 可忽略 |
| 本地门禁 | husky + lint-staged | commit 时检查 | ⚠️ 可绕过 |
| 远程门禁 | GitHub Actions | push 后检查 | ✅ 无法绕过 |

## 详细设计

### 1. ESLint 配置

#### 1.1 Monorepo 根配置

```javascript
// attendance-system/eslint.config.mjs
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  }
);
```

#### 1.2 各端继承配置

```javascript
// packages/server/eslint.config.mjs
import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  { /* server 特定规则 */ }
];
```

### 2. Pre-commit 配置

#### 2.1 安装依赖

```bash
npm install -D husky lint-staged
```

#### 2.2 lint-staged 配置

```json
{
  "lint-staged": {
    "packages/server/**/*.ts": ["eslint --fix", "prettier --write"],
    "packages/web/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "packages/app/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

#### 2.3 pre-commit hook

```bash
# .husky/pre-commit
npx lint-staged
npm run typecheck --workspaces --if-present
```

### 3. CI Pipeline 配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --workspaces

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck --workspaces --if-present

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build --workspaces

  test:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test --workspaces --if-present
```

### 4. Zod 运行时校验

#### 4.1 Schema 定义

```typescript
// packages/shared/src/schemas/common.ts
import { z } from 'zod';

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  });

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
```

#### 4.2 Service 层使用

```typescript
// packages/web/src/services/employee.ts
const EmployeeListSchema = PaginatedResponseSchema(EmployeeSchema);

export async function getEmployees(params: EmployeeQuery): Promise<EmployeeListVo> {
  const response = await request.get('/employees', { params });
  
  const result = EmployeeListSchema.safeParse(response.data);
  if (!result.success) {
    console.error('API Response validation failed:', result.error);
    throw new Error('数据格式异常，请联系管理员');
  }
  
  return result.data;
}
```

### 5. 统一错误处理

#### 5.1 后端全局错误中间件

```typescript
// packages/server/src/common/error-handler.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const response = {
    success: false as const,
    error: {
      code: err instanceof AppError ? err.code : 'ERR_INTERNAL',
      message: err.message || 'Internal Server Error',
    },
  };

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json(response);
};
```

#### 5.2 前端错误边界

```typescript
// packages/web/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error?.message}
          extra={<Button onClick={() => window.location.reload()}>刷新页面</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

## 迁移策略

### 阶段一：建立基础设施（不阻断开发）

1. 配置 ESLint，规则设为 `warn`
2. 配置 husky，但不强制阻断
3. 统计存量问题数量作为基线

### 阶段二：逐步收紧

1. 新代码必须通过 lint
2. 关键规则从 `warn` 改为 `error`
3. 每周修复一定数量的存量问题

### 阶段三：全面强制

1. 所有规则改为 `error`
2. CI 失败阻止合并
3. 存量问题清零

## 风险与应对

| 风险 | 应对 |
|------|------|
| 存量问题太多 | 使用 `eslint-disable` 临时豁免 |
| 开发效率下降 | 配置 IDE 自动修复 |
| 规则过严导致抵触 | 先 warn 后 error |
