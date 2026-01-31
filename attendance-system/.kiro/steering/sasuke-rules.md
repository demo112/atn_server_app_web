---
inclusion: manual
---

# Sasuke 工作规则

## 身份

你正在协助 sasuke 开发考勤系统的用户/组织/统计模块。

## 负责范围

### 数据库表

| 表名 | 说明 |
|------|------|
| users | 用户账号 |
| employees | 人员档案 |
| departments | 部门 |

### 代码目录

| 目录 | 说明 |
|------|------|
| packages/server/src/modules/user/ | 用户模块 |
| packages/server/src/modules/employee/ | 人员模块 |
| packages/server/src/modules/department/ | 部门模块 |
| packages/server/src/modules/stats/ | 统计模块 |
| packages/web/src/pages/user/ | 用户页面 |
| packages/web/src/pages/employee/ | 人员页面 |
| packages/web/src/pages/department/ | 部门页面 |
| packages/web/src/pages/stats/ | 统计页面 |
| packages/app/src/screens/auth/ | App 登录 |
| packages/app/src/screens/profile/ | App 个人中心 |

### API 路径

| 路径前缀 | 说明 |
|----------|------|
| /api/v1/auth/* | 认证相关 |
| /api/v1/users/* | 用户管理 |
| /api/v1/employees/* | 人员管理 |
| /api/v1/departments/* | 部门管理 |
| /api/v1/stats/* | 统计报表 |

### 功能规格

| 规格 | 说明 |
|------|------|
| SW70 | 考勤汇总 |
| SW71 | 考勤明细 |
| SW72 | 统计报表 |

## 禁止操作

❌ 不要修改以下目录/文件：
- packages/server/src/modules/attendance/
- packages/web/src/pages/attendance/
- packages/app/src/screens/clock/
- att_* 开头的数据库表

这些是 naruto 负责的模块。

## 跨模块接口

### 你需要提供给 naruto 的接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取部门树 | GET | /api/v1/departments/tree | 返回完整部门树 |
| 获取部门人员 | GET | /api/v1/departments/:id/employees | 返回部门下所有人员 |
| 获取人员信息 | GET | /api/v1/employees/:id | 返回单个人员详情 |
| 批量获取人员 | POST | /api/v1/employees/batch | 批量查询人员信息 |

### 你需要调用 naruto 的接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取每日考勤记录 | GET | /api/v1/attendance/daily | 统计模块需要 |
| 获取考勤汇总数据 | GET | /api/v1/attendance/summary | 统计模块需要 |

## 任务清单

当前 Sprint 任务请参考：#[[file:docs/task-backlog.md]]

功能文档位置：docs/features/{SPEC_ID}/（如 SW70、SW71、SW72）

筛选条件：负责人 = sasuke
