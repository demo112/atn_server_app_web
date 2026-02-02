
# 设计文档：SW70 考勤汇总

## 接口设计

### GET /api/v1/statistics/summary

**请求参数 (Query)**
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- deptId?: number
- employeeId?: number

**响应数据**
- success: true
- data: AttendanceSummaryVo[]

## 数据模型

使用 `AttDailyRecord` (SW69) 和 `AttLeave` 进行聚合计算。
不存储汇总结果，实时计算。
