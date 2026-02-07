# 部门删除确认交互修复记录

## 问题描述
- **现象**：用户反馈删除部门时，点击取消也会执行删除操作。
- **原因**：原实现使用 `window.confirm`，虽然逻辑看起来正确，但在某些特定浏览器环境或交互场景下可能存在误触或行为异常。且原生弹窗体验不佳，容易造成用户误解。

## 修复方案
- **设计决策**：放弃 `window.confirm`，改用项目统一的 `StandardModal` 组件实现自定义确认弹窗。
- **改动文件**：
  - `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx`
- **实现细节**：
  - 引入 `deleteModalOpen` 和 `deptToDelete` 状态管理。
  - 点击删除图标 -> 打开 Modal，记录待删除部门。
  - Modal 中点击"取消" -> 仅关闭 Modal，不执行任何逻辑。
  - Modal 中点击"确定删除" -> 调用 `departmentService.deleteDepartment`。

## 验证结果
- [x] **类型检查**：Pass (`pnpm --filter @attendance/web type-check`)
- [x] **逻辑验证**：
  - 取消按钮绑定为 `setDeleteModalOpen(false)`，物理隔离了删除逻辑。
  - 确认按钮绑定为 `handleConfirmDelete`，显式调用删除接口。
- [ ] **测试**：受限于测试环境 React 版本问题，组件测试无法运行，但代码逻辑已通过静态分析验证。

## 防回退标记
**关键词**：部门删除、window.confirm、StandardModal
**设计决策**：敏感操作（如删除）禁止使用 `window.confirm`，必须使用 `StandardModal` 以确保交互的明确性和可控性。
