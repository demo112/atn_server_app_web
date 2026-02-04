# Design: Skill Template Improvement

## Overview

本设计旨在改进 Trae 的三个核心 Skill（requirement-analysis、technical-design、task-planning）的文档模板和示例质量。核心改进包括：强制使用 Given-When-Then 格式的 AC、可执行的验证命令、反例和质量检查点、以及高质量的示例内容。

## Architecture

### 改进架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Skill 质量改进体系                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ requirement-    │  │ technical-      │  │ task-       │ │
│  │ analysis        │──▶│ design          │──▶│ planning    │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ GWT AC 模板     │  │ 文件变更清单    │  │ 可执行验证  │ │
│  │ + 反例          │  │ + 影响分析      │  │ 命令模板    │ │
│  │ + 质量检查点    │  │ + 质量检查点    │  │ + 质量检查点│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              统一质量检查清单 (Quality Checklist)        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 改进范围

| Skill | 改进内容 |
|-------|---------|
| requirement-analysis | AC 模板改为 GWT 格式、添加反例、添加质量检查点、更新示例 |
| technical-design | 添加质量检查点、确保文件清单与任务划分一致 |
| task-planning | 验证方式改为可执行命令、添加反例、添加质量检查点、更新示例 |

## Components and Interfaces

### 1. GWT AC 模板组件

**位置**: `requirement-analysis/SKILL.md` 的输出模板部分

**接口定义**:

```markdown
#### Acceptance Criteria

- [ ] AC1: 
  - **Given**: {前置条件 - 系统/用户处于什么状态}
  - **When**: {触发动作 - 用户执行什么操作}
  - **Then**: {预期结果 - 系统应该如何响应}
```

### 2. 可执行验证命令模板组件

**位置**: `task-planning/SKILL.md` 的输出模板部分

**接口定义**:

```markdown
| 验证 | 命令: `{可执行命令}` |
|      | 预期: {预期输出或退出码} |
```

### 3. 质量检查清单组件

**位置**: 三个 Skill 的「质量门控」部分

**接口定义**:

```markdown
## 质量检查清单

### AC 质量检查（requirement-analysis）
- [ ] 每个 AC 都包含 Given/When/Then 三部分
- [ ] Given 描述了具体的前置条件，而非模糊状态
- [ ] When 描述了具体的用户动作，而非抽象行为
- [ ] Then 描述了可验证的预期结果，而非主观感受
- [ ] 没有使用禁止词汇（正常、合理、适当、友好等）

### 验证方式质量检查（task-planning）
- [ ] 每个验证方式都是可执行命令
- [ ] 命令包含预期输出或退出码
- [ ] 没有使用「手动测试」「页面正常」等模糊描述
- [ ] 验证命令与任务类型匹配（编译/类型/测试/API）
- [ ] 验证命令可以在 CI 环境中自动执行
```

### 4. 反例组件

**位置**: 三个 Skill 的模板部分

**接口定义**:

```markdown
## 禁止写法（反例）

### ❌ 低质量 AC 示例
```markdown
- [ ] AC1: 点击打卡后获取GPS位置并提交到服务器
```
**问题**: 没有前置条件、没有预期结果、无法转化为测试用例

### ✅ 高质量 AC 示例
```markdown
- [ ] AC1:
  - **Given**: 员工已登录 App 且 GPS 权限已授予
  - **When**: 员工点击「打卡」按钮
  - **Then**: 系统获取当前 GPS 坐标（精度 ≤ 50m），创建打卡记录，返回 { success: true, data: { id, timestamp, location } }
```
```

## Data Models

本功能不涉及数据库变更，主要是文档模板的改进。

### 模板数据结构

