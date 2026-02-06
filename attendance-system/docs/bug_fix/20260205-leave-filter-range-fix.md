# 请假管理时间范围筛选修复记录

## 问题描述
- **现象**：请假管理页面的时间范围筛选器允许用户选择开始时间晚于结束时间。
- **复现步骤**：
  1. 进入请假管理页面
  2. 设置开始时间为较晚的时间（如 2026-02-05）
  3. 设置结束时间为较早的时间（如 2026-02-04）
  4. 系统未做限制，且可能发起无效查询
- **影响范围**：`packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 设计锚定
- **所属规格**：SW62 (Attendance Processing) / UI Enhancement
- **原设计意图**：通用 UI 交互规范，时间范围选择应当保证 Start <= End。
- **当前偏离**：缺少 UI 限制和逻辑校验。

## 修复方案
1. **UI 限制**：
   - Start Input: 添加 `max={endTime}`
   - End Input: 添加 `min={startTime}`
   - 利用 HTML5 `datetime-local` 的原生约束能力。
2. **逻辑校验**：
   - 在 `fetchData` 前置检查，如果 `startTime > endTime`，阻止请求并 Toast 提示。

## 验证结果
- [x] 类型检查通过 (`tsc --noEmit`)
- [x] 代码逻辑检查：
  - `min`/`max` 属性正确绑定
  - `fetchData` 中断逻辑正确

## 文档同步
- [ ] design.md：无需更新 (UI 交互细节)。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复请假管理时间筛选器范围限制问题
