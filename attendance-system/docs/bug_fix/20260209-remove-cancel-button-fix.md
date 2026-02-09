# 20260209-remove-cancel-button-fix

## 问题描述
用户要求移除 Web 端请假列表中的“撤销”按钮及相关功能。

## 设计锚定
- **原设计**：`docs/features/SW67/design.md` 中定义了撤销功能，允许员工在待审批状态下撤销申请。
- **变更意图**：根据用户指令，从 UI 层移除撤销入口，禁止用户自行撤销。
- **关联文档**：无需修改 `design.md` 的 API 定义，因为后端 API 仍需保留（管理员可能需要撤销，或者未来恢复）。仅修改前端表现。

## 根因分析
- **类型**：功能变更/移除。
- **原因**：业务需求变更，不再允许员工自行撤销。

## 修复方案
1. **Web 端 (`packages/web/src/pages/attendance/leave/LeavePage.tsx`)**:
   - 移除列表中的“撤销”按钮。
   - 移除 `handleCancel` 函数。
   - 移除 `cancelLeave` 的 import。
2. **测试 (`packages/web/src/__tests__/integration/leave/leave.test.tsx`)**:
   - 移除撤销功能的集成测试用例。
   - 移除 `cancelLeave` 的 mock。
   - 修复其他测试用例中因文本变更（确定 -> 保存）和匹配逻辑导致的失败。

## 关联组件清单
- **已修改**: `packages/web/src/pages/attendance/leave/LeavePage.tsx`
- **未修改 (需确认)**: `packages/app/src/screens/attendance/LeaveScreen.tsx` (App 端也有撤销按钮，暂未处理，待用户确认)。

## 验证结果
- **Web 端测试**: `npm test src/__tests__/integration/leave/leave.test.tsx`
  - 结果: 3 passed (Render list, Create leave, Handle error)
  - 证据:
    ```
    Test Files  1 passed (1)
    Tests  3 passed (3)
    ```

## 文档同步
- 无需同步 API 文档。
- 建议后续更新产品手册（如有）。

## 防回退关键词
- `cancel button`
- `撤销按钮`

## 设计决策摘要
- 仅从 UI 移除入口，不禁用后端 API，保留灵活性。
- 修复了测试中因 mock 不完整（缺 `updateLeave`/`deleteLeave`）导致的潜在问题。