```typescript
// AC 模板结构
interface AcceptanceCriteria {
  id: string;           // AC1, AC2, ...
  given: string;        // 前置条件（必填）
  when: string;         // 触发动作（必填）
  then: string;         // 预期结果（必填）
}

// 验证命令模板结构
interface VerificationCommand {
  command: string;      // 可执行命令（必填）
  expected: string;     // 预期输出或退出码（必填）
}

// 质量检查项结构
interface QualityCheckItem {
  id: string;           // 检查项 ID
  description: string;  // 检查项描述
  passed: boolean;      // 是否通过
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: AC 格式验证

*For any* requirement-analysis Skill 输出的 AC，该 AC 应包含 Given、When、Then 三个部分，且每个部分都是非空字符串。

**Validates: Requirements 1.1**

### Property 2: 质量检查标记

*For any* 不符合格式要求的输出（AC 缺少 GWT 部分，或验证方式是模糊描述），Quality_Checklist 应将其标记为不合格。

**Validates: Requirements 1.3, 2.3**

### Property 3: 验证命令格式

*For any* task-planning Skill 输出的任务验证方式，该验证方式应包含可执行命令和预期输出两部分，且命令是可在终端执行的格式。

**Validates: Requirements 2.1, 2.2**

### Property 4: 示例质量验证

*For any* Skill 模板中的示例，该示例应能通过对应的 Quality_Checklist 检查。

**Validates: Requirements 4.4**

### Property 5: AC 与验证方式对应

*For any* requirement-analysis 输出的 AC 和对应的 task-planning 输出的验证方式，AC 的 Then 部分应能映射到验证方式的预期输出。

**Validates: Requirements 5.1**

### Property 6: 文件清单与任务一致性

*For any* technical-design 输出的文件变更清单和对应的 task-planning 输出的任务列表，文件清单中的每个文件应在任务列表中有对应的任务。

**Validates: Requirements 5.2**

## Error Handling

| 错误场景 | 处理方式 |
|---------|---------|
| AC 缺少 Given/When/Then 部分 | Quality_Checklist 标记为不合格，提示补充缺失部分 |
| 验证方式是模糊描述 | Quality_Checklist 标记为不合格，提供可执行命令模板 |
| 示例不符合质量标准 | 自动重写示例，确保符合 GWT 格式和可执行命令要求 |
| 上游输出不符合标准 | 下游 Skill 拒绝处理，提示返回上游修正 |
| 文件清单与任务不一致 | 提示检查 technical-design 和 task-planning 的一致性 |

## Testing Strategy

### 单元测试

由于本功能主要是文档模板改进，单元测试主要验证：

1. **模板结构检查**: 验证模板文件包含必要的部分（GWT 模板、反例、质量检查清单）
2. **示例质量检查**: 验证示例符合质量标准
3. **禁止词汇检查**: 验证模板和示例中不包含禁止词汇

### 属性测试

使用属性测试验证核心属性：

1. **Property 1 测试**: 生成随机需求输入，验证输出 AC 包含 GWT 三部分
2. **Property 2 测试**: 生成不符合格式的输出，验证质量检查正确标记
3. **Property 3 测试**: 生成随机任务，验证验证方式包含命令和预期输出
4. **Property 4 测试**: 对每个示例运行质量检查，验证通过
5. **Property 5 测试**: 生成 AC 和验证方式对，验证对应关系
6. **Property 6 测试**: 生成文件清单和任务列表，验证一致性

### 验证命令

| 检查项 | 验证命令 | 预期结果 |
|-------|---------|---------|
| 模板包含 GWT 格式 | `grep -E "Given.*When.*Then" SKILL.md` | 匹配成功 |
| 模板包含反例 | `grep -E "禁止写法\|反例" SKILL.md` | 匹配成功 |
| 模板包含质量检查清单 | `grep -E "质量检查\|Quality.*Check" SKILL.md` | 匹配成功 |
| 示例不包含模糊描述 | `grep -vE "手动测试\|页面正常\|正常显示" SKILL.md` | 无匹配 |
| 质量检查项 ≥ 5 | `grep -c "- \[ \]" SKILL.md` | ≥ 5 |

## File Changes

| 文件 | 操作 | 内容 |
|------|------|------|
| `.trae/skills/requirement-analysis/SKILL.md` | 修改 | 更新 AC 模板为 GWT 格式、添加反例、添加质量检查清单、更新示例 |
| `.trae/skills/technical-design/SKILL.md` | 修改 | 添加质量检查清单、确保与 task-planning 一致性说明 |
| `.trae/skills/task-planning/SKILL.md` | 修改 | 更新验证方式为可执行命令、添加反例、添加质量检查清单、更新示例 |
