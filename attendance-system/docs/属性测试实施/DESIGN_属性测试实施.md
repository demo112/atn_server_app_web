# DESIGN - 属性测试实施架构 (Phase 2: App Focus)

## 1. 架构目标
在 Node.js 环境下构建 App 端核心逻辑的健壮性验证体系，绕过不稳定的模拟器/真机环境。

## 2. 分层架构设计

### Layer 1: 纯函数工具层 (Utils)
- **目标**: 验证无副作用的工具函数。
- **对象**: 
  - `utils/request.ts` -> `validateResponse` (API 契约验证)
  - `utils/error-handler.ts` (从 request.ts 提取的错误逻辑)
  - `utils/auth.ts` (已覆盖)

### Layer 2: 数据契约层 (Schemas)
- **目标**: 验证 Zod Schema 对脏数据的防御能力。
- **对象**: 
  - `schemas/attendance.ts` (打卡、请假、补卡数据结构)
  - `schemas/auth.ts` (已覆盖)
  - `schemas/user.ts`

### Layer 3: 业务逻辑层 (Hooks/Services)
- **目标**: 验证状态流转和数据转换。
- **策略**: 将 Services 中的数据转换逻辑剥离为 Pure Functions。
- **对象**:
  - `services/attendance.ts` (如果包含数据转换)

## 3. 核心组件设计

### 3.1 错误处理提取器
为了测试 API 错误处理逻辑，需将 `AxiosInterceptor` 中的逻辑提取为纯函数：
```typescript
// utils/error-handler.ts
export function analyzeError(status: number, data: any): ErrorAction {
  // 返回纯对象描述应该做什么 (Alert, ClearAuth, etc.)
  // 而不是直接调用副作用
}
```

### 3.2 契约验证器测试
针对 `validateResponse` 的 PBT：
- **Property**: 对于任何符合 Schema 的数据，`validateResponse` 必须返回该数据。
- **Property**: 对于任何不符合 Schema 的数据，`validateResponse` 必须抛出 Validation Error。

## 4. 目录结构变更
```
packages/app/src/
├── utils/
│   ├── error-handler.ts       <-- New (Extracted logic)
│   ├── __tests__/
│   │   ├── error-handler.prop.test.ts
│   │   └── request.prop.test.ts
├── schemas/
│   ├── __tests__/
│       └── attendance.prop.test.ts
```
