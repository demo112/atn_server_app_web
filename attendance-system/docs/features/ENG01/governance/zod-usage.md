# Zod 使用指南

## 1. 简介

本项目引入 [Zod](https://zod.dev/) 作为运行时校验库。Zod 提供了强大的 Schema 定义能力，并支持从 Schema 自动推导 TypeScript 类型，确保运行时校验与静态类型定义的一致性。

## 2. 核心优势

- **单一数据源**：只需定义 Schema，即可获得 Type。
- **运行时安全**：处理外部输入（API 请求、环境变量）时确保数据符合预期。
- **开发体验**：链式调用，清晰易读。

## 3. 安装

Zod 已集成在 `@attendance/shared` 包中，Server/Web/App 均可直接使用。

```typescript
import { z } from 'zod';
```

## 4. 最佳实践

### 4.1 定义 Schema

通常在 `.dto.ts` 或 `.schema.ts` 文件中定义。

```typescript
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18),
  email: z.string().email().optional(),
});

// 自动推导类型
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
```

### 4.2 Controller 中使用

在 Controller 中解析请求数据：

```typescript
import { createEmployeeSchema } from './employee.dto';

class EmployeeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // parse 会抛出异常如果验证失败
      const dto = createEmployeeSchema.parse(req.body);
      
      // dto 类型为 CreateEmployeeInput
      await employeeService.create(dto);
      
      res.json({ success: true });
    } catch (error) {
      next(error); // 全局错误处理器会处理 ZodError
    }
  }
}
```

### 4.3 处理 Query 参数

Query 参数通常是字符串，使用 `z.coerce` 或 `transform` 进行转换。

```typescript
export const getEmployeesSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  deptId: z.coerce.number().optional(),
});
```

### 4.4 复用 Shared Schema

`@attendance/shared` 提供了通用的 Schema，如分页参数。

```typescript
import { QueryParamsSchema } from '@attendance/shared';

export const myQuerySchema = QueryParamsSchema.extend({
  keyword: z.string().optional(),
});
```

## 5. 常用 Schema

位于 `@attendance/shared`：

- `PaginationSchema`: `{ page, pageSize, total, totalPages }`
- `QueryParamsSchema`: `{ page, pageSize, sortBy, sortOrder }`
- `createApiResponseSchema(dataSchema)`: 生成统一响应结构
- `createPaginatedResponseSchema(itemSchema)`: 生成分页响应结构

## 6. 示例

参考 `packages/server/src/modules/employee/employee.dto.ts`。
