# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **[UA1] 用户管理与认证**
  - 服务层: 实现 Auth 模块 (登录/JWT) 和 User 模块 (CRUD)
  - Web端: 实现登录页面和用户管理页面
  - App端: 实现登录功能和 Token 存储
  - 公共: 定义 User 相关 DTO/VO 类型

- **[SW69] 原始考勤/打卡功能**
  - 数据层: 更新 `AttClockRecord` 模型，支持 `ClockType` (签到/签退) 和 `ClockSource` (App/Web/Device)
  - 服务层: 实现打卡记录的创建与查询逻辑，支持关联信息 (员工/部门/操作人) 返回
  - 接口层: 新增 `POST /api/v1/attendance/clock` (打卡) 和 `GET /api/v1/attendance/clock` (查询) 接口
  - 规范: 完善 API 契约文档，定义打卡相关接口规范
