# Design: 工程质量治理体系 (ENG01)

## 1. 架构概览

ENG01 采用 **G-I-O 三层架构**，从规范立法到基建修路，最后到运营落地，形成完整的质量闭环。

### 核心映射

| 层级 | 职责 | 实现方式 | 关键技术 |
|------|------|----------|----------|
| **L1: Governance** | 立法 | 静态分析 + 门禁 | ESLint, Husky, Zod |
| **L2: Infrastructure** | 修路 | 测试运行器 + Mock | Vitest, Jest, MSW |
| **L3: Operations** | 行车 | 业务测试用例 | RTL, Integration Tests |

---

## 2. L1: 治理层 (Governance) 设计

### 2.1 ESLint 强类型策略
- **规则升级**:
  - `@typescript-eslint/no-explicit-any`: `warn` -> `error` (强类型)
  - `@typescript-eslint/explicit-function-return-type`: `warn` (接口契约显性化)
  - `no-console`: `error` (防止调试代码残留)

### 2.2 Zod 运行时校验
在前端数据入口层 (Service/API) 引入 Zod Schema，构建 "防腐层"。

```typescript
// packages/web/src/schemas/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.enum(['admin', 'user']),
});

export type User = z.infer<typeof UserSchema>;

// Service 层使用
const response = await api.get('/user');
const user = UserSchema.parse(response.data); // 运行时校验，失败则抛错
```

---

## 3. L2: 基建层 (Infrastructure) 设计

### 3.1 统一测试入口
根目录 `package.json` 脚本映射：

```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:web": "pnpm --filter @attendance/web test",
    "test:server": "pnpm --filter @attendance/server test",
    "test:app": "pnpm --filter @attendance/app test"
  }
}
```

### 3.2 MSW Mock 架构 (Web)
采用 "Handlers + Data Factory" 模式，确保 Mock 数据可维护。

```typescript
// packages/web/src/test/mocks/handlers/user.ts
import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/user';

export const userHandlers = [
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers
    });
  }),
];
```

---

## 4. L3: 运营层 (Operations) 设计

### 4.1 Web 端覆盖策略 (S1)
- **Unit Tests**: 针对 `utils` 和纯组件，关注输入输出。
- **Integration Tests**: 针对 Page 级别，关注用户旅程 (User Journey)。

### 4.2 目录规范
```
packages/web/src/
├── utils/
│   └── auth.test.ts               # Unit
├── components/
│   └── DepartmentSelect/
│       └── index.test.tsx         # Unit
└── __tests__/
    └── integration/
        ├── Login.test.tsx         # Integration
        └── Department.test.tsx
```

---

## 5. 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `docs/features/ENG01/design.md` | 新增 | 本文档 (Unified Design) |
| `packages/web/src/schemas/*.ts` | 新增 | Zod Schemas (按需) |
| `packages/web/src/__tests__/integration/*.tsx` | 新增 | 集成测试用例 |

## 6. 技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| **Mock 工具** | **MSW** | 拦截网络请求层，比 Jest Mock 更贴近真实环境，且无侵入性。 |
| **测试框架 (Web)** | **Vitest** | 与 Vite 构建工具链原生集成，速度远快于 Jest。 |
| **校验库** | **Zod** | TS 生态首选，支持类型推导，API 简洁。 |

## 7. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| **Lint 升级报错** | 旧代码大量报错 | 暂不处理旧代码，仅对新代码生效 (或设为 warning 逐步修复)。 |
| **Mock 数据漂移** | Mock 与后端不一致 | (L3规划) 引入后端契约测试，自动生成 Mock 数据。 |
