# 项目上下文与需求对齐 (ALIGNMENT)

## 1. 项目结构分析
项目采用 Monorepo 结构，位于 `attendance-system` 目录下。
核心代码位于 `packages` 目录：
- `packages/app`: 移动端 APP (React Native / Expo)
- `packages/web`: Web 端管理后台
- `packages/server`: 后端服务
- `packages/shared`: 共享代码

参考代码位于 `incoming/app` 目录：
- `shift-master---班次设置`
- `shift_add`
- `shift_list`
这些目录包含了班次管理相关的前端组件和逻辑原型。

## 2. 需求理解
用户要求在 APP 的“常用功能”中添加“班次管理”功能。
需要仿照 `incoming/app` 下的样式和逻辑进行集成。

## 3. 关键决策点
- **入口位置**: 需要在 APP 的首页或特定页面的“常用功能”区域添加入口。
- **页面路由**: 需要在 APP 的路由配置中添加班次管理相关的页面（班次列表、添加班次、编辑班次）。
- **组件复用**: `incoming` 下的代码看起来是 React (Web) 代码（使用了 `<div>`, `vite.config.ts` 等），而 `packages/app` 可能是 React Native。需要确认 `packages/app` 的技术栈（React Native vs React Web in WebView）。如果是 React Native，需要进行 UI 组件的转换（div -> View, span -> Text 等）。

## 4. 待确认事项
- `packages/app` 是 React Native 项目还是 Web 项目？
- “常用功能”模块的具体代码位置。
- `incoming` 代码的复用程度（逻辑可复用，UI 可能需要重写）。

## 5. 下一步行动
- 检查 `packages/app` 的 `package.json` 和源代码，确认技术栈。
- 寻找 APP 首页代码，定位“常用功能”区域。
- 制定详细的集成计划。
