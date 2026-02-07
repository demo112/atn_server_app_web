# 补签记录筛选失效与重置问题修复记录

## 问题描述
- **现象**：
  1. **处理类型筛选失效**：在补签记录页面选择“补签到”或“补签退”后，列表数据未发生变化，仍显示所有类型的记录。
  2. **重置功能不全**：点击“重置”按钮后，筛选条件中的“人员选择”未清空，导致后续查询条件不准确。

- **复现步骤**：
  1. 进入考勤管理 -> 补签记录。
  2. 在“处理类型”下拉框选择“补签到”，观察列表（Bug：列表未过滤）。
  3. 在“人员/部门”选择器中选择一个员工。
  4. 点击“重置”按钮。
  5. 观察人员选择器（Bug：仍显示已选员工）和列表数据。

- **影响范围**：
  - 补签记录查询功能（Web端）。

## 设计锚定
- **所属规格**：SW68 (补签管理)
- **原设计意图**：根据 `docs/features/SW68/design.md`，补签记录查询应支持按部门、员工、时间范围和处理类型进行筛选。
- **当前偏离**：
  1. API 契约（`QueryCorrectionsDto`）在实现层面缺失 `type` 字段定义。
  2. 前端代码因 API 不支持而暂时注释了 `type` 参数传递。
  3. 后端 Service 层未实现 `type` 字段的 SQL 过滤逻辑。

## 根因分析
- **直接原因**：
  1. 前端 `CorrectionView.tsx` 中 `loadData` 函数构建参数时，`type` 字段被注释：`// type: type || undefined`。
  2. 重置按钮 `onClick` 事件中，缺少 `setSelectedItems([])` 调用。
  3. 后端 `AttendanceCorrectionService` 未接收并处理 `type` 参数。
- **根本原因**：
  - 前后端开发期间对 API 契约的同步不及时，导致前端为跑通代码暂时屏蔽了未实现的字段，后续未补全。

## 修复方案
- **修复思路**：
  1. **补全契约**：在 `design.md` 和 Shared DTO 中补全 `type` 字段定义。
  2. **后端实现**：更新 Service 层，支持 `type` 过滤，并优化 `employeeId` 支持多选（逗号分隔）。
  3. **前端对接**：解除 `type` 参数注释，完善重置按钮逻辑。

- **改动文件**：
  - `docs/features/SW68/design.md`
  - `packages/shared/src/types/attendance/correction.ts`
  - `packages/server/src/modules/attendance/attendance-correction.service.ts`
  - `packages/web/src/pages/attendance/correction/components/CorrectionView.tsx`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| CorrectionView | packages/web/src/pages/attendance/correction/components/CorrectionView.tsx | ✅ |
| QueryCorrectionsDto | packages/shared/src/types/attendance/correction.ts | ✅ |

## 验证结果
- [x] **处理类型筛选**：代码已更新，API 参数包含 `type`，后端已增加 `where.type = type` 逻辑。
- [x] **重置功能**：代码已增加 `setSelectedItems([])`，配合 `useEffect` 依赖变更可自动触发重置查询。
- [x] **编译验证**：`npm run build` (shared/server/web) 全部通过。
- [x] **设计一致性**：已同步更新 `design.md`。

## 文档同步
- [x] design.md：已更新 `QueryCorrectionsDto` 定义。
- [ ] api-contract.md：无需更新（API 路径未变，仅 DTO 字段增强）。

## 防回退标记
**关键词**：补签记录、筛选、重置、QueryCorrectionsDto
**设计决策**：统一在 Shared DTO 中管理前后端类型，确保 API 定义一致性。

## 提交信息
fix(attendance): 修复补签记录类型筛选失效及重置问题
