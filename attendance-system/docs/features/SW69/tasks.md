# Tasks: SW69 原始考勤/打卡

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 8 |
| 涉及模块 | attendance |
| 涉及端 | Server, Web, App |
| 预计总时间 | 120 分钟 |

## 任务清单

### 阶段1：Server端 (已完成)

#### Task 1: 更新数据模型 (Schema) ✅
- **文件**: `packages/server/prisma/schema.prisma`
- **状态**: 已完成

#### Task 2: 实现Service与DTO ✅
- **文件**: `packages/server/src/modules/attendance/attendance-clock.dto.ts`<br>`packages/server/src/modules/attendance/attendance-clock.service.ts`
- **状态**: 已完成

#### Task 3: 实现Controller与路由 ✅
- **文件**: `packages/server/src/modules/attendance/attendance-clock.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts`
- **状态**: 已完成

### 阶段2：App端实现 (已完成)

#### Task 4: 打卡服务与状态管理 ✅
- **文件**: 
  - `packages/app/src/services/attendance.ts` (API调用)
- **状态**: 已完成
- **内容**: 
  - 实现 `clockIn`, `getRecords` API调用封装
- **验证**: 单元测试或Log验证

#### Task 5: 打卡界面 (ClockInScreen) ✅
- **文件**: `packages/app/src/screens/attendance/ClockInScreen.tsx`
- **状态**: 已完成
- **内容**:
  - 大按钮 (上班/下班)
  - 当前时间动态显示
  - 今日打卡记录列表
  - 定位/设备信息获取 (Mock)
- **验证**: 模拟器中能点击打卡并看到记录刷新

### 阶段3：Web端实现 (已完成)

#### Task 6: 考勤记录查询页 ✅
- **文件**: `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx`
- **状态**: 已完成
- **内容**:
  - 筛选栏 (时间范围, 员工, 部门)
  - 数据表格 (展示原始打卡数据)
  - 导出按钮 (Mock)
- **验证**: 能查询到App打的数据

#### Task 7: 管理员补录功能 ✅
- **文件**: `packages/web/src/pages/attendance/clock/ClockRecordPage.tsx` (集成在Page中)
- **状态**: 已完成
- **内容**:
  - 选择员工、日期、时间、类型
  - 调用打卡接口 (source=Web)
- **验证**: 补录成功，列表中source显示正确

### 阶段4：交付与文档

#### Task 8: 最终验收
- **文件**: `docs/features/SW69/verification.md`
- **内容**: 端到端测试 (App打卡 -> Web查询)
