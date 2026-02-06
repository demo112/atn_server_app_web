# TEST-SYS - 任务拆分

## 任务列表

| ID | 任务 | 依赖 | 状态 |
|----|------|------|------|
| T0-1 | Shared 包：安装 Vitest + fast-check | - | ⬜ |
| T0-2 | Shared 包：创建 vitest.config.ts | T0-1 | ⬜ |
| T0-3 | Shared 包：创建 src/test/setup.ts | T0-2 | ⬜ |
| T0-4 | Shared 包：为 date.ts 编写单元测试 | T0-3 | ⬜ |
| T0-5 | Shared 包：为 date.ts 编写属性测试 | T0-4 | ⬜ |
| T0-6 | Shared 包：验证 pnpm test 可运行 | T0-5 | ⬜ |
| T1-1 | Web 包：安装测试依赖 | T0-6 | ⬜ |
| T1-2 | Web 包：创建 vitest.config.ts | T1-1 | ⬜ |
| T1-3 | Web 包：创建 src/test/setup.ts | T1-2 | ⬜ |
| T1-4 | Web 包：配置 MSW (server + handlers) | T1-3 | ⬜ |
| T1-5 | Web 包：为一个组件编写测试 | T1-4 | ⬜ |
| T1-6 | Web 包：验证 pnpm test 可运行 | T1-5 | ⬜ |
| T2-1 | App 包：安装测试依赖 | T1-6 | ⬜ |
| T2-2 | App 包：创建 jest.config.js | T2-1 | ⬜ |
| T2-3 | App 包：创建 jest-setup.ts (含原生模块 mock) | T2-2 | ⬜ |
| T2-4 | App 包：配置 MSW | T2-3 | ⬜ |
| T2-5 | App 包：为一个组件编写测试 | T2-4 | ⬜ |
| T2-6 | App 包：验证 pnpm test 可运行 | T2-5 | ⬜ |
| T3-1 | 根目录：添加测试脚本 | T2-6 | ⬜ |
| T3-2 | 根目录：验证 pnpm test 触发所有包 | T3-1 | ⬜ |
| T4-1 | 文档：创建 testing-guide.md | T3-2 | ⬜ |
| T5-1 | 治理层：更新 verification-before-completion | T4-1 | ⬜ |
| T5-2 | 治理层：创建 testing-rules.md | T5-1 | ⬜ |

状态：⬜ 待开始 | 🔄 进行中 | ✅ 已完成

---

## 阶段 0：Shared 包测试环境

### T0-1: 安装 Vitest + fast-check

**操作：**
```bash
cd packages/shared
pnpm add -D vitest fast-check
```

**验收：**
- [ ] package.json 包含 vitest 和 fast-check

---

### T0-2: 创建 vitest.config.ts

**操作：** 在 `packages/shared/` 下创建 `vitest.config.ts`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 文件存在且语法正确

---

### T0-3: 创建 src/test/setup.ts

**操作：** 创建 `packages/shared/src/test/setup.ts`

**内容：**
```typescript
// 全局测试配置
import { expect } from 'vitest';
```

**验收：**
- [ ] 文件存在

---

### T0-4: 为 date.ts 编写单元测试

**操作：** 创建 `packages/shared/src/utils/date.test.ts`

**内容：** 参考 design.md 中的示例

**验收：**
- [ ] 测试文件存在
- [ ] 覆盖 formatDate、parseDate、calculateWorkHours

---

### T0-5: 为 date.ts 编写属性测试

**操作：** 创建 `packages/shared/src/utils/date.property.test.ts`

**内容：** 参考 design.md 中的示例

**验收：**
- [ ] 测试文件存在
- [ ] 包含往返属性测试

---

### T0-6: 验证 pnpm test 可运行

**操作：**
```bash
cd packages/shared
pnpm test
```

**验收：**
- [ ] 命令执行成功
- [ ] 所有测试通过

---

## 阶段 1：Web 包测试环境

### T1-1: 安装测试依赖

**操作：**
```bash
cd packages/web
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw fast-check
```

**验收：**
- [ ] package.json 包含所有依赖

---

### T1-2: 创建 vitest.config.ts

**操作：** 在 `packages/web/` 下创建 `vitest.config.ts`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 文件存在且语法正确
- [ ] environment 设为 jsdom

---

### T1-3: 创建 src/test/setup.ts

**操作：** 创建 `packages/web/src/test/setup.ts`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 文件存在
- [ ] 导入 @testing-library/jest-dom
- [ ] 配置 MSW 生命周期

---

### T1-4: 配置 MSW

**操作：** 创建以下文件：
- `packages/web/src/test/mocks/server.ts`
- `packages/web/src/test/mocks/handlers/index.ts`
- `packages/web/src/test/mocks/handlers/department.ts`
- `packages/web/src/test/mocks/data/department.ts`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 所有文件存在
- [ ] handlers 导出正确

---

### T1-5: 为一个组件编写测试

**操作：** 选择一个现有组件（如 DepartmentSelect），创建测试文件

