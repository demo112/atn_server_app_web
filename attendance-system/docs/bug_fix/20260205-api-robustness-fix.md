# API 健壮性与优化修复记录

## 问题描述
- **现象**：
  1. `POST /schedules` 接口存在多余的数据库查询（创建后再查询），影响性能。
  2. `GET /schedules` 接口未强制要求时间范围，存在全量查询的大数据量风险。
  3. `CreateScheduleDto` 中日期格式校验被注释，可能导致非法格式进入业务层。
- **影响范围**：排班模块 (Attendance Schedule)

## 设计锚定
- **所属规格**：SW65 排班管理
- **原设计意图**：
  - 排班查询应按需加载（按月/按周）。
  - 创建排班应保证原子性和高性能。
- **当前偏离**：
  - 查询接口允许无参调用，偏离按需加载原则。
  - 创建逻辑包含冗余查询。

## 修复方案
1. **优化创建逻辑**：在 `create` 事务中直接利用 `prisma.create({ include: ... })` 返回结果，移除后续的 `findFirst` 查询。
2. **增强查询校验**：`ScheduleController.getOverview` 强制要求 `startDate` 和 `endDate` 参数。
3. **启用严格校验**：恢复 `CreateScheduleDto` 中的 `@Matches` 日期格式校验。

## 改动文件
- `packages/server/src/modules/attendance/schedule/schedule.service.ts`
- `packages/server/src/modules/attendance/schedule/schedule.controller.ts`
- `packages/server/src/modules/attendance/schedule/schedule.dto.ts`

## 验证结果
- [x] 代码静态检查通过。
- [x] 逻辑检查：`createWithTx` 正确返回包含关联数据的对象。
- [x] 逻辑检查：DTO 校验正则 `/^\d{4}-\d{2}-\d{2}$/` 符合前端传参。

## 提交信息
fix(attendance): 优化排班接口性能并增强校验
