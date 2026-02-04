# 属性测试最佳实践 (Server & Web)

## 1. 核心原则
- **定义属性而非示例**：测试 "输入 X 总是产生 Y"，而不是 "输入 1 产生 2"。
- **全覆盖**：让生成器覆盖所有可能的边界情况（空值、负数、极大值、特殊字符、Unicode）。
- **确定性**：虽然输入是随机的，但测试结果必须是可重复的（使用 seed 复现）。
- **不变量 (Invariants)**：验证系统的不变法则，如：
  - **守恒性**: 总量不变。
  - **往返性**: `decode(encode(x)) === x`。
  - **幂等性**: `f(f(x)) === f(x)`。

## 2. 文件与目录规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Server 测试 | `*.pbt.test.ts` | `leave.service.pbt.test.ts` |
| Web 测试 | `*.property.test.ts` | `attendance.property.test.ts` |
| Shared 生成器 | `packages/shared/src/test/arbitraries/` | `common.arb.ts` |
| Server 生成器 | `packages/server/src/common/test/arbitraries/` | `shift.arb.ts` |

## 3. 编写模式

### 3.1 基础模版 (Server Service)
```typescript
import { describe, it, expect, vi } from 'vitest';
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

### 3.2 Schema 健壮性测试 (Web Zod)
针对 Zod Schema，验证其是否能正确处理各种输入，避免运行时崩溃。

```typescript
import { fc, test as propTest } from '@fast-check/vitest';
import { MySchema } from './my-schema';

propTest.prop({
  data: fc.record({
    age: fc.integer(),
    email: fc.string()
  })
})('should never throw runtime error during parsing', ({ data }) => {
  // safeParse 应该永远不抛出异常，只返回 success: true/false
  expect(() => MySchema.safeParse(data)).not.toThrow();
});
```

### 3.3 生成器复用
优先使用已有的生成器，避免重复定义：

```typescript
import { dateArb } from '@attendance/shared/test/arbitraries/common.arb';
```

## 4. Mock 技巧 (Server)
在 Vitest 中使用 PBT 时，为了保证 Mock 引用的一致性，请**在 mock 调用外部定义 mock 函数**，并在 `beforeEach` 中重置。

```typescript
// ✅ 正确做法
const findUniqueMock = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: { findUnique: findUniqueMock }
  }
}));

afterEach(() => {
  vi.resetAllMocks();
});
```

## 5. 常见陷阱与调试
1.  **超时**：默认 PBT 运行 100 次，如果涉及异步 DB 操作可能会慢。
    - 解决：调整 `numRuns` 或将测试拆分。
2.  **不合法的随机数据**：生成的日期可能是 `Invalid Date` 或逻辑上不合理（如 `endTime < startTime`）。
    - 解决：使用 `.filter(r => r.start < r.end)` 进行约束。
3.  **调试**：
    - 查看 CI 日志中的 `Seed` 和 `Path`。
    - 本地复现：`fc.assert(property, { seed: <failed_seed>, path: <failed_path> })`。

## 6. 性能优化
- 在 CI 环境中通过环境变量控制 `numRuns`。
- 将耗时测试标记为 `.skip` 或单独的 `slow` 套件。
