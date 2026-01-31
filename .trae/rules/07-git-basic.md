# Git 基础规范

## 强制规则

### 规则 0: 精准暂存（最重要）
**严禁使用 `git add .` 或 `git add -A`**，必须精准暂存本次任务相关的变更。

| 禁止 ❌ | 使用 ✅ |
|---------|---------|
| `git add .` | `git add <具体文件>` |
| `git add -A` | `git add -p`（交互式暂存） |
| `git add *` | 逐文件或逐 hunk 暂存 |

### 规则 1-4
1. **全中文描述**: commit message 必须中文，禁止 Update/Fix/Add 等英文动词
2. **禁止模糊描述**: 标题必须具体说明「做了什么 + 为什么」
3. **非交互式执行**: 使用 `git --no-pager`
4. **Push 前必须编译通过**: `npm run build`

## 精准暂存流程

```bash
# 1. 查看变更
git --no-pager status
git --no-pager diff

# 2. 分析变更归属（哪些属于当前任务）

# 3. 精准暂存
# 方式A: 按文件（整个文件属于本任务）
git add packages/server/src/modules/user/user.service.ts

# 方式B: 交互式（文件中只有部分变更属于本任务）
git add -p packages/server/src/modules/user/user.service.ts
# 对每个 hunk 选择 y(暂存) / n(跳过) / s(拆分)

# 4. 确认暂存内容
git --no-pager diff --staged  # 将要提交的
git --no-pager diff           # 未暂存的（其他任务的）

# 5. 提交
git commit -m "..."
```

## 变更归属判断

| 变更类型 | 处理 |
|----------|------|
| 本任务新增/修改代码 | ✅ 暂存 |
| 顺手修复的小问题 | ❌ 单独提交 |
| 临时调试代码 | ❌ 删除 |
| 其他任务的修改 | ❌ 不暂存 |

## 分支策略
| 分支 | 用途 |
|------|------|
| main | 稳定版本 |
| feature/xxx | 新功能 |
| fix/xxx | Bug修复 |
| refactor/xxx | 重构 |
| docs/xxx | 文档 |

## 原子提交标准
- 单一职责：只做一件事
- 完整性：代码可编译运行
- 可回滚：可独立 revert
- 精准性：只包含本任务变更
