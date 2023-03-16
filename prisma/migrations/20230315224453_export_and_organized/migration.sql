-- AlterTable
ALTER TABLE `ScheduleRevision` ADD COLUMN `exportedAt` DATETIME(3) NULL,
    ADD COLUMN `exported_file` BLOB NULL,
    ADD COLUMN `organizedColumns` JSON NOT NULL;
