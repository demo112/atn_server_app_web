# Requirements: SW69 原始考勤/打卡

## Overview

实现原始考勤数据的采集与管理功能。包括员工通过App打卡、管理员通过Web端手动打卡（代打卡），以及打卡记录的查询与导出。这是考勤系统的核心数据来源。

## User Stories

### Story 1: 员工App打卡
As a 员工, I want 在手机App上点击打卡, so that 记录我的上下班时间

**Acceptance Criteria:**
- [ ] AC1: 记录打卡时间（精确到秒）
- [ ] AC2: 记录打卡类型（上班/下班，或自动判断）
- [ ] AC3: 记录打卡设备信息（可选）
- [ ] AC4: 记录打卡位置（经纬度/地址）（可选）
- [ ] AC5: 只有登录状态下才能打卡

### Story 2: 管理员Web端代打卡
As a 管理员, I want 在Web后台帮员工补录打卡记录, so that 处理员工忘记打卡或设备故障的情况

**Acceptance Criteria:**
- [ ] AC1: 选择员工、日期、时间进行打卡
- [ ] AC2: 标记该记录为"管理员补录"或"手动"来源
- [ ] AC3: 记录操作人（管理员）ID

### Story 3: 打卡记录查询
As a 员工/管理员, I want 查询打卡记录, so that 核对出勤情况

**Acceptance Criteria:**
- [ ] AC1: 支持按时间范围查询
- [ ] AC2: 支持按员工ID查询
- [ ] AC3: 支持按部门查询（Web端）
- [ ] AC4: 列表显示：员工、时间、类型、来源、设备/位置

### Story 4: 考勤数据导出
As a 管理员, I want 导出打卡记录为Excel, so that 进行存档或线下分析

**Acceptance Criteria:**
- [ ] AC1: 支持按筛选条件导出
- [ ] AC2: 导出字段完整（含员工信息、打卡详情）

## Data Model Requirements

- **AttClockRecord Table**:
  - `id`: BigInt (考虑数据量大)
  - `employeeId`: 关联员工
  - `clockTime`: DateTime
  - `type`: Enum (SignIn, SignOut) - *Wait, simple systems might just be a record, interpretation happens later. But backlog says SW69-02 record clock-in.*
  - `source`: Enum (App, Web, Device)
  - `deviceInfo`: String/JSON
  - `location`: String/JSON
  - Indexes: `employeeId`, `clockTime`

## API Requirements

- `POST /api/v1/attendance/clock`: 打卡提交
- `GET /api/v1/attendance/clock`: 查询打卡记录（支持分页、筛选）
- `GET /api/v1/attendance/clock/export`: 导出（可能是生成下载链接）

## Constraints

- **性能**: 打卡接口高并发支持（虽然当前规模可能不大，但设计上要注意）
- **数据一致性**: 确保时间准确
- **存储**: 使用 BigInt 主键以支持海量数据

## Out of Scope

- 考勤结果计算（这是 SW62/SW63/SW64 配合计算引擎的工作，SW69只负责原始记录）
- 审批流程（补签申请是另一模块 SW66）

## Assumptions

- 暂时不需要复杂的防作弊校验（如人脸、Wifi指纹），仅基础GPS/设备信息记录。
