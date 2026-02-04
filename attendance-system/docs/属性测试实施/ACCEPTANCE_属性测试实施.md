# ACCEPTANCE - 属性测试实施验收记录

## 任务执行记录

| ID | 任务名称 | 状态 | 完成日期 | 备注 |
|:---|:---|:---|:---|:---|
| T1 | 基础设施搭建 | ⬜ | - | - |
| T2 | Server核心生成器 | ⬜ | - | - |
| T3 | Web环境与Schema | ⬜ | - | - |
| T4 | Server核心域PBT | ⬜ | - | - |
| T5 | Server业务逻辑PBT | ⬜ | - | - |
| T6 | Web工具与Hooks | ⬜ | - | - |
| T7 | CI/CD集成 | ⬜ | - | - |
| T8 | 文档与推广 | ⬜ | - | - |

## 阶段验收检查点

### Phase 1: 基础与核心 (T1, T2, T4)
- [ ] `fast-check` 已正确安装在 Server 和 Web 包中。
- [ ] Shared 包中存在可复用的 Arbitraries。
- [ ] Server 端核心考勤计算器通过属性测试验证。

### Phase 2: Web 集成 (T3, T6)
- [ ] Web 端 Zod Schemas 经过 Fuzzing 测试。
- [ ] Web 端核心 Utils 通过属性测试。

### Phase 3: 业务扩展与 CI (T5, T7)
- [ ] Server 端补卡/请假流程覆盖状态机测试。
- [ ] CI 流水线包含 `test:pbt` 步骤。
- [ ] 验证 CI 失败时是否输出 Seed。

### Phase 4: 交付与归档 (T8)
- [ ] 产出 `BEST_PRACTICES.md`。
- [ ] 更新项目最终总结 `FINAL_属性测试实施.md`。
