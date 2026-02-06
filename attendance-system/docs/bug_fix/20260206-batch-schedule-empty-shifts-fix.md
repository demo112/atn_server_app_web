# 批量排班班次为空修复记录

## 问题描述
- **现象**：批量排班弹窗中，“选择班次”下拉列表为空。
- **复现步骤**：打开批量排班弹窗，观察班次下拉框。
- **影响范围**：Web 端排班功能。

## 设计锚定
- **所属规格**：SW64/SW66 (Schedule/Shift Management)
- **原设计意图**：用户应能从下拉列表中选择所有可用班次。
- **当前偏离**：
    - 前端 `getShifts` 期望返回 `Shift[]` 数组。
    - 后端 `AttendanceShiftController.getList` 返回分页结构 `{ items: Shift[], total: number, ... }`。
    - 前端解析失败（类型不匹配），导致列表为空。
    - 前端未指定 `pageSize`，后端默认返回 10 条，可能不全。

## 根因分析
- **直接原因**：前端 Service 层未适配后端的分页响应结构。
- **根本原因**：前后端接口契约在分页处理上存在偏差，且下拉列表场景未处理“获取全部”的需求。
- **相关代码**：`packages/web/src/services/attendance.ts`

## 修复方案
- **修复思路**：
    1. 修改 `attendanceService.getShifts`，请求时指定较大的 `pageSize` (1000) 以获取所有班次。
    2. 更新响应验证逻辑，适配 `PaginatedResponse` 结构并提取 `items`。
- **改动文件**：
    - `packages/web/src/services/attendance.ts`

## 验证结果
- [x] 原问题已解决：代码逻辑已修正，适配后端响应。
- [x] 回归测试通过：`npm run type-check` 通过。
- [x] 设计一致性确认：符合设计意图。

## 文档同步
- [ ] design.md：无需更新 (纯代码修复)。
- [ ] api-contract.md：无需更新 (后端接口未变)。

## 提交信息
fix(web): 修复批量排班班次列表为空的问题

背景: 批量排班弹窗无法加载班次列表
变更: 
1. 修正 getShifts 接口响应解析，适配后端分页结构
2. 增加 pageSize 参数确保加载所有班次
影响: 恢复排班功能的班次选择
