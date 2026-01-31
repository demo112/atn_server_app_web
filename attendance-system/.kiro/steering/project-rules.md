# 考勤系统项目规则

## 项目概述

三端考勤管理系统，包含 Server（后端服务）、Web（管理端）、App（移动打卡端）。

## 技术栈

| 模块 | 技术 |
|------|------|
| Server | Node.js + Express + TypeScript + Prisma |
| Web | React + TypeScript + Vite |
| App | React Native + Expo + TypeScript |
| 共享 | @attendance/shared（类型定义） |

## 代码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getUserInfo` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类/类型 | PascalCase | `AttendanceRecord` |
| 文件 | kebab-case | `user-service.ts` |

### API 规范

| 项目 | 规范 |
|------|------|
| 路径格式 | `/api/v1/{resource}` |
| 方法 | GET 查询、POST 创建、PUT 更新、DELETE 删除 |
| 响应格式 | `{ success: boolean, data?: T, error?: { code, message } }` |
| 错误码 | `ERR_{MODULE}_{TYPE}`，如 `ERR_USER_NOT_FOUND` |

### 文件组织

```
packages/server/src/
├── modules/           # 业务模块
│   ├── user/          # sasuke 负责
│   ├── employee/      # sasuke 负责
│   ├── department/    # sasuke 负责
│   ├── stats/         # sasuke 负责
│   └── attendance/    # naruto 负责
├── common/            # 公共代码
└── config/            # 配置
```

## 分工边界

### sasuke 负责模块

- 用户管理（users 表）
- 人员管理（employees 表）
- 部门管理（departments 表）
- 统计报表（SW70、SW71、SW72）

### naruto 负责模块

- 考勤配置（att_time_periods、att_shifts、att_shift_periods、att_schedules、att_settings）
- 考勤数据（att_clock_records、att_daily_records、att_corrections、att_leaves）
- 对应规格：SW62-SW69

## 关键文档

- 需求规格：#[[file:docs/requirements.md]]
- 需求分析：#[[file:docs/requirement-analysis.md]]
- 数据库设计：#[[file:docs/database-design.md]]
- 项目路线图：#[[file:docs/project-roadmap.md]]
- 任务清单：#[[file:docs/task-backlog.md]]
- API 契约：#[[file:docs/api-contract.md]]
- 共享类型：#[[file:packages/shared/src/types/index.ts]]
- Prisma Schema：#[[file:packages/server/prisma/schema.prisma]]
