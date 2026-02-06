# ZodError Fix Record

## 问题描述
- **现象**：进入班次管理页面时，控制台报错 `ZodError: [`，无法加载班次列表。
- **复现步骤**：
  1. 启动 Web 项目。
  2. 进入“考勤配置” -> “班次管理”。
  3. 如果存在 `rules` 字段为 `null` 的班次数据，触发报错。
- **影响范围**：Web 端班次列表页 (ShiftPage)。

## 设计锚定
- **所属规格**：班次管理 (SW64/SW66)
- **原设计意图**：`TimePeriod` 的 `rules` 字段用于存储扩展规则，如宽限时间等。
- **当前偏离**：
  - 后端返回的数据中，`rules` 字段可能是 `null`（数据库中无数据时）。
  - 前端 Zod Schema 定义为 `rules: TimePeriodRulesSchema.optional()`，不接受 `null`。
  - 导致 Zod 解析失败，抛出异常。

## 根因分析
- **直接原因**：前端 `TimePeriodSchema` 中的 `rules` 字段未标记为 `nullable`，但后端接口返回了 `null`。
- **根本原因**：前后端数据契约定义不一致，Schema 校验过于严格。
- **相关代码**：`packages/web/src/schemas/attendance.ts`

## 修复方案
- **修复思路**：修改 Zod Schema，允许 `rules` 字段为 `null`。
- **改动文件**：
  - `packages/web/src/schemas/attendance.ts`

```typescript
// Before
rules: TimePeriodRulesSchema.optional(),

// After
rules: TimePeriodRulesSchema.nullable().optional(),
```

此外，修复了一处语法错误：`createdAt: z.string(),z.string().optional()` -> `createdAt: z.string()`。

## 验证结果
- [x] 原问题已解决：通过复现脚本验证，`rules: null` 现在可以正确通过校验。
- [x] 回归测试通过：Schema 变更不影响现有非 null 数据。
- [x] 设计一致性确认：符合允许 rules 为空的业务逻辑。

## 文档同步
- [ ] design.md：无需修改，属实现细节修复。
- [ ] api-contract.md：无需修改。

## 提交信息
fix(web): 修复班次列表 Zod 校验错误

背景: 班次数据中 rules 字段可能为 null
变更: 将 TimePeriodSchema 中的 rules 字段改为 nullable
影响: 解决班次列表加载失败的问题
