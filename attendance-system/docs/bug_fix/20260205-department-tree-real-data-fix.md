# 排班管理部门树真实数据修复记录

## 问题描述
- **现象**：排班管理页面的部门树使用硬编码的 Mock 数据，无法显示系统中的真实部门。
- **复现步骤**：打开排班管理页面，左侧部门树内容固定，不随系统数据变化。
- **影响范围**：排班管理页面、补签管理页面（使用了同一组件）。

## 设计锚定
- **所属规格**：SW65 (排班管理)
- **原设计意图**：应通过 `GET /api/v1/departments/tree` 获取部门树数据。
- **当前偏离**：前端组件 `DepartmentTree` 使用了静态硬编码数据。

## 根因分析
- **直接原因**：`DepartmentTree.tsx` 组件开发时未对接 API。
- **根本原因**：早期开发为了快速展示 UI 使用了 Mock 数据，后期未及时替换。
- **相关代码**：`packages/web/src/components/common/DepartmentTree.tsx`

## 修复方案
- **修复思路**：重构 `DepartmentTree` 组件，使用 `departmentService.getTree()` 获取数据，并增加 `selectedId` 属性支持选中高亮。
- **改动文件**：
  - `packages/web/src/components/common/DepartmentTree.tsx`
  - `packages/web/src/pages/attendance/schedule/SchedulePage.tsx`
  - `packages/web/src/pages/attendance/correction/CorrectionPage.tsx`

## 验证结果
- [x] 原问题已解决：代码已改为异步加载真实数据。
- [x] 回归测试通过：`npm run build` 通过。
- [x] 设计一致性确认：符合 API 设计。

## 文档同步
- [ ] design.md：无需更新（设计本身正确）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 排班管理部门树改用真实数据

背景: 排班页面部门树此前为Mock数据
变更: 重构DepartmentTree对接真实API，支持选中高亮
影响: 排班管理、补签管理页面的部门树将显示真实数据
