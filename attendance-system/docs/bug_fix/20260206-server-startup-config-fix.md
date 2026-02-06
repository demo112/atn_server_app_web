# 服务端启动配置修复记录

## 问题描述
- **现象**：服务端启动时报错 `Directory import '.../packages/shared/dist/types' is not supported resolving ES modules`。
- **复现步骤**：
  1. 运行 `pnpm start` 或 `node dist/server/src/index.js`
  2. 进程崩溃退出
- **影响范围**：服务端无法启动

## 设计锚定
- **所属规格**：技术栈规范
- **原设计意图**：
  - Shared 包编译为 CommonJS 供 Server (Node.js) 使用
  - Server 端使用 CommonJS 模块规范
- **当前偏离**：
  - `packages/server/tsconfig.json` 中配置了 `"moduleResolution": "node16"`，导致 Node.js 尝试以 ESM 规则解析 CommonJS 的目录导入（Directory Import），这在 ESM 中是不允许的。

## 根因分析
- **直接原因**：`tsconfig.json` 配置不一致。Server 试图用 Node16 (ESM-like) 策略解析 Shared 包（CommonJS）。
- **根本原因**：Server 端 TypeScript 配置未正确对齐 CommonJS 运行时环境。
- **相关代码**：`packages/server/tsconfig.json`

## 修复方案
- **修复思路**：将 Server 的模块解析策略改为标准的 `node` (CommonJS兼容)，并显式指定模块类型为 `commonjs`。
- **改动文件**：
  - `packages/server/tsconfig.json`

## 关联组件
| 组件 | 文件路径 | 是否同步修复 |
|------|----------|--------------|
| Server Build Config | packages/server/tsconfig.json | ✅ |

## 验证结果
- [x] 原问题已解决：服务端正常启动，无模块解析错误
- [x] 回归测试通过：API 接口可访问
- [x] 设计一致性确认：符合 CommonJS 规范
- [x] 同类组件已检查：检查了 `tsconfig.dev.json` 确保兼容

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 防回退标记
**关键词**：moduleResolution, Directory import, CommonJS
**设计决策**：Server 端维持 CommonJS 规范以确保与 Shared 包的最大兼容性。

## 提交信息
fix(server): 修正 tsconfig 模块解析配置以解决启动错误
