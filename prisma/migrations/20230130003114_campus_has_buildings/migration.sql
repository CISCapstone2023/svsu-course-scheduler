/*
  Warnings:

  - You are about to drop the column `campus_tuid` on the `Room` table. All the data in the column will be lost.
  - Added the required column `campus_tuid` to the `GuidelineBuilding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_campus_tuid_fkey`;

-- AlterTable
ALTER TABLE `GuidelineBuilding` ADD COLUMN `campus_tuid` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `campus_tuid`;

-- AddForeignKey
ALTER TABLE `GuidelineBuilding` ADD CONSTRAINT `GuidelineBuilding_campus_tuid_fkey` FOREIGN KEY (`campus_tuid`) REFERENCES `GuidelineCampus`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;
