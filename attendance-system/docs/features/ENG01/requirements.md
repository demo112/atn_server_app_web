# ENG01 - 工程质量治理体系建设

## 概述

建立"契约校验-统一异常-强制门禁-全链路测试"的工程闭环，从根本上解决 TypeScript 规范失效、前后端契约断裂、防御性编程缺失等系统性问题。

## 背景

### 问题现象

1. 前端频繁出现 `TypeError: xxx.map is not a function`（白屏）
2. 后端 `AxiosError: 500`（服务崩溃）
3. 代码中 `any` 满天飞，类型安全形同虚设
4. `@ts-ignore` 和非空断言 `!` 滥用
5. `console.log` 调试代码残留

### 根因分析

| 层级 | 问题 | 表现 |
|------|------|------|
| 机制层 | 契约断裂 | shared 定义 `data: T[]`，后端返回 `{ items: [], total }` |
| 机制层 | 校验真空 | 无运行时数据校验，完全依赖编译时类型 |
| 流程层 | DoD 流于形式 | 只测快乐路径，缺乏异常场景测试 |
| 流程层 | 门禁缺失 | 无 ESLint error、无 pre-commit、无 CI |
| 架构层 | 错误处理不统一 | 后端有的 try-catch，有的 next(error) |

### 当前状态

- ❌ 无 husky / pre-commit hooks
- ❌ 无 GitHub Actions CI
- ❌ 无项目级 ESLint 强制配置
- ❌ 无运行时数据校验（Zod）
- ❌ 无契约测试

## 用户故事

- 作为开发者，我希望代码提交时自动检查类型和规范，以便在问题进入仓库前被拦截
- 作为开发者，我希望前端能优雅处理后端异常，以便用户不会看到白屏
- 作为项目管理者，我希望有统一的质量门禁，以便保证代码质量底线

## 功能需求

### FR-1: ESLint 强制规则配置

在三端（server/web/app）配置统一的 ESLint 规则：

```javascript
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "no-console": ["error", { allow: ["warn", "error"] }]
}
```

### FR-2: Pre-commit 本地门禁

使用 husky + lint-staged 实现提交前自动检查：

- 运行 ESLint 检查
- 运行 Prettier 格式化
- 运行 TypeScript 类型检查

### FR-3: CI Pipeline 远程门禁

GitHub Actions 配置：

- Push/PR 触发
- 运行 lint、build、test
- 失败阻止合并

### FR-4: 运行时数据校验

前端 Service 层引入 Zod 校验：

```typescript
// 示例
const PaginatedResponseSchema = z.object({
  items: z.array(EmployeeSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// 在 service 中
const data = PaginatedResponseSchema.parse(response.data);
```

### FR-5: 统一错误响应格式

后端强制统一错误响应：

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;      // ERR_MODULE_TYPE
    message: string;
  };
}
```

### FR-6: 前端错误边界与降级

- 组件级 ErrorBoundary
- 数据加载失败的 Fallback UI
- 空数据状态处理

## 非功能需求

### NFR-1: 增量治理

- 新代码严格执行规则
- 存量代码逐步迁移
- 不阻塞当前开发进度

### NFR-2: 开发体验

- ESLint 配置不能过于严苛导致开发效率下降
- 提供 `// eslint-disable-next-line` 的合理使用指南

## 验收标准

- [ ] ESLint 配置完成，`npm run lint` 可执行
- [ ] husky + lint-staged 配置完成，commit 时自动检查
- [ ] GitHub Actions CI 配置完成，PR 自动运行检查
- [ ] 前端至少一个 Service 引入 Zod 校验作为示例
- [ ] 后端错误响应格式统一
- [ ] 存量 `any` 数量统计并记录基线
