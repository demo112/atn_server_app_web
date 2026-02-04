# Skill 清单与映射关系

## 三层架构

```
流程层 (When/What) → 参考层 (How) → 方法论层 (Mindset)
```

## 流程层 Skill（主导开发流程）

| Skill | 使用场景 | 关联 Rules |
|-------|----------|-----------|
| requirement-analysis | 阶段1：需求分析 | 20-project-overview |
| technical-design | 阶段2：技术设计 | 04-api-spec |
| task-planning | 阶段3：任务规划 | 13-doc-management |
| code-implementation | 阶段5：代码实现 | 02-typescript, 03-file-structure |
| code-logging | 阶段5：日志检查 | 06-logging |
| code-verification | 阶段5：四维验证 | 14-definition-of-done |
| problem-fixing | 阶段5：问题修复 | - |
| verification-before-completion | 阶段5：完成前验证 | 14-definition-of-done |
| git-operation | 阶段5：Git提交 | 07-git-basic, 08-git-commit |
| git-conflict-resolution | Git冲突处理 | 09-git-conflict |
| integration-test | 阶段6：集成测试 | 11-testing |
| doc-sync | 文档同步 | 13-doc-management |
| project-logging | 进度记录 | 13-doc-management |

## 参考层 Skill（技术知识库）

编写代码时按模块查阅：

| 模块 | 参考 Skill |
|------|-----------|
| Server (Express/Prisma) | nodejs-backend-patterns |
| Web (React/Vite) | react-best-practices, vite-patterns |
| App (React Native/Expo) | react-native-patterns, expo-native-ui, expo-networking |
| App 调试 | app-debugging, expo-dev-client |
| Web 调试 | web-debugging |

## 方法论层 Skill（可选）

| Skill | 说明 | 融入位置 |
|-------|------|---------|
| systematic-debugging | 系统化调试 | 已融入 problem-fixing |
| test-driven-development | TDD 模式 | code-implementation 可选 |

## 业务领域 Skill

| 业务 | Skill | 说明 |
|------|-------|------|
| 考勤系统 | attendance-domain | 考勤概念、数据模型、业务规则 |

## UI 相关 Skill

| Skill | 说明 |
|-------|------|
| ui-cloning | 截图模仿界面 |
| mobile-android-design | Android 设计规范 |

---

## Skill 与 Rules 联动规则

### 按操作类型加载

| 操作 | 先读 Rules | 先读 Skill |
|------|-----------|-----------|
| 写 Service 代码 | 06-logging, 05-security | nodejs-backend-patterns |
| 写 Controller 代码 | 04-api-spec, 05-security | nodejs-backend-patterns |
| 写测试代码 | 11-testing | test-driven-development |
| 改数据模型 | - | attendance-domain |
| Git 操作 | 07-git-basic, 08-git-commit | git-operation |
| Git 冲突 | 09-git-conflict | git-conflict-resolution |
| 补充日志 | 06-logging | code-logging |

### 按文件类型加载

| 文件 | 先读 Rules |
|------|-----------|
| *.service.ts | 06-logging, 05-security |
| *.controller.ts | 04-api-spec, 05-security |
| *.test.ts | 11-testing |
| schema.prisma | 对照 database-design.md |
| package.json | 01-tech-stack |

---

## 工作流程中的 Skill 调用

```
阶段1: Align     → requirement-analysis + attendance-domain
阶段2: Architect → technical-design + attendance-domain
阶段3: Atomize   → task-planning
阶段4: Approve   → (人工确认)
阶段5: Automate  → code-implementation → code-logging → code-verification → git-operation
                         ↑                                    ↓
                         └──────── problem-fixing ←───────────┘
阶段6: Assess    → integration-test → doc-sync → project-logging
```
