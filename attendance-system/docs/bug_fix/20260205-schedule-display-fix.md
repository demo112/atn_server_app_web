# 排班显示缺失人员信息修复记录

## 问题描述
- **现象**：排班管理日历视图中只显示员工ID和班次ID，未显示员工姓名和班次名称。
- **复现步骤**：
  1. 进入排班管理页面。
  2. 查看已有排班。
  3. 发现显示格式为 "ID: ID"，而非 "姓名: 班次名"。
- **影响范围**：Web端排班管理页面。

## 设计锚定
- **所属规格**：SW66 (排班管理)
- **原设计意图**：用户应能直观看到排班详情，包括具体人员和班次。
- **当前偏离**：后端已返回人员姓名和班次名称，但前端因Schema校验过滤了这些字段，导致无法显示。

## 根因分析
- **直接原因**：前端 `ScheduleSchema` 未包含 `employeeName` 和 `shiftName` 字段，导致 Zod 验证时这些字段被剔除。
- **根本原因**：前后端数据契约在实现层面的不一致，前端使用的 Schema 落后于后端返回的数据结构（`ScheduleVo`）。
- **相关代码**：
  - `packages/web/src/services/attendance.ts`
  - `packages/web/src/pages/attendance/schedule/components/ScheduleCalendar.tsx`

## 修复方案
- **修复思路**：
  1. 修改 Service 层，使用 `ScheduleVoSchema`（包含 name 字段）替代 `ScheduleSchema` 进行响应校验。
  2. 修改组件层，使用 `ScheduleVo` 类型，并在渲染时优先使用 `employeeName` 和 `shiftName`。
- **改动文件**：
  - `packages/web/src/services/attendance.ts`
  - `packages/web/src/pages/attendance/schedule/components/ScheduleCalendar.tsx`

## 验证结果
- [x] 原问题已解决：新增单元测试 `ScheduleCalendar.test.tsx` 验证了姓名显示逻辑。
- [x] 回归测试通过：`schedule.test.tsx` 集成测试通过。
- [x] 设计一致性确认：符合用户直观查看排班的需求。

## 文档同步
- [ ] design.md：无需更新（纯展示层修复）。
- [ ] api-contract.md：无需更新（API本身返回数据未变）。

## 提交信息
fix(web): 修复排班日历不显示员工姓名和班次名称的问题
