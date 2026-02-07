# 漏测分析与补充测试需求 (Gap Analysis & Supplementary Test Requirements)

> **版本**: 1.0
> **日期**: 2026-02-07
> **状态**: 待评审
> **来源**: 基于 2026/02/06 - 2026/02/07 期间的 Bug Fix 记录回顾

## 1. 背景

通过对近期修复的 10+ 个高频 Bug 进行根本原因分析（RCA），我们识别出当前测试覆盖中存在的系统性盲区。本文档旨在定义补充测试需求，以防止同类问题在其他模块复发。

## 2. 漏测模式分析 (Gap Analysis)

我们识别出以下 5 类共性问题模式，这些问题在多个模块中重复出现，表明现有的测试策略未能有效拦截。

| ID | 问题模式 | 典型案例 | 根本原因 | 风险等级 |
|:---|:---|:---|:---|:---|
| **GAP-01** | **删除响应格式不统一** | 部门删除报错 `Expected void, received null` | 后端返回 `null`，前端 Zod 校验严格；且缺乏被删资源 ID，导致前端状态更新困难。 | High |
| **GAP-02** | **查询参数类型转换缺失** | 请假查询 500 错误 | Express `req.query` 默认为 String，Prisma 需要 Int，Controller 未做类型转换 (Coercion)。 | High |
| **GAP-03** | **DTO 长度校验缺失** | 员工新增 500 错误 (P2000) | DTO 未限制字符串长度，DB 字段有长度限制，超长输入导致数据库报错。 | Medium |
| **GAP-04** | **前端 Null 值处理不兼容** | 班次列表加载失败 (ZodError) | DB 可选字段返回 `null`，前端 Zod `optional()` 仅认 `undefined`，导致解析失败。 | Medium |
| **GAP-05** | **RN 导航对象缺失** | 考勤记录页点击日历崩溃 | 组件内直接使用 `navigation` 变量但未通过 `useNavigation` hook 获取，缺少组件级单元测试。 | High |

## 3. 补充测试需求 (Requirements)

为了填补上述盲区，定义以下补充测试需求。

### 3.1 类别 A：API 健壮性与契约 (Server)

#### Requirement 1: 统一删除接口响应契约 (P0)
*   **目标**: 确保所有删除操作返回一致结构，避免前端解析失败，并提供必要的反馈信息。
*   **适用范围**: 所有 DELETE 接口及撤销类 POST 接口 (如 `cancel`)。
*   **验收标准**:
    1.  接口必须返回 HTTP 200。
    2.  响应体必须符合结构：`{ success: true, data: { id: number } }`。
    3.  **禁止**返回 `data: null` 或 `data: void`。
*   **涉及模块**: User, Department, Employee, Shift, Schedule, Leave, TimePeriod.

#### Requirement 2: 查询参数自动类型转换 (P0)
*   **目标**: 防止因参数类型问题导致的 500 服务器内部错误。
*   **适用范围**: 所有包含分页 (`page`, `pageSize`) 或数值型筛选 (`deptId`, `status`, `employeeId`) 的列表接口。
*   **验收标准**:
    1.  当传入字符串格式的数值（如 `?page="1"`）时，接口应自动转换为数字处理。
    2.  接口应返回 200 OK，且数据过滤正确。
    3.  不应抛出 Prisma 校验错误或 500 异常。

#### Requirement 3: DTO 边界值校验 (P1)
*   **目标**: 在进入业务逻辑前拦截非法数据，保护数据库免受 P2000 错误影响。
*   **适用范围**: 所有 Create/Update DTO。
*   **验收标准**:
    1.  所有对应数据库 `VARCHAR(N)` 的字段，DTO 中必须有 `.max(N)` 校验。
    2.  输入超长字符串时，应返回 400 Bad Request (Zod ValidationError)。
    3.  **禁止**透传导致 500 Internal Server Error。

### 3.2 类别 B：前端稳定性 (Web & App)

#### Requirement 4: Zod Schema Null 兼容性 (P0)
*   **目标**: 确保前端能健壮处理后端返回的 `null` 值（Prisma 默认将无值的 optional 字段序列化为 null）。
*   **适用范围**: Web 端所有 `schemas/*.ts`。
*   **验收标准**:
    1.  所有 `optional()` 字段必须同时支持 `nullable()`。
    2.  建议使用 `.transform(v => v ?? undefined)` 统一转换为 `undefined`，以适配 TypeScript 类型。
    3.  针对 Mock 的 `null` 响应数据，Schema 解析不应抛出异常。

#### Requirement 5: App 导航安全 (P1)
*   **目标**: 防止因导航对象缺失导致的运行时崩溃。
*   **适用范围**: App 端所有 Screen 组件。
*   **验收标准**:
    1.  组件内部**禁止**使用未定义的全局 `navigation` 变量。
    2.  必须显式调用 `useNavigation()` 获取实例。
    3.  组件测试中必须模拟点击导航操作，验证不崩溃。

## 4. 建议执行计划

建议按以下顺序落实上述需求：

1.  **Server 端契约扫描**:
    - 编写集成测试脚本，批量扫描所有 DELETE 接口的返回值。
    - 批量扫描所有 List 接口的参数兼容性。
2.  **Web 端 Schema 加固**:
    - 全局搜索 `packages/web/src/schemas` 中的 `.optional()`，确认是否缺失 `.nullable()`。
3.  **App 端代码审查**:
    - 静态扫描 App 代码，查找潜在的未定义 `navigation` 使用。
