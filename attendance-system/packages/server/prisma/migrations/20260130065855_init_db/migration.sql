-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_no` VARCHAR(50) NOT NULL COMMENT '人员编号，唯一',
    `name` VARCHAR(100) NOT NULL COMMENT '姓名',
    `phone` VARCHAR(20) NULL COMMENT '手机号',
    `email` VARCHAR(100) NULL COMMENT '邮箱',
    `dept_id` INTEGER NULL COMMENT '部门ID，外键',
    `status` ENUM('active', 'inactive', 'resigned') NOT NULL DEFAULT 'active' COMMENT '状态：active/inactive/resigned',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    UNIQUE INDEX `employees_employee_no_key`(`employee_no`),
    INDEX `employees_dept_id_idx`(`dept_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '人员表（核心考勤主体）';

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名，唯一',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `employee_id` INTEGER NOT NULL COMMENT '关联人员ID，外键，唯一（一个用户对应一个人员）',
    `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active' COMMENT '状态：active/disabled',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用户表（系统登录账号）';

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '部门名称',
    `parent_id` INTEGER NULL COMMENT '父部门ID，自引用',
    `sort_order` INTEGER NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '部门表';

-- CreateTable
CREATE TABLE `devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '设备名称',
    `sn` VARCHAR(100) NOT NULL COMMENT '设备序列号，唯一',
    `type` ENUM('face', 'fingerprint', 'card') NOT NULL DEFAULT 'face' COMMENT '设备类型',
    `location` VARCHAR(200) NULL COMMENT '安装位置',
    `supports_temperature` BOOLEAN NOT NULL DEFAULT false COMMENT '是否支持体温检测',
    `supports_mask` BOOLEAN NOT NULL DEFAULT false COMMENT '是否支持口罩检测',
    `status` ENUM('online', 'offline', 'disabled') NOT NULL DEFAULT 'offline' COMMENT '设备状态',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    UNIQUE INDEX `devices_sn_key`(`sn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '设备表';

-- CreateTable
CREATE TABLE `att_time_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '时间段名称',
    `type` ENUM('normal', 'flexible') NOT NULL DEFAULT 'normal' COMMENT '类型：normal/flexible（普通/弹性）',
    `work_start` TIME NULL COMMENT '上班时间',
    `work_end` TIME NULL COMMENT '下班时间',
    `check_in_start` TIME NULL COMMENT '签到开始时间',
    `check_in_end` TIME NULL COMMENT '签到结束时间',
    `check_out_start` TIME NULL COMMENT '签退开始时间',
    `check_out_end` TIME NULL COMMENT '签退结束时间',
    `require_check_in` BOOLEAN NOT NULL DEFAULT true COMMENT '是否必须签到',
    `require_check_out` BOOLEAN NOT NULL DEFAULT true COMMENT '是否必须签退',
    `late_rule` JSON NULL COMMENT '迟到规则',
    `early_leave_rule` JSON NULL COMMENT '早退规则',
    `absent_check_in_rule` JSON NULL COMMENT '未签到规则',
    `absent_check_out_rule` JSON NULL COMMENT '未签退规则',
    `flex_calc_method` ENUM('first_last', 'pair') NULL COMMENT '弹性计算方式：first_last/pair（首尾/两两）',
    `flex_min_interval` INTEGER NULL COMMENT '有效打卡间隔（分钟）',
    `flex_daily_hours` DECIMAL(4, 2) NULL COMMENT '每日工作时长',
    `flex_day_switch` TIME NULL COMMENT '跨天切换点',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '时间段表';

-- CreateTable
CREATE TABLE `att_shifts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '班次名称',
    `cycle_days` INTEGER NOT NULL DEFAULT 7 COMMENT '周期天数（默认7）',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '班次表';

-- CreateTable
CREATE TABLE `att_shift_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `shift_id` INTEGER NOT NULL COMMENT '班次ID',
    `period_id` INTEGER NOT NULL COMMENT '时间段ID',
    `day_of_cycle` INTEGER NOT NULL COMMENT '周期内第几天（1-7）',
    `sort_order` INTEGER NOT NULL DEFAULT 0 COMMENT '排序',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '班次时间段关联表';

-- CreateTable
CREATE TABLE `att_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_id` INTEGER NOT NULL COMMENT '人员ID',
    `shift_id` INTEGER NOT NULL COMMENT '班次ID',
    `start_date` DATE NOT NULL COMMENT '生效开始日期',
    `end_date` DATE NOT NULL COMMENT '生效结束日期',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    INDEX `att_schedules_employee_id_start_date_end_date_idx`(`employee_id`, `start_date`, `end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '排班表';

-- CreateTable
CREATE TABLE `att_clock_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_id` INTEGER NOT NULL COMMENT '人员ID',
    `device_id` INTEGER NULL COMMENT '设备ID',
    `clock_time` DATETIME(3) NOT NULL COMMENT '打卡时间',
    `temperature` DECIMAL(3, 1) NULL COMMENT '体温',
    `mask_status` ENUM('none', 'wearing', 'not_wearing') NULL COMMENT '口罩状态',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',

    INDEX `att_clock_records_employee_id_clock_time_idx`(`employee_id`, `clock_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '原始打卡记录表';

-- CreateTable
CREATE TABLE `att_daily_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_id` INTEGER NOT NULL COMMENT '人员ID',
    `work_date` DATE NOT NULL COMMENT '工作日',
    `shift_id` INTEGER NULL COMMENT '班次ID',
    `period_id` INTEGER NULL COMMENT '时间段ID',
    `check_in_time` DATETIME(3) NULL COMMENT '签到时间',
    `check_out_time` DATETIME(3) NULL COMMENT '签退时间',
    `status` ENUM('normal', 'late', 'early_leave', 'absent', 'leave', 'business_trip') NOT NULL DEFAULT 'normal' COMMENT '状态：normal/late/early_leave/absent/leave...',
    `actual_hours` DECIMAL(5, 2) NULL COMMENT '实际出勤时长',
    `effective_hours` DECIMAL(5, 2) NULL COMMENT '有效出勤时长',
    `late_minutes` INTEGER NULL COMMENT '迟到分钟数',
    `early_leave_minutes` INTEGER NULL COMMENT '早退分钟数',
    `absent_minutes` INTEGER NULL COMMENT '缺勤分钟数',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    INDEX `att_daily_records_employee_id_work_date_idx`(`employee_id`, `work_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '每日考勤记录表';

-- CreateTable
CREATE TABLE `att_corrections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_id` INTEGER NOT NULL COMMENT '人员ID（被补签人）',
    `daily_record_id` BIGINT NOT NULL COMMENT '关联的每日记录ID',
    `type` ENUM('check_in', 'check_out') NOT NULL COMMENT '类型：check_in/check_out（补签到/补签退）',
    `correction_time` DATETIME(3) NOT NULL COMMENT '补签时间',
    `operator_id` INTEGER NOT NULL COMMENT '操作人用户ID',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '补签记录表';

-- CreateTable
CREATE TABLE `att_leaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `employee_id` INTEGER NOT NULL COMMENT '人员ID',
    `type` ENUM('annual', 'sick', 'personal', 'business_trip', 'maternity', 'paternity', 'marriage', 'bereavement', 'other') NOT NULL COMMENT '类型：annual/sick/personal/business_trip...',
    `start_time` DATETIME(3) NOT NULL COMMENT '开始时间',
    `end_time` DATETIME(3) NOT NULL COMMENT '结束时间',
    `reason` VARCHAR(500) NULL COMMENT '备注/原因',
    `apply_time` DATETIME(3) NOT NULL COMMENT '申请时间',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '状态：pending/approved/rejected',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '请假/出差记录表';

-- CreateTable
CREATE TABLE `att_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '主键',
    `key` VARCHAR(50) NOT NULL COMMENT '设置键',
    `value` JSON NOT NULL COMMENT '设置值',
    `description` VARCHAR(200) NULL COMMENT '说明',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新时间',

    UNIQUE INDEX `att_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '考勤设置表';

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_shift_periods` ADD CONSTRAINT `att_shift_periods_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `att_shifts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_shift_periods` ADD CONSTRAINT `att_shift_periods_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `att_time_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_schedules` ADD CONSTRAINT `att_schedules_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_schedules` ADD CONSTRAINT `att_schedules_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `att_shifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_clock_records` ADD CONSTRAINT `att_clock_records_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_clock_records` ADD CONSTRAINT `att_clock_records_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_daily_records` ADD CONSTRAINT `att_daily_records_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_daily_records` ADD CONSTRAINT `att_daily_records_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `att_shifts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_daily_records` ADD CONSTRAINT `att_daily_records_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `att_time_periods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_corrections` ADD CONSTRAINT `att_corrections_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_corrections` ADD CONSTRAINT `att_corrections_daily_record_id_fkey` FOREIGN KEY (`daily_record_id`) REFERENCES `att_daily_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_corrections` ADD CONSTRAINT `att_corrections_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_leaves` ADD CONSTRAINT `att_leaves_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
