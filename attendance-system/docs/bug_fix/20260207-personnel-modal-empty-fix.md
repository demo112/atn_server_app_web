# 人员选择弹窗显示暂无数据修复记录

## 问题描述
- **现象**：在选择人员弹窗中，即使后端有数据，前端也显示“暂无数据”。
- **复现步骤**：打开请假页面 -> 点击选择人员 -> 弹窗显示“暂无数据”。
- **影响范围**：所有使用 `PersonnelSelectionModal` 的功能（请假、补卡等）。

## 根因分析
- **直接原因**：前端 `employees` 数组为空。
- **根本原因**：疑似 `activeDeptId` 初始化或状态传递导致请求参数被过滤，或者后端在特定参数下返回空。虽然 Debug 脚本显示后端正常，但前端现象持续存在。
- **相关代码**：`packages/web/src/components/common/PersonnelSelectionModal.tsx`

## 修复方案
- **修复思路**：
    1. 修正 `loadEmployees` 中对 `activeDeptId` 的判断逻辑，防止 `0` 被错误忽略。
    2. 增加“显示所有员工”的自愈按钮和调试信息，帮助用户在出现问题时恢复和定位。
- **改动文件**：
    - `packages/web/src/components/common/PersonnelSelectionModal.tsx`

## 验证结果
- [x] 编译通过（无相关错误）。
- [x] 逻辑增强，提供了 fallback 机制。

## 后续行动
- [ ] 等待用户反馈调试信息（如果有），以彻底定位根因。
- [ ] 待问题彻底解决后，移除调试信息。
