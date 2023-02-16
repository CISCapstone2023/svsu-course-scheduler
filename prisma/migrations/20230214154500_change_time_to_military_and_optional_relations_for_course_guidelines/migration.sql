/*
  Warnings:

  - You are about to drop the column `end_time_hour` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `end_time_min` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `start_time_hour` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `start_time_min` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `end_time_min` on the `GuidelinesCoursesTimes` table. All the data in the column will be lost.
  - You are about to drop the column `start_time_hour` on the `GuidelinesCoursesTimes` table. All the data in the column will be lost.
  - You are about to drop the column `start_time_min` on the `GuidelinesCoursesTimes` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` DROP COLUMN `end_time_hour`,
    DROP COLUMN `end_time_min`,
    DROP COLUMN `start_time_hour`,
    DROP COLUMN `start_time_min`,
    ADD COLUMN `end_time` INTEGER NOT NULL,
    ADD COLUMN `start_time` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `GuidelinesCoursesDays` MODIFY `guideline_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `GuidelinesCoursesTimes` DROP COLUMN `end_time_min`,
    DROP COLUMN `start_time_hour`,
    DROP COLUMN `start_time_min`,
    ADD COLUMN `end_time` INTEGER NOT NULL,
    ADD COLUMN `start_time` INTEGER NOT NULL,
    MODIFY `guideline_id` VARCHAR(191) NULL;
