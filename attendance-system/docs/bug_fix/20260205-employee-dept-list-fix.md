# 员工部门列表硬编码修复记录

## 问题描述
- **现象**：新增员工弹窗中的部门列表是硬编码的，无法显示系统中实际存在的部门。
- **复现步骤**：
  1. 打开 Web 端
  2. 进入人员管理页面
  3. 点击“新增员工”
  4. 部门下拉框中只有固定的几个选项（总经办、研发部等）
- **影响范围**：员工新增和编辑功能

## 设计锚定
- **所属规格**：UA2 人员与部门管理
- **原设计意图**：应通过 `GET /api/v1/departments/tree` 动态获取部门数据。
- **当前偏离**：前端 `EmployeeModal.tsx` 硬编码了部门选项。

## 根因分析
- **直接原因**：开发阶段使用了临时硬编码数据，未对接后端 API。
- **根本原因**：前端实现未完全遵循设计文档中的动态数据要求。
- **相关代码**：`packages/web/src/pages/employee/components/EmployeeModal.tsx`

## 修复方案
- **修复思路**：引入 `departmentService`，在弹窗打开时获取部门树，并展平为列表展示。
- **改动文件**：
  - `packages/web/src/pages/employee/components/EmployeeModal.tsx`

## 验证结果
- [x] 原问题已解决：代码已改为从 API 获取数据。
- [x] 回归测试通过：`npm run type-check` 通过。
- [x] 设计一致性确认：符合 UA2 设计文档。

## 文档同步
- [ ] design.md：设计文档无误，不需要更新。
- [ ] api-contract.md：不需要更新。

## 提交信息
fix(web): 员工弹窗部门列表改为动态获取

背景: 之前是硬编码的部门列表
变更: 引入 departmentService 获取部门树，并展平展示
影响: 员工新增/编辑弹窗
