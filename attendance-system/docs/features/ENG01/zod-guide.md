# Zod 数据校验使用指南

## 1. 简介
本项目使用 **Zod** 进行运行时数据校验。Zod 不仅能校验数据格式，还能自动推断 TypeScript 类型，实现"单点定义，多端复用"。

## 2. 核心原则
1.  **Shared First**: 所有跨端复用的 Schema 必须定义在 `packages/shared/src/schemas/`。
2.  **Schema 即类型**: 禁止手动定义 interface，必须通过 `z.infer<typeof Schema>` 生成类型。
3.  **输入输出全覆盖**: 不仅校验请求参数 (Input)，建议也定义响应结构 (Response) 以生成准确的 API 类型。

## 3. 目录结构
```
packages/shared/src/schemas/
├── common.ts      # 通用基础 Schema (分页、API响应结构)
├── employee.ts    # 员工模块 Schema
├── auth.ts        # 认证模块 Schema
└── index.ts       # 统一导出
```

## 4. 如何定义 Schema

### 4.1 基础实体
定义与数据库或领域模型对应的基础 Schema：

```typescript
// packages/shared/src/schemas/employee.ts
import { z } from 'zod';

export const EmployeeSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  email: z.string().email().nullable(),
  // ...
});

export type Employee = z.infer<typeof EmployeeSchema>;
```

### 4.2 输入参数 (Input)
用于校验 API 请求体 (Body) 或 查询参数 (Query)。

```typescript
// Create DTO
export const CreateEmployeeSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  // 使用 .optional() 表示可选字段
  phone: z.string().optional(),
});

// Query DTO (注意使用 z.coerce 自动转换字符串)
export const GetEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  deptId: z.coerce.number().int().optional(),
});
```

### 4.3 响应结构 (Response)
利用 `common.ts` 中的工具函数生成统一响应结构：

```typescript
import { createPaginatedResponseSchema, createApiResponseSchema } from './common';

// 分页列表响应
export const EmployeeListResponseSchema = createPaginatedResponseSchema(EmployeeSchema);

// 单项详情响应
export const EmployeeDetailResponseSchema = createApiResponseSchema(EmployeeSchema);
```

## 5. 如何在 Server 端使用

### 5.1 引入
从 `@attendance/shared` 导入：

```typescript
// packages/server/src/modules/employee/employee.dto.ts
import { CreateEmployeeSchema } from '@attendance/shared';

// 可以重新导出或重命名以适应本地命名习惯
export { CreateEmployeeSchema as createEmployeeSchema };
```

### 5.2 Controller 中校验
使用 `.parse()` 方法。如果校验失败，Zod 会抛出异常，由全局异常处理器捕获（需配置）。

```typescript
// packages/server/src/modules/employee/employee.controller.ts
import { createEmployeeSchema, getEmployeesSchema } from './employee.dto';

async create(req: Request, res: Response, next: NextFunction) {
  try {
    // 自动校验 body，如果失败抛出 ZodError
    const dto = createEmployeeSchema.parse(req.body);
    
    // dto 此时已有自动推断的类型
    const result = await employeeService.create(dto);
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

### 5.3 Query 参数处理
对于 `req.query`，务必使用定义了 `z.coerce` 的 Schema，否则数字会作为字符串导致校验失败。

```typescript
// 正确
const query = getEmployeesSchema.parse(req.query); 
// query.page 将自动转换为 number
```

## 6. 常见问题

### Q: 什么时候用 `.parse()` vs `.safeParse()`?
- **Server端**: 通常使用 `.parse()`，让异常抛出并由中间件统一处理（返回 400）。
- **Web/App端**: 表单校验通常配合 `zod-resolver` 使用；如果手动校验，推荐 `.safeParse()` 以便优雅处理错误。

### Q: 如何处理日期？
- 数据库返回的 Date 对象在 JSON 中是字符串。
- Schema 定义：`hireDate: z.string().nullable()` (如果作为 JSON 传输) 或 `z.date()` (如果在内部处理 Date 对象)。
- 建议：DTO 层定义为 `string` (ISO 格式)，Service 层负责 `new Date()` 转换。

