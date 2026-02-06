# AI 修复记录：SW72 E2E 测试 Mock 数据结构错误

## 1. 问题描述

在运行 SW72 (统计报表) 的 E2E 测试时，`报表默认展示` 和 `按月份搜索` 用例失败。

**错误现象**：
测试期望在表格中找到 "研发部" 等部门名称，但表格显示 "暂无数据"。

**错误日志**：
```
Error: expect(locator).toContainText(expected) failed
Locator: locator('table')
Expected substring: "研发部"
Received string: "部门总人数出勤率正常迟到早退缺勤请假暂无数据"
```

## 2. 原因分析

**根因**：
E2E 测试中的 `page.route` Mock 返回的数据结构与 API 契约不一致。

- **前端代码 (`services/api.ts`)**：
  前端统一拦截器期望后端返回 `ApiResponse` 结构：
  ```typescript
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string };
  }
  ```

- **错误的 Mock 实现 (`report.spec.ts`)**：
  直接返回了数据数组：
  ```typescript
  await route.fulfill({
    body: JSON.stringify(mockDeptStats) // 错误：直接返回数组
  });
  ```

- **结果**：
  前端 `validateResponse` 函数检查 `apiRes.success` 时失败（undefined），或者直接抛出错误，导致前端组件捕获错误并显示空状态或错误提示。

## 3. 修复方案

修改 `packages/e2e/tests/statistics/report.spec.ts` 中的所有 `route.fulfill` 调用，使其包裹在 `ApiResponse` 结构中。

**修改前**：
```typescript
body: JSON.stringify(mockDeptStats)
```

**修改后**：
```typescript
body: JSON.stringify({
  success: true,
  data: mockDeptStats
})
```

涉及的接口 Mock：
1. `/api/v1/statistics/departments`
2. `/api/v1/statistics/charts`

## 4. 验证结果

运行测试命令：
```bash
pnpm test:e2e -- --grep "SW72"
```

**结果**：
- `SW72: 统计报表 › 报表默认展示` ✅ Passed
- `SW72: 统计报表 › 按月份搜索` ✅ Passed
- 所有 5 个用例全部通过。

## 5. 影响范围

- 仅影响 SW72 模块的 E2E 测试代码。
- 不影响业务代码。
- 不影响其他测试模块。
