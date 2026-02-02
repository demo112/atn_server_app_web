# Git 基础规范

## 核心规则

1. **禁止 `git add .`** — 必须精准暂存：`git add <文件>` 或 `git add -p`
2. **全中文 commit** — 禁止 Update/Fix/Add 等英文动词
3. **强制非交互式** — **所有 git 命令必须加 `--no-pager`**，防止进入分页器卡住
4. **Push 前编译** — `npm run build`

## ⚠️ 非交互式规则（重要）

**每个 git 命令都必须使用 `git --no-pager`**，否则会进入分页器导致执行卡住。

```bash
# ✅ 正确写法
git --no-pager status
git --no-pager diff
git --no-pager log
git --no-pager show
git --no-pager branch
git --no-pager diff --staged

# ❌ 错误写法（会卡住）
git status
git diff
git log
git show
```

## 精准暂存流程

```bash
# 1. 查看变更（必须 --no-pager）
git --no-pager status
git --no-pager diff

# 2. 精准暂存（按文件或交互式）
git add <具体文件>
git add -p <文件>  # 对 hunk 选 y/n/s

# 3. 确认后提交（必须 --no-pager）
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
