# 项目代码整改与规范对齐计划

## 阶段一：规则修订 (Rule Alignment)
### 目标
解决规则与现状的冲突，使规范更具可执行性。

### 任务清单
1. **更新文件结构规范**
   - 修改 `.trae/rules/03-file-structure.md`
   - 正式通过 `packages/shared` 的存在，明确其作为类型和工具共享层的地位。
2. **更新命名规范**
   - 修改 `.trae/rules/02-typescript.md`
   - 允许 React 组件 (`.tsx`) 使用 `PascalCase` 命名。
   - 维持非组件文件使用 `kebab-case`。
3. **同步业务规则文档**
   - 修改 `.trae/rules/naruto-rules.md`
   - 修正 App 端页面路径描述 (`screens/clock` -> `screens/attendance`)。

## 阶段二：代码质量治理 (Core Cleanup)
### 目标
消除 TypeScript 违规，恢复类型安全。

### 任务清单
1. **Server 端类型修复**
   - 扫描 `packages/server/src/modules/attendance`。
   - 将 `as any` 替换为具体的 DTO 或 Prisma 类型。
   - 为所有 `async` Service 方法添加显式 `Promise<T>` 返回类型。
2. **Web/App 端类型修复**
   - 修复 `ClockRecordPage.tsx` 中的 `any` 和 `!` 断言。
   - 修复 `attendance.ts` (Service) 中的泛型丢失问题。

## 阶段三：环境大扫除 (Housekeeping)
### 目标
清理调试痕迹，保持代码库整洁。

### 任务清单
1. **删除临时文件**
   - 删除 `packages/web/src/components/AntdTest.test.tsx`。
2. **清理调试日志**
   - 全局搜索并移除生产代码中的 `console.log` / `console.error`。
   - 确保关键错误通过 Logger 记录（Server 端）。