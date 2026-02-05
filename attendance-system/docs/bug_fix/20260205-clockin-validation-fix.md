# 上班打卡响应校验失败 修复记录

## 问题描述
- 现象：App 端点击“上班打卡”后弹窗提示“Response validation failed”，控制台出现 ZodError
- 复现步骤：登录 App → 进入“考勤打卡”页面 → 点击“上班打卡”
- 影响范围：App 端打卡接口 POST /api/v1/attendance/clock 的响应解析

## 设计锚定
- 所属规格：SW69
- 原设计意图：打卡接口返回 AttClockRecordVo，其中 operatorId 允许为 null（Web 代打卡时记录操作人，App 自助打卡为 null）
- 当前偏离：App 端 ClockRecordSchema 将 operatorId 定义为可选 number，但不接受 null

## 根因分析
- 直接原因：服务端返回 operatorId: null，Zod Schema 不接受 → 校验失败
- 根本原因：前后端对契约中 null 可选值约定不一致（设计允许 null，前端未对 null 兼容）
- 相关代码：packages/app/src/schemas/attendance.ts: ClockRecordSchema.operatorId

## 修复方案
- 修复思路：遵循设计文档，将 operatorId Schema 改为可为空并归一化为 undefined，最小改动修复
- 改动文件：packages/app/src/schemas/attendance.ts

## 验证结果
- [ ] 原问题已解决（等待用户端交互验证）
- [x] 回归测试通过（App 模块基础用例运行）
- [x] 设计一致性确认（与 SW69 一致）

## 文档同步
- [x] design.md：无需更新（契约本身正确）
- [x] api-contract.md：无需更新

## 提交信息
fix(app): 上班打卡响应校验兼容 operatorId 为 null
