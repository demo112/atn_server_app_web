# Git 基础规范

## 核心规则

1. **禁止 `git add .`** — 必须精准暂存：`git add <文件>` 或 `git add -p`
2. **全中文 commit** — 禁止 Update/Fix/Add 等英文动词
3. **非交互式** — 使用 `git --no-pager`
4. **Push 前编译** — `npm run build`

## 精准暂存流程

```bash
# 1. 查看变更
git --no-pager status && git --no-pager diff

# 2. 精准暂存（按文件或交互式）
git add <具体文件>
git add -p <文件>  # 对 hunk 选 y/n/s

# 3. 确认后提交
git --no-pager diff --staged
git commit -m "类型(范围): 中文描述"
```

## 暂存判断

| 变更类型 | 处理 |
|----------|------|
| 本任务代码 | ✅ 暂存 |
| 顺手修复 | ❌ 单独提交 |
| 调试代码 | ❌ 删除 |

## Commit 格式

```
<type>(<scope>): <中文描述>
```

| Type | 场景 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| refactor | 重构 |
| docs | 文档 |

## 分支命名

`feature/xxx` | `fix/xxx` | `refactor/xxx` | `docs/xxx`
