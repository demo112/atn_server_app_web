# 统一删除接口响应格式修复记录

## 问题描述
- **现象**：Web 端删除部门时报错 `Expected void, received null`。
- **复现步骤**：在部门管理页面点击删除部门。
- **影响范围**：所有使用 `z.void()` 校验删除响应的 Web 端功能（部门、用户、班次等）。
- **根本原因**：后端 Controller 在删除成功后返回 `null` 或 `void`，但前端 Zod Schema 校验严格，且不同模块实现不一致。

## 修复方案
- **设计决策**：统一所有删除/撤销类接口的响应格式，返回被删除资源的 ID。
  - 格式：`{ success: true, data: { id: number } }`
  - 语义：明确告知前端哪个资源被删除了，增强接口的确定性。
- **改动文件**：
  - **Server**:
    - `department.controller.ts`
    - `user.controller.ts`
    - `time-period.controller.ts`
    - `employee.controller.ts` (bindUser)
    - `attendance-correction.controller.ts`
    - `schedule.controller.ts`
    - `leave.controller.ts` (cancel)
  - **Web**:
    - `services/department.ts`
    - `services/user.ts`
    - `services/time-period.ts`
    - `services/employee.ts`
    - `services/attendance.ts`
    - `services/leave.ts`
    - `services/shift.ts`
  - **App**:
    - `services/department.ts`
    - `services/user.ts`
    - `services/employee.ts`
    - `services/attendance.ts`

## 验证结果
- [x] **Web 端**：
  - 部门删除：验证通过 (TypeCheck Pass)
  - 请假撤销：验证通过 (TypeCheck Pass)
  - 班次删除：验证通过 (TypeCheck Pass)
- [x] **App 端**：
  - 接口适配检查通过 (已支持 { id } 响应)
- [x] **构建**：
  - Server Build: Pass
  - Web Type-Check: Pass

## API 契约变更
所有 DELETE 接口（或 POST cancel 接口）成功响应由 `null/void` 变更为 `{ id: number }`。

## 防回退标记
**关键词**：删除接口响应、Expected void received null
**设计决策**：删除操作必须返回 `{ id }`，前端必须校验 `{ id: z.number() }`。
