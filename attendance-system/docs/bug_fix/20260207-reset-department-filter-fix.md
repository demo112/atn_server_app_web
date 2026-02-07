# 考勤记录重置部门筛选不清空修复记录

## 问题描述
- **现象**：点击重置按钮后，部门输入框中的内容没有被清空。
- **复现步骤**：
  1. 进入原始考勤记录页面。
  2. 选择一个部门。
  3. 点击“重置”按钮。
  4. 观察到部门输入框依然显示之前选择的部门名称。
- **影响范围**：原始考勤记录页面的筛选功能。

## 设计锚定
- **所属规格**：SW69 (原始考勤)
- **原设计意图**：重置按钮应清空所有筛选条件，并将 UI 恢复到默认状态。
- **当前偏离**：UI 状态（显示的部门名称）与数据状态（查询参数）不同步。

## 根因分析
- **直接原因**：`PunchFilter` 组件内部维护了 `deptName` 状态用于显示，但未监听父组件传入的 `deptId` 参数的变化。
- **根本原因**：UI 状态管理缺失同步机制。
- **相关代码**：`packages/web/src/pages/attendance/clock/components/PunchFilter.tsx`

## 修复方案
- **修复思路**：在 `PunchFilter` 组件中添加 `useEffect`，监听 `params.deptId`。当 `deptId` 为空时，强制清空 `deptName`。
- **改动文件**：
  - `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PunchFilter (Employee) | 同文件 | ✅ 已有类似逻辑 |

## 验证结果
- [x] 代码逻辑检查：确认重置时 `deptId` 变空会触发 `setDeptName('')`。
- [x] 编译通过：`npm run build` 成功。
- [x] 最小改动：仅增加 5 行代码，不影响其他逻辑。

## 提交信息
fix(web): 修复考勤记录重置时部门筛选未清空的问题
