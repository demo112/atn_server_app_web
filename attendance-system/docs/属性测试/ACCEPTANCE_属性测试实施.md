# ACCEPTANCE - 属性测试实施

## 总体进度
- [x] T1: 基础设施搭建
- [x] T2: 核心生成器开发
- [x] T3: 核心域 PBT 实现
- [x] T4: 业务逻辑 PBT 覆盖
- [x] T5: 数据管理 PBT 覆盖
- [x] T6: CI/CD 集成
- [x] T7: 团队文档

## 详细记录

### T1: 基础设施搭建
- [x] 创建 `packages/shared/src/test/arbitraries/`
- [x] 创建 `packages/server/src/common/test/arbitraries/`
- [x] 更新根目录 `package.json` 添加 `test:pbt`
- [x] 验证测试脚本可执行

### T2: 核心生成器开发
- [x] 创建基础生成器 `common.arb.ts` (Time, DateRange)
- [x] 创建业务生成器 `shift.arb.ts`
- [x] 创建 Prisma 生成器 `prisma-types.arb.ts`

### T3: 核心域 PBT 实现
- [x] 实现 `attendance-calculator.pbt.test.ts`
- [x] 验证核心算法不变量 (非负性、幂等性)
- [x] 修复发现的逻辑缺陷 (负数时长问题)

### T4: 业务逻辑 PBT 覆盖
- [x] 实现 `leave.service.pbt.test.ts`
- [x] 验证请假业务规则 (时间重叠、无效时间)
- [x] 实现 `attendance-correction.service.pbt.test.ts`
- [x] 验证补卡业务规则 (状态流转、记录更新)

### T5: 数据管理 PBT 覆盖
- [x] 实现 `employee.service.pbt.test.ts`
- [x] 验证 CRUD 操作和数据完整性

### T6: CI/CD 集成
- [x] 更新 `.github/workflows/ci.yml`
- [x] 添加 `test:pbt` 步骤

### T7: 团队文档
- [x] 创建 `docs/属性测试/BEST_PRACTICES.md`
- [x] 包含生成器复用指南和 Mock 最佳实践
