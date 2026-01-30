# 数据库设计

## 一、模块归属

| 模块 | 负责人 | 表前缀 |
|------|--------|--------|
| 用户/组织 | 人A | `user_`, `dept_`, `device_` |
| 考勤 | 人B | `att_` |

---

## 二、表结构设计

### 用户/组织模块（人A）

#### employees - 人员表（核心考勤主体）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| employee_no | VARCHAR(50) | 人员编号，唯一 |
| name | VARCHAR(100) | 姓名 |
| phone | VARCHAR(20) | 手机号 |
| email | VARCHAR(100) | 邮箱 |
| dept_id | INT | 部门ID，外键 |
| status | ENUM | active/inactive/resigned |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### users - 用户表（系统登录账号）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名，唯一 |
| password_hash | VARCHAR(255) | 密码哈希 |
| employee_id | INT | 关联人员ID，外键，唯一（一个用户对应一个人员） |
| status | ENUM | active/disabled |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### departments - 部门表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 部门名称 |
| parent_id | INT | 父部门ID，自引用 |
| sort_order | INT | 排序 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### devices - 设备表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 设备名称 |
| sn | VARCHAR(100) | 设备序列号，唯一 |
| type | ENUM | 设备类型 |
| location | VARCHAR(200) | 安装位置 |
| supports_temperature | BOOLEAN | 是否支持体温检测 |
| supports_mask | BOOLEAN | 是否支持口罩检测 |
| status | ENUM | online/offline/disabled |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### 考勤模块（人B）

#### att_time_periods - 时间段表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 时间段名称 |
| type | ENUM | normal/flexible（普通/弹性） |
| work_start | TIME | 上班时间 |
| work_end | TIME | 下班时间 |
| check_in_start | TIME | 签到开始时间 |
| check_in_end | TIME | 签到结束时间 |
| check_out_start | TIME | 签退开始时间 |
| check_out_end | TIME | 签退结束时间 |
| require_check_in | BOOLEAN | 是否必须签到 |
| require_check_out | BOOLEAN | 是否必须签退 |
| late_rule | JSON | 迟到规则 |
| early_leave_rule | JSON | 早退规则 |
| absent_check_in_rule | JSON | 未签到规则 |
| absent_check_out_rule | JSON | 未签退规则 |
| flex_calc_method | ENUM | first_last/pair（首尾/两两） |
| flex_min_interval | INT | 有效打卡间隔（分钟） |
| flex_daily_hours | DECIMAL | 每日工作时长 |
| flex_day_switch | TIME | 跨天切换点 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### att_shifts - 班次表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 班次名称 |
| cycle_days | INT | 周期天数（默认7） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### att_shift_periods - 班次时间段关联表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| shift_id | INT | 班次ID |
| period_id | INT | 时间段ID |
| day_of_cycle | INT | 周期内第几天（1-7） |
| sort_order | INT | 排序 |

#### att_schedules - 排班表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| employee_id | INT | 人员ID |
| shift_id | INT | 班次ID |
| start_date | DATE | 生效开始日期 |
| end_date | DATE | 生效结束日期 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### att_clock_records - 原始打卡记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| employee_id | INT | 人员ID |
| device_id | INT | 设备ID |
| clock_time | DATETIME | 打卡时间 |
| temperature | DECIMAL(3,1) | 体温 |
| mask_status | ENUM | none/wearing/not_wearing |
| created_at | DATETIME | 创建时间 |

#### att_daily_records - 每日考勤记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| employee_id | INT | 人员ID |
| work_date | DATE | 工作日 |
| shift_id | INT | 班次ID |
| period_id | INT | 时间段ID |
| check_in_time | DATETIME | 签到时间 |
| check_out_time | DATETIME | 签退时间 |
| status | ENUM | normal/late/early_leave/absent/leave |
| actual_hours | DECIMAL(5,2) | 实际出勤时长 |
| effective_hours | DECIMAL(5,2) | 有效出勤时长 |
| late_minutes | INT | 迟到分钟数 |
| early_leave_minutes | INT | 早退分钟数 |
| absent_minutes | INT | 缺勤分钟数 |
| remark | VARCHAR(500) | 备注 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### att_corrections - 补签记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| employee_id | INT | 人员ID（被补签人） |
| daily_record_id | BIGINT | 关联的每日记录ID |
| type | ENUM | check_in/check_out（补签到/补签退） |
| correction_time | DATETIME | 补签时间 |
| operator_id | INT | 操作人用户ID（users.id） |
| created_at | DATETIME | 操作时间 |

#### att_leaves - 请假/出差记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| employee_id | INT | 人员ID |
| type | ENUM | annual/sick/personal/business_trip/... |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间 |
| reason | VARCHAR(500) | 备注/原因 |
| apply_time | DATETIME | 申请时间 |
| status | ENUM | pending/approved/rejected |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### att_settings - 考勤设置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| key | VARCHAR(50) | 设置键 |
| value | JSON | 设置值 |
| description | VARCHAR(200) | 说明 |
| updated_at | DATETIME | 更新时间 |

默认设置：
- `day_switch_time`: "05:00" （考勤日切换时间）
- `data_retention_years`: 2 （数据保留年限）

---

## 三、索引设计

### 高频查询索引

```sql
-- 打卡记录按人员+时间查询
CREATE INDEX idx_clock_emp_time ON att_clock_records(employee_id, clock_time);

-- 每日记录按人员+日期查询
CREATE INDEX idx_daily_emp_date ON att_daily_records(employee_id, work_date);

-- 排班按人员+日期范围查询
CREATE INDEX idx_schedule_emp_date ON att_schedules(employee_id, start_date, end_date);

-- 人员按部门查询
CREATE INDEX idx_employee_dept ON employees(dept_id);

-- 用户按人员查询
CREATE INDEX idx_user_employee ON users(employee_id);
```

---

## 四、数据保留策略

| 表 | 保留期限 | 清理策略 |
|------|----------|----------|
| att_clock_records | 2年 | 定时任务归档/删除 |
| att_daily_records | 2年 | 定时任务归档/删除 |
| 其他 | 永久 | - |
