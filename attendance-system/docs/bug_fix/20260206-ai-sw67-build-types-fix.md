# AI修复报告: SW67构建类型错误修复

## 问题描述
运行 `pnpm --filter @attendance/web build` 时出现多个 TypeScript 编译错误，阻碍了 CI/CD 流程和代码提交。

主要错误包括：
1. `leave.test.tsx`: Mock 函数返回值类型不匹配 (`mockResolvedValue` 缺少参数或结构错误)。
2. `Header.test.tsx`: `window.location` 赋值类型错误。
3. `CorrectionPage.tsx`: 存在未使用的变量。

## 根本原因
1. **测试 Mock 不准确**: `leaveService.cancelLeave` 返回 `Promise<LeaveVo>`，但测试中 mock 返回了 `undefined`。`leaveService.getLeaves` 返回 `{ items, meta }` 结构，但 mock 返回了扁平结构。Mock 数据缺少 `updatedAt` 字段。
2. **环境模拟类型冲突**: 在 JSDOM 环境下 `window.location` 是只读或特定类型，直接赋值 mock 对象导致 TS 类型兼容性错误。
3. **代码清理不彻底**: 开发过程中残留了未使用的 imports 和 state。

## 修复方案
1. **修正 Mock 数据**:
   - 完善 `mockLeaves` 数据，补充 `updatedAt`。
   - 修正 `getLeaves` mock 返回值为嵌套结构 `{ items, meta }`。
   - 修正 `cancelLeave` mock 返回值为 `LeaveVo` 对象。

2. **修正类型断言**:
   - 在 `Header.test.tsx` 中使用 `as any` 强制转换 `window.location` 恢复操作，绕过类型检查（在测试环境中是安全的）。

3. **清理代码**:
   - 删除 `CorrectionPage.tsx` 中未使用的 `useState`。

## 验证结果
执行 `pnpm --filter @attendance/web build` 成功通过，无 TypeScript 错误。

## 影响范围
- `packages/web/src/__tests__/integration/leave/leave.test.tsx`
- `packages/web/src/components/layout/Header.test.tsx`
- `packages/web/src/pages/attendance/correction/CorrectionPage.tsx`
