# Design: App Leave Employee Selection

## 需求映射

| Story | 实现方式 |
|-------|---------|
| App端请假页面支持选择员工 | 修改 `LeaveScreen.tsx`，管理员可选择员工，非管理员默认当前用户 |

## 数据模型

无新增数据模型。复用现有的 `EmployeeVo`。

## API定义

复用现有 API：
- `GET /employees`: 获取员工列表
- `POST /leaves`: 创建请假（已支持 `employeeId` 参数）

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `packages/app/src/screens/attendance/LeaveScreen.tsx` | 修改 | 1. 引入 `useAuth`, `getEmployees`, `EmployeeVo`<br>2. 添加 `selectedEmployee` 状态<br>3. `useEffect` 中若为管理员则获取员工列表<br>4. 渲染员工选择器（仅管理员可见）<br>5. 提交时使用选中的 `employeeId` |

## 引用的已有代码

- `packages/app/src/utils/auth.ts`: `useAuth` 获取当前用户角色
- `packages/app/src/services/employee.ts`: `getEmployees` 获取员工数据
- `packages/shared/src/types/employee.ts`: `EmployeeVo` 类型

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 普通员工请假 | 保持不变（隐藏选择器，使用当前用户ID） | 低 |
| 管理员请假 | 变为必须选择员工（原为硬编码0，现需明确选择） | 低 |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 选择器UI | 使用 Modal + List | 简单直观，适合移动端，且员工数量可能较多，下拉框体验不佳 |
| 数据加载 | 进入页面时加载 | 简单实现，暂不需分页（假设员工数不多），若多则需加搜索 |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| 员工列表过长 | 加载慢，选择困难 | 暂时全量加载，后续可加搜索功能 |
