# 属性测试最佳实践 (Web端)

## 1. 何时使用属性测试 (PBT)
- **输入空间巨大**：如表单验证、数据转换、复杂算法.
- **寻找边界情况**：如负数、极大数、特殊字符、空值、Unicode.
- **验证不变量 (Invariants)**：如 `decode(encode(x)) === x`.

## 2. 编写模式

### 2.1 Schema 健壮性测试
针对 Zod Schema，验证其是否能正确处理各种输入，避免运行时崩溃.

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

### 2.2 往返测试 (Round-trip)
适用于数据转换、序列化等场景.

```typescript
propTest.prop({
  original: fc.string()
})('should restore original value after encode/decode', ({ original }) => {
  const encoded = encode(original);
  const decoded = decode(encoded);
  expect(decoded).toBe(original);
});
```

### 2.3 幂等性测试 (Idempotency)
多次执行结果应保持一致.

```typescript
propTest.prop({
  text: fc.string()
})('should be idempotent', ({ text }) => {
  const once = format(text);
  const twice = format(once);
  expect(twice).toBe(once);
});
```

## 3. 性能优化
- 在 CI 环境中限制 `numRuns`，避免拖慢流水线.
- 将耗时测试标记为 `.skip` 或单独的 `slow` 套件.
