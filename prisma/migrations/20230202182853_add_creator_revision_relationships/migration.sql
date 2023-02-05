/*
  Warnings:

  - Added the required column `creator_tuid` to the `ScheduleRevision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ScheduleRevision` ADD COLUMN `creator_tuid` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ScheduleRevision` ADD CONSTRAINT `ScheduleRevision_creator_tuid_fkey` FOREIGN KEY (`creator_tuid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
