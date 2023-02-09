/*
  Warnings:

  - You are about to drop the column `creator_tuid` on the `schedulerevision` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_tuid` on the `schedulerevision` table. All the data in the column will be lost.
  - Added the required column `user` to the `ScheduleRevision` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `schedulerevision` DROP FOREIGN KEY `ScheduleRevision_creator_tuid_fkey`;

-- DropForeignKey
ALTER TABLE `schedulerevision` DROP FOREIGN KEY `ScheduleRevision_schedule_tuid_fkey`;

-- AlterTable
ALTER TABLE `schedulerevision` DROP COLUMN `creator_tuid`,
    DROP COLUMN `schedule_tuid`,
    ADD COLUMN `schedule` VARCHAR(191) NULL,
    ADD COLUMN `user` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ScheduleRevision` ADD CONSTRAINT `ScheduleRevision_schedule_fkey` FOREIGN KEY (`schedule`) REFERENCES `Schedule`(`tuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleRevision` ADD CONSTRAINT `ScheduleRevision_user_fkey` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
