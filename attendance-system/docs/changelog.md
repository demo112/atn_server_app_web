# 变更日志

## [2026-01-31]

### 新增
- feat(attendance): 新增考勤系统基础设置功能 (SW62)
  - 新增 AttendanceSettingsService 实现默认配置初始化
  - 新增 RESTful 接口 GET/PUT /api/v1/attendance/settings
  - 集成 Prisma AttSetting 模型
