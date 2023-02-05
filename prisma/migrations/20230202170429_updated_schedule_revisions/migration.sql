-- AlterTable
ALTER TABLE `ScheduleRevision` ADD COLUMN `onboarding` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `file` BLOB NULL,
    MODIFY `schedule_tuid` VARCHAR(191) NULL;
