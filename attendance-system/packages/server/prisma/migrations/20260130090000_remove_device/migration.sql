-- 移除设备管理功能，改用APP/Web手动打卡

-- 移除打卡记录表的设备外键约束
ALTER TABLE `att_clock_records` DROP FOREIGN KEY `att_clock_records_device_id_fkey`;

-- 移除打卡记录表的设备相关字段
ALTER TABLE `att_clock_records` DROP COLUMN `device_id`;
ALTER TABLE `att_clock_records` DROP COLUMN `temperature`;
ALTER TABLE `att_clock_records` DROP COLUMN `mask_status`;

-- 添加打卡方式字段
ALTER TABLE `att_clock_records` ADD COLUMN `clock_type` ENUM('app', 'web') NOT NULL DEFAULT 'app' COMMENT '打卡方式：app/web';

-- 删除设备表
DROP TABLE `devices`;
