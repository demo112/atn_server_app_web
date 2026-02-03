# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **[SW71] 考勤明细与日历**
  - Server: 新增 `GET /statistics/details` (明细查询) 和 `GET /statistics/calendar` (日历视图)
  - Web: 实现考勤明细页面，支持多维筛选与手动重算
  - App: 新增考勤日历视图与管理员明细查询功能
  - 架构: 统一 Web/App 明细查询接口，后端驱动权限过滤

- **[SW70] 考勤汇总与定时计算**
  - 架构: 采用每日定时预计算 (BullMQ) + 实时SQL聚合的混合模式
  - Server: 实现 `AttendanceScheduler` 定时任务，优化 `StatisticsService` 聚合查询
  - Web: 新增考勤汇总页面 (支持导出Excel)，考勤配置增加 `auto_calc_time` 选项
  - API: 新增 `POST /statistics/calculate` 手动触发接口

- **[UA1] 用户管理与认证**
  - 服务层: 实现 Auth 模块 (登录/JWT) 和 User 模块 (CRUD)
  - Web端: 实现登录页面和用户管理页面
  - App端: 实现登录功能和 Token 存储
  - 公共: 定义 User 相关 DTO/VO 类型

- **[SW69] 原始考勤/打卡功能**
  - 数据层: 更新 `AttClockRecord` 模型，支持 `ClockType` (签到/签退) 和 `ClockSource` (App/Web/Device)
  - 服务层: 实现打卡记录的创建与查询逻辑，支持关联信息 (员工/部门/操作人) 返回
  - 接口层: 新增 `POST /api/v1/attendance/clock` (打卡) 和 `GET /api/v1/attendance/clock` (查询) 接口
  - Web端: 实现考勤记录查询与管理员补录功能
  - App端: 实现打卡界面，支持定位与设备信息获取
  - 规范: 完善 API 契约文档，定义打卡相关接口规范

- **[SW64] 班次管理**
  - Web端: 实现班次列表管理、创建/编辑班次（支持复杂周期与时间段配置）

- **[SW67] 请假/出差管理**
  - Web端: 实现请假申请列表与管理页面，支持撤销功能
  - App端: 实现请假申请提交与历史记录查询

- **[SW68] 补签记录管理**
  - Web端: 实现补签申请列表与管理页面
  - App端: 实现补签申请提交与历史记录查询
  - Shared: 补充 `CreateShiftDto`, `CorrectionType` 等类型定义
