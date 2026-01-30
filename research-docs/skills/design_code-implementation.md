# Skill: code-implementation 设计文档

## 一、基本信息

| 项目 | 内容 |
|------|------|
| 职责 | 根据任务描述实现代码 |
| 输入 | 单个Task + design.md + 已有代码 |
| 输出 | 代码文件 |

---

## 二、设计讨论记录

### 2026-01-29 讨论

**核心问题：** AI写代码时需要什么？

**答案：**
1. Task描述 - 知道做什么
2. 设计文档 - 知道接口定义、数据模型
3. 已有代码 - 遵循模式
4. 项目规范 - 遵循约定

**与其他Skill的边界：**
- 不负责验证（code-verification）
- 不负责日志检查（code-logging）
- 只负责"写出来"

**关键点：**
- 上下文加载：必须读取design.md和相关已有代码
- 模式遵循：参考已有代码的写法
- 增量实现：一次只做一个Task
- 不过度设计：只实现Task要求的，不多做

---

## 三、方法论层

### 代码实现原则

| 原则 | 说明 |
|------|------|
| 契约优先 | 先看接口定义，再写实现 |
| 模式复用 | 参考已有代码的写法 |
| 最小实现 | 只做Task要求的 |
| 类型完整 | 不用any，类型要明确 |

### 上下文优先级

```
1. Task描述（必须）
2. design.md（必须）
3. 相关已有代码（必须）
4. project_rules.md（必须）
5. user_rules.md（检查命名空间）
```

---

## 四、领域知识层

依赖技术栈知识（LLM自带）：
- Node.js + Express + TypeScript
- React + TypeScript
- React Native + TypeScript
- Prisma ORM

---

## 五、操作指南层

### 流程

```
1. 读取Task描述
   - 文件路径
   - 要实现的内容
   
2. 读取design.md
   - 找到相关的接口定义
   - 找到相关的数据模型
   
3. 读取相关已有代码
   - 同模块的其他文件
   - 要引用的公共代码
   
4. 实现代码
   - 遵循已有模式
   - 遵循项目规范
   
5. 自检
   - 语法正确
   - 类型完整
   - 命名规范
   
6. 输出代码文件
```

### 代码模板参考

**Service层：**
```typescript
import { PrismaClient } from '@prisma/client'
import { CreateXxxDto, XxxResponse } from '@shared/types/xxx'

export class XxxService {
  constructor(private prisma: PrismaClient) {}

  async create(dto: CreateXxxDto): Promise<XxxResponse> {
    // 实现
  }
}
```

**Controller层：**
```typescript
import { Router } from 'express'
import { XxxService } from './xxx.service'

const router = Router()

router.post('/', async (req, res) => {
  // 实现
})

export default router
```

---

## 六、边界处理层

| 情况 | 处理 |
|------|------|
| Task描述不清 | 返回task-planning补充 |
| 设计信息不足 | 返回technical-design补充 |
| 需要修改已有代码但不确定影响 | 暂停，询问用户 |
| 涉及common.*文件 | 拒绝，提示需与团队沟通 |
| 超出user_rules.md命名空间 | 拒绝，提示检查权限 |

### 质量自检

输出前检查：
- [ ] 语法正确（无明显错误）
- [ ] 类型完整（无any）
- [ ] 符合命名规范
- [ ] 与design.md定义一致
- [ ] 遵循已有代码模式

---

## 七、SKILL.md 最终版

（设计完成后，提炼为正式的SKILL.md文件）
