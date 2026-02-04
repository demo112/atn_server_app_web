# TODO - 属性测试实施待办 (Integrated)

## 1. 待办事项 (Backlog)

### 🔴 High Priority (Server Core)
- [ ] **T1 基础设施**: 安装 `fast-check`，配置 Vitest。
- [ ] **T2 核心生成器**: 实现 `TimePeriod`, `Shift`, `AttendanceRecord` 的 Arbitraries。
- [ ] **T4 核心算法**: 覆盖 `AttendanceCalculator` 的时长计算逻辑。

### 🟡 Medium Priority (Web & Business)
- [ ] **T3 Web Schema**: 对 `packages/web/src/schemas` 进行 Fuzzing 测试。
- [ ] **T5 业务逻辑**: 覆盖补卡 (`CorrectionService`) 和请假 (`LeaveService`) 状态机。
- [ ] **T7 CI集成**: 配置 GitHub Actions 运行 PBT。

### 🟢 Low Priority (Expansion)
- [ ] **T6 Web Utils**: 覆盖纯函数工具。
- [ ] **T8 文档**: 编写详细的教程和 Case Study。

## 2. 配置指引

### 如何运行 PBT?
```bash
# 运行所有 PBT
npm run test:pbt

# 运行特定文件
npx vitest run my-service.pbt.test.ts
```

### 环境变量
```bash
# 增加强度
FC_NUM_RUNS=1000 npm run test:pbt
```
