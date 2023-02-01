/*
  Warnings:

  - You are about to drop the column `course_tuid` on the `Room` table. All the data in the column will be lost.
  - Added the required column `course_tuid` to the `CourseLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classrooms` to the `GuidelineBuilding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_tuid` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_course_tuid_fkey`;

-- AlterTable
ALTER TABLE `CourseLocation` ADD COLUMN `course_tuid` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `GuidelineBuilding` ADD COLUMN `classrooms` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `course_tuid`,
    ADD COLUMN `location_tuid` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `CourseLocation` ADD CONSTRAINT `CourseLocation_course_tuid_fkey` FOREIGN KEY (`course_tuid`) REFERENCES `Course`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_location_tuid_fkey` FOREIGN KEY (`location_tuid`) REFERENCES `CourseLocation`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;
