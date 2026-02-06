# 请假列表获取失败修复记录

## 问题描述
- **现象**：进入请假管理页面时，界面右侧弹出报错“获取列表失败”。
- **复现步骤**：
  1. 登录系统。
  2. 访问“请假/出差管理”页面 (`/attendance/leaves`)。
  3. 观察右上角 Toast 报错。
- **影响范围**：Web 端请假列表无法显示。

## 设计锚定
- **所属规格**：SW67
- **原设计意图**：API 应返回分页数据结构。
- **当前偏离**：前端代码假设返回结构包含 `meta` 字段 (`res.meta.total`)，但后端实际返回的是扁平结构 (`res.total`)，且未使用共享类型定义。

## 根因分析
- **直接原因**：前端 `LeavePage.tsx` 尝试访问 `res.meta.total`，导致 undefined 访问异常。
- **根本原因**：前端服务层 `services/leave.ts` 和页面组件未正确使用共享的 `PaginatedResponse` 类型定义，导致对 API 响应结构的假设错误。
- **相关代码**：`packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 修复方案
- **修复思路**：修正前端代码以匹配后端 API 返回结构，并使用共享类型增强类型安全。
- **改动文件**：
  - `packages/web/src/services/leave.ts`: 引入 `PaginatedResponse`，修正 `getLeaves` 返回类型。
  - `packages/web/src/pages/attendance/leave/LeavePage.tsx`: 将 `res.meta.total` 改为 `res.total`。
  - `packages/web/src/__tests__/integration/leave/leave.test.tsx`: 修正测试 Mock 数据结构。

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| LeaveService | `packages/web/src/services/leave.ts` | ✅ |
| LeavePage | `packages/web/src/pages/attendance/leave/LeavePage.tsx` | ✅ |

## 验证结果
- [x] 原问题已解决：代码逻辑已修正，匹配后端返回结构。
- [x] 回归测试通过：`tsc --noEmit` 通过。
- [x] 设计一致性确认：符合 `PaginatedResponse` 标准。

## 文档同步
- [ ] design.md：无需更新。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复请假列表获取失败的问题

修正前端对请假列表 API 响应结构的解析错误，移除不存在的 meta 字段访问。
