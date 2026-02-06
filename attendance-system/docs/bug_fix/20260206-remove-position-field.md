# 移除 Employee 中冗余的 position 字段

## 问题描述
- **现象**：前端添加人员失败（之前已修复端口问题），但在检查代码时发现 `Employee` 相关类型和服务中存在 `position` 字段，而需求文档和数据库 Schema 中并未定义该字段。
- **复现步骤**：
  1. 检查 `packages/shared/src/types/employee.ts`，发现 `CreateEmployeeDto` 中有 `position`。
  2. 检查 `packages/server/src/modules/employee/employee.service.ts`，发现 `create` 方法中有对 `position` 的处理。
  3. 检查 `packages/server/prisma/schema.prisma`，发现 `Employee` 模型无 `position` 字段。
- **影响范围**：代码与设计/数据库不一致，可能导致混淆或潜在错误。

## 设计锚定
- **所属规格**：UA2 (人员管理)
- **原设计意图**：根据需求文档，人员信息不包含职位（Position）字段。
- **当前偏离**：代码中多余了 `position` 字段。

## 根因分析
- **直接原因**：开发过程中可能复制了其他项目的模板或预留了字段，但未及时清理。
- **根本原因**：代码与设计文档/数据库 Schema 同步不及时。
- **相关代码**：
  - `packages/shared/src/types/employee.ts`
  - `packages/server/src/modules/employee/employee.dto.ts`
  - `packages/server/src/modules/employee/employee.service.ts`

## 修复方案
- **修复思路**：移除所有代码中冗余的 `position` 字段定义和处理逻辑，保持与数据库 Schema 和需求文档一致。
- **改动文件**：
  - `packages/shared/src/types/employee.ts`: 删除 `CreateEmployeeDto` 中的 `position`。
  - `packages/server/src/modules/employee/employee.dto.ts`: 删除 Zod Schema 中的 `position`。
  - `packages/server/src/modules/employee/employee.service.ts`: 删除 `create` 和 `update` 方法中对 `position` 的解构和处理。

## 验证结果
- [x] 代码编译通过 (`pnpm build` in server, web, shared)。
- [x] 确认数据库 Schema 中无 `position` 字段。
- [x] 确认前端页面无 `position` 输入项。

## 文档同步
- [ ] design.md：无需更新（设计文档本就无此字段）
- [ ] api-contract.md：无需更新

## 提交信息
fix(employee): 移除冗余的 position 字段以符合需求
