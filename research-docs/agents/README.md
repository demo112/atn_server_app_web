# Agent 清单

Agent是流程管理者，负责定义工作流程、调度Skill、管理状态、在关键节点请求人确认。

## Agent与Skill的关系

| 层级 | 角色 | 职责 | 类比 |
|------|------|------|------|
| 人 | 决策者 | 提需求、确认设计、验收结果 | 老板 |
| **Agent** | **流程管理者** | **定义工作流程、调度Skill** | **项目经理** |
| Skill | 执行者 | 执行具体步骤 | 操作手册 |
| Rules | 约束 | 全局规范 | 公司制度 |

## Agent清单

| Agent | 说明 | 调用的Skill |
|-------|------|------------|
| [feature-development](./feature-development.md) | 功能开发全流程 | 全部11个Skill |
| [task-execution](./task-execution.md) | 单个Task执行循环 | code-implementation, code-logging, code-verification, problem-fixing, git-operation |

## 流程总览

### feature-development 流程

```
┌─────────────────────────────────────────────────────────────┐
│  阶段一：需求分析                                            │
│  Skill(requirement-analysis) → 🔴 人确认                    │
├─────────────────────────────────────────────────────────────┤
│  阶段二：技术设计                                            │
│  Skill(technical-design) → 🔴 人确认                        │
├─────────────────────────────────────────────────────────────┤
│  阶段三：任务规划                                            │
│  Skill(task-planning)                                       │
├─────────────────────────────────────────────────────────────┤
│  阶段四：迭代实现                                            │
│  循环调用 task-execution Agent                              │
├─────────────────────────────────────────────────────────────┤
│  阶段五：集成测试                                            │
│  Skill(integration-test)                                    │
├─────────────────────────────────────────────────────────────┤
│  阶段六：交付                                                │
│  Skill(doc-sync) + Skill(project-logging) → 🔴 人确认       │
└─────────────────────────────────────────────────────────────┘
```

### task-execution 流程

```
code-implementation → code-logging → code-verification
                              ↑              ↓
                              └── problem-fixing ←┘（如验证失败）
                                       ↓
                              git-operation（验证通过）
```

## 人确认节点

| 节点 | Agent | 人需要确认什么 |
|------|-------|---------------|
| 需求确认 | feature-development | 需求文档是否准确 |
| 设计确认 | feature-development | 设计方案是否合理 |
| 交付确认 | feature-development | 功能是否符合预期 |
| 止损决策 | feature-development / task-execution | 回退/新思路/继续 |

## 止损机制

所有Agent共享止损规则：

| 规则 | 说明 |
|------|------|
| 3次上限 | 同一问题同一思路最多尝试3次 |
| 范围限制 | 改动 > 3个文件触发止损 |
| 核心保护 | 涉及核心逻辑触发止损 |
| 人介入 | 止损触发后通知人决定 |
