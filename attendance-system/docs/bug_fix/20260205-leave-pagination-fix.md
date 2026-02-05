# 请假管理分页功能修复记录

## 问题描述
- **现象**：请假管理页面无法选择分页大小，固定为 10 条/页。
- **复现步骤**：进入请假管理页面，底部只有上一页/下一页按钮。
- **影响范围**：`packages/web/src/pages/attendance/leave/LeavePage.tsx`

## 设计锚定
- **所属规格**：SW62 (Attendance Processing)
- **原设计意图**：应提供标准的分页功能，支持用户调整每页显示数量。
- **当前偏离**：UI 实现过于简单，缺失 pageSize 选择。

## 修复方案
- **修复思路**：引入通用的 `Pagination` 组件（复用 `shift` 模块的实现），替换原有的简单分页按钮。
- **改动文件**：
    - `packages/web/src/pages/attendance/leave/LeavePage.tsx`
    - `packages/web/src/pages/attendance/leave/components/Pagination.tsx` (新增)

## 验证结果
- [x] 原问题已解决：已添加分页组件，支持选择 10/20/50/100 条每页。
- [x] 回归测试通过：`tsc` 类型检查通过。
- [x] 数据验证：生成 60 条测试数据，验证分页逻辑。

## 文档同步
- [ ] design.md：无需更新 (UI 细节)。
- [ ] api-contract.md：无需更新。

## 技术债务
- `Pagination` 组件目前在 `shift` 和 `leave` 模块中存在重复，建议后续提取到 `common` 目录。

## 提交信息
fix(web): 修复请假管理页面缺失分页大小选择的问题
