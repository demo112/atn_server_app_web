# 员工新增保存报错修复记录

## 问题描述
- **现象**：App端新增员工时报错，返回 500 Internal Server Error。
- **复现步骤**：
  1. 打开 App 员工管理页面。
  2. 点击新增员工。
  3. 输入超长姓名（例如 > 100 字符）。
  4. 点击保存，界面报错。
- **影响范围**：App 端员工新增/编辑功能。

## 设计锚定
- **所属规格**：UA2
- **原设计意图**：数据库设计中 Employee 表字段有明确长度限制（Name: 100, EmployeeNo: 50, Phone: 20, Email: 100）。
- **当前偏离**：DTO 层缺失对应的长度校验，导致超长数据透传至数据库，触发 Prisma P2000 错误。

## 根因分析
- **直接原因**：Prisma 抛出 P2000 错误（Value too long for column type）。
- **根本原因**：`employee.dto.ts` 中 `zod` schema 缺失 `.max()` 校验，未防御超长输入。
- **相关代码**：`packages/server/src/modules/employee/employee.dto.ts`

## 修复方案
- **修复思路**：
  1. Server 端：在 DTO 中添加与数据库字段定义一致的 `.max()` 校验。
  2. App 端：在输入框组件中添加 `maxLength` 属性，并在保存前进行校验提示，提升用户体验。
- **改动文件**：
  - `packages/server/src/modules/employee/employee.dto.ts`
  - `packages/app/src/screens/organization/employee/EmployeeEditScreen.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| EmployeeEditScreen | `packages/app/src/screens/organization/employee/EmployeeEditScreen.tsx` | ✅ |
| EmployeeDTO | `packages/server/src/modules/employee/employee.dto.ts` | ✅ |

## 验证结果
- [x] 原问题已解决：DTO 层拦截超长数据，不再报 500 错误。
- [x] 回归测试通过：新增 `employee.dto.test.ts` 验证长度校验逻辑。
- [x] 设计一致性确认：DTO 校验与 Database Schema 一致。
- [x] App 端验证：输入框已限制最大输入长度，且提交前有弹窗提示。

## 文档同步
- [ ] design.md：无需更新（属实现细节修复）。
- [ ] api-contract.md：无需更新。

## 防回退标记
**关键词**：Employee validation, max length, P2000
**设计决策**：所有 DTO 字符串字段必须显式声明 `.max()`，且值需与 Prisma Schema 保持一致。

## 提交信息
fix(employee): 修复员工信息保存时因字段超长导致的报错

背景: 数据库字段有长度限制，但 DTO 未校验，导致 500 错误。
变更:
1. Server: DTO 增加 max 长度校验 (Name:100, No:50, Phone:20, Email:100)。
2. App: 编辑页面增加 maxLength 限制及保存前校验。
3. Test: 新增 DTO 边界测试用例。
