# 员工管理引用错误修复记录

## 问题描述
- **现象**：Web 启动报错 `[plugin:vite:import-analysis] Failed to resolve import "./pages/employee/EmployeeManagement" from "src/App.tsx"`.
- **复现步骤**：启动 Web 服务 (`npm run dev`)。
- **影响范围**：Web 应用无法加载，页面白屏。

## 设计锚定
- **所属规格**：UA2 (人员与部门管理)
- **原设计意图**：根据 `docs/features/UA2/requirements.md` 和设计文档，员工列表页面组件应为 `EmployeeList`。
- **当前偏离**：`App.tsx` 引用了不存在的 `EmployeeManagement` 组件。

## 根因分析
- **直接原因**：`src/App.tsx` 中导入路径指向不存在的文件。
- **根本原因**：组件重命名或重构后，未更新入口文件的引用。
- **相关代码**：`packages/web/src/App.tsx:24`

## 修复方案
- **修复思路**：修正导入路径，指向实际存在的 `EmployeeList.tsx`。
- **改动文件**：`packages/web/src/App.tsx`

## 验证结果
- [x] 原问题已解决：Web 服务启动无报错。
- [x] 回归测试通过：`npm run build` 通过。
- [x] 设计一致性确认：代码与设计文档一致。

## 文档同步
- [ ] design.md：无需更新 (设计文档已正确)
- [ ] api-contract.md：无需更新

## 提交信息
fix(web): 修复 EmployeeManagement 引用错误
