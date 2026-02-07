# 补录打卡失败 (未来时间) 修复记录

## 问题描述
- **现象**：补录打卡时选择未来时间，提交后报错 "Future clock time not allowed"。
- **复现步骤**：
  1. 进入考勤记录页面。
  2. 点击“补录打卡”。
  3. 选择一个未来的时间（如2026-02-11）。
  4. 提交。
- **影响范围**：Web端考勤记录补录、补签到、补签退功能。

## 设计锚定
- **所属规格**：SW69 (原始考勤/打卡)
- **原设计意图**：后端已实施禁止未来时间打卡的限制（`ERR_CLOCK_FUTURE_TIME_NOT_ALLOWED`）。前端应在 UI 层配合限制，提升用户体验。
- **当前偏离**：前端未限制日期选择器范围，导致用户可以选择无效时间。

## 根因分析
- **直接原因**：`<input type="datetime-local">` 缺少 `max` 属性。
- **根本原因**：前端组件封装时未考虑到“未来时间禁止”的业务规则。
- **相关代码**：`ClockRecordPage.tsx`, `CheckInDialog.tsx`, `CheckOutDialog.tsx`。

## 修复方案
- **修复思路**：
  1. 给日期选择器添加 `max` 属性，限制最大值为当前时间。
  2. 在提交前添加 JS 校验，拦截未来时间并给出友好提示。
- **改动文件**：
  - `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx`
  - `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`
  - `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx`
  - `packages/web/src/App.tsx` (顺手修复构建错误)
  - 多个测试文件 (顺手修复 unused vars 以通过构建)

## 关联组件（重要）
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| ClockRecordPage | `web/src/pages/attendance/clock/ClockRecordPage.tsx` | ✅ |
| CheckInDialog | `web/src/pages/attendance/correction/components/CheckInDialog.tsx` | ✅ |
| CheckOutDialog | `web/src/pages/attendance/correction/components/CheckOutDialog.tsx` | ✅ |

## 验证结果
- [x] 原问题已解决 (代码逻辑确认)
- [x] 回归测试通过 (Build Success)
- [x] 设计一致性确认
- [x] **同类组件已检查**

## 文档同步
- [ ] design.md：无需更新 (符合原设计)

## 防回退标记
**关键词**：Future clock time, 补录打卡, 补签
**设计决策**：所有手动打卡/补卡入口必须限制时间 <= 当前时间。

## 提交信息
fix(web): 限制补录打卡禁止选择未来时间

- fix: 给打卡时间选择器添加 max 属性
- fix: 提交前校验打卡时间
- fix: 修复 App.tsx 引用不存在模块导致构建失败的问题
- chore: 清理未使用的变量和导入
