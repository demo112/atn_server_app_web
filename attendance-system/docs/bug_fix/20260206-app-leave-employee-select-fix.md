# App请假管理无员工选择修复记录

## 问题描述
- **现象**：App端新建请假申请时，没有选择员工的选项。
- **用户反馈**：“app请假管理没有选择员工的地方”。
- **影响范围**：App端请假功能。

## 设计锚定
- **所属规格**：App端请假功能（无独立Spec ID，参考 Server 端 `LeaveController` 及现有 App 逻辑）。
- **原设计意图**：
    - **普通员工** (`role: user`)：只能给自己申请，不需要也不应该看到员工选择器。
    - **管理员** (`role: admin`)：必须指定员工 (`employeeId`)，应该看到员工选择器。
- **当前偏离**：
    - 代码中包含 `user?.role === 'admin'` 的判断逻辑。
    - 用户反馈看不到，推测原因是：
        1. 用户确实不是 Admin。
        2. App 本地缓存的用户信息 (`user.role`) 过时或不准确，导致判断失败。

## 根因分析
- **直接原因**：`LeaveScreen` 仅依赖 `useAuth()` 从本地 Storage 读取用户信息。如果用户角色在服务端发生变更（如被提权为 Admin），但 App 未重新登录，本地 Storage 中的 `role` 仍为旧值 (`user`)，导致 UI 隐藏了员工选择器。
- **根本原因**：权限敏感的操作界面缺乏实时的权限校验/同步机制。
- **相关代码**：`packages/app/src/screens/attendance/LeaveScreen.tsx`

## 修复方案
- **修复思路**：在进入 `LeaveScreen` 时，调用 `authService.getMe()` 获取服务端最新的用户信息，并据此更新页面状态。
- **改动文件**：
    - `packages/app/src/screens/attendance/LeaveScreen.tsx`

## 验证计划
- [ ] 检查代码编译通过。
- [ ] 模拟 `getMe` 返回 admin 角色，确认 UI 显示员工选择器。
- [ ] 模拟 `getMe` 返回 user 角色，确认 UI 隐藏员工选择器。

## 文档同步
- 无需同步（纯代码修复，未改变设计契约）。
