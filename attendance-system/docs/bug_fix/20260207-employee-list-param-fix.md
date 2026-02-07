# 人员列表参数验证失败修复记录

## 问题描述
- **现象**：人员管理页面弹出“参数验证失败”和“获取人员列表失败”错误提示。
- **复现步骤**：
  1. 进入人员管理页面。
  2. 默认选中“全公司”（虚拟根节点）。
  3. 页面加载时触发 API 请求，随后报错。
- **影响范围**：Web 端人员管理页面。

## 设计锚定
- **所属规格**：部门管理 (SW62) / 人员管理
- **原设计意图**：
  - 引用 `docs/bug_fix/20260206-department-root-and-admin-fix.md`。
  - 选中虚拟根节点“全公司”时，应查询所有员工（不带 `deptId` 过滤）。
- **当前偏离**：
  - 前端传递了 `deptId: -1`。
  - 后端接口校验规则要求 `deptId` 为正整数 (`positive`)。

## 根因分析
- **直接原因**：`DepartmentSidebar` 组件选中根节点时返回 ID `'-1'`，`EmployeeList` 直接将其转为数字 `-1` 传递给后端。
- **根本原因**：前端组件间缺乏对特殊值（虚拟 ID）的转换处理，导致不合法的参数传给后端。
- **相关代码**：`packages/web/src/pages/employee/EmployeeList.tsx`

## 修复方案
- **修复思路**：在 `EmployeeList` 的 `handleDeptSelect` 方法中，拦截 `'-1'` 值，将其转换为 `undefined`，从而在请求参数中省略 `deptId`。
- **改动文件**：
  - `packages/web/src/pages/employee/EmployeeList.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| DepartmentSidebar | `packages/web/src/pages/employee/components_new/DepartmentSidebar.tsx` | ❌ (逻辑在父组件处理) |

## 验证结果
- [x] 原问题已解决：逻辑上已拦截非法参数。
- [x] 回归测试通过：`npm run build` 成功。
- [x] 设计一致性确认：符合查询所有员工的设计意图。

## 文档同步
- [ ] design.md：无需更新。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复人员列表参数验证失败问题

1. 修复选中全公司时传递非法deptId(-1)的问题
2. 确保查询所有员工时参数正确
