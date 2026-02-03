# ENG01 - 任务拆分

## 任务列表

| ID | 任务 | 负责人 | 状态 |
|----|------|--------|------|
| T1 | 统计存量问题基线（any 数量、console.log 数量等） | Trae | ✅ |
| T2 | 配置 monorepo 根级 ESLint（规则设为 warn） | Trae | ✅ |
| T3 | 配置 server 端 ESLint 继承 | Trae | ✅ |
| T4 | 配置 web 端 ESLint 继承 | Trae | ✅ |
| T5 | 配置 app 端 ESLint 继承 | Trae | ✅ |
| T6 | 安装配置 husky + lint-staged | Trae | ✅ |
| T7 | 添加 npm scripts（lint、typecheck） | Trae | ✅ |
| T8 | 修复 lint-staged 拦截的存量问题（如果有） | Trae | ✅ |

## 完成标准 (DoD)

### 代码层面
- [x] `npm run build` 通过 (App 端可能有警告，但 Lint 通过)
- [x] `npm run lint` 通过 (Exit code 0, no errors)
- [x] 无 `console.log` error (已修复 scripts 和 config files)

### 验证层面
- [x] 存量代码不报错（Errors 已修复，Warnings 允许）
- [x] 新增代码将被拦截（通过 husky 验证）

## 风险
- App 端依赖安装存在潜在问题 (peer deps)，目前通过配置绕过。
