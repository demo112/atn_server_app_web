/*
  Warnings:

  - You are about to drop the column `clock_type` on the `att_clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `actual_hours` on the `att_daily_records` table. All the data in the column will be lost.
  - You are about to drop the column `effective_hours` on the `att_daily_records` table. All the data in the column will be lost.
  - You are about to drop the column `apply_time` on the `att_leaves` table. All the data in the column will be lost.
  - You are about to drop the column `absent_check_in_rule` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `absent_check_out_rule` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `check_in_end` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `check_in_start` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `check_out_end` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `check_out_start` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `early_leave_rule` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `flex_calc_method` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `flex_daily_hours` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `flex_day_switch` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `flex_min_interval` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `late_rule` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `require_check_in` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `require_check_out` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `work_end` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to drop the column `work_start` on the `att_time_periods` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `att_time_periods` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `TinyInt`.
  - The values [resigned] on the enum `employees_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [disabled] on the enum `users_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `source` to the `att_clock_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `att_clock_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_employee_id_fkey`;

-- AlterTable
ALTER TABLE `att_clock_records` DROP COLUMN `clock_type`,
    ADD COLUMN `device_info` JSON NULL,
    ADD COLUMN `location` JSON NULL,
    ADD COLUMN `operator_id` INTEGER NULL,
    ADD COLUMN `remark` VARCHAR(200) NULL,
    ADD COLUMN `source` ENUM('app', 'web', 'device') NOT NULL,
    ADD COLUMN `type` ENUM('sign_in', 'sign_out') NOT NULL;

-- AlterTable
ALTER TABLE `att_corrections` ADD COLUMN `remark` VARCHAR(200) NULL;

-- AlterTable
ALTER TABLE `att_daily_records` DROP COLUMN `actual_hours`,
    DROP COLUMN `effective_hours`,
    ADD COLUMN `actual_minutes` INTEGER NULL,
    ADD COLUMN `effective_minutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `att_leaves` DROP COLUMN `apply_time`,
    ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `approver_id` INTEGER NULL,
    MODIFY `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `att_time_periods` DROP COLUMN `absent_check_in_rule`,
    DROP COLUMN `absent_check_out_rule`,
    DROP COLUMN `check_in_end`,
    DROP COLUMN `check_in_start`,
    DROP COLUMN `check_out_end`,
    DROP COLUMN `check_out_start`,
    DROP COLUMN `early_leave_rule`,
    DROP COLUMN `flex_calc_method`,
    DROP COLUMN `flex_daily_hours`,
    DROP COLUMN `flex_day_switch`,
    DROP COLUMN `flex_min_interval`,
    DROP COLUMN `late_rule`,
    DROP COLUMN `require_check_in`,
    DROP COLUMN `require_check_out`,
    DROP COLUMN `work_end`,
    DROP COLUMN `work_start`,
    ADD COLUMN `end_time` CHAR(5) NULL,
    ADD COLUMN `rest_end_time` CHAR(5) NULL,
    ADD COLUMN `rest_start_time` CHAR(5) NULL,
    ADD COLUMN `rules` JSON NULL,
    ADD COLUMN `start_time` CHAR(5) NULL,
    MODIFY `type` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `hire_date` DATE NULL,
    ADD COLUMN `leave_date` DATE NULL,
    MODIFY `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    MODIFY `employee_id` INTEGER NULL,
    MODIFY `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX `att_leaves_employee_id_start_time_end_time_idx` ON `att_leaves`(`employee_id`, `start_time`, `end_time`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_clock_records` ADD CONSTRAINT `att_clock_records_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `att_leaves` ADD CONSTRAINT `att_leaves_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
