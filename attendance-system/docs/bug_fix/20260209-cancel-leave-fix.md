# 修复记录：撤销功能报错

## 1. 问题描述
用户反馈在 Web 端点击“撤销”按钮时报错。
前端抛出验证错误，提示撤销失败。

## 2. 设计锚定
- **所属规格**: SW67 (请假/出差管理)
- **设计文档**: `docs/features/SW67/design.md`
- **原设计意图**:
  - 后端提供撤销接口，更新状态为 `cancelled`。
  - 前端调用接口并刷新列表。
- **偏离分析**:
  - **后端实现**: `LeaveService.cancel` 返回更新后的 `LeaveVo` 对象。
  - **前端契约**: `packages/web/src/services/leave.ts` 中 `cancelLeave` 定义期望返回 `{ id: number }`。
  - **偏离类型**: 契约偏离 (Type Mismatch)。

## 3. 根因分析
前端 `cancelLeave` 方法使用了错误的 Zod 验证 Schema：
```typescript
validateResponse(z.object({ id: z.number() }), res);
```
而后端返回的是完整的 `LeaveVo` 对象，导致 Zod 验证失败，抛出异常。

## 4. 修复方案
修改前端 `packages/web/src/services/leave.ts`，将 `cancelLeave` 的响应类型校验从 `{ id: number }` 改为 `LeaveVoSchema`。

```typescript
export const cancelLeave = async (id: number, reason: string): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>(`/leaves/${id}/cancel`, { reason });
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};
```

## 5. 关联组件清单
- `packages/web/src/services/leave.ts`
- `packages/web/src/pages/attendance/leave/LeavePage.tsx` (调用方，无需修改)

## 6. 验证结果
- [x] **原问题解决**: 静态类型检查通过，契约对齐。
- [x] **回归测试**: `npm run build` 在 Web 端通过。
- [x] **设计一致性**: 符合后端实际返回数据结构。
- [x] **编译通过**: 无类型错误。

## 7. 文档同步
- 纯代码契约修复，无需更新设计文档。

## 8. 防回退关键词
- `cancelLeave`
- `LeaveVoSchema`
- `validateResponse`
