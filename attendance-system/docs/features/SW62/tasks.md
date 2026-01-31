# 任务拆分：SW62 考勤制度

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 4 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 45 分钟 |

## 任务清单

### 阶段1：类型定义

#### Task 1: 定义考勤设置DTO
- **文件**: `packages/server/src/modules/attendance/attendance-settings.dto.ts`
- **内容**: 定义 `GetSettingsResponse` 和 `UpdateSettingsDto`
- **验证**: `npx tsc --noEmit`
- **依赖**: 无

### 阶段2：业务逻辑

#### Task 2: 实现考勤设置Service
- **文件**: `packages/server/src/modules/attendance/attendance-settings.service.ts`
- **内容**: 实现 `initDefaults`, `getSettings`, `updateSettings`
- **验证**: 编写单元测试或 `npx ts-node packages/server/src/modules/attendance/attendance-settings.service.ts` (临时验证)
- **依赖**: Task 1

### 阶段3：接口实现

#### Task 3: 实现考勤设置Controller
- **文件**: `packages/server/src/modules/attendance/attendance-settings.controller.ts`
- **内容**: 实现 `getSettings`, `updateSettings` 接口方法
- **验证**: 无（需配合路由验证）
- **依赖**: Task 2

### 阶段4：路由配置

#### Task 4: 配置考勤模块路由
- **文件**:
    - `packages/server/src/modules/attendance/attendance.routes.ts` (新增)
    - `packages/server/src/modules/attendance/index.ts` (修改)
- **内容**:
    - 创建路由文件，注册 `/settings` 路由
    - 在 index.ts 中导出路由
- **验证**: `curl http://localhost:3000/api/v1/attendance/settings`
- **依赖**: Task 3
