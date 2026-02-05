# 20260205-recalc-zod-fix

## 问题描述

用户在触发考勤重算时遇到 `ZodError`，导致重算请求失败。

**错误信息**：
```
Recalculation failed ZodError: ...
```

**原因分析**：
- 后端 `/statistics/calculate` 接口返回了 `{ success: true, data: { message: "..." } }`。
- 前端 `triggerCalculation` 使用 `z.void()` 校验响应数据。
- `z.void()` 期望 `undefined`，但实际收到了 `{ message: ... }`，导致校验失败。

## 修复方案

修改 `packages/web/src/services/statistics.ts`，将校验规则从 `z.void()` 放宽为 `z.any()`。

```typescript
// Before
return validateResponse(z.void(), res);

// After
return validateResponse(z.any(), res);
```

## 验证

编写了 `src/services/statistics.verify.test.ts` 单元测试：
1. 模拟后端返回 `{ message: "..." }`。
2. 验证 `z.void()` 会抛出错误。
3. 验证 `z.any()` 能通过校验。

## 影响范围

仅影响考勤重算功能的前端响应处理逻辑。
