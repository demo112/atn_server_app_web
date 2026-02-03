# ALIGNMENT: 工程质量治理体系融合 (ENG01 Refined)

## 1. 背景与目标

当前项目存在三个相关的工程治理实体：
1. **ENG01** (工程质量治理体系): 侧重 Lint、CI/CD、Zod 校验等规范。
2. **test_sys** (测试基础设施): 侧重 Vitest/Jest 配置、MSW Mock 等工具链。
3. **QA-WEB-01** (Web端测试落地): 侧重具体的测试用例编写和覆盖率提升。

**问题**：这三者在文档和概念上较为分散，缺乏统一的顶层设计，导致开发者在查阅规范或执行测试时需要跨越多个上下文。

**目标**：将上述三者融合为一套统一的 **"工程效能与质量体系 (Engineering Efficiency & Quality System)"**，实现从规范到基建，再到落地的闭环管理。

## 2. 融合方案：三层架构体系

我们将 `ENG01` 升级为顶层代号，下设三个逻辑层级：

| 层级 | 英文 | 包含内容 (原归属) | 核心职责 |
|------|------|-------------------|----------|
| **L1 治理层** | **Governance** | 原 `ENG01` (Lint, Hooks, Rules) | **立法**：制定规则、门禁、统一错误处理、类型契约 |
| **L2 基建层** | **Infrastructure** | 原 `test_sys` + `ENG01(CI)` | **修路**：提供统一测试运行器、Mock服务、CI流水线 |
| **L3 运营层** | **Operations** | 原 `QA-WEB-01` + 后续QA任务 | **行车**：执行具体的测试覆盖、专项治理行动 |

### 2.1 目录结构重构 (建议)

建议将文档物理结构调整如下，以反映逻辑关系：

```
docs/features/ENG01/
├── index.md                # [新增] 体系总览 (Map)
├── governance/             # [原 ENG01]
│   ├── rules.md            # Lint & TS 规范
│   ├── branch-policy.md    # 分支门禁
│   └── error-handling.md   # 统一错误处理
├── infrastructure/         # [原 test_sys]
│   ├── test-runner.md      # Vitest/Jest 统一配置
│   ├── mocking.md          # MSW & Data Mock 指南
│   └── ci-pipeline.md      # GitHub Actions 配置
└── operations/             # [原 QA-WEB-01 等]
    ├── web-coverage-s1.md  # Web端测试覆盖迭代1 (原 QA-WEB-01)
    └── server-contract.md  # 后续服务端契约测试
```

## 3. 核心变更点

1.  **文档归并**：
    *   废弃 `docs/test_sys` 根目录，将其内容迁移至 `docs/features/ENG01/infrastructure`。
    *   废弃 `docs/features/QA-WEB-01` 独立目录，将其作为 `ENG01` 的一个执行阶段文档 `docs/features/ENG01/operations/web-coverage-s1.md`。
2.  **概念统一**：
    *   不再单独提及 "test_sys"，统称为 "ENG01 测试基建"。
    *   统一使用 `pnpm test` 作为所有测试的入口，底层调用各端配置。

## 4. 决策与疑问

### 4.1 关键决策点
- **Q1**: 是否同意将 `test_sys` 和 `QA-WEB-01` 的物理文档目录移动到 `ENG01` 下？
    - **建议**: 是。物理聚合能强化逻辑聚合。
- **Q2**: `QA-WEB-01` 原本作为一个独立的 Feature (有独立的需求/设计/任务)，合并后是否保留其独立性？
    - **建议**: 保留其内容作为 "专项行动 (Campaign)" 文档，但从 Feature 列表中移除，归属于 ENG01 的子任务。

## 5. 验收标准

- [ ] 形成统一的 `docs/features/ENG01/index.md` 导航页。
- [ ] 完成 `docs/test_sys` 的文档迁移。
- [ ] 完成 `docs/features/QA-WEB-01` 的文档迁移。
- [ ] 更新相关引用链接。
