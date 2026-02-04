# DESIGN - 属性测试实施架构

## 1. 总体架构

属性测试将横跨 Server、Web 和 Shared 包，形成统一的质量保障层。

```mermaid
graph TD
    subgraph Shared [Packages/Shared]
        Arb[Arbitraries (Generators)]
        Types[Domain Types]
    end

    subgraph Server [Packages/Server]
        S_Domain[Domain Logic]
        S_PBT[Server PBT (*.pbt.test.ts)]
        S_PBT -->|Use| Arb
        S_PBT -->|Test| S_Domain
    end

    subgraph Web [Packages/Web]
        W_Schema[Zod Schemas]
        W_Utils[Utils/Hooks]
        W_PBT[Web PBT (*.property.test.ts)]
        W_PBT -->|Use| Arb
        W_PBT -->|Test| W_Schema
        W_PBT -->|Test| W_Utils
    end

    CI[CI Pipeline] -->|Run| S_PBT
    CI -->|Run| W_PBT
```

## 2. 详细设计

### 2.1 目录与文件结构

#### Server 端
```
packages/server/src/
├── modules/attendance/domain/
│   ├── attendance-calculator.ts       # 源码
│   └── attendance-calculator.pbt.test.ts # 属性测试
└── common/test/arbitraries/           # Server 特有生成器
    └── shift.arb.ts
```

#### Web 端
```
packages/web/src/
├── schemas/
│   ├── attendance.ts
│   └── __tests__/
│       └── attendance.property.test.ts # Schema Fuzzing
└── utils/
    └── date-helper.property.test.ts
```

#### Shared (公共生成器)
```
packages/shared/src/test/arbitraries/
├── time-period.arb.ts  # 通用时间段生成器
├── user.arb.ts         # 通用用户数据生成器
└── date.arb.ts         # 日期生成器
```

### 2.2 核心组件：生成器 (Arbitraries)

为了最大化复用，采用分层生成器策略：

- **L0 基础层 (Shared)**: Email, Phone, DateRange, ID 等通用类型。
- **L1 领域层 (Server/Shared)**: 
  - `TimePeriod`: 保证 `start < end`。
  - `Shift`: 包含合法休息时间的班次。
  - `AttendanceRecord`: 合法的打卡流水。
- **L2 业务层 (Web/Server)**: 
  - `UserWithRole`: 带权限的用户。
  - `ValidForm`: 符合 Zod Schema 的表单数据。

### 2.3 测试策略

#### Server 策略
- **核心算法**: 验证数学性质（结合律、单调性、守恒性）。
- **状态机**: 使用 `fast-check` 的 `Model Based Testing` 功能验证复杂状态流转（如请假审批流）。

#### Web 策略
- **Schema Fuzzing**: 
  - 生成大量随机 JSON 对象传给 `ZodSchema.safeParse`。
  - 验证：对于非法数据是否总是返回 `success: false` 而非抛出异常。
  - 验证：对于合法生成器生成的数据，是否总是返回 `success: true`。
- **Utils**: 验证往返性 (Round-trip)，如 `decode(encode(x)) === x`。

### 2.4 CI/CD 集成
- **环境变量控制**:
  - `FC_NUM_RUNS`: 控制迭代次数。
  - `FC_SEED`: 允许注入 Seed 复现失败。
- **流水线**:
  - PR Check: `FC_NUM_RUNS=100` (快速)
  - Nightly: `FC_NUM_RUNS=1000` (深度)

## 3. 质量保证
- **代码审查**: 关注 Property 的有效性，避免写成 "Re-implementation" (在测试中重写一遍逻辑)。
- **性能熔断**: 单个测试文件超时阈值 5s。
