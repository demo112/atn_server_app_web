# 中文错误提示修复记录

## 问题描述
- 现象：App 弹窗英文错误信息，如“employeeId is required for admin”
- 复现步骤：管理员在请假模块创建记录且未选择员工时触发
- 影响范围：请假接口返回提示、App 端通用错误展示

## 设计锚定
- 所属规格：UA1/考勤与权限控制
- 原设计意图：错误提示需面向中文用户，统一且友好
- 当前偏离：服务端与客户端存在英文文案

## 根因分析
- 直接原因：服务端抛出的 AppError 使用英文 message；客户端仅部分错误码做了中文映射
- 根本原因：未统一中文化策略，代码中零散英文提示未覆盖
- 相关代码：packages/server/src/modules/attendance/leave.controller.ts

## 修复方案
- 修复思路：最小改动，保留错误码不变，统一将 message 改为中文；客户端补充错误码与常见英文短语到中文映射
- 改动文件：
  - packages/server/src/modules/attendance/leave.controller.ts：将管理员必填 employeeId 等提示改为中文
  - packages/app/src/utils/error-handler.ts：补充错误码与英文短语的中文映射
  - packages/app/src/utils/error.ts：同上，用于通用错误消息获取

## 验证结果
- 原问题已解决：调用 POST /api/v1/attendance/leaves 不传 employeeId 返回中文“管理员创建请假时必须指定员工（employeeId）”
- 回归测试：手动调用接口验证通过；App 端使用统一映射将英文短语翻译为中文
- 设计一致性确认：符合中文提示要求，不改动 API 契约

## 文档同步
- design.md：不需更新（提示语言变更不影响契约）
- api-contract.md：不需更新

## 提交信息
fix(attendance): 统一请假模块与App错误提示中文化

