# 修复前端崩溃、404 错误及废弃警告

根据日志分析，`TimePeriodPage` 的崩溃是因为前端未能正确解析 API 响应结构。404 错误是由于前端请求的 API 路径与后端定义不匹配。同时还有一些 Ant Design 的废弃属性警告需要修复。

## 1. 修复 `TimePeriodPage` 崩溃问题
- **文件**: `packages/web/src/services/time-period.ts`
- **问题**: `getTimePeriods` 返回了完整的 API 响应对象（如 `{ success: true, data: [...] }`），但组件 `TimePeriodPage` 预期直接接收数据数组 `[...]`，导致调用 `map` 方法时崩溃。
- **修复**: 修改 `getTimePeriods` 及相关方法，使其返回 `response.data`，正确解包数据。

## 2. 修复统计页面 404 错误
- **文件**: `packages/web/src/api/statistics.ts`
- **问题**: 请求路径 `/statistics/dept-stats` 和 `/statistics/chart-stats` 在后端不存在。
- **修复**: 将路径修正为 `/statistics/departments` 和 `/statistics/charts`，以匹配 `statistics.routes.ts` 中的定义。

## 3. 修复 Ant Design 废弃警告
- **文件**: `packages/web/src/pages/statistics/ReportPage.tsx`
  - 将 `<Card>` 组件的 `bordered={false}` 替换为 `variant="borderless"`。
- **文件**: `DepartmentForm.tsx`, `EmployeeModal.tsx`, `BindUserModal.tsx`
  - 将 `<Modal>` 组件的 `destroyOnClose` 替换为 `destroyOnHidden`。

## 4. 验证
- 在 `packages/web` 目录下运行 `npm run build`，确保代码编译通过且无类型错误。
- (注：日志中的 500 服务器错误可能与数据库环境有关，但上述修复将解决前端的代码逻辑错误和崩溃问题)。
