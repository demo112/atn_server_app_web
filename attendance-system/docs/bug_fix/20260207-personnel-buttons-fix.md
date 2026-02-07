# 人员列表按钮失效修复记录

## 问题描述
- **现象**：人员列表页面的“删除”和“更换部门”按钮点击无反应。
- **复现步骤**：
  1. 进入人员列表页面。
  2. 勾选人员。
  3. 点击“删除”或“更换部门”按钮。
- **影响范围**：`PersonnelDashboard` 组件，影响批量操作功能。

## 设计锚定
- **所属规格**：UA2 (人员与部门管理)
- **原设计意图**：设计文档 `docs/features/UA2/design.md` 中未明确定义“批量删除”和“批量更换部门”的交互细节，但 UI 组件中存在这些按钮。
- **当前偏离**：UI 组件已存在但未连接业务逻辑，导致按钮点击无反应（UI 欺骗）。

## 根因分析
- **直接原因**：
  - `PersonnelDashboard` 组件中的“更换部门”按钮未绑定 `onClick` 事件。
  - “删除”按钮绑定了 `onBatchDelete`，但父组件 `EmployeeList` 未传递该回调。
- **根本原因**：前端 UI 开发超前于业务逻辑实现，且后端缺乏批量操作接口。

## 修复方案
- **修复思路**：
  1. **批量删除**：在前端实现批量删除逻辑（循环调用单删接口），并连接到按钮。
  2. **其他按钮**（更换部门、导入、导出）：由于缺乏后端支持和详细设计，且实现成本较高，暂时添加 Toast 提示“功能暂未开放”，消除用户困惑。
- **改动文件**：
  - `packages/web/src/pages/employee/EmployeeList.tsx`: 实现 `handleBatchDelete`。
  - `packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx`: 连接删除回调，添加 Toast 提示。

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PersonnelDashboard | `packages/web/src/pages/employee/components_new/PersonnelDashboard.tsx` | ✅ |
| EmployeeList | `packages/web/src/pages/employee/EmployeeList.tsx` | ✅ |

## 验证结果
- [x] 选中人员后，“删除”按钮可用且能触发批量删除。
- [x] 点击“更换部门”按钮提示“功能暂未开放”。
- [x] TypeScript 检查通过（无新增错误）。

## 文档同步
- [ ] design.md：暂不需要更新（未引入新 API 或重大设计变更）。

## 防回退标记
**关键词**：批量删除、更换部门、PersonnelDashboard
**设计决策**：由于后端无批量接口，前端暂时采用循环调用实现批量删除；其他复杂批量操作暂时禁用。

## 提交信息
fix(web): 修复人员列表批量删除按钮失效问题，禁用未实现功能按钮
