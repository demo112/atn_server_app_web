# 修复记录：部门选择弹窗不可用

## 问题描述
用户反馈打卡记录页面的部门筛选无法使用，弹窗提示“请在左侧选择部门（暂不支持）”。

## 根因分析
`PersonnelSelectionModal` 组件在 `selectType="department"` 模式下未实现选择逻辑。中间区域被硬编码为显示“暂不支持”，且左侧 `DepartmentTree` 点击事件仅用于过滤员工列表，未触发部门选中逻辑。

## 修复方案
1. **增强 `DepartmentTree`**：
   - 新增 `onNodeSelect` 回调，传递完整的 `DepartmentVO` 节点对象，而不仅仅是 ID。
   - 保持向后兼容，原 `onSelect` 行为不变。

2. **更新 `PersonnelSelectionModal`**：
   - 在 `selectType="department"` 模式下，监听 `onNodeSelect`。
   - 点击树节点时，直接构造 `SelectionItem` 并更新 `selectedItems` 状态。
   - 移除“暂不支持”的占位提示，改为操作引导。

## 验证结果
- [x] 代码编译通过 (`npm run build`)
- [x] 逻辑检查：
  - 单选模式下点击替换选中项
  - 多选模式下点击切换选中状态
  - 数据结构与 `PunchFilter` 期望的 `SelectionItem` 匹配

## 影响范围
- `packages/web/src/components/common/DepartmentTree.tsx` (修改)
- `packages/web/src/components/common/PersonnelSelectionModal.tsx` (修改)
