# 20260209-department-data-loss-fix

## 问题描述

用户反馈部门架构中部门数据消失。经排查，数据库 `department` 表为空，导致前端无法显示部门树，且相关集成测试因环境问题和代码缺陷失败。

## 设计锚定

- **功能模块**: 部门管理 (Department Management)
- **关联文档**: `docs/features/SW66/requirements.md` (提及部门树展示)
- **原设计意图**: 
  - 部门数据应持久化存储。
  - 接口 `GET /api/v1/departments/tree` 应返回树形结构。
  - 删除部门时需校验是否有子部门或员工。

## 根因分析

1.  **数据丢失**: 数据库中部门表为空（`count = 0`），原因可能是开发环境数据库重置或迁移导致数据清除。
2.  **测试失败**:
    - **端点错误**: 集成测试中 `GET` 请求使用了旧路径 `/api/v1/departments`，而实际实现为 `/api/v1/departments/tree`。
    - **Mock 缺失**: `department.service.ts` 在 `create/update/delete` 操作中使用了 `prisma.department.findFirst` 进行校验，但测试文件 `department.integration.test.ts` 未对其进行 Mock，导致 `TypeError` (500错误)。
3.  **验证脚本环境问题**: 验证脚本未正确加载 `.env` 文件，导致连接错误的数据库实例。

## 修复方案

1.  **数据恢复**: 编写并执行 `scripts/restore-departments.ts`，重新初始化 9 个基础部门节点（包含层级结构）。
2.  **测试修复**:
    - 修正 `department.integration.test.ts` 中的 API 端点。
    - 在测试文件中添加 `prisma.department.findFirst` 和 `prisma.employee.findFirst` 的 Mock 实现。
3.  **验证工具优化**: 修正脚本中的环境变量加载逻辑，确保连接正确的开发数据库。

## 关联组件清单

- `packages/server/src/modules/department/department.integration.test.ts`
- `packages/server/scripts/restore-departments.ts` (新增)
- `packages/server/scripts/verify-department-tree.ts` (新增)

## 验证结果

### 1. 数据验证
执行 `scripts/verify-department-tree.ts`:
```
Total departments: 9
Root departments: 5
- 总经办 (ID: 1667, Children: 0)
- 人事行政部 (ID: 1668, Children: 1)
  - 招聘组 (ID: 1675)
- 产品研发部 (ID: 1669, Children: 3)
  - 后端开发组 (ID: 1672)
  - 前端开发组 (ID: 1673)
  - 测试组 (ID: 1674)
- 财务部 (ID: 1670, Children: 0)
- 市场部 (ID: 1671, Children: 0)
```

### 2. 回归测试
执行 `npm test -- src/modules/department`:
```
✓ src/modules/department/department.acv.test.ts (3 tests)
✓ src/modules/department/department.service.test.ts (13 tests)
✓ src/modules/department/department.cycle.integration.test.ts (1 test)
✓ src/modules/department/department.integration.test.ts (7 tests)

Test Files  4 passed (4)
Tests  24 passed (24)
```

## 文档同步

- 本次修复为数据恢复和测试修正，未变更 API 契约或业务逻辑，无需更新 design.md。

## 防回退关键词

- `prisma mock findFirst`
- `department tree endpoint`
- `dotenv loading in scripts`
