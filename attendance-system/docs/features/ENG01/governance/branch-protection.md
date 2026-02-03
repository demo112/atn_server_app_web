# 分支保护规则指南

为了确保代码质量，建议在 GitHub 仓库中配置以下分支保护规则（Branch Protection Rules）。

## 目标分支
- `main`
- `master` (如果存在)

## 规则设置

### 1. Require status checks to pass before merging
勾选此项，并选择以下 Status Checks（需先运行一次 CI workflow 才会出现）：
- `Lint & Typecheck`
- `Build`

### 2. Require pull request reviews before merging
- **Required approving reviews**: 1
- **Dismiss stale pull request approvals when new commits are pushed**: 勾选 (建议)

### 3. Do not allow bypassing the above settings
勾选此项，防止管理员意外绕过检查。

## 操作步骤
1. 进入 GitHub 仓库页面。
2. 点击 **Settings** > **Branches**。
3. 点击 **Add branch protection rule**。
4. **Branch name pattern** 输入 `main`。
5. 勾选上述配置项。
6. 点击 **Create**。
