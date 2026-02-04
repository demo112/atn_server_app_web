# CONSENSUS - 属性测试实施 (Phase 2)

## 1. 核心共识
- **实施目标**: "聚焦App"，通过在 Node.js 环境下运行属性测试，解决 App 端因环境不稳定导致的测试难题。
- **实施策略**: **逻辑剥离 (Logic Extraction)**。将业务逻辑从 UI/Network 副作用中剥离为纯函数。

## 2. 交付物清单
| ID | 交付物 | 说明 |
|----|--------|------|
| D1 | `packages/app/src/utils/error-handler.ts` | 重构后的纯逻辑错误处理器 |
| D2 | `packages/app/src/utils/__tests__/error-handler.prop.test.ts` | 错误处理逻辑的 PBT |
| D3 | `packages/app/src/utils/__tests__/request.prop.test.ts` | API 响应验证的 PBT |
| D4 | `packages/app/src/schemas/__tests__/attendance.prop.test.ts` | 考勤核心数据结构的 PBT |

## 3. 风险与缓解
- **风险**: 重构 `request.ts` 可能破坏现有功能。
- **缓解**: 
  - 保持 `request.ts` 的对外接口不变。
  - 仅提取逻辑，保留原有副作用调用代码。
  - 先写测试，再重构 (如果可能)，或者重构后立即手动验证。

## 4. 下一步行动
请确认执行 **Phase 5: Automate**，我将按照 T1 -> T4 的顺序执行代码修改和测试编写。
