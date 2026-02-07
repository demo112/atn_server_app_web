# 人员选择弹窗输入框无法输入修复记录

## 问题描述
- **现象**：人员选择弹窗（PersonnelSelectionModal）中的搜索输入框无法输入内容，或者输入即消失。
- **复现步骤**：
  1. 打开任意使用 `PersonnelSelectionModal` 的页面（如请假申请、考勤组设置）。
  2. 点击“选择人员”打开弹窗。
  3. 尝试在搜索框输入姓名。
  4. 发现无法输入或输入内容立即清空。
- **影响范围**：所有使用人员选择组件的模块（请假、补卡、考勤组、排班等）。

## 设计锚定
- **所属规格**：Common Components (UI-STD-001)
- **原设计意图**：`PersonnelSelectionModal` 提供人员搜索和选择功能。输入框应允许用户输入关键字过滤人员列表。
- **当前偏离**：输入框被异常重置，导致无法使用搜索功能。

## 根因分析
- **直接原因**：组件内部的 `useEffect` 依赖了 `initialSelected` 属性。
- **根本原因**：
  1. `PersonnelSelectionModal` 接收 `initialSelected` 属性，默认值为 `[]`。
  2. 当父组件重渲染时（或者用户在输入框输入导致当前组件重渲染），默认值 `[]` 会生成一个新的数组引用。
  3. `useEffect` 监听到 `initialSelected` 引用变化，执行重置逻辑 `setSearchName('')`。
  4. 导致用户每次输入（触发重渲染）后，输入框内容立即被清空。
- **相关代码**：`packages/web/src/components/common/PersonnelSelectionModal.tsx`

## 修复方案
- **修复思路**：修改 `useEffect` 依赖，仅在 `isOpen` 状态变为 `true` 时执行初始化/重置逻辑，忽略 `initialSelected` 在组件生命周期内的后续变化（符合 `initial` 语义）。
- **改动文件**：`packages/web/src/components/common/PersonnelSelectionModal.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PersonnelSelectionModal | `packages/web/src/components/common/PersonnelSelectionModal.tsx` | ✅ |
| SelectionModals | `packages/web/src/pages/attendance/group/components/SelectionModals.tsx` | 无需修改 (Wrapper) |

## 验证结果
- [x] 原问题已解决：输入框不再被异常清空。
- [x] 回归测试通过：打开弹窗时状态正常重置，搜索功能正常工作。
- [x] 设计一致性确认：符合设计预期。
- [x] 同类组件已检查。

## 文档同步
- [ ] design.md：无需更新 (Bug fix)
- [ ] api-contract.md：无需更新

## 防回退标记
**关键词**：PersonnelSelectionModal, input reset, initialSelected
**设计决策**：`initialSelected` 仅用于组件首次打开时的初始化，组件打开期间的外部属性变化不应重置内部状态。

## 提交信息
fix(web): 修复人员选择弹窗搜索框无法输入的问题
