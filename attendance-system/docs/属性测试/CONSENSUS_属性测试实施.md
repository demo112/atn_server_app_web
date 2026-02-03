# CONSENSUS - 属性测试实施

## 1. 实施目标
- **核心目标**: 实现 Server 端业务逻辑的属性测试全覆盖。
- **验收标准**:
  - 所有 Service 层核心方法均有对应的 PBT 用例。
  - 关键算法（考勤计算、排班）必须验证核心不变量（如：时间段不重叠、总时长守恒）。
  - CI 流水线包含属性测试步骤。

## 2. 技术方案
- **测试框架**: Vitest
- **属性测试库**: fast-check
- **文件命名**: `*.pbt.test.ts` (Property-Based Test) 或集成在现有的 `*.test.ts` 中（推荐使用独立文件以区分长运行测试）。
- **运行配置**: 
  - 本地开发: 默认运行 100 次迭代。
  - CI 环境: 运行 1000+ 次迭代以深度扫描。

## 3. 渐进式实施策略 (4 Phases)

### Phase 1: Core Domain (核心域)
- **目标**: 覆盖最复杂的算法逻辑。
- **模块**: 
  - `attendance/domain` (考勤计算器)
  - `attendance/schedule` (排班服务)
  - `attendance/time-period` (时间段处理)
- **价值**: 收益最高，最容易发现深层 Bug。

### Phase 2: Business Logic (业务逻辑)
- **目标**: 覆盖状态流转和业务规则。
- **模块**:
  - `attendance/attendance-correction` (补卡)
  - `attendance/leave` (请假)
  - `attendance/attendance-shift` (班次)
- **重点**: 状态机属性、权限约束。

### Phase 3: Data Management (数据管理)
- **目标**: 覆盖 CRUD 和基础关联。
- **模块**:
  - `user` (用户)
  - `employee` (员工)
  - `department` (部门)
- **重点**: 数据完整性、关联关系约束。

### Phase 4: Utilities & Common (工具与公共)
- **目标**: 覆盖底层工具函数。
- **模块**:
  - `common/utils`
  - `shared/utils` (如果适用)
- **重点**: 输入宽容度、异常处理。

## 4. 团队协作与培训
- **知识库**: 建立 `docs/属性测试/KNOWLEDGE_BASE.md`，记录常见 Property 模式。
- **Code Review**: PBT 代码必须经过资深人员 Review，确保 Property 定义的正确性（避免 tautology）。

## 5. 风险缓解
- **超时问题**: 将 PBT 标记为耗时测试，在 commit hook 中仅运行少量迭代，在 nightly build 中运行全量。
- **Flaky Tests**: 固定 Seed，确保失败可重现。
