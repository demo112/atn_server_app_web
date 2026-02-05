# 部门树缺少根部门修复记录

## 问题描述
- **现象**：人员管理部门树展示了多个一级部门，但缺少统一的根节点（如“全公司”），导致视觉分散，操作不便。
- **复现步骤**：
  1. 进入人员管理页面。
  2. 观察左侧部门树。
  3. 发现直接列出了一级部门，没有顶层根节点。
- **影响范围**：人员管理页面（Employee Management）。

## 设计锚定
- **所属规格**：UA2 (人员与部门管理)
- **原设计意图**：
  > 部门树应清晰展示层级结构，支持便捷的增删改操作。
- **当前偏离**：虽然支持展示层级，但缺少统一的根节点，与公共组件 `DepartmentTree`（包含虚拟根）不一致。

## 根因分析
- **直接原因**：`DepartmentSidebar` 组件直接渲染 API 返回的部门列表（森林结构），未像 `DepartmentTree` 组件那样封装虚拟根节点。
- **根本原因**：前端组件实现不一致。
- **相关代码**：`packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`

## 修复方案
- **修复思路**：在 `DepartmentSidebar` 中获取数据后，手动添加一个 ID 为 `-1` 的虚拟根节点“全公司”，并将 API 数据作为其子节点。同时调整选中逻辑和操作按钮逻辑（根节点禁止编辑/删除）。
- **改动文件**：
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`

## 验证结果
- [x] 原问题已解决：显示“全公司”根节点。
- [x] 回归测试通过：已添加单元测试 `DepartmentSidebar.test.tsx` 并通过。
- [x] 设计一致性确认：与 `DepartmentTree` 行为一致。

## 文档同步
- [ ] design.md：设计文档未明确规定必须有根节点，属于 UI 实现细节，无需更新。
- [ ] api-contract.md：API 未变更。

## 提交信息
fix(web): 修复人员管理部门树缺少根部门的问题

- 添加虚拟根节点“全公司”
- 禁用根节点的编辑和删除操作
- 优化根节点选中逻辑
