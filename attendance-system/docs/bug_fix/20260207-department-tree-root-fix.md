# 部门树缺失根节点修复记录

## 问题描述
- **现象**：所有部门架构组织树没有根节点，无法方便地查看所有员工或排班。
- **复现步骤**：进入员工管理页面或排班页面，左侧部门树只显示一级部门，无“全公司”或“所有部门”选项。
- **影响范围**：
  - 员工管理页面 (EmployeeList / DepartmentSidebar)
  - 排班页面 (SchedulePage)
  - 人员选择弹窗 (PersonnelSelectionModal)

## 设计锚定
- **所属规格**：UA2 (人员与部门管理)
- **原设计意图**：提供部门筛选功能。
- **当前偏离**：原设计未明确指定根节点，导致实现时缺失“查看所有”的便捷入口。
- **历史修复**：无相关记录。

## 根因分析
- **直接原因**：各处部门树组件直接渲染 API 返回的部门列表，未启用或未添加虚拟根节点。
- **根本原因**：UI 设计细节在开发时未充分考虑“查看所有”的交互需求，且 `DepartmentTree` 的 `showVirtualRoot` 默认为 false。
- **相关代码**：
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`
  - `packages/web/src/pages/attendance/schedule/SchedulePage.tsx`
  - `packages/web/src/components/common/PersonnelSelectionModal.tsx`

## 修复方案
- **修复思路**：
  1. `DepartmentSidebar`: 手动包裹 ID 为 `-1` 的虚拟根节点“全公司”，处理点击事件传递空 ID。
  2. `SchedulePage` & `PersonnelSelectionModal`: 启用 `DepartmentTree` 的 `showVirtualRoot={true}` 属性。
  3. `ScheduleCalendar`: 兼容处理 `deptId=-1` 的情况，将其转换为 `undefined` 传递给 API，以查询所有数据。
- **改动文件**：
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`
  - `packages/web/src/pages/attendance/schedule/SchedulePage.tsx`
  - `packages/web/src/components/common/PersonnelSelectionModal.tsx`
  - `packages/web/src/pages/attendance/schedule/components/ScheduleCalendar.tsx`
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.test.tsx`
  - `packages/web/src/pages/attendance/schedule/components/ScheduleCalendar.test.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| DepartmentSidebar | `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx` | ✅ |
| SchedulePage | `packages/web/src/pages/attendance/schedule/SchedulePage.tsx` | ✅ (启用虚拟根节点) |
| PersonnelSelectionModal | `packages/web/src/components/common/PersonnelSelectionModal.tsx` | ✅ (启用虚拟根节点) |
| ScheduleCalendar | `packages/web/src/pages/attendance/schedule/components/ScheduleCalendar.tsx` | ✅ (处理 -1 ID) |

## 验证结果
- [x] 原问题已解决：所有相关页面的部门树均显示“全公司”根节点。
- [x] 回归测试通过：`DepartmentSidebar` 和 `ScheduleCalendar` 的单元测试均通过。
- [x] 设计一致性确认：已更新 UA2 design.md。
- [x] 同类组件已检查：所有发现的 `DepartmentTree` 使用处均已检查并修复。

## 文档同步
- [x] design.md：已更新 `docs/features/UA2/design.md`。
- [ ] api-contract.md：无需更新。

## 防回退标记
**关键词**：部门树、根节点、全公司、虚拟节点
**设计决策**：
1. 前端负责组装虚拟根节点，ID 固定为 -1。
2. 业务组件需兼容 `deptId=-1` 或 `null` 的情况，视为“所有部门”。

## 提交信息
fix(web): 部门树增加"全公司"虚拟根节点

- DepartmentSidebar: 增加虚拟根节点，点击清除筛选
- SchedulePage: 启用虚拟根节点，支持查看所有排班
- PersonnelSelectionModal: 启用虚拟根节点
- ScheduleCalendar: 兼容处理 -1 部门ID
