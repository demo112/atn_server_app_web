# ALIGNMENT - 属性测试实施 (Server & Web)

## 1. 项目上下文分析
- **项目结构**: Monorepo (pnpm workspace)
- **技术栈**: 
  - **Server**: Node.js, Express, TypeScript, Prisma, Vitest
  - **Web**: React, TypeScript, Vite, Ant Design, Zod, Vitest
- **当前状态**:
  - **Server**: 包含核心考勤计算、排班算法，逻辑复杂度高。依赖中已包含 `fast-check`，但缺乏系统性 PBT 覆盖。
  - **Web**: 涉及大量表单验证、数据转换、时区处理。现有测试主要为组件测试，缺失对极端输入的验证。
- **业务特点**: 
  - 考勤系统核心在于“时间”与“规则”，涉及大量时间段计算、状态流转、排班算法，天然适合属性测试（如验证时间不重叠、总时长守恒）。
  - Web 端输入校验（Schema）直接决定了脏数据是否会进入系统。

## 2. 属性测试需求理解
- **核心目标**: 构建端到端的属性测试防护网。
  - **Server**: 确保核心业务规则（Invariants）在任何边缘数据下不被破坏。
  - **Web**: 确保前端数据验证（Schema）的健壮性，防止异常数据导致 Crash。
- **痛点**:
  - 传统单元测试难以覆盖所有时间边界组合（如跨天、夏令时、极短/极长班次）。
  - 复杂的排班算法容易在边缘情况下出错。
  - Web 端表单验证逻辑随需求频繁变更，容易引入回归 Bug。
- **预期效果**:
  - 发现隐藏的边界 Bug。
  - 提高核心算法的健壮性。
  - 建立“生成器”库（Arbitraries），复用于各个层级的测试。

## 3. 智能决策与风险评估
- **工具选择**: `fast-check` (TypeScript 生态事实标准，已在 Server 端引入，需扩展至 Web)。
- **实施策略**: **分层渐进，Server 优先**。
  - **Phase 1 (Server Core)**: 覆盖最高风险的考勤计算与排班算法。
  - **Phase 2 (Web Schema)**: 利用 Zod Schema 自动生成测试数据，验证边界健壮性。
  - **Phase 3 (Business Logic)**: 覆盖 Server 端状态机（补卡、请假）与 Web 端复杂 Hooks。
- **潜在风险**:
  - **执行时间**: PBT 运行耗时。-> *对策: CI/Local 区分迭代次数 (1000 vs 100)*.
  - **学习曲线**: 团队需转变思维。-> *对策: 建立最佳实践文档与代码模板*.
  - **DOM 依赖**: Web 测试不稳定。-> *对策: 剥离逻辑到纯函数进行 PBT*.

## 4. 关键决策点 (已确认)
- **范围**: `packages/server` (全量核心逻辑) + `packages/web` (Utils & Schemas)。
- **工具**: 统一使用 `fast-check` + `vitest`。
- **集成**: 
  - Server: 集成到 `npm run test`。
  - Web: 集成到 `npm run test`。
  - CI: 配置独立的 PBT 检查步骤或参数。
