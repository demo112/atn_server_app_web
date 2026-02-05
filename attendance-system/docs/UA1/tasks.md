# Tasks: App Leave Employee Selection

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 1 |
| 涉及模块 | attendance |
| 涉及端 | App |
| 预计总时间 | 30 分钟 |

## 任务清单

### 阶段1：前端开发

#### Task 1: 实现员工选择并更新测试

| 属性 | 值 |
|------|-----|
| 文件 | `packages/app/src/screens/attendance/LeaveScreen.tsx` (修改)<br>`packages/app/src/screens/attendance/LeaveScreen.test.tsx` (修改) |
| 操作 | 修改 |
| 内容 | 1. 在 `LeaveScreen` 中引入 `useAuth` 和 `getEmployees`<br>2. 根据管理员权限加载并显示员工选择器<br>3. 更新 `handleSubmit` 使用选中的员工ID<br>4. 更新测试文件，Mock `useAuth` 和 `getEmployees`，验证新逻辑 |
| 验证 | 命令: `npm test -- LeaveScreen` |
|      | 预期: 所有测试通过，退出码 0 |
| 预计 | 30 分钟 |
| 依赖 | 无 |

## 检查点策略

| 时机 | 操作 |
|------|------|
| 任务完成后 | 运行测试 → git commit |
