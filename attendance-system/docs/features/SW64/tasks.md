# Tasks: 班次管理 (SW64)

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 6 |
| 涉及模块 | attendance |
| 涉及端 | Server, Web |
| 预计总时间 | 90 分钟 |

## 任务清单

### 阶段1：数据层 (已完成)

#### Task 1: 验证数据模型 ✅
- **文件**: `packages/server/prisma/schema.prisma`
- **状态**: 已完成

### 阶段2：服务层 (已完成)

#### Task 2: 实现Service与DTO ✅
- **文件**: `packages/server/src/modules/attendance/attendance-shift.dto.ts`<br>`packages/server/src/modules/attendance/attendance-shift.service.ts`
- **状态**: 已完成

### 阶段3：接口层 (已完成)

#### Task 3: 实现Controller与路由 ✅
- **文件**: `packages/server/src/modules/attendance/attendance-shift.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts`
- **状态**: 已完成

### 阶段4：Web端实现 (已完成)

#### Task 4: 班次列表页 ✅
- **文件**: `packages/web/src/pages/attendance/shift/ShiftPage.tsx`
- **状态**: 已完成
- **内容**: 
  - 创建 `ShiftPage` 组件
  - 调用 `GET /api/v1/attendance/shifts` 获取列表
  - 展示班次表格 (ID, 名称, 创建时间, 操作)
  - 实现删除功能
- **验证**: 页面正常显示列表，删除有效
- **依赖**: Task 3

#### Task 5: 班次创建/编辑弹窗 ✅
- **文件**: `packages/web/src/pages/attendance/shift/ShiftPage.tsx` (集成在Page中)
- **状态**: 已完成
- **内容**:
  - 创建表单：班次名称
  - 周期配置：周一到周日
  - 每天支持添加/移除时间段 (下拉选择 TimePeriod)
  - 调用 `GET /api/v1/attendance/time-periods` 获取选项
  - 调用 `POST/PUT` 接口保存
- **验证**: 能创建包含复杂时间段组合的班次
- **依赖**: Task 4, SW63(TimePeriod API)

### 阶段5：验证与交付

#### Task 6: 集成验证与文档同步
- **文件**: `docs/api-contract.md`<br>`docs/changelog.md`
- **操作**: 修改
- **内容**: 更新API文档，记录变更，执行手动测试
- **验证**: 手动调用API验证功能
- **预计**: 10 分钟
- **依赖**: Task 5

## 检查点策略

| 时机 | 操作 |
|------|------|
| 每个任务完成后 | 验证 → git commit |
| 全部完成后 | 集成测试 → git push |