**内容：** 参考 design.md 中的示例

**验收：**
- [ ] 测试文件存在
- [ ] 测试使用 MSW mock API

---

### T1-6: 验证 pnpm test 可运行

**操作：**
```bash
cd packages/web
pnpm test
```

**验收：**
- [ ] 命令执行成功
- [ ] 所有测试通过
- [ ] MSW 正常拦截请求

---

## 阶段 2：App 包测试环境

### T2-1: 安装测试依赖

**操作：**
```bash
cd packages/app
pnpm add -D jest jest-expo @testing-library/react-native @testing-library/jest-native msw fast-check
```

**验收：**
- [ ] package.json 包含所有依赖

---

### T2-2: 创建 jest.config.js

**操作：** 在 `packages/app/` 下创建 `jest.config.js`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 文件存在且语法正确
- [ ] preset 设为 jest-expo

---

### T2-3: 创建 jest-setup.ts

**操作：** 创建 `packages/app/jest-setup.ts`

**内容：** 参考 design.md 中的配置

**验收：**
- [ ] 文件存在
- [ ] 包含 expo-location mock
- [ ] 包含 expo-secure-store mock
- [ ] 配置 MSW 生命周期

---

### T2-4: 配置 MSW

**操作：** 创建以下文件：
- `packages/app/src/test/mocks/server.ts`
- `packages/app/src/test/mocks/handlers/index.ts`

**内容：** 可复用 Web 包的 handlers

**验收：**
- [ ] 所有文件存在

---

### T2-5: 为一个组件编写测试

**操作：** 选择一个现有组件（如 ClockButton），创建测试文件

**内容：** 参考 design.md 中的示例

**验收：**
- [ ] 测试文件存在
- [ ] 测试使用原生模块 mock

---

### T2-6: 验证 pnpm test 可运行

**操作：**
```bash
cd packages/app
pnpm test
```

**验收：**
- [ ] 命令执行成功
- [ ] 所有测试通过
- [ ] 原生模块 mock 正常工作

---

## 阶段 3：根目录配置

### T3-1: 添加测试脚本

**操作：** 修改根目录 `package.json`

**内容：**
```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:shared": "pnpm --filter @attendance/shared test",
    "test:web": "pnpm --filter @attendance/web test",
    "test:app": "pnpm --filter @attendance/app test"
  }
}
```

**验收：**
- [ ] 脚本已添加

---

### T3-2: 验证 pnpm test 触发所有包

**操作：**
```bash
# 根目录
pnpm test
```

**验收：**
- [ ] 所有包的测试都被执行
- [ ] 所有测试通过

---

## 阶段 4：文档

### T4-1: 创建 testing-guide.md

**操作：** 创建 `docs/testing-guide.md`

**内容：**
- 如何运行测试
- 如何编写测试
- Mock 策略说明
- 测试命名规范
- 常见问题

**验收：**
- [ ] 文档存在
- [ ] 内容完整

---

## 阶段 5：治理层更新

### T5-1: 更新 verification-before-completion

**操作：** 修改 `.trae/skills/verification-before-completion/SKILL.md` 或 `.kiro/steering/` 中对应文件

**内容：** 在验证清单中添加测试命令

```markdown
## 验证命令

```bash
pnpm test          # 运行所有测试
pnpm test:web      # 运行 Web 测试
pnpm test:app      # 运行 App 测试
pnpm test:shared   # 运行 Shared 测试
```
```

**验收：**
- [ ] Skill 已更新
- [ ] 测试命令已添加到验证清单

---

### T5-2: 创建 testing-rules.md

**操作：** 创建 `.kiro/steering/testing-rules.md`

**内容：**
```markdown
# 测试规范

## 测试文件位置

测试文件与源码同目录（co-location）：

| 源码 | 测试 |
|------|------|
| src/utils/date.ts | src/utils/date.test.ts |
| src/hooks/useAuth.ts | src/hooks/useAuth.test.ts |

## 测试命名

| 类型 | 命名 |
|------|------|
| 单元测试 | *.test.ts / *.test.tsx |
| 属性测试 | *.property.test.ts |
| 集成测试 | *.integration.test.ts |

## 测试覆盖要求

- 业务逻辑：必须有单元测试
- 核心逻辑：推荐有属性测试
- 页面流程：推荐有集成测试

## Mock 策略

- 使用 MSW 在网络层 mock
- 不要 mock 内部实现
```

**验收：**
- [ ] 文件存在
- [ ] 内容完整

---

## 完成标准

所有任务完成后，必须验证：

1. **基础设施**
   - [ ] `pnpm test` 在根目录可运行
   - [ ] 三个包的测试都通过

2. **Skill 可用性**
   - [ ] TDD Skill 能正常工作（红-绿-重构）
   - [ ] code-verification 能运行属性测试
   - [ ] verification-before-completion 包含测试验证

3. **文档完整**
   - [ ] testing-guide.md 存在
   - [ ] testing-rules.md 存在
