# App 新建请假默认时间修复记录

## 问题描述
- 现象：App 新建申请弹窗时间为空，需手动输入
- 复现：进入请假/出差页面，点击“+ 新申请”，时间输入框为空
- 影响范围：App 端请假申请新增弹窗

## 设计锚定
- 所属规格：SW67（请假/出差管理）
- 原设计意图：新增弹窗提供便捷录入体验（不影响编辑已有记录）
- 当前偏离：新增时未预填工作时间段

## 根因分析
- 直接原因：新增弹窗打开时未设置默认值
- 根本原因：缺少 UI 层初始化逻辑
- 相关代码：packages/app/src/screens/attendance/LeaveScreen.tsx

## 修复方案
- 新增弹窗打开时，若为空则默认：当天 09:00 与 18:00
- 仅在新增场景生效；编辑场景保持原值
- 改动文件：
  - packages/app/src/screens/attendance/LeaveScreen.tsx
  - 回退 Web 端默认值：packages/web/src/pages/attendance/leave/components/LeaveDialog.tsx（保持 Web 不改动）

## 验证结果
- [x] App 端弹窗打开默认时间正确
- [x] 编辑已有记录不受影响
- [x] 不改变 API 契约与数据模型

## 文档同步
- design.md：无需更新（UI 初始化细节）
- api-contract.md：无需更新

## 防回退标记
**关键词**：请假申请、默认时间、09:00、18:00、App
**设计决策**：新增仅预填当天工作时段，不覆盖用户已填写值

## 提交信息
fix(app): 新建请假默认时间为当天09:00/18:00；同步回退web默认值改动
