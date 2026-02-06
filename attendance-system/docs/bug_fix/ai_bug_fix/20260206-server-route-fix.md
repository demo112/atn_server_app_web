# AI 修复记录：Server 路由引用错误与模块分离

## 1. 问题描述

在运行 E2E 测试启动 Server 时，出现以下错误导致启动失败：

```
ReferenceError: leaveController is not defined
    at Object.<anonymous> (.../attendance.routes.ts:98:24)
```

这阻止了 Server 的正常启动，进而导致所有 E2E 测试无法运行。

## 2. 原因分析

- **直接原因**：`attendance.routes.ts` 文件中保留了对 `leaveController` 的路由定义代码（`router.post('/leaves', ...)`），但该文件中并未实例化或导入 `leaveController`。
- **根本原因**：在进行模块化重构时，请假（Leave）相关的路由计划分离到独立文件，但迁移工作未彻底完成，导致旧文件残留了断裂的引用。

## 3. 修复方案

### 3.1 路由分离
创建独立的路由文件 `packages/server/src/modules/attendance/leave.routes.ts`，将请假相关路由定义移入其中。

### 3.2 清理旧代码
从 `packages/server/src/modules/attendance/attendance.routes.ts` 中删除所有请假相关的路由定义。

### 3.3 注册新路由
在 `packages/server/src/app.ts` 中引入新的 `leaveRouter` 并注册到 `/api/v1/leaves` 路径。

### 代码变更摘要

**packages/server/src/modules/attendance/leave.routes.ts (新增)**
```typescript
const router = Router();
const leaveController = new LeaveController();
router.use(authenticate);
router.get('/', leaveController.getList.bind(leaveController));
// ... 其他路由
export { router as leaveRouter };
```

**packages/server/src/app.ts**
```typescript
import { attendanceRouter, leaveRouter } from './modules/attendance';
// ...
app.use('/api/v1/leaves', leaveRouter);
app.use('/api/v1/attendance', attendanceRouter);
```

## 4. 验证结果

- [x] **编译检查**：代码编译通过，无未定义变量错误。
- [x] **服务启动**：执行 `pnpm dev` Server 能正常启动。
- [x] **E2E 测试**：修复后 E2E 测试环境可正常连接 Server。

## 5. 影响范围

- **后端路由**：影响 `/api/v1/leaves/*` 和 `/api/v1/attendance/*` 下的路由结构。
- **前端调用**：API 路径保持兼容，未改变对外契约（仅内部实现重构）。
