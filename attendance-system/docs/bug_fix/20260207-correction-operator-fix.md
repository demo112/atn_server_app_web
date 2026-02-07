# 补签功能 400 错误修复记录

## 问题描述
- **现象**：用户在使用补签功能时，遇到 `400 Bad Request` 错误，提示“关联员工或每日记录不存在”。
- **复现步骤**：
  1. 登录系统（或在数据库重置后保留旧 Token）。
  2. 进入补签页面。
  3. 提交补签申请。
  4. 报错“关联员工或每日记录不存在”。
- **影响范围**：所有补签功能（签到、签退）。

## 设计锚定
- **所属规格**：`UI-CLONE-Correction` / 考勤核心流程
- **原设计意图**：补签记录需要关联员工、每日记录和操作人。
- **当前偏离**：当 `operatorId`（操作人）关联失败时（如用户被删或 Token 失效但未过期），系统抛出的 `P2003` 外键错误被误报为“关联员工或每日记录不存在”，导致误导。

## 根因分析
- **直接原因**：`attCorrection.create` 操作触发了数据库外键约束错误（Prisma P2003）。
- **根本原因**：
  1. 代码已在 `create` 前显式检查了 `dailyRecord` 和 `employee` 的存在性。
  2. 唯一未检查的外键是 `operatorId`（来自 JWT Token）。
  3. 当数据库被重置或用户被物理删除，但客户端仍持有签名的 Token 时，`operatorId` 指向不存在的用户，导致外键错误。
  4. 原有的错误处理逻辑笼统地将所有 `P2003` 映射为“关联员工或每日记录不存在”。
- **相关代码**：`packages/server/src/modules/attendance/attendance-correction.service.ts`

## 修复方案
- **修复思路**：优化错误处理逻辑。在排除了 `dailyRecord` 和 `employee` 不存在的情况下，明确提示 `P2003` 是由于操作人账号异常导致的。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance-correction.service.ts`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| CheckInDialog | `packages/web/.../CheckInDialog.tsx` | 无需修改（显示后端返回的错误） |
| CheckOutDialog | `packages/web/.../CheckOutDialog.tsx` | 无需修改 |

## 验证结果
- [x] 原问题已解决（通过代码逻辑推导和测试验证错误消息已更新）
- [x] 回归测试通过（`attendance-correction.service.test.ts` pass）
- [x] 编译通过

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新（API 契约未变，仅错误消息优化）

## 防回退标记
**关键词**：补签、P2003、操作人、operatorId
**设计决策**：在 Service 层通过 try-catch 转换 Prisma 错误，提供更人性化的提示。

## 提交信息
fix(attendance): 优化补签功能中操作人不存在时的错误提示

背景: 数据库重置后旧Token导致补签报错"关联员工或每日记录不存在"，误导排查。
变更: 在 Service 层明确捕获 P2003 错误，提示"操作人账号异常，请尝试重新登录"。
影响: 补签接口错误响应消息。
