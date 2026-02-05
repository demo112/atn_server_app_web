# 20260205-punch-table-vertical-scroll-fix.md

## 问题描述
- **现象**：原始考勤记录列表无法纵向滚动，超出部分被直接截断。
- **影响范围**：原始考勤记录页面 (ClockRecordPage)。

## 根因分析
- **直接原因**：
  1. `ClockRecordPage` 中包裹 `PunchTable` 的父容器使用了 `overflow-hidden`，但未设置为 Flex 容器。
  2. `PunchTable` 组件虽然设置了 `flex-1` 和 `overflow-auto`，但作为普通块级元素在非 Flex 父容器中，其高度会随内容撑开而非填充剩余空间。
  3. 结果是 `PunchTable` 高度超过父容器，且父容器裁剪了溢出部分，导致滚动条不可见。

## 修复方案
- **样式调整**：
  1. 将 `ClockRecordPage` 中包裹 `PunchTable` 的 `div` 类名从 `flex-1 overflow-hidden relative` 修改为 `flex-1 overflow-hidden relative flex flex-col`。
  2. 这样父容器成为 Flex 容器，子元素 `PunchTable` 的 `flex-1` 属性生效，使其高度被限制在父容器内，从而触发 `PunchTable` 内部的 `overflow-auto` 滚动机制。

## 验证结果
- [x] 表格内容超出高度时出现纵向滚动条。
- [x] 表格头部固定（sticky top-0 依然有效）。
- [x] 横向滚动条依然正常工作。
