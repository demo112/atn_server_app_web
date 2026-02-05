# Tasks: 菜单重构

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 1 |
| 涉及模块 | web |
| 涉及端 | Web |
| 预计总时间 | 10 分钟 |

## 任务清单

### 阶段1：前端实现

#### Task 1: 更新侧边栏菜单结构

| 属性 | 值 |
|------|-----|
| 文件 | `packages/web/src/components/layout/Sidebar.tsx` |
| 操作 | 修改 |
| 内容 | 按照 Design 文档更新 `menuItems` 数组 |
| 验证 | 命令: `npm run build --filter @attendance/web` |
|      | 预期: 编译成功，无类型错误 |
| 预计 | 10 分钟 |
| 依赖 | 无 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 任务完成后 | 本地运行验证 -> git commit |
