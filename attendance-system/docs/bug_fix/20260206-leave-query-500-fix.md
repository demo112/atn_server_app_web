# Leave Query 500 Error Fix Record

## 问题描述
Web 端查询请假记录时报错：`[ERROR] Failed to fetch leaves AxiosError: Request failed with status code 500`。
后端日志显示 Prisma 类型错误。

## 根因分析
1. **现象**: 前端传递查询参数（如 `employeeId`, `deptId`）时，Express 将 URL Query String 解析为字符串类型。
2. **原因**: `LeaveController` 直接将 `req.query` 赋值给 `LeaveQueryDto`，并传给 Service。
3. **冲突**: Prisma Schema 中 `employeeId` 为 `Int` 类型。当 Service 将字符串类型的 ID 传给 Prisma 时，Prisma 抛出验证错误，导致 500 异常。
4. **对比**: `EmployeeController` 使用了 Zod Schema (`parse`) 自动处理了类型转换 (Coercion)，而 `LeaveController` 缺失了这一层。

## 修复方案
在 `LeaveController.getList` 中手动进行参数类型转换：

```typescript
    // 手动处理 query 参数类型转换 (Express req.query 默认为 string)
    const rawQuery = req.query as any;
    const query: LeaveQueryDto = {
      page: rawQuery.page ? Number(rawQuery.page) : 1,
      pageSize: rawQuery.pageSize ? Number(rawQuery.pageSize) : 20,
      employeeId: rawQuery.employeeId ? Number(rawQuery.employeeId) : undefined,
      deptId: rawQuery.deptId ? Number(rawQuery.deptId) : undefined,
      // ...
    };
```

## 验证结果
- [x] 代码编译通过 (`npm run build`)
- [x] 添加了日志以便后续排查
