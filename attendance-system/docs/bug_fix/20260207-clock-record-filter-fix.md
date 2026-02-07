# 原始考勤记录筛选框及人员展示修复记录

## 问题描述
- **现象**：
  1. “筛选部门”和“筛选员工”输入框无法点击，无法选择。
  2. 人员列表不展示，补录打卡下拉框及筛选回显可能显示 ID 而非姓名。
- **复现步骤**：进入“考勤统计” -> “打卡记录”页面，尝试点击筛选框。
- **影响范围**：原始考勤记录页面的筛选功能和补录打卡功能。

## 设计锚定
- **所属规格**：SW69 (原始考勤)
- **原设计意图**：用户应能通过弹窗选择部门和员工进行筛选，界面应显示员工姓名而非 ID。
- **当前偏离**：
  1. 输入框可能因样式或层级问题无法响应点击。
  2. 数据源使用了 `UserService` (User) 而非 `EmployeeService` (Employee)，导致数据不匹配，无法正确回显姓名。

## 根因分析
- **直接原因**：
  1. `PunchFilter` 组件使用 `readOnly` 的 `input` 元素且可能存在层级遮挡，导致点击事件无效。
  2. `ClockRecordPage` 错误地使用了 `userService.getUsers` 加载数据，而考勤记录关联的是 `Employee`，导致 ID 和姓名无法正确匹配。
- **根本原因**：前端组件开发时混淆了 User 和 Employee 的概念，且 UI 实现未充分测试交互。
- **相关代码**：
  - `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx`
  - `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx`

## 修复方案
- **修复思路**：
  1. 将 `ClockRecordPage` 中的数据源切换为 `employeeService.getEmployees`。
  2. 重构 `PunchFilter`，将 `input` 替换为 `div` 模拟的输入框，确保点击区域有效且样式统一。
  3. 更新类型定义，确保使用 `EmployeeVo`。
- **改动文件**：
  - `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx`
  - `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| PunchFilter | `packages/web/src/pages/attendance/clock/components/PunchFilter.tsx` | ✅ |

## 验证结果
- [x] 静态代码分析确认数据源已切换为 `EmployeeService`。
- [x] 确认 `PunchFilter` 使用 `div` 模拟输入框，消除了 `readOnly` input 的潜在交互问题。
- [x] `npm run build` 编译通过，类型检查无误。

## 提交信息
fix(web): 修复考勤记录筛选框无法点击及人员数据源错误
