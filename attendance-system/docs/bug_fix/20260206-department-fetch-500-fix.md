# 部门获取接口 500 错误修复记录

## 问题描述
- **现象**：前端获取部门树时报错 `Failed to fetch departments: AxiosError: Request failed with status code 500`。
- **复现步骤**：
  1. 数据库中存在循环引用的部门数据（如 A->B->A）。
  2. 调用 `GET /api/v1/departments/tree`。
  3. 后端尝试序列化 JSON 时失败，返回 500。
- **影响范围**：部门管理页面、所有依赖部门树的功能。

## 设计锚定
- **所属规格**：部门管理（未找到专门 SW 文档，基于代码反推）。
- **原设计意图**：提供树形结构的部门列表。
- **当前偏离**：代码未处理数据层面的循环引用，导致 API 崩溃。

## 根因分析
- **直接原因**：`DepartmentService.getTree` 构建的对象树包含循环引用，导致 `res.json` 序列化失败。
- **根本原因**：数据库中存在脏数据（循环引用），且代码缺乏防御性编程来处理这种情况。
- **相关代码**：`packages/server/src/modules/department/department.service.ts`

## 修复方案
- **修复思路**：在构建树时检测循环引用。如果发现循环，将节点提升为根节点，断开循环，并记录错误日志。
- **改动文件**：
  - `packages/server/src/modules/department/department.service.ts`

## 验证结果
- [x] 原问题已解决：新增集成测试 `department.cycle.integration.test.ts` 验证循环引用不再导致崩溃。
- [x] 回归测试通过：`department.service.test.ts` 中的现有 `getTree` 测试通过。
- [x] 设计一致性确认：API 依然返回树形结构（即使是降级处理后的树）。

## 文档同步
- [ ] design.md：无变更。
- [ ] api-contract.md：无变更。

## 提交信息
fix(department): handle circular reference in getTree to prevent 500 error
