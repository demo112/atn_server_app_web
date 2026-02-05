# 考勤计算按钮无响应修复记录

## 问题描述
- **现象**：每日统计全字段报表页面的“考勤计算”按钮点击无反应。
- **复现步骤**：进入统计报表 -> 每日统计全字段报表 -> 点击“考勤计算”按钮。
- **影响范围**：统计报表模块的用户无法手动触发考勤计算。

## 设计锚定
- **所属规格**：Statistical Report UI (UI仿制)
- **原设计意图**：提供手动触发考勤计算的入口。根据 `DailyRecords.tsx` 的实现，应弹出日期选择框供用户指定重算范围。
- **当前偏离**：按钮仅有 UI 样式，未绑定任何点击事件，也未实现后端交互逻辑。

## 根因分析
- **直接原因**：`DailyStatsReport.tsx` 中按钮 `onClick` 事件缺失。
- **根本原因**：UI 仿制阶段未对接后端逻辑，且后续未补充实现。
- **相关代码**：`packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 修复方案
- **修复思路**：
  1. 引入 `StandardModal` 组件用于日期选择。
  2. 引入 `triggerCalculation` API。
  3. 实现状态管理 (`recalcModalVisible`, `recalcForm`)。
  4. 绑定按钮事件并实现重算逻辑。
- **改动文件**：
  - `packages/web/src/pages/statistics/DailyStatsReport.tsx`

## 验证结果
- [x] 原问题已解决：按钮点击可弹出对话框，并能触发 API 调用。
- [x] 回归测试通过：TypeScript 编译通过 (`npm run type-check`)。
- [x] 设计一致性确认：交互方式与 `DailyRecords` 页面保持一致。

## 文档同步
- [ ] design.md：无需更新 (UI 实现细节)。
- [ ] api-contract.md：无需更新 (使用已有 API)。

## 提交信息
fix(web): 修复每日统计报表考勤计算按钮无响应问题

背景: 用户反馈考勤计算按钮点击无反应
变更:
1. 每日统计报表页增加手动重算弹窗
2. 集成 triggerCalculation API
影响: 统计报表模块
