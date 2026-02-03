# TEST-SYS - 任务拆分

## 概览

| 指标 | 值 |
|------|-----|
| 总任务数 | 8 |
| 涉及模块 | shared, web, app, root |
| 涉及端 | Server, Web, App |
| 预计总时间 | 120 分钟 |
| 当前状态 | 🟢 全线通过 (2026-02-03 修复 Web 集成测试) |

## 任务清单

### 阶段1：Shared 包 (基础环境)

#### Task 1: Shared 测试环境配置
- **文件**:
  - `packages/shared/package.json` (新增 test 脚本和依赖)
  - `packages/shared/vitest.config.ts` (新建配置)
  - `packages/shared/src/test/setup.ts` (新建环境配置)
- **内容**: 配置 Vitest 运行环境，支持 Node.js 环境测试
- **验证**: `cd packages/shared && npm test` (应提示无测试文件或运行成功)
- **状态**: ✅ 已完成

#### Task 2: Shared 示例测试
- **文件**:
  - `packages/shared/src/utils/date.ts` (确保存在或创建)
  - `packages/shared/src/utils/date.test.ts` (新增单元测试)
  - `packages/shared/src/utils/date.property.test.ts` (新增属性测试)
- **内容**: 编写日期工具函数及其单元测试、基于 fast-check 的属性测试
- **验证**: `cd packages/shared && npm test` (所有测试通过)
- **状态**: ✅ 已完成

### 阶段2：Web 包 (React环境)

#### Task 3: Web 测试环境配置
- **文件**:
  - `packages/web/package.json` (新增 test 脚本和依赖)
  - `packages/web/vitest.config.ts` (新建配置)
  - `packages/web/src/test/setup.ts` (新建环境配置)
- **内容**: 配置 Vitest + JSDOM + React Testing Library 环境
- **验证**: `cd packages/web && npm test`
- **状态**: ✅ 已完成

#### Task 4: Web MSW Mock 服务
- **文件**:
  - `packages/web/src/test/mocks/server.ts`
  - `packages/web/src/test/mocks/handlers/index.ts`
  - `packages/web/src/test/mocks/handlers/department.ts`
  - `packages/web/src/test/mocks/data/department.ts`
- **内容**: 搭建 MSW 拦截服务，实现部门数据的 Mock 接口
- **验证**: 编译通过，无类型错误
- **状态**: ✅ 已完成

#### Task 5: Web 组件测试示例
- **文件**:
  - `packages/web/src/components/DepartmentSelect.tsx` (确保存在或创建)
  - `packages/web/src/components/DepartmentSelect.test.tsx` (新增测试)
- **内容**: 编写部门选择组件及其测试，验证 MSW 拦截是否生效
- **验证**: `cd packages/web && npm test` (测试通过)
- **状态**: ✅ 已完成 (2026-02-03: 修复了 PaginatedResponse 解包逻辑与 Mock 格式不一致的问题)

### 阶段3：App 包 (React Native环境)

#### Task 6: App 测试环境配置
- **文件**:
  - `packages/app/package.json` (新增 test 脚本和依赖)
  - `packages/app/jest.config.js` (新建配置)
  - `packages/app/jest-setup.ts` (新建环境配置)
- **内容**: 配置 Jest + Expo + React Native Testing Library 环境
- **验证**: `cd packages/app && npm test`
- **状态**: ✅ 已完成

#### Task 7: App 组件测试示例
- **文件**:
  - `packages/app/src/components/CheckInButton.tsx` (确保存在或创建)
  - `packages/app/src/components/CheckInButton.test.tsx` (新增测试)
- **内容**: 编写打卡按钮组件及其测试，验证原生模块 Mock
- **验证**: `cd packages/app && npm test` (测试通过)
- **状态**: ✅ 已完成

### 阶段4：整合与文档

#### Task 8: 根目录整合与文档
- **文件**:
  - `package.json` (根目录脚本)
  - `docs/testing-guide.md` (测试指南)
- **内容**: 添加根目录测试命令，编写测试指南文档
- **验证**: 根目录执行 `npm test` 跑通所有包测试
- **状态**: ✅ 已完成

## 完成标准 (DoD)

每个任务完成前必须确认：

### 代码层面
- [x] `npm run build` 通过 (如涉及)
- [x] `npm run lint` 通过
- [x] 测试全部通过
