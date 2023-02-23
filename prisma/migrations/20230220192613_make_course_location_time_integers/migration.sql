/*
  Warnings:

  - Changed the type of `start_time` on the `CourseLocation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `CourseLocation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `CourseLocation` DROP COLUMN `start_time`,
    ADD COLUMN `start_time` INTEGER NOT NULL,
    DROP COLUMN `end_time`,
    ADD COLUMN `end_time` INTEGER NOT NULL;
