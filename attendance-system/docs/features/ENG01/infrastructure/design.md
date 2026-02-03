# 设计文档：测试系统 (TEST-SYS)

## 1. 技术选型

| 模块 | 框架 | 原因 |
|------|------|------|
| Shared | Vitest | 速度快，原生支持 TS/ESM |
| Web | Vitest + RTL | 与 Vite 生态完美契合 |
| App | Jest + Expo | Expo 官方推荐，兼容性最好 |
| Mock | MSW | 拦截网络请求，真实模拟 API |

## 2. 目录结构

```
packages/
├── shared/
│   └── src/utils/*.test.ts
├── web/
│   ├── src/components/*.test.tsx
│   └── src/test/ (setup, mocks)
└── app/
    ├── src/components/*.test.tsx
    └── jest-setup.ts
```

## 3. 配置策略

- **Shared**: 纯 Node 环境，无 DOM 依赖
- **Web**: `jsdom` 环境，集成 `setupTests.ts` 进行全局 Mock
- **App**: `jest-expo` 预设，模拟 Native 模块

## 4. 依赖管理
- 使用 `pnpm workspace` 管理依赖
- `devDependencies` 安装在各包中，避免提升污染
