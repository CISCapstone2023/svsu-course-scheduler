-- DropForeignKey
ALTER TABLE `GuidelinesCoursesDays` DROP FOREIGN KEY `GuidelinesCoursesDays_guideline_id_fkey`;

-- DropForeignKey
ALTER TABLE `GuidelinesCoursesTimes` DROP FOREIGN KEY `GuidelinesCoursesTimes_guideline_id_fkey`;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesTimes` ADD CONSTRAINT `GuidelinesCoursesTimes_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesDays` ADD CONSTRAINT `GuidelinesCoursesDays_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
