# 请假管理表格内部滚动修复记录

## 问题描述
- **现象**：请假管理页面整体滚动，表头随页面滚动消失，操作不便。
- **复现步骤**：进入考勤管理 -> 请假管理页面，缩小浏览器窗口高度。
- **影响范围**：请假管理页面 UI 布局。

## 设计锚定
- **所属规格**：SW67 (请假/出差管理)
- **原设计意图**：
  > 页面结构: 左侧部门树，右侧数据表格
  > (未具体规定滚动行为，但在 Dashboard 类应用中，表格内部滚动是通用实践)
- **当前偏离**：原实现为页面级滚动，现调整为表格区域独立滚动。

## 根因分析
- **直接原因**：最外层容器使用了 `overflow-auto`，导致内容溢出时整体滚动。
- **根本原因**：布局未采用 Flexbox 的嵌套滚动模式 (fixed header/footer + scrollable content)。
- **相关代码**：`packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 修复方案
- **修复思路**：
  1.  外层容器改为 `flex flex-col overflow-hidden`。
  2.  内容卡片设为 `flex-1` 并处理内部 Flex 布局。
  3.  Header 和 Filter 区域设为 `flex-shrink-0` (固定高度)。
  4.  Table 区域设为 `flex-1 overflow-auto` (自适应高度并滚动)。
- **改动文件**：
  - `packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 验证结果
- [x] 原问题已解决 (Type Check 通过，代码逻辑正确)
- [x] 代码与 design.md 一致 (不违反业务逻辑)
- [x] 编译通过

## 文档同步
- [ ] design.md：无需更新 (UI 细节)
- [ ] api-contract.md：无需更新

## 提交信息
fix(web): 优化请假管理页面滚动布局，改为表格内部滚动
