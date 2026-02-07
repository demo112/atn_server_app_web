# 部门树缺失根节点修复记录

## 问题描述
- **现象**：所有部门架构组织树没有根节点，无法方便地查看所有员工。
- **复现步骤**：进入员工管理页面，左侧部门树只显示一级部门，无“全公司”或“所有部门”选项。
- **影响范围**：员工管理页面 (EmployeeList)。

## 设计锚定
- **所属规格**：UA2 (人员与部门管理)
- **原设计意图**：提供部门筛选功能。
- **当前偏离**：原设计未明确指定根节点，导致实现时缺失“查看所有”的便捷入口。
- **历史修复**：无相关记录。

## 根因分析
- **直接原因**：`DepartmentSidebar` 组件直接渲染 API 返回的部门列表，未添加虚拟根节点。
- **根本原因**：UI 设计细节在开发时未充分考虑“查看所有”的交互需求。
- **相关代码**：`packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`

## 修复方案
- **修复思路**：
  1. 在前端获取到部门树后，包裹一个 ID 为 `-1` 的虚拟根节点“全公司”。
  2. 处理根节点点击事件，传递空 ID 以清除筛选。
  3. 限制根节点的操作（仅允许添加子部门，不允许编辑/删除）。
- **改动文件**：
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.test.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| DepartmentSidebar | `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx` | ✅ |
| DepartmentTree | `packages/web/src/components/common/DepartmentTree.tsx` | ❌ (已有 showVirtualRoot 属性，无需修改) |

## 验证结果
- [x] 原问题已解决：树结构显示“全公司”根节点。
- [x] 回归测试通过：`npm test` 通过，新增了针对根节点的测试用例。
- [x] 设计一致性确认：已更新 UA2 design.md。
- [x] 同类组件已检查：`DepartmentTree` 已支持该功能。

## 文档同步
- [x] design.md：已更新 `docs/features/UA2/design.md`。
- [ ] api-contract.md：无需更新。

## 防回退标记
**关键词**：部门树、根节点、全公司、虚拟节点
**设计决策**：前端负责组装虚拟根节点，ID 固定为 -1。

## 提交信息
fix(web): 部门树增加"全公司"虚拟根节点

- 增加虚拟根节点以便查看所有员工
- 点击根节点清除部门筛选
- 根节点禁用编辑/删除操作
- 更新相关测试用例
