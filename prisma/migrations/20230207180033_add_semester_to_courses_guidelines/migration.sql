/*
  Warnings:

  - You are about to drop the column `cycle` on the `guidelinescourses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `semester_fall` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_spring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_summer` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_winter` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `GuidelinesCourses` DROP COLUMN `cycle`,
    ADD COLUMN `semester_fall` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_spring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_summer` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `semester_winter` BOOLEAN NOT NULL DEFAULT false;
