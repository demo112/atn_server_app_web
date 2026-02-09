# 每日统计报表加载失败修复

## 问题描述
用户反馈进入“每日统计全字段报表”页面时报错，图标无内容展示，错误信息为 `Failed to fetch daily records: ZodError: [`。

## 设计锚定
- **原设计意图**：前端使用 Zod Schema 对后端返回的数据进行运行时校验，确保数据格式符合预期。
- **偏离点**：`packages/web/src/schemas/attendance.ts` 中定义的字段长度限制（如 `max(20)`, `max(50)`）严于数据库 Schema 定义（`VarChar(50)`, `VarChar(100)`）。

## 根因分析
后端数据库字段长度定义：
- `employeeNo`: VarChar(50)
- `employeeName`: VarChar(100)
- `Department.name`: VarChar(100)

前端 Zod Schema 定义：
- `employeeNo`: max(20)
- `employeeName`: max(50)
- `deptName`: max(50)

当存在工号长度超过 20 或姓名/部门名称超过 50 的数据时，Zod 校验失败，导致页面无法渲染数据。

## 修复方案
修改 `packages/web/src/schemas/attendance.ts`，将相关字段的长度限制放宽至与数据库一致：
- `employeeNo`: max(20) -> max(50)
- `employeeName`: max(50) -> max(100)
- `deptName`: max(50) -> max(100)
- `operatorName`: max(50) -> max(100)

同时同步修复了 `LeaveVoSchema`, `ClockRecordSchema`, `CorrectionVoSchema` 中的类似问题。

## 关联组件清单
- `DailyRecordVoSchema` (修复目标)
- `LeaveVoSchema`
- `ClockRecordSchema`
- `CorrectionVoSchema`

## 验证结果
- [x] 代码构建通过 (`npm run build` in `packages/web`)
- [x] Schema 定义与 Prisma Schema 匹配

## 文档同步
纯代码 Bug 修复，不涉及 API 契约变更（实际上是修正了契约实现），无需更新 design.md。
