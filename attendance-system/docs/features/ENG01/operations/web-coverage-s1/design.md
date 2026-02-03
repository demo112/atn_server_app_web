# Design: Web端测试覆盖提升 (迭代1)

## Test Strategy

### 1. 测试分层
- **Unit Tests**: 针对 `utils` 和纯展示 `components`。
  - 位置：同目录
  - 命名：`*.test.ts` / `*.test.tsx`
- **Integration Tests**: 针对 `pages` 及其业务流程。
  - 位置：`src/__tests__/integration/` 或各模块下的 `__tests__/`
  - 命名：`*.integration.test.tsx`
  - 策略：使用 MSW 模拟后端，测试 Happy Path。
- **E2E Tests**: 暂不包含。

### 2. 目录结构规范
```
src/
├── utils/
│   ├── auth.ts
│   └── auth.test.ts               # Unit
├── components/
│   ├── DepartmentSelect/
│   │   ├── index.tsx
│   │   └── index.test.tsx         # Unit
└── __tests__/
    └── integration/
        ├── Login.integration.test.tsx      # Integration
        ├── Department.integration.test.tsx
        └── Employee.integration.test.tsx
```

### 3. Mocking Strategy (MSW)
- 所有 API 请求通过 `src/test/mocks/handlers` 进行拦截。
- 页面测试前必须 `server.listen()`。

## Refactoring Requirements
- `Login.tsx` 等页面需确保 `data-testid` 完备，便于定位元素。
