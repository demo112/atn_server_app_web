# 20260209-manual-clock-500-fix

## 问题描述

Web 端手动补录打卡时，如果当前操作人（operator）的 Token 有效，但数据库中对应的 User 记录不存在（例如被物理删除或 ID 变更），后端会抛出外键约束错误，导致 500 Internal Server Error。

- **错误信息**：`[ERROR] Manual clock failed AxiosError: Request failed with status code 500`
- **日志详情**：`Foreign key constraint violated: operator_id`

## 设计锚定

- **SPEC_ID**: SW69
- **文档路径**: `attendance-system/docs/features/SW69/design.md`
- **原设计意图**:
  - Web 端补录打卡必须记录 `operatorId`。
  - 接口响应应为标准 API 响应结构。
  - 权限校验应在 Controller/Middleware 层处理。

## 根因分析

1. **直接原因**：`AttClockRecord` 表的 `operator_id` 字段有外键约束指向 `User.id`。
2. **根本原因**：`AttendanceClockService.create` 方法直接使用 `data.operatorId` 插入数据，未校验该 ID 对应的用户是否存在。虽然 `authMiddleware` 验证了 Token 签名，但 Token 中的 payload 可能包含已过时的用户 ID（如用户已被删除）。
3. **现象**：Prisma 抛出 `P2003` 外键约束失败，被全局错误处理器捕获并记录为 500 错误。

## 修复方案

在 `AttendanceClockService.create` 方法中增加前置校验：
- 如果提供了 `operatorId`，先查询 `User` 表确认是否存在。
- 如果不存在，抛出 `401 Unauthorized` 错误（`ERR_AUTH_INVALID_TOKEN`），提示用户重新登录。

## 关联组件清单

- `packages/server/src/modules/attendance/attendance-clock.service.ts`

## 验证结果

### 1. 单元/集成测试
- 新增测试用例：`should fail with 401 if operator user does not exist`
- 运行结果：
  ```
  ✓ src/modules/attendance/__tests__/attendance-clock.integration.test.ts (7 tests)
  ```
  全部通过。

### 2. 构建检查
- `npm run build` 在 server 包中执行成功。

## 文档同步

- 本次修复属于代码健壮性优化，未变更 API 契约或业务逻辑，无需同步 `design.md`。

## 防回退关键词

- `operatorId`
- `Foreign key constraint`
- `ERR_AUTH_INVALID_TOKEN`

## 设计决策摘要

- 选择抛出 401 而不是 400 或 404，因为这种情况意味着 Token 虽然签名有效但内容已失效（用户不存在），属于认证范畴的问题，客户端应引导用户重新登录。
