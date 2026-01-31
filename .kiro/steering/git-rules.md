# Git 提交规范

## 核心原则

> **精准提交** —— 只提交本次任务相关的变更（hunk 级精度），让代码历史清晰可追溯。

## 强制规则

### 规则 0: 禁止 `git add .`

**严禁使用 `git add .` 或 `git add -A`**，必须精准暂存。

| 禁止 ❌ | 使用 ✅ |
|---------|---------|
| `git add .` | `git add <具体文件>` |
| `git add -A` | `git add -p`（交互式暂存） |

### 规则 1-4

1. **全中文描述**: commit message 必须中文
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
# 按文件: git add attendance-system/packages/server/src/modules/user/user.service.ts
# 交互式: git add -p <file>  # 对每个 hunk 选择 y/n/s

# 4. 确认暂存内容
git --no-pager diff --staged  # 将要提交的
git --no-pager diff           # 未暂存的

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

## 提交前检查清单

- [ ] 使用了精准暂存（非 `git add .`）？
- [ ] 暂存的变更都属于当前任务？
- [ ] 临时调试代码已清理？
- [ ] 已执行 `git diff --staged` 确认？

## Commit 格式

```
<type>(<scope>): <中文描述>

背景: ...
变更: ...
影响: ...
```

| Type | 场景 |
|------|------|
| feat | 新功能 |
| fix | 修复Bug |
| refactor | 重构 |
| docs | 文档 |
| test | 测试 |
| chore | 构建配置 |
