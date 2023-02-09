/*
  Warnings:

  - You are about to drop the column `end_time` on the `GuidelinesCoursesTimes` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `GuidelinesCoursesTimes` table. All the data in the column will be lost.
  - Added the required column `end_time_hour` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time_min` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time_hour` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time_min` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time_hour` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time_min` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time_hour` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time_min` to the `GuidelinesCoursesTimes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `end_time_hour` INTEGER NOT NULL,
    ADD COLUMN `end_time_min` INTEGER NOT NULL,
    ADD COLUMN `start_time_hour` INTEGER NOT NULL,
    ADD COLUMN `start_time_min` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `GuidelinesCoursesTimes` DROP COLUMN `end_time`,
    DROP COLUMN `start_time`,
    ADD COLUMN `end_time_hour` INTEGER NOT NULL,
    ADD COLUMN `end_time_min` INTEGER NOT NULL,
    ADD COLUMN `start_time_hour` INTEGER NOT NULL,
    ADD COLUMN `start_time_min` INTEGER NOT NULL;
