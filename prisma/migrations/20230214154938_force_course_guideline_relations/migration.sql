/*
  Warnings:

  - Made the column `guideline_id` on table `GuidelinesCoursesDays` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guideline_id` on table `GuidelinesCoursesTimes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `GuidelinesCoursesDays` DROP FOREIGN KEY `GuidelinesCoursesDays_guideline_id_fkey`;

-- DropForeignKey
ALTER TABLE `GuidelinesCoursesTimes` DROP FOREIGN KEY `GuidelinesCoursesTimes_guideline_id_fkey`;

-- AlterTable
ALTER TABLE `GuidelinesCoursesDays` MODIFY `guideline_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `GuidelinesCoursesTimes` MODIFY `guideline_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesTimes` ADD CONSTRAINT `GuidelinesCoursesTimes_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesDays` ADD CONSTRAINT `GuidelinesCoursesDays_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;
