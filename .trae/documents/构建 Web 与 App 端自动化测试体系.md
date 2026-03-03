# Web & App 端测试基础设施建设方案

当前 Web 和 App 端尚未配置任何自动化测试环境，这是导致“难以测试”的根本原因。本方案将从零搭建测试基础设施，并提供核心测试策略。

## 1. 核心策略：分层测试与逻辑剥离
针对 "难测" 的痛点，我们将采用以下策略：
*   **工具选型**：
    *   **Web**: `Vitest` + `React Testing Library` (利用 Vite 原生优势，速度快)
    *   **App**: `Jest` + `React Native Testing Library` (Expo 官方推荐)
*   **架构优化**：
    *   **UI 与逻辑分离**：将复杂业务逻辑抽离为 Custom Hooks 或纯函数（易于单元测试）。
    *   **组件测试**：只关注渲染、交互和状态变化，Mock 掉所有网络请求和底层模块。

## 2. 实施步骤

### 阶段一：Web 端 (Packages/Web) 测试环境搭建
1.  **依赖安装**：安装 `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`。
2.  **配置 Vitest**：修改 `vite.config.ts` 或创建 `vitest.config.ts`，配置环境为 `jsdom`。
3.  **设置环境**：创建 `src/test/setup.ts`，扩展 Jest 匹配器。
4.  **添加脚本**：在 `package.json` 中添加 `test` 和 `test:ui` 命令。
5.  **示例测试**：为 `src/components/DepartmentSelect` 编写一个简单的组件渲染测试。

### 阶段二：App 端 (Packages/App) 测试环境搭建
1.  **依赖安装**：安装 `jest`, `jest-expo`, `@testing-library/react-native`。
2.  **配置 Jest**：在 `package.json` 或 `jest.config.js` 中配置 Preset 为 `jest-expo`。
3.  **设置环境**：创建 `jest-setup.ts` 用于 Mock Native 模块。
4.  **添加脚本**：在 `package.json` 中添加 `test` 命令。
5.  **示例测试**：为 `src/components/DepartmentSelect.tsx` 编写一个快照或渲染测试。

### 阶段三：测试规范与文档
1.  **文档编写**：在 `docs/` 下创建 `testing-guide.md`，记录如何运行测试及编写规范。
2.  **CI 集成准备**：确保 `pnpm test` 能在根目录正确触发各端测试（通过 pnpm workspace）。

## 3. 预期成果
*   Web 和 App 具备运行单元测试和组件测试的能力。
*   提供一套可复制的测试代码模板（Mock 数据 + 组件渲染 + 断言）。
*   解决“难测”问题：通过基础设施消除环境障碍，通过 Mock 机制消除依赖障碍。
