# Skill: technical-design 设计文档

## 一、基本信息

| 项目 | 内容 |
|------|------|
| 职责 | 将需求文档转化为可执行的技术设计 |
| 输入 | `.trae/specs/{feature}/requirements.md` |
| 输出 | `.trae/specs/{feature}/design.md` |

---

## 二、设计讨论记录

### 2026-01-29 讨论

**核心理念：**

1. **设计是给AI的执行指令，不是给人的文档**
   - AI读完设计应该能直接写代码，不需要猜测
   - 定义接口契约（输入输出），不定义内部实现

2. **文件变更清单是关键输出**
   - 具体到每个文件做什么
   - 让task-planning可以"无脑"拆分任务

3. **设计必须可验证**
   - API定义 → 实际API是否一致
   - 数据模型 → 实际schema是否一致

4. **设计需要上下文感知**
   - 读取已有代码结构
   - 遵循项目模式和约定
   - 复用已有类型和工具

5. **设计需要可回溯**
   - 每个设计决策对应哪个Story
   - 代码能追溯到设计，设计能追溯到需求

6. **人确认的是影响和风险，不是技术细节**
   - 影响范围可接受吗？
   - 风险可接受吗？
   - 需要决策的点

**Skill依赖：**
- requirements.md（需求来源）
- 项目现有代码结构
- 技术栈约定（06-开发实施指南）
- 命名空间规则（user_rules.md）

---

## 三、方法论层

### 设计维度

| 维度 | 内容 | 确定程度 |
|------|------|---------|
| 数据模型 | 实体、关系、字段 | 完全确定（Prisma schema） |
| API设计 | 路径、方法、请求响应类型 | 完全确定 |
| 文件结构 | 哪些文件、每个文件做什么 | 完全确定 |
| 组件结构 | 页面级组件 | 确定名称和职责 |
| 内部实现 | 具体算法、逻辑 | 不确定，留给实现 |

### 设计原则

| 原则 | 应用 |
|------|------|
| 单一职责 | 每个文件/模块只做一件事 |
| 接口隔离 | API粒度适中 |
| 最小变更 | 尽量少改已有代码 |
| 显式依赖 | 明确引用已有代码 |

---

## 四、领域知识层

依赖项目文档：
- `06-开发实施指南.md` - 技术栈、代码规范
- `user_rules.md` - 命名空间规则
- 已有代码结构

---

## 五、操作指南层

### 流程

```
1. 读取需求文档
2. 读取项目现有结构（相关模块的代码）
3. 设计数据模型
4. 设计API接口
5. 规划文件变更
6. 分析影响范围
7. 识别风险和决策点
8. 输出设计文档 → 用户确认
9. 完成
```

### 输出模板

```markdown
# Design: {Feature Name}

## 需求映射

| Story | 实现方式 |
|-------|---------|
| Story 1: xxx | API: POST /api/v1/xxx, 组件: XxxPage |
| Story 2: xxx | API: GET /api/v1/xxx, 组件: XxxList |

## 数据模型

```prisma
model Xxx {
  id        String   @id @default(uuid())
  // ...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API定义

### POST /api/v1/xxx

创建xxx

**Request:**
```typescript
interface CreateXxxDto {
  field1: string
  field2: number
}
```

**Response:**
```typescript
interface XxxResponse {
  success: boolean
  data?: Xxx
  error?: { code: string, message: string }
}
```

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| packages/shared/src/types/xxx.ts | 新增 | CreateXxxDto, XxxResponse 类型定义 |
| packages/server/src/modules/xxx/xxx.service.ts | 新增 | XxxService类，create/find/update方法 |
| packages/server/src/modules/xxx/xxx.controller.ts | 新增 | 路由处理，调用service |
| packages/web/src/pages/xxx/XxxPage.tsx | 新增 | 页面组件 |

## 引用的已有代码

- `packages/shared/src/types/common.ts` - 通用响应类型
- `packages/server/src/common/middleware/auth.ts` - 认证中间件

## 影响分析

| 已有功能 | 影响 | 风险等级 |
|---------|------|---------|
| 用户模块 | 无影响 | - |

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| xxx | A方案 | xxx |

## 风险点

| 风险 | 影响 | 应对 |
|------|------|------|
| xxx | xxx | xxx |

## 需要人决策

- [ ] 决策1：xxx？
- [ ] 决策2：是否接受xxx风险？
```

---

## 六、边界处理层

| 情况 | 处理 |
|------|------|
| 需求不清导致无法设计 | 返回requirement-analysis补充 |
| 技术方案有多个选择 | 列入"需要人决策"，暂停等确认 |
| 设计影响已有功能 | 列入"影响分析"，标记风险 |
| 涉及common.*公共代码 | 标记警告，提醒需与团队沟通 |
| 超出命名空间范围 | 拒绝，提示检查user_rules.md |

### 质量门禁

进入下一阶段前：
- [ ] 每个Story有对应的实现方式
- [ ] 数据模型完整（可直接用于Prisma）
- [ ] API定义完整（有请求响应类型）
- [ ] 文件变更清单具体到每个文件
- [ ] 影响分析已完成
- [ ] 人已确认设计

---

## 七、SKILL.md 最终版

（设计完成后，提炼为正式的SKILL.md文件）
