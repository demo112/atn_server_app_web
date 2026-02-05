# 补签处理列表报错及数据缺失修复记录

## 问题描述
- **现象**：
  1. 用户反馈“列表有报错”，界面显示“Network error”或“获取考勤数据失败”。
  2. 选择“全公司”时数据可能为空。
- **复现步骤**：
  1. 传递无效的 `deptId` 参数（如 `NaN` 或非法字符串）给后端。
  2. 前端 `DepartmentTree` 选择“全公司”时传递 `null`，导致后端过滤 `deptId=0`。
- **影响范围**：补签处理页面数据加载。

## 设计锚定
- **所属规格**：SW66 补签管理
- **原设计意图**：应能查看和处理异常考勤，支持部门筛选。
- **当前偏离**：参数处理不健壮导致后端崩溃（500）；参数映射不准确导致查询结果为空。

## 根因分析
- **直接原因**：
  1. 后端 `getDailyRecords` 直接使用 `Number(deptId)`，如果转换结果为 `NaN`，Prisma 查询会出错或行为不符合预期。
  2. 前端 `deptId` 状态为 `null` 时，未转换为 `undefined`，可能导致后端接收到空字符串或 0。
- **根本原因**：缺乏参数健壮性校验和防御性编程。
- **相关代码**：
  - `packages/server/src/modules/attendance/attendance-correction.service.ts`
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 修复方案
- **修复思路**：
  1. 后端：在 Service 层增加 `!isNaN` 检查，忽略无效的数字参数。
  2. 前端：在调用 API 前将 `null` `deptId` 转换为 `undefined`。
  3. 前端：优化错误展示，在表格内显示详细错误信息。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance-correction.service.ts`
  - `packages/web/src/pages/attendance/correction/CorrectionProcessingPage.tsx`

## 验证结果
- [x] 原问题已解决：新增测试用例 `should ignore invalid deptId` 通过。
- [x] 回归测试通过：`attendance-correction.service.query.test.ts` 全通过。
- [x] 设计一致性确认：符合设计意图。
- [x] 编译通过：Lint 检查通过。

## 文档同步
- [ ] design.md：无需更新（纯代码修复）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(attendance): 修复补签列表报错及数据缺失问题

背景: 用户反馈列表报错，且全公司筛选无数据
变更:
1. 后端增加 deptId/employeeId 参数 NaN 检查
2. 前端修正全公司筛选时的参数传递 (null -> undefined)
3. 前端优化错误提示 UI
影响: 补签处理页面数据加载更健壮
