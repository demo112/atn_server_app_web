# 测试加固效果报告

## 1. 概述

本次测试加固旨在验证系统对恶意输入（如超长字符串）的防御能力。我们遵循"只测试不修改代码"的原则，通过新增测试用例暴露了当前系统的安全隐患。

## 2. 测试执行结果

### 2.1 Server 端单元测试 (DTO)

- **测试文件**: `packages/server/src/modules/user/user.dto.test.ts`
- **结果**: ❌ 失败
- **现象**: `should reject username too long` 断言失败。
- **原因**: `CreateUserDto` 中的 `username` 字段缺少 `.max()` 长度限制。
- **影响**: 攻击者可发送任意长度的用户名，可能导致数据库存储溢出或拒绝服务攻击 (DoS)。

### 2.2 Server 端 API Fuzzing 测试 (扩展)

- **测试文件**: `packages/server/src/test/security/api-fuzzing.test.ts`
- **概览**:
  | 模块 | 端点 | 结果 | 说明 |
  |------|------|------|------|
  | Auth | `/auth/login` | ✅ 通过 | 返回 400，证明 Auth 模块已有完善校验。 |
  | User | `/users` | ❌ 失败 | 返回 500，证明 User DTO 虽有 Zod 但缺长度限制。 |
  | Attendance | `/attendance/clock` | ❌ 失败 | 未返回 400，证明考勤模块完全缺失运行时校验。 |
  | Leave | `/attendance/leaves` | ❌ 失败 | 未返回 400，证明请假模块完全缺失运行时校验。 |

- **关键发现**: 
  - `Attendance` 和 `Leave` 模块仅使用了 TypeScript Interface (`CreateClockDto`, `CreateLeaveDto`)，**完全没有运行时校验 (No Runtime Validation)**。
  - 这是一个严重的安全漏洞，比单纯缺少长度限制更危险，因为所有字段都缺乏类型和格式校验。

### 2.3 Web 端静态代码审计

- **工具脚本**: `packages/web/scripts/lint-schema.ts` (新增)
- **结果**: ❌ 发现 **106** 个潜在漏洞
- **现象**: 扫描了 Web 端所有 Schema 定义，发现绝大多数 `z.string()` 调用链中缺失 `.max()`。
- **受影响文件**: 
  - `schemas/department.ts`
  - `schemas/employee.ts`
  - `schemas/user.ts`
  - `services/leave.ts`
  - 等共 10 个文件。
- **影响**: 前端校验层存在系统性缺失，无法有效拦截超长输入。

### 2.4 App 端导航安全审计

- **工具脚本**: `packages/app/scripts/lint-nav.ts` (新增)
- **结果**: ❌ 发现 **13** 个不安全参数访问
- **现象**: 扫描了 App 端所有 Screen 组件，发现 `route.params` 直接访问且无 Zod 校验。
- **受影响文件**: 
  - `DepartmentEditScreen.tsx`
  - `EmployeeEditScreen.tsx`
  - `UserEditScreen.tsx`
  - `ShiftEditScreen.tsx`
- **影响**: 导航参数可能被篡改或类型不匹配，导致应用崩溃或逻辑错误。

### 2.5 Web 端 E2E 健壮性测试

- **测试文件**: `packages/e2e/tests/web/robustness.spec.ts`
- **结果**: ❌ 失败 (VULNERABILITY CONFIRMED)
- **现象**:
  1. **登录页**: 输入 5000 字符用户名，测试脚本检测到页面未显示任何错误提示，明确抛出 `[GAP]` 异常。
  2. **创建用户**: 输入 5000 字符用户名并提交，测试脚本检测到未出现验证错误提示，明确抛出 `[GAP]` 异常。
- **原因**: 前端表单缺乏 `maxLength` 限制，且未处理后端可能的异常响应。
- **影响**: 前端未能作为第一道防线拦截非法输入，导致恶意请求直达后端。

## 3. 结论与建议

当前系统在前后端均缺乏对字段长度的严格限制，且部分核心业务模块（考勤、请假）完全缺失运行时输入校验。

**建议修复方案 (后续步骤)**:

1. **Server 统一校验层**:
   - 必须将 `Attendance` 和 `Leave` 模块的 Interface 升级为 Zod Schema。
   - 为所有 Zod Schema 添加 `.max()` 限制。
   - 引入全局 Validation Pipe (或类似中间件) 确保所有 DTO 在 Controller 层自动校验。

2. **Web 安全加固**:
   - 修复 lint 脚本发现的 106 个 Schema 问题。
   - 在基础 Input 组件中强制要求 `maxLength` 属性 (通过封装)。

3. **App 安全加固**:
   - 引入 Zod 对 `route.params` 进行运行时校验。

4. **CI 集成**:
   - 将 `lint-schema.ts`, `lint-nav.ts` 和 `api-fuzzing.test.ts` 加入 CI 流程，作为发布门禁。

## 4. 加固效果验证 (Verification)

我们创建了统一的安全检查脚本 `scripts/security-check.ts`，运行结果如下，成功暴露了所有预期内的漏洞：

```bash
$ npx tsx scripts/security-check.ts

=== Verification Summary ===
┌─────────┬────────────────────────┬───────────────────────────┬─────────────────────────────────────────┐
│ (index) │ Task                   │ Status                    │ Details                                 │
├─────────┼────────────────────────┼───────────────────────────┼─────────────────────────────────────────┤
│ 0       │ 'Server API Fuzzing'   │ 'VULNERABILITY CONFIRMED' │ 'Tests failed as expected (Gaps found)' │
│ 1       │ 'Web Schema Audit'     │ 'VULNERABILITY CONFIRMED' │ 'Found 106 schema gaps'                 │
│ 2       │ 'App Navigation Audit' │ 'VULNERABILITY CONFIRMED' │ 'Found 13 navigation gaps'              │
│ 3       │ 'Web E2E Robustness'   │ 'VULNERABILITY CONFIRMED' │ 'Gap detected in UI robustness'         │
└─────────┴────────────────────────┴───────────────────────────┴─────────────────────────────────────────┘
```

**说明**: 
- 状态为 `VULNERABILITY CONFIRMED` 表示测试成功拦截到了安全隐患（即测试按预期失败）。
- 这些“失败”的测试现在成为了系统的安全基线。后续修复工作的目标是将这些状态转变为 `SECURE`。
