# Git 操作规范

## 核心原则

> **精准提交 + 安全拉取** —— 提交时只包含本次任务变更，拉取时确保本地干净，冲突时理解优先。

---

## 一、拉取规范

### 规则 P1: 工作前必须拉取

每天开始工作前、长时间离开后，必须先拉取最新代码：

```bash
git pull --rebase origin main
```

### 规则 P2: 拉取前确保干净

**禁止在有未提交变更时直接 pull**，会导致混乱。

| 场景 | 处理方式 |
|------|----------|
| 有未完成的修改 | 先 `git stash`，pull 后 `git stash pop` |
| 有已暂存的修改 | 先 commit 或 reset |
| 工作区干净 | 直接 pull |

```bash
# 检查状态
git --no-pager status

# 如果有修改，先暂存
git stash

# 拉取
git pull --rebase origin main

# 恢复暂存
git stash pop
```

### 规则 P3: 优先使用 rebase

拉取时使用 `--rebase` 保持线性历史：

```bash
# 推荐
git pull --rebase origin main

# 或配置默认行为
git config pull.rebase true
```

---

## 二、冲突处理规范

### 规则 C1: 冲突必须理解后解决

**禁止盲目接受任一方**，必须理解双方意图后合并。

```bash
# 查看冲突文件
git --no-pager diff --name-only --diff-filter=U

# 查看双方改动历史
git log --merge -p <file>

# 查看共同祖先版本
git show :1:<file>
```

### 规则 C2: 解决后必须验证

冲突解决后必须：

1. 确认无残留冲突标记
2. 编译通过
3. 测试通过（如有）

```bash
# 检查残留标记
git --no-pager diff | grep -E "^(<<<<<<<|=======|>>>>>>>)"

# 编译验证
npm run build
```

### 规则 C3: 复杂冲突需人工决策

以下冲突类型必须人工确认：

| 类型 | 原因 |
|------|------|
| 业务逻辑冲突 | 需要业务判断 |
| 数据模型冲突 | 影响数据结构 |
| 架构变更冲突 | 影响系统设计 |
| 安全相关代码 | 风险高 |

### 冲突处理流程

```
检测冲突 → 分析类型 → 理解意图 → 选择策略 → 解决 → 验证 → 继续
```

---

## 三、提交规范

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


---

## 四、冲突解决策略速查

### 按场景选择策略

| 场景 | 策略 | 示例 |
|------|------|------|
| import 语句冲突 | 合并去重 | 保留所有需要的 import |
| 双方新增不同功能 | 保留双方 | 合并两段代码 |
| 同函数不同修改 | 合并逻辑 | 理解后整合 |
| 格式化差异 | 统一格式 | 按项目规范 |
| 配置文件冲突 | 按环境合并 | 保留各环境配置 |
| 依赖版本冲突 | 取较新版本 | 选择兼容的较新版 |
| 一方删除一方修改 | 确认需求 | 询问是否保留 |

### 冲突标记说明

```
<<<<<<< HEAD
你的本地代码
=======
远程/对方的代码
>>>>>>> origin/main
```

### 解决后操作

```bash
# 标记已解决
git add <resolved-file>

# 继续 rebase
git rebase --continue

# 或继续 merge
git merge --continue
```

### 放弃解决

```bash
# 放弃 rebase
git rebase --abort

# 放弃 merge
git merge --abort
```

---

## 五、检查清单

### 拉取前检查
- [ ] 工作区是否干净？（无未提交变更）
- [ ] 是否需要先 stash？

### 冲突解决检查
- [ ] 是否理解了双方的改动意图？
- [ ] 是否删除了所有冲突标记？
- [ ] 编译是否通过？
- [ ] 测试是否通过？

### 提交前检查
- [ ] 使用了精准暂存（非 `git add .`）？
- [ ] 暂存的变更都属于当前任务？
- [ ] 临时调试代码已清理？
- [ ] 已执行 `git diff --staged` 确认？
