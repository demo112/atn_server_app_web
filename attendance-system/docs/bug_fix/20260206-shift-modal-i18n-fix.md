# 班次弹窗汉化修复记录

## 问题描述
- **现象**：Web 端新增班次弹窗界面显示为英文（Check-in, Check-out 等）。
- **复现步骤**：进入班次管理 -> 点击新增班次。
- **影响范围**：`packages/web/src/pages/attendance/shift/components/ShiftModal.tsx`。

## 设计锚定
- **所属规格**：SW64 (Web 班次管理)
- **原设计意图**：根据 `docs/features/SW64/requirements_web.md`，功能描述均为中文，界面应支持中文显示。
- **当前偏离**：代码中硬编码了英文标签。

## 根因分析
- **直接原因**：开发时使用了硬编码的英文文本。
- **根本原因**：缺乏国际化支持或直接使用了英文原型代码。
- **相关代码**：`ShiftModal.tsx`

## 修复方案
- **修复思路**：将硬编码的英文文本替换为对应的中文术语。
- **改动文件**：`packages/web/src/pages/attendance/shift/components/ShiftModal.tsx`

## 验证结果
- [x] 原问题已解决：所有相关英文标签已替换为中文。
- [x] 回归测试通过：`npm run type-check` 未引入新错误。
- [x] 设计一致性确认：符合设计文档描述。

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 提交信息
fix(web): 汉化班次管理弹窗界面
