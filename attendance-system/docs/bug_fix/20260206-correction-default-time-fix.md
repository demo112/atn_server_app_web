# 补签弹窗默认时间修复记录

## 问题描述
- **现象**：在进行补签操作时，弹窗中的默认时间显示为当前操作时间（`dayjs()`），而不是该班次规定的上下班时间。
- **复现步骤**：
  1. 进入考勤补卡页面。
  2. 点击某条异常记录的"补签"按钮（签到或签退）。
  3. 观察弹窗中的时间输入框，默认值为当前时间。
- **影响范围**：Web 端考勤补卡功能。

## 设计锚定
- **所属规格**：SW66_Supplement (补签功能)
- **原设计意图**：`DailyRecordVo` 包含 `startTime` (班次规定上班时间) 和 `endTime` (班次规定下班时间)。补签作为对特定班次的修正，应优先建议使用规定的班次时间。
- **当前偏离**：UI 组件未利用 `DailyRecordVo` 中的班次时间数据作为默认值。

## 根因分析
- **直接原因**：`CheckInDialog` 和 `CheckOutDialog` 组件在初始化时，`useEffect` 钩子中使用了 `dayjs().format(...)` 作为默认值，且未接收外部传入的班次时间。
- **根本原因**：组件接口定义缺失 `startTime`/`endTime` 属性，导致无法从父组件传递班次时间数据。
- **相关代码**：
  - `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`
  - `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx`

## 修复方案
- **修复思路**：
  1. 修改 Dialog 组件接口，增加 `startTime`/`endTime` 可选属性。
  2. 修改 `useEffect` 逻辑：优先使用传入的班次时间，若无则降级为当前时间。
  3. 在父组件 `CorrectionProcessingPage` 中将 `selectedRecord` 的时间传递给 Dialog。
- **改动文件**：
  - `packages/web/src/pages/attendance/correction/components/CheckInDialog.tsx`
  - `packages/web/src/pages/attendance/correction/components/CheckOutDialog.tsx`
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 验证结果
- [x] 原问题已解决：逻辑已更新，优先取值 `workDate` + `startTime`/`endTime`。
- [ ] 回归测试通过：等待构建验证。
- [x] 设计一致性确认：符合补签业务逻辑。

## 文档同步
- [ ] design.md：无需更新（属 UI 默认值优化，未改变 API 或核心流程）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复补签弹窗默认时间未取班次时间的问题
