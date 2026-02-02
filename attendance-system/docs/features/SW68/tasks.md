# Tasks: SW68 补签记录

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 5 |
| 涉及模块 | attendance |
| 涉及端 | Server |
| 预计总时间 | 60 分钟 |
| 状态 | ✅ 已完成 |

## 任务清单

### 阶段1：数据与类型

#### Task 1: 更新数据模型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/prisma/schema.prisma` |
| 操作 | 修改 |
| 内容 | `AttCorrection` 表增加 `updatedAt` 字段 |
| 验证 | `npx prisma migrate dev --name add_correction_updated_at` |
| 预计 | 5 分钟 |
| 依赖 | 无 |
| 状态 | ✅ 完成 |

#### Task 2: 定义共享类型

| 属性 | 值 |
|------|-----|
| 文件 | `packages/shared/src/types/attendance/correction.ts` |
| 操作 | 修改 |
| 内容 | 增加 `QueryCorrectionsDto`, `UpdateCorrectionDto`, `CorrectionVo` 等类型定义 |
| 验证 | `npm run type-check` |
| 预计 | 5 分钟 |
| 依赖 | Task 1 |
| 状态 | ✅ 完成 |

### 阶段2：核心逻辑重构

#### Task 3: 实现考勤重算核心逻辑

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-correction.service.ts` |
| 操作 | 修改 |
| 内容 | 1. 提取 `recalculateDailyRecord` 私有方法<br>2. 重构 `checkIn` / `checkOut` 方法使用该核心逻辑 |
| 验证 | `npm test packages/server/src/modules/attendance/__tests__/attendance-correction.integration.test.ts` |
| 预计 | 20 分钟 |
| 依赖 | Task 2 |
| 状态 | ✅ 完成 |

### 阶段3：业务功能实现

#### Task 4: 实现补签管理服务

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-correction.service.ts` |
| 操作 | 修改 |
| 内容 | 实现 `getCorrections`, `updateCorrection`, `deleteCorrection` 方法 |
| 验证 | `npm test packages/server/src/modules/attendance/__tests__/attendance-correction.integration.test.ts` (需新增测试用例) |
| 预计 | 15 分钟 |
| 依赖 | Task 3 |
| 状态 | ✅ 完成 |

#### Task 5: 实现补签管理接口

| 属性 | 值 |
|------|-----|
| 文件 | `packages/server/src/modules/attendance/attendance-correction.controller.ts`<br>`packages/server/src/modules/attendance/attendance.routes.ts` |
| 操作 | 修改 |
| 内容 | 实现 Controller 方法并注册路由 |
| 验证 | 启动服务，使用 curl 或 Postman 验证接口 |
| 预计 | 15 分钟 |
| 依赖 | Task 4 |
| 状态 | ✅ 完成 |

### 阶段4：Web/App端实现

#### Task 6: Web 端补签管理页
- **文件**: `packages/web/src/pages/attendance/correction/CorrectionPage.tsx`
- **状态**: ✅ 已完成
- **内容**: 
  - 补签申请列表查询
  - 补签申请表单（支持为员工补签）
  - 补签记录展示与状态管理

#### Task 7: App 端补签申请页
- **文件**: `packages/app/src/screens/attendance/CorrectionScreen.tsx`
- **状态**: ✅ 已完成
- **内容**: 
  - 补签申请表单（选择日期、时间、类型）
  - 历史补签记录查询

## 检查点策略

| 时机 | 操作 | 结果 |
|------|------|------|
| Task 3 完成后 | 必须确保现有集成测试通过，保证重构不破坏原有逻辑 | ✅ Pass |
| Task 5 完成后 | 执行完整 API 测试，验证编辑/删除后的考勤重算效果 | ✅ Pass |

## 风险提醒

| 任务 | 风险 | 应对 |
|------|------|------|
| Task 3 | 重算逻辑复杂，可能导致状态计算错误 | 仔细核对 `recalculate` 中的时间取值逻辑，优先取补签时间 (已验证) |
| Task 4 | 删除补签后的回滚逻辑 | 确保删除后若无原始打卡，状态能正确回滚为缺勤 (已验证) |
