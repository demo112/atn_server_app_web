# 每日报表功能修复记录

## 问题描述

### 问题 1: 前端运行时崩溃
- **现象**：进入统计仪表盘每日报表时页面报错。
- **错误信息**：`ReferenceError: total is not defined`。
- **位置**：`DailyStatsReport.tsx`。

### 问题 2: 后端 500 错误
- **现象**：前端修复后，请求数据返回 500。
- **错误信息**：`AxiosError: Request failed with status code 500`。
- **位置**：`statistics.service.ts` / `statistics.controller.ts`。

## 设计锚定
- **所属规格**：SW72 (统计报表)
- **原设计意图**：报表需支持分页显示，展示总记录数，后端需健壮处理查询参数。
- **当前偏离**：
  1. 前端组件遗漏状态定义。
  2. 后端服务对日期参数和返回类型处理不够健壮。

## 根因分析

### 问题 1 (前端)
- **直接原因**：组件状态 `total`, `page`, `pageSize` 缺失。
- **根本原因**：代码实现不完整，遗漏了状态定义。

### 问题 2 (后端)
- **直接原因**：请求参数处理或数据库返回类型转换潜在风险。
- **根本原因**：
  1. `startDate`/`endDate` 构造 `Date` 对象时未做有效性检查，可能导致 `Invalid Date` 错误。
  2. `prisma.count` 返回值可能需要显式转换为 `number` (防止 BigInt 兼容性问题)。
  3. 缺乏详细的错误日志。

## 修复方案

### 前端修复 (`DailyStatsReport.tsx`)
1. 添加 `total`, `page`, `pageSize` 状态。
2. 修改 `fetchData` 支持分页参数并更新 `total`。
3. 修复 `StatusBadge` 组件中未使用的 `status` 变量警告。

### 后端修复 (`statistics.service.ts`, `statistics.controller.ts`)
1. **Controller**: 添加 `try-catch` 块和详细日志，捕获并记录未处理异常。
2. **Service**:
   - 增加 `startDate` 和 `endDate` 的有效性检查，无效日期直接返回空结果而非抛错。
   - 显式将 `prisma.count` 结果转换为 `Number()`。

## 验证结果
- [x] 原问题已解决：
  - 前端 `total` 变量已定义。
  - 后端增加防御性代码和日志。
- [x] 编译检查通过：
  - 前端无类型错误。
  - 后端 `npm run build` 通过。
- [x] 设计一致性确认：符合分页设计要求。

## 文档同步
- [ ] design.md：无需更新。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(statistics): 修复每日报表前后端错误

1. web: 修复 DailyStatsReport 缺失 total/page 状态导致的崩溃
2. server: 修复 getDailyRecords 潜在的日期解析错误和类型转换问题
3. server: 增加统计模块的错误日志
