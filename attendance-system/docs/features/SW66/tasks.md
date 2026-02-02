# 任务拆分：SW66 补签处理

## Task 1: 定义补签相关类型 (Shared)
- **文件**: `packages/shared/src/types/attendance/correction.ts`
- **内容**: 定义 `CorrectionRequestDto`, `CorrectionVo` 等类型
- **验证**: `npm run build` in shared package
- **依赖**: 无
- **状态**: ✅ 已完成

## Task 2: 实现考勤计算逻辑 (Server)
- **文件**: `packages/server/src/modules/attendance/attendance-calculator.ts`
- **内容**: 实现 `calculateDuration`, `determineStatus` 等核心方法
- **验证**: 单元测试覆盖核心计算逻辑
- **依赖**: Task 1
- **状态**: ✅ 已完成

## Task 3: 实现补签服务层 (Server)
- **文件**: `packages/server/src/modules/attendance/attendance-correction.service.ts`
- **内容**: 实现 `applyCorrection`, `approveCorrection` 等业务逻辑
- **验证**: 单元测试 mock Prisma
- **依赖**: Task 2
- **状态**: ✅ 已完成

## Task 4: 实现补签控制器与路由 (Server)
- **文件**: 
  - `packages/server/src/modules/attendance/attendance-correction.controller.ts`
  - `packages/server/src/routes/attendance.routes.ts`
- **内容**: 暴露 API 接口
- **验证**: Postman / Curl 测试接口
- **依赖**: Task 3
- **状态**: ✅ 已完成

## Task 5: 封装补签 API (Web)
- **文件**: `packages/web/src/services/attendance.ts`
- **内容**: 封装 `applyCorrection`, `getDailyRecords` 等请求
- **验证**: 类型检查通过
- **依赖**: Task 1, Task 4
- **状态**: ✅ 已完成

## Task 6: 实现异常考勤列表页 (Web)
- **文件**: `packages/web/src/pages/attendance/correction/CorrectionPage.tsx`
- **内容**: 展示每日考勤记录，筛选异常状态
- **验证**: 页面渲染正常，数据加载正确
- **依赖**: Task 5
- **状态**: ✅ 已完成

## Task 7: 实现补签弹窗组件 (Web)
- **文件**: `packages/web/src/pages/attendance/correction/CorrectionDialog.tsx`
- **内容**: 表单输入补签时间与原因
- **验证**: 弹窗交互正常，提交成功
- **依赖**: Task 6
- **状态**: ✅ 已完成

## Task 8: 集成测试 (Server)
- **文件**: `packages/server/src/modules/attendance/__tests__/attendance-correction.integration.test.ts`
- **内容**: 测试完整补签流程
- **验证**: `npm test` 通过
- **依赖**: All above
- **状态**: ✅ 已完成
