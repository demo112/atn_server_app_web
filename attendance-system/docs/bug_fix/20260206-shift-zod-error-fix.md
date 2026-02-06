# 班次数据 Zod 校验错误修复记录

## 问题描述
- **现象**：进入考勤班次页面时，前端抛出 `ZodError`，无法加载班次列表。
- **复现步骤**：
  1. 打开考勤系统 Web 端
  2. 进入“考勤设置” -> “班次管理”
  3. 页面显示错误提示，控制台报错 `ZodError`
- **影响范围**：班次管理列表页 (`ShiftPage`)

## 设计锚定
- **所属规格**：SW64 (班次管理)
- **原设计意图**：
  - `design.md` 中定义的 `TimePeriod` 数据模型中，`startTime` 等字段为可选 (`?string`)。
  - 前端 UI 模型期望这些字段为 `string | undefined`。
- **当前偏离**：
  - 后端接口返回的数据中，未设置的时间字段值为 `null`。
  - 前端 `TimePeriodSchema` 使用 `z.string().optional()`，仅支持 `string | undefined`，不支持 `null`。
  - `ShiftSchema` 缺失 `days` 字段定义（由远程修复补充）。

## 根因分析
- **直接原因**：后端返回 `null`，Zod Schema 期望 `undefined`。`ShiftSchema` 定义不完整。
- **根本原因**：Schema 定义未考虑到 JSON 序列化中 `null` 的存在（后端通常将 `optional` 字段序列化为 `null` 而非省略）。前后端数据契约定义不一致。
- **相关代码**：`packages/web/src/schemas/attendance.ts` 中的 `TimePeriodSchema` 和 `ShiftSchema`。

## 修复方案
- **修复思路**：修改 Zod Schema，允许字段为 `nullable`，并在转换（transform）阶段将 `null` 转换为 `undefined`，以保持与前端类型的兼容性。同时补充缺失的 `days` 字段。
- **改动文件**：
  - `packages/web/src/schemas/attendance.ts`

```typescript
// TimePeriodSchema 修改
startTime: z.string().nullable().optional().transform((v): string | undefined => v ?? undefined),
rules: TimePeriodRulesSchema.nullable().optional(),
createdAt: z.string().optional(),
updatedAt: z.string().optional(),

// ShiftSchema 修改
// 添加 days 字段
```

## 验证结果
- [x] 原问题已解决：Schema 验证脚本确认可正确解析含 `null` 的数据。
- [x] 回归测试通过：`npm run type-check` 和 `npm run build` 均通过，无类型兼容性问题。
- [x] 设计一致性确认：修复后的类型符合 `design.md` 和 Shared Type 定义。

## 文档同步
- [ ] design.md：无需更新（设计本身允许可选，Schema 只是适配实现细节）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复班次数据校验 ZodError

背景: 后端返回的班次时间段数据中，可选字段值为 null，且 ShiftSchema 缺失 days 字段
变更: 更新 TimePeriodSchema 支持 nullable 并转换为 undefined，更新 ShiftSchema
影响: 班次管理列表页数据加载
