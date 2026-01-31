# 变更日志

## [2026-01-31]

### 新增
- feat(attendance): 新增班次管理功能 (SW64)
  - 新增 AttendanceShiftService 实现班次 CRUD
  - 新增 RESTful 接口 /api/v1/attendance/shifts
  - 实现班次与时间段的按天聚合配置
- feat(attendance): 新增时间段配置功能 (SW63)
  - 新增 AttendancePeriodService 实现时间段 CRUD
  - 新增 RESTful 接口 /api/v1/attendance/time-periods
  - 更新 AttTimePeriod 数据模型支持固定/弹性班制
- feat(attendance): 新增考勤系统基础设置功能 (SW62)
  - 新增 AttendanceSettingsService 实现默认配置初始化
  - 新增 RESTful 接口 GET/PUT /api/v1/attendance/settings
  - 集成 Prisma AttSetting 模型
