-- CreateTable
CREATE TABLE `SchedulesOnUsers` (
    `user_tuid` VARCHAR(191) NOT NULL,
    `schedule_tuid` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`user_tuid`, `schedule_tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SchedulesOnUsers` ADD CONSTRAINT `SchedulesOnUsers_user_tuid_fkey` FOREIGN KEY (`user_tuid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SchedulesOnUsers` ADD CONSTRAINT `SchedulesOnUsers_schedule_tuid_fkey` FOREIGN KEY (`schedule_tuid`) REFERENCES `Schedule`(`tuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
