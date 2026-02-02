# SW67 - 任务拆分

## 任务列表

| ID | 任务 | 负责人 | 状态 |
|----|------|--------|------|
| SW67-01 | 请假模块 DTO 与 Service 实现 | naruto | ✅ |
| SW67-02 | 请假模块 Controller 与 API 实现 | naruto | ✅ |
| SW67-03 | Web 端请假 API Service 封装 | naruto | ✅ |
| SW67-04 | Web 端请假管理页面开发 (列表+增删改) | naruto | ✅ |
| SW67-05 | 考勤计算逻辑集成请假数据 | naruto | ✅ |

状态：⬜ 待开始 | 🔄 进行中 | ✅ 已完成

## 详细任务描述

### SW67-01: 请假模块 DTO 与 Service 实现
- **文件**: 
  - `packages/server/src/modules/attendance/leave.dto.ts`
  - `packages/server/src/modules/attendance/leave.service.ts`
- **内容**: 
  - 定义 Create/Update/Query DTO，包含验证规则。
  - 实现 CRUD 逻辑：
    - `create`: 检查时间重叠，默认状态 approved，记录操作人。
    - `update`: 检查时间重叠。
    - `delete`: 物理删除或软删除（视项目约定，暂定物理删除）。
    - `findAll`: 支持多条件筛选。
- **验证**: 编写单元测试验证时间重叠校验逻辑。

### SW67-02: 请假模块 Controller 与 API 实现
- **文件**: 
  - `packages/server/src/modules/attendance/leave.controller.ts`
  - `packages/server/src/routes/index.ts` (或 attendance.routes.ts)
- **内容**: 
  - 实现 RESTful 接口。
  - 注册路由 `/api/v1/leaves`。
- **验证**: 使用 Postman 或测试脚本验证 API。

### SW67-03: Web 端请假 API Service 封装
- **文件**: `packages/web/src/services/attendance/leave.ts`
- **内容**: 封装 axios 请求，定义 TypeScript 类型。
- **验证**: 类型检查通过。

### SW67-04: Web 端请假管理页面开发
- **文件**: 
  - `packages/web/src/pages/attendance/leave/LeavePage.tsx`
  - `packages/web/src/pages/attendance/leave/components/LeaveFormModal.tsx`
- **内容**: 
  - 左侧复用部门树组件。
  - 右侧表格展示请假记录。
  - 弹窗表单实现新增/编辑。
- **验证**: 页面交互正常，数据能正确保存和回显。

### SW67-05: 考勤计算逻辑集成请假数据
- **文件**: `packages/server/src/modules/attendance/services/attendance-calculator.ts` (假设存在)
- **内容**: 
  - 修改 `calculateDaily` 方法。
  - 查询当天的请假记录。
  - 根据请假类型和时间调整 `AttendanceStatus` 和各项时长统计。
- **验证**: 编写集成测试，模拟请假场景下的考勤计算结果。

## 完成标准 (DoD)

每个任务完成前必须确认：

### 代码层面
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] 无 `console.log`（使用 `logger`）
- [ ] 无 `throw new Error()`（使用 `AppError`）

### 文档层面
- [ ] `npm run lint:docs` 通过
- [ ] design.md 已同步
- [ ] api-contract.md 已同步（如有 API 变更）

### 验证层面
- [ ] 四维验证 ≥ 80 分
