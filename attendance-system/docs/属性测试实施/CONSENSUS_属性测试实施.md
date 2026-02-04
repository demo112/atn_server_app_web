# CONSENSUS - 属性测试实施 (Server & Web)

## 1. 实施目标与验收标准
- **核心目标**: 建立全栈属性测试能力，Server 端保障逻辑正确性，Web 端保障输入健壮性。
- **验收标准**:
  - **Server**: 核心 Service (考勤、排班) 关键算法实现 PBT 覆盖，验证业务不变量。
  - **Web**: 引入 `fast-check`，对核心 Utils 和 Zod Schemas 进行 Fuzzing 测试。
  - **Shared**: 建立可复用的生成器库 (`arbitraries`)。
  - **CI**: 流水线包含 PBT 步骤，并能正确报告失败 Seed。

## 2. 技术方案
- **测试框架**: Vitest (统一)
- **属性测试库**: fast-check
- **文件命名**: 
  - 推荐: `*.pbt.test.ts` (独立文件，便于区分和单独运行)
  - 允许: `*.test.ts` (简单的 PBT 可与单元测试共存)
- **运行配置**:
  - **Local**: `numRuns: 100` (快速反馈)
  - **CI**: `numRuns: 1000+` (深度扫描，Nightly Build 可更高)

## 3. 渐进式实施策略 (4 Phases)

### Phase 1: Server Core Domain (核心域 - P0)
- **目标**: 覆盖最复杂的算法逻辑，建立生成器基础。
- **模块**: 
  - `server/src/modules/attendance/domain` (考勤计算)
  - `shared/src/test/arbitraries` (基础生成器)
- **价值**: 收益最高，解决核心痛点。

### Phase 2: Web Foundation & Schemas (Web 基础 - P1)
- **目标**: 建立 Web 端 PBT 环境，验证输入契约。
- **模块**:
  - `web/src/schemas` (Zod Schema Fuzzing)
  - `web/src/utils` (纯函数)
- **价值**: 拦截异常数据，提升前端稳定性。

### Phase 3: Server Business Logic (业务逻辑 - P1)
- **目标**: 覆盖状态流转和权限约束。
- **模块**:
  - `server/src/modules/attendance/correction` (补卡)
  - `server/src/modules/attendance/leave` (请假)
- **重点**: 状态机属性、权限模型。

### Phase 4: Expansion (扩展与推广 - P2)
- **目标**: 推广至 App 端，完善文档与培训。
- **模块**:
  - `packages/app` (App 端适配)
  - 团队培训与 Code Review 规范固化。

## 4. 风险缓解
- **超时问题**: 将 PBT 标记为耗时测试，避免阻塞日常开发。
- **Flaky Tests**: 强制要求 CI 失败时打印 Seed，本地通过 Seed 复现。
- **学习成本**: 提供 "PBT vs Example-based" 对比示例库。
