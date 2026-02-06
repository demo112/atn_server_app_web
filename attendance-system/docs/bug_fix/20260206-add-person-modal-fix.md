# 20260206-add-person-modal-fix 修复记录

## 问题描述
- **现象**：
  1. 添加人员时，部门选择框允许手动选择，未按预期锁定为上层目录选中的部门。
  2. 添加人员失败，提示校验错误或无反应。
- **复现步骤**：
  1. 在人员管理页面选中某个部门。
  2. 点击"添加人员"按钮。
  3. 弹出的模态框中部门字段为空，且允许手动修改。
  4. 填写信息后点击保存，可能失败。
- **影响范围**：
  - 前端：`AddPersonModal` 组件及相关表单。

## 设计锚定
- **所属规格**：UA2 人员与部门管理
- **原设计意图**：
  - 根据 `docs/features/UA2/requirements.md` Story 2 AC1，部门为必填项。
  - 用户交互优化要求：当在部门树选中部门添加人员时，应默认选中该部门并锁定，减少误操作。
- **当前偏离**：
  - `AddPersonModal` 初始化时 `deptId` 为空字符串，导致后端 Zod 校验（期望正整数）失败。
  - 未接收 `defaultDeptId` 参数，导致无法继承上层部门信息。

## 根因分析
- **直接原因**：
  - `AddPersonModal.tsx` 中 `formData` 初始化状态 `deptId` 缺失，`department` 默认为空。
  - `BasicInfoForm.tsx` 缺乏锁定部门选择的功能支持。
  - 依赖缺失：`@headlessui/react` 未安装，导致组件渲染可能异常（虽然主要表现是逻辑错误）。
- **根本原因**：
  - 新组件 `AddPersonModal` 实现不完整，未对齐旧组件 `EmployeeModal` 的默认部门逻辑。

## 修复方案
- **修复思路**：
  1. 修改 `AddPersonModal` 接收 `defaultDeptId` 和 `defaultDeptName` props。
  2. 使用传入的 props 初始化表单数据。
  3. 修改 `BasicInfoForm` 支持 `isDeptLocked` 属性，当有默认部门时禁用选择。
  4. 补充缺失的依赖 `@headlessui/react`。
- **改动文件**：
  - `packages/web/src/pages/employee/components_new/AddPersonModal.tsx`
  - `packages/web/src/pages/employee/components_new/BasicInfoForm.tsx`
  - `packages/web/package.json` (依赖补充)

## 验证结果
- [x] 原问题已解决
  - 单元测试 `AddPersonModal.test.tsx` 通过：
    - `should initialize with default department if provided` ✅
    - `should validate required fields on save` ✅
- [x] 回归测试通过
  - `npm run type-check` 通过。
- [x] 设计一致性确认
  - 符合 UA2 必填要求及用户交互预期。

## 文档同步
- [ ] design.md：无需更新（纯 UI/UX 逻辑修复）。
- [ ] api-contract.md：无需更新。

## 提交信息
fix(web): 修复添加人员模态框部门选择逻辑及校验问题
