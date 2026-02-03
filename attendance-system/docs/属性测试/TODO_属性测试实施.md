# TODO - 属性测试后续规划

## 1. 待办事项 (Backlog)

### 🔴 高优先级
- [x] **User模块覆盖**：参照 `EmployeeService` 的模式，为 `UserService` 添加属性测试。
- [x] **Report模块覆盖**：考勤报表计算逻辑复杂，是 PBT 的绝佳应用场景。

### 🟡 中优先级
- [x] **性能优化**：目前 PBT 运行次数默认为 100，在 CI 中可能会变慢。考虑引入 `test:pbt:quick` (run 10) 和 `test:pbt:full` (run 1000)。
- [ ] **生成器完善**：目前的 `prisma-types.arb.ts` 覆盖了核心字段，建议根据 Schema 变化自动生成或完善更多字段。

### 🟢 低优先级
- [ ] **前端集成**：探索在 Web/App 端利用 `fast-check` 进行表单验证逻辑的测试。
- [ ] **模糊测试**：结合 API 接口测试，进行端到端的模糊测试 (Fuzzing)。

## 2. 配置指引

### 如何添加新的 PBT 测试？
1. 在模块目录下创建 `*.pbt.test.ts`。
2. 引入 `fast-check` 和相关 `arbitrary`。
3. 编写 `fc.assert(fc.asyncProperty(...))`。

### 如何调试失败的用例？
CI 日志会输出 `Seed` 和 `Path`。在本地运行：
```typescript
fc.assert(property, { seed: 123456789, path: "25:3:2" })
```

### 如何调整测试强度？
在 `vitest.config.ts` 或单个测试文件中配置：
```typescript
fc.configureGlobal({ numRuns: 1000 }); // 全局增加强度
```
