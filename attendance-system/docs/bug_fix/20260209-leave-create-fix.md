# 请假创建失败修复

## 问题描述
用户反馈请假创建失败，提示“服务器错误”。
经排查，原因为后端 Prisma 严格校验 Enum 类型，而前端（可能是旧版本或特定入口）可能传递了中文类型标签（如“事假”）而非 Enum 值（如“personal”），导致 `PrismaClientValidationError`，引发 500 错误。

## 根因分析
1.  **直接原因**：API 接收到的 `type` 字段值为中文（如 "事假"），不符合 `LeaveType` Enum 定义。
2.  **根本原因**：后端缺乏对输入类型的宽容处理或映射机制，直接透传给 ORM 层导致崩溃。

## 修复方案
在 `LeaveService.create` 方法中增加类型映射逻辑：
- 检查 `type` 是否为有效 Enum 值。
- 若无效，尝试将中文标签映射为对应的 `LeaveType` Enum。
- 若映射失败，抛出 400 `ERR_INVALID_PARAMS`（而非 500）。

## 关联组件
- `packages/server/src/modules/attendance/leave.service.ts`

## 验证结果
- **测试用例 1**：传入标准 Enum (`personal`) -> **成功** (2027年无冲突时段)
- **测试用例 2**：传入中文 (`事假`) -> **成功** (自动映射为 `personal`)
- **测试用例 3**：传入无效字符 (`Invalid`) -> **失败** (捕获为 400 错误)

## 影响范围
- 仅影响请假创建接口 (`POST /api/v1/leaves`)。
- 增强了接口鲁棒性，不影响现有正确调用。

## 防回退关键词
- LeaveType mapping
- Chinese character compatibility
