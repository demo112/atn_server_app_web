# 属性测试 (Property-Based Testing) 最佳实践

## 1. 核心原则

- **定义属性而非示例**：测试"输入 X 总是产生 Y"，而不是"输入 1 产生 2"。
- **全覆盖**：让生成器覆盖所有可能的边界情况（空值、负数、极大值、特殊字符）。
- **确定性**：虽然输入是随机的，但测试结果必须是可重复的（使用 seed 复现）。

## 2. 文件与目录规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 测试文件 | `*.pbt.test.ts` | `leave.service.pbt.test.ts` |
| 生成器(Shared) | `packages/shared/src/test/arbitraries/` | `common.arb.ts` |
| 生成器(Server) | `packages/server/src/common/test/arbitraries/` | `prisma-types.arb.ts` |

## 3. 编写指南

### 3.1 基础模版

```typescript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('MyService PBT', () => {
  it('should maintain invariant X', async () => {
    await fc.assert(
      fc.asyncProperty(myArbitrary, async (input) => {
        // 1. Setup
        // 2. Execute
        const result = await service.method(input);
        // 3. Verify
        expect(result).toBeValid();
      })
    );
  });
});
```

### 3.2 生成器复用

优先使用已有的生成器，避免重复定义：

```typescript
import { dateArb } from '@attendance/shared/test/arbitraries/common.arb';
import { attLeaveArb } from '../../common/test/arbitraries/prisma-types.arb';
```

### 3.3 Mock 技巧

在 Vitest 中使用 PBT 时，为了保证 Mock 引用的一致性，请**在 mock 调用外部定义 mock 函数**：

```typescript
// ✅ 正确做法
const findUniqueMock = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: { findUnique: findUniqueMock }
  }
}));

// ❌ 错误做法 (每次都会生成新引用，导致 expect 失败)
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() }
  }
}));
```

并且在 `beforeEach` 或 `afterEach` 中重置：

```typescript
afterEach(() => {
  vi.resetAllMocks();
});
```

## 4. 常见陷阱

1.  **超时**：默认 PBT 运行 100 次，如果涉及异步 DB 操作可能会慢。可调整 `numRuns`：
    ```typescript
    fc.assert(property, { numRuns: 50 })
    ```
2.  **不合法的随机数据**：生成的日期可能是 `Invalid Date` 或逻辑上不合理（如 `endTime < startTime`）。
    - 解决方法：在 Arbitrary 层面使用 `filter` 或 `map` 进行约束。
    - 示例：
      ```typescript
      const rangeArb = fc.record({ start: fc.date(), end: fc.date() })
        .filter(r => r.start < r.end);
      ```

## 5. 调试

如果 CI 挂了，查看日志中的 `Counterexample` 和 `Seed`。
在本地复现：
```typescript
fc.assert(property, { seed: <failed_seed>, path: <failed_path> })
```
