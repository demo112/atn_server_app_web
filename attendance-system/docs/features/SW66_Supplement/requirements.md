# Requirements: 补签处理模块 (SW66)

## Overview

在 Web 端实现补签处理功能，允许用户对每日考勤记录进行补签到和补签退操作。
UI 需模仿参考实现 (`incoming/web/signed`)。

## User Stories

### Story 1: 独立补签处理页面

As a 考勤管理员, I want 一个独立的补签处理页面, so that 我可以集中处理异常考勤记录

**Acceptance Criteria:**

- [ ] AC1: 独立页面入口
  - **Given**: 用户在侧边栏导航
  - **When**: 点击“考勤管理” -> “补签处理”
  - **Then**: 进入独立的补签处理页面，不依赖“每日考勤明细”

- [ ] AC2: UI 复刻 (UI Cloning)
  - **Given**: 进入补签处理页面
  - **Then**: 页面布局、样式、交互必须与 `incoming/web/signed` 保持一致
  - **Detail**:
    - 顶部筛选区：日期范围（默认本月）、部门（树形选择）、姓名/工号、状态
    - 中间表格区：包含“操作”列，样式像素级复刻
    - 底部操作区：分页控件

- [ ] AC3: 补签操作流程
  - **Given**: 表格中显示异常记录（缺卡/迟到/早退）
  - **When**: 点击“补签到”或“补签退”按钮
  - **Then**: 弹出补签对话框（复用现有 Dialog 组件），提交后刷新列表

- [ ] AC3: 补签弹窗交互
  - **Given**: 用户点击“补签到”或“补签退”
  - **Then**: 
    - 弹出补签对话框
    - 自动填充当前日期
    - 必填项：补签时间、备注
    - 显示“确认”和“取消”按钮

- [ ] AC4: 提交补签
  - **Given**: 用户填写完补签信息并点击确认
  - **When**: API 调用成功
  - **Then**: 
    - 关闭弹窗
    - 显示成功提示
    - 自动刷新列表数据

## Constraints

- 复用现有的 `CheckInDialog` / `CheckOutDialog` 组件（如果可用）
- 保持与 `incoming/web/signed` 的视觉风格一致（Tailwind）

## References

- 参考代码：`attendance-system/incoming/web/signed`
- 现有页面：`packages/web/src/pages/attendance/details/AttendanceDetailsPage.tsx`
