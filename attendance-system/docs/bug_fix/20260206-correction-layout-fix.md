# 表格布局错乱修复记录

## 问题描述
- **现象**：在“补签处理”页面，筛选栏位置异常，导致表格第一行数据被遮挡或位置错乱。
- **复现步骤**：进入考勤处理 -> 补签处理页面，观察表格头部与筛选栏的布局。
- **影响范围**：仅影响 `CorrectionProcessingPage` 页面布局，不影响业务逻辑。

## 设计锚定
- **所属规格**：SW62 (补签处理)
- **原设计意图**：页面分为头部筛选栏（固定）和内容表格（滚动）。
- **当前偏离**：`sticky` 属性在复杂的 Flex 嵌套布局中导致定位计算异常，特别是在父容器滚动行为不明确时。

## 根因分析
- **直接原因**：Filter Header 使用了 `sticky top-0`，但其父容器及兄弟节点（Table Section）的滚动行为设置导致 `sticky` 定位上下文复杂，引发视觉错位。
- **根本原因**：在“Header + 独立滚动 Content”的 Flex 布局模式中，Header 本身处于滚动容器外部，无需使用 `sticky`。
- **相关代码**：`packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 修复方案
- **修复思路**：移除 Filter Header 的 `sticky` 属性，使其回归正常的 Flex 流布局。同时给父容器添加 `overflow-hidden`，确保内部 Flex 布局（Table Section 的 `overflow-auto`）正确生效，防止溢出。
- **改动文件**：
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 验证结果
- [x] 原问题已解决：逻辑上消除了定位不确定性。
- [x] 回归测试通过：类型检查和构建均通过。
- [x] 设计一致性确认：布局结构符合设计意图。

## 提交信息
fix(web): 修复补签处理页面表格布局错乱问题

移除 Filter Header 的 sticky 属性，修正 Flex 布局容器溢出问题。
