# 修复记录: 请假记录点击删除报错

## 问题描述
用户在“请假/出差管理”页面点击“删除”按钮时，出现“服务器错误”和“删除失败”的提示。

## 设计锚定
- **设计文档**: `docs/features/SW67/design.md`
- **原设计意图**: 
  - `DELETE /api/v1/leaves/:id` 用于删除请假记录。
  - `POST /api/v1/leaves/:id/cancel` 用于撤销请假记录（逻辑删除）。
- **偏离点**: 
  - 后端路由 `DELETE /:id` 错误地绑定到了 `cancel` 方法（逻辑删除）。
  - `LeaveController` 和 `LeaveService` 中缺失 `delete` 方法（物理删除）。
  - 前端调用 `DELETE` 接口时期望物理删除，但后端执行逻辑删除且可能因状态问题或权限问题（`cancel` 仅限 admin）导致混淆，最终因实现缺失或逻辑错误导致 500/404。

## 根因分析
1.  **路由绑定错误**: `DELETE /:id` 被绑定到了 `cancel` 方法。
2.  **功能缺失**: 后端未实现物理删除功能 (`delete` 方法)。
3.  **UI/API 不匹配**: 前端“删除”按钮调用 `DELETE` API，期望物理删除；而原后端实现只有“撤销”逻辑。

## 修复方案
1.  **LeaveService**: 新增 `delete(id)` 方法，执行物理删除。删除前检查记录是否存在，删除后如果原记录已通过，触发考勤重算。
2.  **LeaveController**: 新增 `delete` 方法，仅限管理员调用。
3.  **LeaveRoutes**: 
    - 将 `DELETE /:id` 绑定到 `leaveController.delete`。
    - 保留 `POST /:id/cancel` 用于撤销操作。

## 验证结果
- **单元测试**: 更新 `leave.integration.test.ts`，验证 `DELETE` 调用 `delete` 方法，`POST cancel` 调用 `cancel` 方法。测试通过。
- **回归验证**: `POST /cancel` 接口保留，前端撤销功能不受影响。

## 文档同步
- `docs/features/SW67/design.md` 已包含 `DELETE` 接口定义，无需修改。
- `api-contract.md` (如有) 应保持一致。

## 防回退关键词
- `leave delete`
- `physical delete`
- `cancel vs delete`
