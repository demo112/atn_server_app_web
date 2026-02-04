# Tasks: 班次管理 (SW64)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | attendance (app) |
| 涉及端 | App |
| 预计总时间 | 40 分钟 |

## 任务清单

### 阶段1：依赖与基础

#### Task 1: 安装依赖与类型定义

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/package.json`, `packages/app/src/types/shift.ts` |
| 操作 | 修改 |
| 内容 | 1. 安装 `@google/genai` (若不兼容则回退到 `fetch` 方案)。<br>2. 确保 `Shift` 接口定义正确。 |
| 验证 | `npm install` 无报错, `tsc` 类型检查通过 |
| 预计 | 5 分钟 |
| 依赖 | 无 |

### 阶段2：组件实现

#### Task 2: 实现 AddShiftModal 组件

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/components/shift/AddShiftModal.tsx` |
| 操作 | 新增 |
| 内容 | 1. 仿制 `incoming` 的 Modal UI。<br>2. 实现 AI 智能建议逻辑。<br>3. 处理 API Key 环境变量。 |
| 验证 | 单元测试或集成到 Screen 后手动验证 |
| 预计 | 20 分钟 |
| 依赖 | Task 1 |

### 阶段3：页面集成

#### Task 3: 改造 ShiftListScreen

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/shift/ShiftListScreen.tsx` |
| 操作 | 修改 |
| 内容 | 1. 引入 `AddShiftModal`。<br>2. 修改添加按钮点击事件。<br>3. 确保搜索功能正常。<br>4. 更新 UI 样式匹配 `incoming`。 |
| 验证 | 启动 App，完整测试添加流程 |
| 预计 | 15 分钟 |
| 依赖 | Task 2 |

### 阶段4：验证与交付

#### Task 4: 完整验证与文档同步

| 属性 | 值 |
|------|-----|
| 文件 | 无 |
| 操作 | 验证 |
| 内容 | 1. 手动验证所有 AC。<br>2. 运行 Lint。<br>3. 同步文档。 |
| 验证 | 功能符合预期 |
| 预计 | 5 分钟 |
| 依赖 | Task 3 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 2 | `@google/genai` 在 RN 中可能不兼容 | 准备好使用 `fetch` 直接调用 REST API 的备选方案 |
