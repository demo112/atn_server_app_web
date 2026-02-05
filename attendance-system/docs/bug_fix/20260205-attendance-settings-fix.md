# 考勤设置接口报错修复记录

## 问题描述
- **现象**：前端访问 `/api/v1/attendance/settings` 报错 `net::ERR_ABORTED`。
- **复现步骤**：
  1. 启动 Server 和 Web 端。
  2. 进入考勤设置页面。
  3. 观察 Console 报错。
- **影响范围**：考勤设置页面无法加载配置。

## 设计锚定
- **所属规格**：SW62 (考勤规则/设置)
- **原设计意图**：`GET /api/v1/attendance/settings` 应返回当前考勤配置。
- **当前偏离**：后端接口 Crash，未正确响应。

## 根因分析
- **直接原因**：`AttendanceSettingsController` 方法丢失 `this` 上下文。
- **根本原因**：在 `attendance.routes.ts` 中注册路由时，直接传递了 `attendanceSettingsController.getSettings` 而没有绑定实例，导致运行时访问 `this.logger` 失败。
- **相关代码**：`packages/server/src/modules/attendance/attendance.routes.ts`

## 修复方案
- **修复思路**：在注册路由时使用 `.bind()` 显式绑定上下文。
- **改动文件**：
  - `packages/server/src/modules/attendance/attendance.routes.ts`

## 验证结果
- [x] 代码逻辑审查通过：已添加 `.bind()`。
- [x] 对比其他 Controller (如 ClockController) 确认模式一致。

## 提交信息
fix(attendance): 修复考勤设置接口上下文丢失导致的崩溃
