# SW67 请假/出差处理 - 任务拆分

## 任务列表

| ID | 任务 | 负责人 | 状态 |
|----|------|--------|------|
| T1 | Server - 请假API实现 | naruto | ✅ |
| T2 | Web - 请假申请列表与审批 | naruto | ⬜ |

## 详细描述

### T1: Server - 请假API实现
已完成。

### T2: Web - 请假申请列表与审批
- **文件**: `packages/web/src/pages/attendance/leave/LeavePage.tsx`
- **内容**:
  - 增加“通过”/“驳回”操作按钮（仅管理员可见）。
  - 调用 `update` 接口修改状态。
- **验证**: 管理员点击通过，记录状态变更为 Approved。
