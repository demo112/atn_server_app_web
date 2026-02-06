# AI修复报告: SW67人员选择数据丢失修复

## 问题描述
在 SW67 请假/出差功能开发中，使用 `PersonnelSelectionModal` 组件选择员工时，选中的员工详细数据（如 ID、部门等）未正确传递给父组件，导致 `LeavePage` 无法获取正确的 `employeeId` 进行请假申请。

## 根本原因
1. **接口定义缺失**: `SelectionItem` 接口仅包含 `id`, `name`, `type`, `avatar`，缺少用于存储原始数据的字段。
2. **数据映射丢失**: 在 `PersonnelSelectionModal` 中将 API 返回的 `EmployeeVo` 转换为 `SelectionItem` 时，未保留原始对象。

## 修复方案
1. **扩展接口**:
   在 `PersonnelSelectionModal.tsx` 的 `SelectionItem` 接口中增加 `data?: any` 字段。

2. **保留原始数据**:
   在数据映射逻辑中，将 API 返回的 `item` 赋值给 `SelectionItem.data`。

3. **消费端更新**:
   更新 `DepartmentUserSelectModal.tsx`，从 `SelectionItem.data` 中提取完整的 `EmployeeVo` 对象传递给回调函数。

## 验证结果
代码静态分析确认数据流已打通。构建检查通过。

## 影响范围
- `packages/web/src/components/common/PersonnelSelectionModal.tsx`
- `packages/web/src/pages/attendance/leave/components/DepartmentUserSelectModal.tsx`
