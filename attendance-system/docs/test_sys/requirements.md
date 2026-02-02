# 需求文档：测试系统 (TEST-SYS)

## 1. 背景
为确保考勤系统 (Server, Web, App) 的代码质量和稳定性，需要构建统一的自动化测试基础设施。

## 2. 目标
- 支持 Shared, Web, App 三端的自动化测试
- 统一运行入口
- 提供标准测试示例
- 集成 MSW 进行 API Mock
- 支持 React 组件测试 (Web/App)

## 3. 范围
- **Shared**: 纯逻辑单元测试 (Vitest)
- **Web**: React 组件与 Hook 测试 (Vitest + RTL + MSW)
- **App**: React Native 组件测试 (Jest + Expo + RNTL)
- **Root**: 统一测试脚本

## 4. 验收标准
- [x] 所有包均有 test 脚本
- [x] 根目录 `pnpm test` 可运行所有测试
- [x] 提供详细的测试指南文档
